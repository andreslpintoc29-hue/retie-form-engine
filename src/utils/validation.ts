import { z } from 'zod';
import { FormField, FieldValidation } from '@/types/schema';

// ============================================
// GENERADOR DE ESQUEMAS ZOD DESDE JSON
// ============================================

export const generateZodSchema = (field: FormField): z.ZodType<unknown> => {
  const validation = field.validation;

  switch (field.type) {
    case 'text':
    case 'textarea':
      let textSchema = z.string();
      if (validation?.required) {
        textSchema = textSchema.min(1, validation.message || 'Campo requerido');
      }
      if (validation?.minLength) {
        textSchema = textSchema.min(validation.minLength, `Mínimo ${validation.minLength} caracteres`);
      }
      if (validation?.maxLength) {
        textSchema = textSchema.max(validation.maxLength, `Máximo ${validation.maxLength} caracteres`);
      }
      if (validation?.pattern) {
        textSchema = textSchema.regex(new RegExp(validation.pattern), validation.message || 'Formato inválido');
      }
      return textSchema;

    case 'number':
      let numberSchema = z.number();
      if (validation?.min !== undefined) {
        numberSchema = numberSchema.min(validation.min, `Valor mínimo: ${validation.min}`);
      }
      if (validation?.max !== undefined) {
        numberSchema = numberSchema.max(validation.max, `Valor máximo: ${validation.max}`);
      }
      return !validation?.required ? numberSchema.optional() : numberSchema;

    case 'decimal':
      let decimalSchema = z.number();
      if (validation?.min !== undefined) {
        decimalSchema = decimalSchema.min(validation.min);
      }
      if (validation?.max !== undefined) {
        decimalSchema = decimalSchema.max(validation.max);
      }
      return !validation?.required ? decimalSchema.optional() : decimalSchema;

    case 'date':
      let dateSchema = z.string();
      if (validation?.required) {
        dateSchema = dateSchema.min(1, 'Fecha requerida');
      }
      return dateSchema;

    case 'checkbox':
      if (validation?.required) {
        return z.array(z.string()).min(1, 'Seleccione al menos una opción');
      }
      return z.array(z.string()).optional();

    case 'radio':
    case 'select':
      let enumSchema = z.string();
      if (validation?.required) {
        enumSchema = enumSchema.min(1, 'Seleccione una opción');
      }
      return enumSchema.optional();

    case 'dynamic-table':
      return z.array(z.record(z.string(), z.unknown())).optional();

    case 'group-fields':
      return z.record(z.string(), z.unknown()).optional();

    default:
      return z.any();
  }
};

// ============================================
// VALIDACIÓN DE CAMPOS
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export const validateField = (
  field: FormField,
  value: unknown
): ValidationError | null => {
  const validation = field.validation;
  if (!validation) return null;

  // Validar requerido
  if (validation.required) {
    if (value === null || value === undefined || value === '') {
      return { field: String(field.id), message: validation.message || `${field.label} es requerido` };
    }
  }

  // Validar tipo text/textarea
  if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return { field: String(field.id), message: `Mínimo ${validation.minLength} caracteres` };
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return { field: String(field.id), message: `Máximo ${validation.maxLength} caracteres` };
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        return { field: String(field.id), message: validation.message || 'Formato inválido' };
      }
    }
  }

  // Validar tipo number/decimal
  if ((field.type === 'number' || field.type === 'decimal') && typeof value === 'number') {
    if (validation.min !== undefined && value < validation.min) {
      return { field: String(field.id), message: `Valor mínimo: ${validation.min}` };
    }
    if (validation.max !== undefined && value > validation.max) {
      return { field: String(field.id), message: `Valor máximo: ${validation.max}` };
    }
  }

  // Validar radio/select
  if ((field.type === 'radio' || field.type === 'select') && validation.required) {
    if (!value || value === '') {
      return { field: String(field.id), message: validation.message || 'Seleccione una opción' };
    }
  }

  // Validar checkbox
  if (field.type === 'checkbox' && validation.required) {
    if (!Array.isArray(value) || value.length === 0) {
      return { field: String(field.id), message: validation.message || 'Seleccione al menos una opción' };
    }
  }

  return null;
};

// ============================================
// VALIDACIÓN DE SECCIÓN COMPLETA
// ============================================

export const validateSection = (
  fields: FormField[],
  values: Record<string, unknown>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  fields.forEach((field) => {
    const value = values[String(field.id)];
    const error = validateField(field, value);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

// ============================================
// UTILIDADES DE FORMATO
// ============================================

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};