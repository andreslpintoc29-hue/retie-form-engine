// ============================================
// COMPLIANCE RULES ENGINE - RETIE SPECIFIC
// ============================================

import { COMPLIANCE_STANDARDS, NC_STATUS } from '@/schemas/normalization';

export interface NoConformityRule {
  id: string;
  name: string;
  description: string;
  condition: NoConformityCondition;
  severity: 'critical' | 'major' | 'minor';
  automatic: boolean;
  evidenceRequired: boolean;
  fieldIds?: string[];
}

export interface NoConformityCondition {
  type: 'field_equals' | 'field_not_equals' | 'field_greater' | 'field_less' | 'field_empty' | 'field_range';
  fieldId: string;
  value?: any;
  threshold?: number;
  secondaryFieldId?: string;
}

export interface GeneratedNoConformity {
  id: string;
  fieldId: string;
  fieldLabel: string;
  currentValue: any;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  recommendation: string;
  evidenceRequired: boolean;
  status: 'open' | 'corrected' | 'validated' | 'closed';
  createdAt: string;
}

export interface ComplianceRuleResult {
  noConformities: GeneratedNoConformity[];
  compliancePercentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  criticalCount: number;
  majorCount: number;
  minorCount: number;
}

// ============================================
// RETIE COMPLIANCE RULES DEFINITIONS
// ============================================

export const RETIE_COMPLIANCE_RULES: NoConformityRule[] = [
  // --- REGLAS CRÍTICAS (Risk to life/safety) ---
  {
    id: 'nc_critical_01',
    name: 'Sin protección general',
    description: 'El tablero no cuenta con protección general',
    condition: { type: 'field_equals', fieldId: 'has_main_protection', value: 'NO' },
    severity: 'critical',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['has_main_protection']
  },
  {
    id: 'nc_critical_02',
    name: 'Sin puesta a tierra',
    description: 'No existe sistema de puesta a tierra',
    condition: { type: 'field_equals', fieldId: 'has_grounding_system', value: 'NO' },
    severity: 'critical',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['has_grounding_system']
  },
  {
    id: 'nc_critical_03',
    name: 'Resistencia de puesta a tierra alta',
    description: 'La resistencia de puesta a tierra supera 25Ω - riesgo de electrocución',
    condition: { type: 'field_greater', fieldId: 'grounding_ohm', threshold: 25 },
    severity: 'critical',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['grounding_ohm']
  },
  {
    id: 'nc_critical_04',
    name: 'Sin sistema equipotencial',
    description: 'No existe sistema equipotencial en la piscina',
    condition: { type: 'field_equals', fieldId: 'has_equipotential', value: 'NO' },
    severity: 'critical',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['has_equipotential']
  },
  {
    id: 'nc_critical_05',
    name: 'Lámparas sin transformador de seguridad',
    description: 'Las lampsubacuáticas no usan transformador de seguridad (12V)',
    condition: { type: 'field_equals', fieldId: 'has_transformer', value: 'NO' },
    severity: 'critical',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['has_transformer', 'underwater_lamp_count']
  },

  // --- REGLAS MAYORES (Significant RETIE non-compliance) ---
  {
    id: 'nc_major_01',
    name: 'Protección sin certificado RETIE',
    description: 'La protección no cuenta con certificación RETIE',
    condition: { type: 'field_equals', fieldId: 'main_protection_cert', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: false,
    fieldIds: ['main_protection_cert']
  },
  {
    id: 'nc_major_02',
    name: 'Tablero no hermético',
    description: 'El tablero no es estanco al agua (IP65 mínimo)',
    condition: { type: 'field_equals', fieldId: 'panel_waterproof', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['panel_waterproof', 'panel_enclosure']
  },
  {
    id: 'nc_major_03',
    name: 'Iluminación bajo mínimo',
    description: 'Los niveles de iluminación son inferiores al mínimo (50 lux)',
    condition: { type: 'field_equals', fieldId: 'lux_meets_minimum', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['lux_meets_minimum', 'lux_avg']
  },
  {
    id: 'nc_major_04',
    name: 'Aislamiento insuficiente',
    description: 'La resistencia de aislamiento es menor a 1MΩ',
    condition: { type: 'field_less', fieldId: 'ins_all_ok', threshold: 1 },
    severity: 'major',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['ins_all_ok']
  },
  {
    id: 'nc_major_05',
    name: 'Tensiones fuera de rango',
    description: 'Las tensiones están fuera del rango ±10%',
    condition: { type: 'field_equals', fieldId: 'voltages_ok', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['voltages_ok']
  },
  {
    id: 'nc_major_06',
    name: 'Continuidad de tierra defectuosa',
    description: 'La continuidad de puesta a tierra es mayor a 1Ω',
    condition: { type: 'field_equals', fieldId: 'ground_cont_all_ok', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: true,
    fieldIds: ['ground_cont_all_ok']
  },
  {
    id: 'nc_major_07',
    name: 'Sin protección de falla a tierra en bombas',
    description: 'Las bombas no tienen protección de falla a tierra',
    condition: { type: 'field_equals', fieldId: 'pump_ground_fault', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: false,
    fieldIds: ['pump_ground_fault']
  },
  {
    id: 'nc_major_08',
    name: 'Sin protección marcha en seco',
    description: 'Las bombas no tienen protección contra marcha en seco',
    condition: { type: 'field_equals', fieldId: 'pump_dry_run_protection', value: 'NO' },
    severity: 'major',
    automatic: true,
    evidenceRequired: false,
    fieldIds: ['pump_dry_run_protection']
  },

  // --- REGLAS MENORES (Minor deviations) ---
  {
    id: 'nc_minor_01',
    name: 'Medidor con lectura',
    description: 'El medidor tiene lectura previa',
    condition: { type: 'field_greater', fieldId: 'meter_reading', threshold: 0 },
    severity: 'minor',
    automatic: false,
    evidenceRequired: false,
    fieldIds: ['meter_reading']
  },
  {
    id: 'nc_minor_02',
    name: 'Sin coordenadas GPS',
    description: 'No se especificaron coordenadas de ubicación',
    condition: { type: 'field_empty', fieldId: 'latitude' },
    severity: 'minor',
    automatic: false,
    evidenceRequired: false,
    fieldIds: ['latitude', 'longitude']
  }
];

// ============================================
// COMPLIANCE RULES ENGINE
// ============================================

export class ComplianceRulesEngine {
  private rules: NoConformityRule[] = RETIE_COMPLIANCE_RULES;

  /**
   * Evaluate all rules and generate no conformities
   */
  evaluate(answers: Record<string, any>, fieldLabels: Record<string, string>): ComplianceRuleResult {
    const noConformities: GeneratedNoConformity[] = [];
    let criticalCount = 0;
    let majorCount = 0;
    let minorCount = 0;

    for (const rule of this.rules) {
      if (this.evaluateCondition(rule.condition, answers)) {
        const nc: GeneratedNoConformity = {
          id: `nc_${rule.id}_${Date.now()}`,
          fieldId: rule.condition.fieldId,
          fieldLabel: fieldLabels[rule.condition.fieldId] || rule.condition.fieldId,
          currentValue: answers[rule.condition.fieldId],
          severity: rule.severity,
          description: rule.description,
          recommendation: this.getRecommendation(rule.severity, rule.condition.fieldId),
          evidenceRequired: rule.evidenceRequired,
          status: 'open',
          createdAt: new Date().toISOString()
        };

        noConformities.push(nc);

        switch (rule.severity) {
          case 'critical': criticalCount++; break;
          case 'major': majorCount++; break;
          case 'minor': minorCount++; break;
        }
      }
    }

    // Calculate compliance
    const totalRules = this.rules.filter(r => r.automatic).length;
    const compliantCount = totalRules - noConformities.filter(nc => nc.severity !== 'minor').length;
    const compliancePercentage = totalRules > 0 ? (compliantCount / totalRules) * 100 : 0;

    // Calculate grade
    const grade = this.calculateGrade(compliancePercentage);

    // Calculate score
    const score = this.calculateScore(compliancePercentage, criticalCount, majorCount, minorCount);

    return {
      noConformities,
      compliancePercentage: Math.round(compliancePercentage * 100) / 100,
      grade,
      score: Math.round(score * 100) / 100,
      criticalCount,
      majorCount,
      minorCount
    };
  }

  private evaluateCondition(condition: NoConformityCondition, answers: Record<string, any>): boolean {
    const value = answers[condition.fieldId];

    switch (condition.type) {
      case 'field_equals':
        return value === condition.value;

      case 'field_not_equals':
        return value !== condition.value;

      case 'field_greater':
        return value !== undefined && value !== null && Number(value) > (condition.threshold || 0);

      case 'field_less':
        return value !== undefined && value !== null && Number(value) < (condition.threshold || 0);

      case 'field_empty':
        return value === undefined || value === null || value === '';

      case 'field_range':
        return value !== undefined && value !== null && 
               Number(value) >= (condition.threshold || 0) && 
               Number(value) <= (condition.secondaryFieldId ? answers[condition.secondaryFieldId] : 0);

      default:
        return false;
    }
  }

  private calculateGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (percentage >= 90) return 'A';
    if (percentage >= 75) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  }

  private calculateScore(percentage: number, critical: number, major: number, minor: number): number {
    let score = percentage;
    score -= critical * COMPLIANCE_STANDARDS.SCORE_CALCULATION.criticalPenalty;
    score -= major * COMPLIANCE_STANDARDS.SCORE_CALCULATION.majorPenalty;
    score -= minor * COMPLIANCE_STANDARDS.SCORE_CALCULATION.minorPenalty;
    return Math.max(0, score);
  }

  private getRecommendation(fieldId: string, severity: string): string {
    const recommendations: Record<string, Record<string, string>> = {
      critical: {
        has_main_protection: 'Instalar protección general (interruptor automático) en el tablero',
        has_grounding_system: 'Instalar sistema de puesta a tierra según NTC 2050',
        grounding_ohm: 'Verificar y mejorar el sistema de puesta a tierra. Valor debe ser ≤25Ω',
        has_equipotential: 'Instalar sistema equipotencial según RETIE capítulos 6 y 8',
        has_transformer: 'Instalar transformador de seguridad 12V para iluminación subacuática'
      },
      major: {
        main_protection_cert: 'Reemplazar protección por una certificada RETIE',
        panel_waterproof: 'Reemplazar tablero por uno con grado IP65 o superior',
        lux_meets_minimum: 'Incrementar iluminación hasta alcanzar mínimo de 50 lux',
        ins_all_ok: 'Revisar y reemplazar cables con aislamiento defectuoso',
        voltages_ok: 'Verificar alimentación y regulación de voltaje',
        ground_cont_all_ok: 'Verificar conexiones de puesta a tierra',
        pump_ground_fault: 'Instalar protector de falla a tierra en circuito de bombas',
        pump_dry_run_protection: 'Instalar protección contra marcha en seco'
      },
      minor: {
        meter_reading: 'Verificar lectura inicial del medidor',
        latitude: 'Registrar coordenadas GPS de la instalación'
      }
    };

    return recommendations[severity]?.[fieldId] || 'Revisar y corregir según normativa RETIE';
  }

  /**
   * Add custom rule
   */
  addRule(rule: NoConformityRule): void {
    this.rules.push(rule);
  }

  /**
   * Get rules by severity
   */
  getRulesBySeverity(severity: 'critical' | 'major' | 'minor'): NoConformityRule[] {
    return this.rules.filter(r => r.severity === severity);
  }

  /**
   * Get all rules
   */
  getRules(): NoConformityRule[] {
    return [...this.rules];
  }
}

export const complianceRulesEngine = new ComplianceRulesEngine();

export default complianceRulesEngine;