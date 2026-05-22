/**
 * =====================================================
 * VALIDATION ENGINE - MOTOR DE VALIDACIÓN
 * =====================================================
 * 
 * Características:
 * - required
 * - min/max (números y fechas)
 * - regex/pattern
 * - validaciones personalizadas
 * - validaciones cruzadas
 * - validaciones de tabla
 * - validaciones condicionales
 */

import { 
  Field, 
  ValidationRule,
  CrossFieldValidation,
  TableColumn,
  InspectionAnswers 
} from '@/schemas/masterSchema';

// ============================================
// RESULTADO DE VALIDACIÓN
// ============================================

export interface ValidationError {
  fieldId: string;
  message: string;
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom' | 'cross-field' | 'table' | 'conditional';
  severity?: 'error' | 'warning';
  metadata?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================
// VALidador individual
// ============================================

export class ValidationEngine {
  
  // Validar un campo individual
  validateField(field: Field, value: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    if (!field.validation || field.validation.length === 0) {
      return { isValid: true, errors: [], warnings: [] };
    }
    
    for (const rule of field.validation) {
      const result = this.applyValidationRule(field, rule, value);
      if (result.error) {
        if (result.severity === 'warning') {
          warnings.push(result.error);
        } else {
          errors.push(result.error);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Aplicar una regla de validación específica
  private applyValidationRule(
    field: Field, 
    rule: ValidationRule, 
    value: unknown
  ): { error?: ValidationError; severity?: 'error' | 'warning' } {
    
    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message || `${field.label} es requerido`,
              type: 'required'
            },
            severity: 'error'
          };
        }
        
        // Validar arrays vacíos
        if (Array.isArray(value) && value.length === 0) {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message || `Seleccione al menos una opción`,
              type: 'required'
            },
            severity: 'error'
          };
        }
        break;
        
      case 'min':
        if (typeof value === 'number' && value < Number(rule.value)) {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message || `Valor mínimo: ${rule.value}`,
              type: 'min'
            },
            severity: 'error'
          };
        }
        break;
        
      case 'max':
        if (typeof value === 'number' && value > Number(rule.value)) {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message || `Valor máximo: ${rule.value}`,
              type: 'max'
            },
            severity: 'error'
          };
        }
        break;
        
      case 'minLength':
        if (typeof value === 'string' && value.length < Number(rule.value)) {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message || `Mínimo ${rule.value} caracteres`,
              type: 'min'
            },
            severity: 'error'
          };
        }
        break;
        
      case 'maxLength':
        if (typeof value === 'string' && value.length > Number(rule.value)) {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message || `Máximo ${rule.value} caracteres`,
              type: 'max'
            },
            severity: 'error'
          };
        }
        break;
        
      case 'pattern':
        if (typeof value === 'string' && rule.value) {
          const regex = new RegExp(String(rule.value));
          if (!regex.test(value)) {
            return {
              error: {
                fieldId: String(field.id),
                message: rule.message || 'Formato inválido',
                type: 'pattern'
              },
              severity: 'error'
            };
          }
        }
        break;
        
      case 'custom':
        // Las validaciones personalizadas se evalúan con funciones específicas
        // El mensaje ya está en rule.message
        if (rule.message) {
          return {
            error: {
              fieldId: String(field.id),
              message: rule.message,
              type: 'custom'
            },
            severity: rule.severity === 'critical' ? 'error' : 'warning'
          };
        }
        break;
    }
    
    return {};
  }

  // Validación cruzada (entre campos)
  validateCrossField(
    field: Field,
    crossValidation: CrossFieldValidation,
    allAnswers: InspectionAnswers
  ): ValidationError | null {
    const targetValue = allAnswers[crossValidation.targetField];
    let isValid = false;
    
    switch (crossValidation.operator) {
      case 'equals':
        isValid = targetValue === crossValidation.value;
        break;
      case 'not-equals':
        isValid = targetValue !== crossValidation.value;
        break;
      case 'greater-than':
        isValid = typeof targetValue === 'number' && targetValue > Number(crossValidation.value);
        break;
      case 'less-than':
        isValid = typeof targetValue === 'number' && targetValue < Number(crossValidation.value);
        break;
      case 'contains':
        isValid = typeof targetValue === 'string' && targetValue.includes(String(crossValidation.value));
        break;
      case 'is-empty':
        isValid = !targetValue;
        break;
      case 'is-not-empty':
        isValid = !!targetValue;
        break;
    }
    
    if (!isValid) {
      return {
        fieldId: String(field.id),
        message: crossValidation.message || `Validación cruzada fallida con ${crossValidation.targetField}`,
        type: 'cross-field'
      };
    }
    
    return null;
  }

  // Validar tabla dinámica
  validateTable(
    rows: Record<string, unknown>[],
    columns: TableColumn[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    rows.forEach((row, rowIndex) => {
      columns.forEach(col => {
        const value = row[col.field];
        
        // Validar requerido
        if (col.required && (value === null || value === undefined || value === '')) {
          errors.push({
            fieldId: `table-${col.field}-row-${rowIndex}`,
            message: `${col.label} es requerido en fila ${rowIndex + 1}`,
            type: 'required'
          });
        }
        
        // Validar tipo number
        if (col.type === 'number' && value !== null && value !== undefined) {
          if (typeof value !== 'number' || isNaN(Number(value))) {
            errors.push({
              fieldId: `table-${col.field}-row-${rowIndex}`,
              message: `${col.label} debe ser un número`,
              type: 'pattern'
            });
          }
          
          // Validar min/max
          if (col.validation) {
            col.validation.forEach(rule => {
              if (rule.type === 'min' && Number(value) < Number(rule.value)) {
                errors.push({
                  fieldId: `table-${col.field}-row-${rowIndex}`,
                  message: rule.message || `Valor mínimo: ${rule.value}`,
                  type: 'min'
                });
              }
              if (rule.type === 'max' && Number(value) > Number(rule.value)) {
                errors.push({
                  fieldId: `table-${col.field}-row-${rowIndex}`,
                  message: rule.message || `Valor máximo: ${rule.value}`,
                  type: 'max'
                });
              }
            });
          }
        }
        
        // Validar tipo decimal
        if (col.type === 'decimal' && value !== null && value !== undefined) {
          const num = parseFloat(String(value));
          if (isNaN(num)) {
            errors.push({
              fieldId: `table-${col.field}-row-${rowIndex}`,
              message: `${col.label} debe ser un número decimal`,
              type: 'pattern'
            });
          }
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validar sección completa
  validateSection(
    fields: Field[],
    answers: Record<string, unknown>
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    fields.forEach(field => {
      // Ignorar títulos de sección
      if (field.type === 'section-title') return;
      
      const value = answers[field.id as string];
      
      // Validar campo individual
      const result = this.validateField(field, value);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      
      // Validación cruzada
      if (field.crossFieldValidation) {
        field.crossFieldValidation.forEach((cross: any) => {
          const crossError = this.validateCrossField(field, cross, answers as InspectionAnswers);
          if (crossError) {
            allErrors.push(crossError);
          }
        });
      }
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  // Validar toda la inspección
  validateAll(
    fields: Field[],
    answers: InspectionAnswers
  ): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];
    
    // Iterar sobre todas las hojas
    Object.entries(answers).forEach(([sheetName, sheetAnswers]) => {
      if (!sheetAnswers || typeof sheetAnswers !== 'object') return;
      
      const sheetFields = fields.filter(f => 
        (f.metadata?.section || '').toLowerCase() === sheetName.toLowerCase()
      );
      
      // Si no hay campos específicos de hoja, usar todos
      const fieldsToValidate = sheetFields.length > 0 ? sheetFields : fields;
      
      const result = this.validateSection(fieldsToValidate, sheetAnswers as Record<string, unknown>);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  // Validación condicional (basada en reglas)
  validateConditional(
    fields: Field[],
    answers: Record<string, unknown>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    fields.forEach(field => {
      if (!field.conditional || field.type === 'section-title') return;
      
      const conditionField = answers[field.conditional.field];
      let conditionMet = false;
      
      switch (field.conditional.operator) {
        case 'equals':
          conditionMet = conditionField === field.conditional.value;
          break;
        case 'not-equals':
          conditionMet = conditionField !== field.conditional.value;
          break;
        // Agregar más operadores según necesidad
      }
      
      // Si la condición indica que el campo debe mostrarse y está vacío
      if (conditionMet && field.conditional.action === 'require') {
        const value = answers[field.id as string];
        if (value === null || value === undefined || value === '') {
          errors.push({
            fieldId: String(field.id),
            message: `${field.label} es requerido según la condición`,
            type: 'conditional'
          });
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const validationEngine = new ValidationEngine();

export default ValidationEngine;