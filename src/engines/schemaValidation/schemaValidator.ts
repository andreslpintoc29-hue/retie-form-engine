/**
 * =====================================================
 * JSON SCHEMA VALIDATOR
 * =====================================================
 * 
 * Valida que los schemas cargados sean válidos
 * antes de renderizar
 */

import { Field, Section, Sheet, MasterSchema, FieldTypeEnum } from '@/schemas/masterSchema';

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  path: string;
  message: string;
  code: string;
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  metadata: {
    fieldsCount: number;
    sectionsCount: number;
    tablesCount: number;
    formulasCount: number;
  };
}

export class SchemaValidator {
  private validFieldTypes = [
    'text', 'textarea', 'number', 'decimal', 'date', 'datetime',
    'checkbox', 'radio', 'select', 'multi-select',
    'dynamic-table', 'group-fields', 'section-title',
    'file-upload', 'signature', 'location', 'calculated', 'status'
  ];

  private validOperators = [
    'equals', 'not-equals', 'contains', 'not-contains',
    'greater-than', 'less-than', 'greater-or-equal', 'less-or-equal',
    'between', 'in', 'not-in', 'is-empty', 'is-not-empty'
  ];

  private validValidationTypes = [
    'required', 'min', 'max', 'minLength', 'maxLength',
    'pattern', 'custom', 'cross-field', 'table', 'conditional'
  ];

  // Validar schema completo
  validateSheet(sheet: Sheet): SchemaValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    
    // Validar estructura básica
    if (!sheet.nombre) {
      errors.push({
        severity: 'error',
        path: 'nombre',
        message: 'Campo nombre es requerido',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }

    if (!sheet.codigo) {
      errors.push({
        severity: 'error',
        path: 'codigo',
        message: 'Campo código es requerido',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }

    if (!sheet.titulo) {
      errors.push({
        severity: 'error',
        path: 'titulo',
        message: 'Campo título es requerido',
        code: 'MISSING_REQUIRED_FIELD'
      });
    }

    // Validar tipo
    if (sheet.type && !['checklist', 'informacion', 'medicion', 'certificado', 'documento'].includes(sheet.type)) {
      errors.push({
        severity: 'error',
        path: 'type',
        message: `Tipo "${sheet.type}" no es válido`,
        code: 'INVALID_TYPE'
      });
    }

    // Validar secciones y campos
    let fieldsCount = 0;
    let sectionsCount = 0;
    let tablesCount = 0;
    let formulasCount = 0;

    if (sheet.sections) {
      sectionsCount = sheet.sections.length;
      
      sheet.sections.forEach((section, secIdx) => {
        // Validar sección
        if (!section.id) {
          errors.push({
            severity: 'error',
            path: `sections[${secIdx}].id`,
            message: `Sección ${secIdx} no tiene ID`,
            code: 'MISSING_SECTION_ID'
          });
        }

        if (!section.title) {
          errors.push({
            severity: 'error',
            path: `sections[${secIdx}].title`,
            message: `Sección ${secIdx} no tiene título`,
            code: 'MISSING_SECTION_TITLE'
          });
        }

        // Validar campos
        section.fields?.forEach((field, fieldIdx) => {
          const fieldResult = this.validateField(field, `sections[${secIdx}].fields[${fieldIdx}]`);
          errors.push(...fieldResult.errors);
          warnings.push(...fieldResult.warnings);

          fieldsCount++;
          if (field.type === 'dynamic-table') tablesCount++;
          if (field.formula) formulasCount++;
        });

        // Validar subsecciones
        section.subsections?.forEach((subsec, subIdx) => {
          subsec.fields?.forEach((field, fieldIdx) => {
            const fieldResult = this.validateField(field, `sections[${secIdx}].subsections[${subIdx}].fields[${fieldIdx}]`);
            errors.push(...fieldResult.errors);
            warnings.push(...fieldResult.warnings);

            fieldsCount++;
            if (field.type === 'dynamic-table') tablesCount++;
            if (field.formula) formulasCount++;
          });
        });
      });
    }

    // Validar campos raíz si no hay secciones
    if (!sheet.sections && sheet.fields) {
      sheet.fields.forEach((field, fieldIdx) => {
        const fieldResult = this.validateField(field, `fields[${fieldIdx}]`);
        errors.push(...fieldResult.errors);
        warnings.push(...fieldResult.warnings);

        fieldsCount++;
        if (field.type === 'dynamic-table') tablesCount++;
      });
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors: errors.filter(e => e.severity === 'error'),
      warnings: [...errors.filter(e => e.severity === 'warning'), ...warnings],
      metadata: {
        fieldsCount,
        sectionsCount,
        tablesCount,
        formulasCount
      }
    };
  }

  // Validar campo individual
  private validateField(field: Field, path: string): { errors: ValidationIssue[]; warnings: ValidationIssue[] } {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // ID requerido
    if (field.id === undefined || field.id === null) {
      errors.push({
        severity: 'error',
        path: `${path}.id`,
        message: 'Campo sin ID',
        code: 'MISSING_FIELD_ID'
      });
    }

    // Tipo válido
    if (field.type && !this.validFieldTypes.includes(field.type)) {
      errors.push({
        severity: 'error',
        path: `${path}.type`,
        message: `Tipo "${field.type}" no válido`,
        code: 'INVALID_FIELD_TYPE'
      });
    }

    // Label requerido para campos interactivos
    if (field.type && !['section-title', 'calculated'].includes(field.type) && !field.label) {
      errors.push({
        severity: 'error',
        path: `${path}.label`,
        message: 'Campo sin label',
        code: 'MISSING_FIELD_LABEL'
      });
    }

    // Validar opciones para radio/select
    if ((field.type === 'radio' || field.type === 'select') && (!field.options || field.options.length === 0)) {
      errors.push({
        severity: 'error',
        path: `${path}.options`,
        message: 'Campo radio/select sin opciones',
        code: 'MISSING_OPTIONS'
      });
    }

    // Validar columnas para tablas dinámicas
    if (field.type === 'dynamic-table' && (!field.columns || field.columns.length === 0)) {
      errors.push({
        severity: 'error',
        path: `${path}.columns`,
        message: 'Tabla dinámica sin columnas',
        code: 'MISSING_TABLE_COLUMNS'
      });
    }

    // Validar columnas de tabla
    field.columns?.forEach((col: any, colIdx: number) => {
      if (!col.field) {
        errors.push({
          severity: 'error',
          path: `${path}.columns[${colIdx}].field`,
          message: 'Columna sin field',
          code: 'MISSING_COLUMN_FIELD'
        });
      }

      if (!col.label) {
        warnings.push({
          severity: 'warning',
          path: `${path}.columns[${colIdx}].label`,
          message: 'Columna sin label',
          code: 'MISSING_COLUMN_LABEL'
        });
      }
    });

    // Validar validación rules
    field.validation?.forEach((rule: any, ruleIdx: number) => {
      if (!this.validValidationTypes.includes(rule.type)) {
        errors.push({
          severity: 'error',
          path: `${path}.validation[${ruleIdx}].type`,
          message: `Tipo de validación "${rule.type}" no válido`,
          code: 'INVALID_VALIDATION_TYPE'
        });
      }
    });

    // Validar condiciones
    if (field.conditional) {
      if (!field.conditional.field) {
        errors.push({
          severity: 'error',
          path: `${path}.conditional.field`,
          message: 'Condición sin field de referencia',
          code: 'MISSING_CONDITIONAL_FIELD'
        });
      }

      if (!field.conditional.operator || !this.validOperators.includes(field.conditional.operator)) {
        errors.push({
          severity: 'error',
          path: `${path}.conditional.operator`,
          message: 'Operador de condición inválido',
          code: 'INVALID_CONDITIONAL_OPERATOR'
        });
      }
    }

    // Validar fórmulas
    if (field.formula) {
      const formulaValidation = this.validateFormula(field.formula);
      if (!formulaValidation.isValid) {
        errors.push({
          severity: 'error',
          path: `${path}.formula`,
          message: formulaValidation.error || 'Fórmula inválida',
          code: 'INVALID_FORMULA'
        });
      }
    }

    // Advertencias
    if (field.type === 'text' && !field.validation?.some((v: any) => v.type === 'required')) {
      warnings.push({
        severity: 'warning',
        path: `${path}`,
        message: 'Campo de texto sin validación',
        code: 'TEXT_WITHOUT_VALIDATION'
      });
    }

    return { errors, warnings };
  }

  // Validar fórmula básica
  validateFormula(formula: string): { isValid: boolean; error?: string } {
    try {
      // Verificar paréntesis balanceados
      let parens = 0;
      for (const char of formula) {
        if (char === '(') parens++;
        if (char === ')') parens--;
        if (parens < 0) return { isValid: false, error: 'Paréntesis desbalanceados' };
      }
      if (parens !== 0) return { isValid: false, error: 'Paréntesis desbalanceados' };

      // Verificar referencias de campos
      const fieldRefs = formula.match(/\$\{[a-zA-Z_][a-zA-Z0-9_]*}/g);
      if (fieldRefs) {
        for (const ref of fieldRefs) {
          const fieldName = ref.replace(/\$\{|}/g, '');
          if (!fieldName) return { isValid: false, error: `Referencia de campo vacía` };
        }
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }

  // Validar Master Schema
  validateMasterSchema(schema: MasterSchema): SchemaValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    if (!schema.sheets || schema.sheets.length === 0) {
      errors.push({
        severity: 'error',
        path: 'sheets',
        message: 'Master Schema sin hojas',
        code: 'EMPTY_SCHEMAS'
      });
    }

    schema.sheets?.forEach((sheet, idx) => {
      const result = this.validateSheet(sheet);
      result.errors.forEach(e => ({ ...e, path: `sheets[${idx}].${e.path}` }));
      result.warnings.forEach(w => ({ ...w, path: `sheets[${idx}].${w.path}` }));
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        fieldsCount: 0,
        sectionsCount: schema.sheets?.length || 0,
        tablesCount: 0,
        formulasCount: 0
      }
    };
  }
}

export const schemaValidator = new SchemaValidator();
export default SchemaValidator;