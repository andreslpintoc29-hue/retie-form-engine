/**
 * =====================================================
 * RULE ENGINE - MOTOR DE REGLAS DESACOPLADO
 * =====================================================
 * Las reglas NO están hardcodeadas. Vienen desde JSON.
 * 
 * Tipos de reglas soportadas:
 * - conditional: mostrar/ocultar campos
 * - required: campos condicionalmente requeridos
 * - observation: requerir observación si NO
 * - non-conformity: crear no conformidad automática
 * - auto-value: valor automático basado en otros campos
 * - calculation: fórmulas dinámicas
 * - severity: asignar severidad automáticamente
 * - validation: validaciones cruzadas
 * - navigation: control de flujo
 */

import { 
  Field, 
  Operator, 
  InspectionAnswers,
  ValidationRule,
  Severity 
} from '@/schemas/masterSchema';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TIPOS DE REGLAS
// ============================================

export type RuleAction = 
  | 'show' 
  | 'hide' 
  | 'enable' 
  | 'disable' 
  | 'require' 
  | 'unrequire'
  | 'set-value'
  | 'clear-value'
  | 'create-non-conformity'
  | 'add-observation'
  | 'set-severity'
  | 'trigger-calc'
  | 'block-submit'
  | 'show-warning';

export type RuleConditionOperator = 
  | 'equals' 
  | 'not-equals' 
  | 'contains' 
  | 'not-contains'
  | 'greater-than' 
  | 'less-than' 
  | 'greater-or-equal' 
  | 'less-or-equal'
  | 'between' 
  | 'in' 
  | 'not-in' 
  | 'is-empty' 
  | 'is-not-empty'
  | 'all-answered'
  | 'any-answered';

export interface RuleCondition {
  field: string;
  operator: RuleConditionOperator;
  value?: unknown;
  values?: unknown[];
}

export interface RuleActionConfig {
  action: RuleAction;
  targetField?: string;
  value?: unknown;
  severity?: Severity;
  message?: string;
  observationTemplate?: string;
}

// ============================================
// REGLA DEFINIDA EN JSON
// ============================================

export interface RuleDefinition {
  id: string;
  name: string;
  description?: string;
  priority: number;
  enabled: boolean;
  
  // Condiciones
  conditions: RuleCondition[];
  conditionOperator: 'AND' | 'OR';
  
  // Acciones
  actions: RuleActionConfig[];
  
  // Metadatos
  metadata?: {
    category?: string;
    tags?: string[];
  };
}

// ============================================
// REGLA DESDE SCHEMA (inline rules)
// ============================================

export interface SchemaRule {
  field: string;
  operator: RuleConditionOperator;
  value?: unknown;
  action: RuleAction;
  targetField?: string;
  valueToSet?: unknown;
  severity?: Severity;
  message?: string;
}

// ============================================
// ENGINE PRINCIPAL
// ============================================

export class RuleEngine {
  private rules: RuleDefinition[];
  
  constructor(rules: RuleDefinition[] = []) {
    this.rules = rules;
  }

  // Cargar reglas desde JSON
  loadRules(rules: RuleDefinition[]): void {
    this.rules = rules.filter(r => r.enabled);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  // Evaluar condición individual
  private evaluateCondition(
    condition: RuleCondition,
    answers: InspectionAnswers
  ): boolean {
    const value = this.getFieldValue(condition.field, answers);
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
        
      case 'not-equals':
        return value !== condition.value;
        
      case 'contains':
        return typeof value === 'string' && value.includes(String(condition.value));
        
      case 'not-contains':
        return typeof value === 'string' && !value.includes(String(condition.value));
        
      case 'greater-than':
        return typeof value === 'number' && value > Number(condition.value);
        
      case 'less-than':
        return typeof value === 'number' && value < Number(condition.value);
        
      case 'greater-or-equal':
        return typeof value === 'number' && value >= Number(condition.value);
        
      case 'less-or-equal':
        return typeof value === 'number' && value <= Number(condition.value);
        
      case 'between':
        if (Array.isArray(condition.values) && condition.values.length === 2) {
          const num = Number(value);
          return num >= Number(condition.values[0]) && num <= Number(condition.values[1]);
        }
        return false;
        
      case 'in':
        return Array.isArray(condition.values) && condition.values.includes(value);
        
      case 'not-in':
        return Array.isArray(condition.values) && !condition.values.includes(value);
        
      case 'is-empty':
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0);
        
      case 'is-not-empty':
        return !this.evaluateCondition({ ...condition, operator: 'is-empty' }, answers);
        
      case 'all-answered':
        // Verificar que todos los campos en el valor estén respondidos
        if (Array.isArray(condition.value)) {
          return condition.value.every((f: unknown) => {
            const v = this.getFieldValue(String(f), answers);
            return v !== null && v !== undefined && v !== '';
          });
        }
        return true;
        
      case 'any-answered':
        if (Array.isArray(condition.value)) {
          return condition.value.some((f: unknown) => {
            const v = this.getFieldValue(String(f), answers);
            return v !== null && v !== undefined && v !== '';
          });
        }
        return false;
        
      default:
        return false;
    }
  }

  // Obtener valor de campo (soporta paths como "sheetName.fieldId")
  private getFieldValue(fieldPath: string, answers: InspectionAnswers): unknown {
    const parts = fieldPath.split('.');
    
    if (parts.length === 1) {
      return answers[fieldPath];
    }
    
    let current: unknown = answers;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // Evaluar todas las condiciones de una regla
  private evaluateRuleConditions(
    rule: RuleDefinition,
    answers: InspectionAnswers
  ): boolean {
    const results = rule.conditions.map(c => this.evaluateCondition(c, answers));
    
    if (rule.conditionOperator === 'AND') {
      return results.every(r => r);
    } else {
      return results.some(r => r);
    }
  }

  // Ejecutar todas las reglas y obtener acciones a aplicar
  evaluateAll(
    answers: InspectionAnswers,
    currentSheetName: string
  ): Map<string, RuleActionConfig[]> {
    const actionsMap = new Map<string, RuleActionConfig[]>();
    
    for (const rule of this.rules) {
      // Solo evaluar reglas de la hoja actual o globales
      const ruleSheet = rule.metadata?.tags?.find(t => t.startsWith('sheet:'));
      if (ruleSheet && !ruleSheet.includes(currentSheetName)) {
        continue;
      }
      
      if (this.evaluateRuleConditions(rule, answers)) {
        for (const action of rule.actions) {
          const target = action.targetField || rule.id;
          const existing = actionsMap.get(target) || [];
          existing.push(action);
          actionsMap.set(target, existing);
        }
      }
    }
    
    return actionsMap;
  }

  // Obtener acciones para un campo específico
  getActionsForField(
    fieldId: string,
    answers: InspectionAnswers
  ): RuleActionConfig[] {
    const allActions = this.evaluateAll(answers, '');
    return allActions.get(fieldId) || [];
  }

  // Evaluar reglas inline del schema
  evaluateSchemaRules(
    fields: Field[],
    answers: InspectionAnswers
  ): Map<string, RuleActionConfig[]> {
    const actionsMap = new Map<string, RuleActionConfig[]>();
    
    for (const field of fields) {
      if (!field.conditional) continue;
      
      const conditionValue = this.getFieldValue(field.conditional.field, answers);
      let shouldApply = false;
      
      switch (field.conditional.operator) {
        case 'equals':
          shouldApply = conditionValue === field.conditional.value;
          break;
        case 'not-equals':
          shouldApply = conditionValue !== field.conditional.value;
          break;
        default:
          // Agregar más operadores según necesidad
          break;
      }
      
      if (shouldApply) {
        const action: RuleActionConfig = {
          action: field.conditional.action,
          targetField: String(field.id),
          message: `Campo visible basado en ${field.conditional.field}`
        };
        
        actionsMap.set(String(field.id), [action]);
      }
    }
    
    return actionsMap;
  }

  // Evaluar reglas y retornar las coincidentes
  evaluate(answers: InspectionAnswers, sheet: any): RuleDefinition[] {
    const sheetName = sheet?.codigo || sheet?.id || '';
    const triggered: RuleDefinition[] = [];
    for (const rule of this.rules) {
      const ruleSheet = rule.metadata?.tags?.find(t => t.startsWith('sheet:'));
      if (ruleSheet && !ruleSheet.includes(sheetName)) {
        continue;
      }
      if (this.evaluateRuleConditions(rule, answers)) {
        triggered.push(rule);
      }
    }
    return triggered;
  }

  // Ejecutar acciones de una regla sobre el store
  executeRule(rule: RuleDefinition, store: any): RuleActionConfig[] {
    for (const action of rule.actions) {
      if (!action.targetField) continue;
      
      switch (action.action) {
        case 'set-value':
          store.setFieldValue(action.targetField, action.value);
          break;
        case 'clear-value':
          store.setFieldValue(action.targetField, null);
          break;
      }
    }
    return rule.actions;
  }
}

// ============================================
// REGLAS PREDEFINIDAS (EJEMPLO JSON)
// ============================================

export const exampleRules: RuleDefinition[] = [
  {
    id: 'rule-001',
    name: 'Observación requerida cuando NO',
    description: 'Si la respuesta es NO, requerir observación',
    priority: 10,
    enabled: true,
    conditions: [
      { field: 'answer', operator: 'equals', value: 'NO' }
    ],
    conditionOperator: 'AND',
    actions: [
      { action: 'require', targetField: 'observation' },
      { action: 'create-non-conformity', severity: 'major' }
    ],
    metadata: { category: 'compliance', tags: ['sheet:PISCINAS'] }
  },
  {
    id: 'rule-002',
    name: 'Severidad crítica para equipos de protección',
    description: 'Equipos de protección sin aprobación son críticos',
    priority: 20,
    enabled: true,
    conditions: [
      { field: 'norma', operator: 'contains', value: 'protección' },
      { field: 'answer', operator: 'equals', value: 'NO' }
    ],
    conditionOperator: 'AND',
    actions: [
      { action: 'set-severity', severity: 'critical' }
    ],
    metadata: { category: 'severity' }
  },
  {
    id: 'rule-003',
    name: 'Cálculo automático de resistencia',
    description: 'Calcular resistencia de puesta a tierra automáticamente',
    priority: 5,
    enabled: true,
    conditions: [
      { field: 'measurementType', operator: 'equals', value: 'puesta-tierra' }
    ],
    conditionOperator: 'AND',
    actions: [
      { action: 'trigger-calc', targetField: 'resistanceCalculated' }
    ],
    metadata: { category: 'calculation', tags: ['sheet:IN'] }
  },
  {
    id: 'rule-004',
    name: 'Validación cruzada de calibres',
    description: 'Verificar que calibre de conductor sea adecuado para la protección',
    priority: 15,
    enabled: true,
    conditions: [
      { field: 'protectionAmps', operator: 'greater-than', value: 0 }
    ],
    conditionOperator: 'AND',
    actions: [
      { action: 'block-submit', message: 'El calibre no es adecuado para la protección' }
    ],
    metadata: { category: 'validation', tags: ['sheet:TABLEROS'] }
  }
];

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const ruleEngine = new RuleEngine(exampleRules);

export default RuleEngine;