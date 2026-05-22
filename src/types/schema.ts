// ============================================
// TIPOS BASE DEL ESQUEMA JSON
// ============================================

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'decimal' 
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'select' 
  | 'dynamic-table' 
  | 'group-fields' 
  | 'section-title';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
}

export interface TableColumn {
  label: string;
  field: string;
  type: 'text' | 'number' | 'decimal' | 'select' | 'date';
  width?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
}

export interface GroupField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  columns?: TableColumn[];
  width?: string;
}

export interface FormField {
  id: number;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  columns?: TableColumn[];
  fields?: GroupField[];
  width?: string;
  conditional?: {
    field: string;
    value: string;
  };
}

export interface FormSection {
  id?: string;
  titulo: string;
  type: 'section';
  fields: FormField[];
}

export interface FormSheet {
  nombre: string;
  codigo: string;
  titulo: string;
  type: 'checklist' | 'informacion' | 'medicion';
  secciones?: FormSection[];
  fields?: FormField[];
  preguntas?: {
    item: number;
    cod: string;
    txt: string;
  }[];
}

export interface BaseDatos {
  hojas: FormSheet[];
}

// ============================================
// TIPOS DE RESPUESTAS
// ============================================

export interface FieldAnswer {
  [key: string]: string | number | boolean | string[] | Record<string, unknown> | null;
}

export interface TableRow {
  id: string;
  [key: string]: string | number | null;
}

export interface SectionAnswers {
  [fieldId: string]: FieldAnswer;
}

export interface SheetAnswers {
  seccion?: SectionAnswers;
  [key: string]: unknown;
}

export interface InspectionAnswers {
  [sheetName: string]: SheetAnswers;
}

// ============================================
// TIPOS DE VALIDACIÓN
// ============================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  fieldId: string;
  message: string;
  type: 'required' | 'format' | 'range' | 'custom';
}

// ============================================
// TIPOS DE CUMPLIMIENTO
// ============================================

export interface ComplianceResult {
  total: number;
  conforme: number;
  noConforme: number;
  noAplica: number;
  porcentaje: number;
  estado: 'aprobado' | 'rechazado' | 'pendiente';
}

export interface SheetCompliance {
  sheetName: string;
  compliance: ComplianceResult;
}

// ============================================
// TIPOS DE INSPECCIÓN
// ============================================

export interface InspectionMetadata {
  id: string;
  proyecto: string;
  direccion: string;
  fecha: string;
  inspector: string;
  codigo: string;
  estado: 'borrador' | 'completa' | 'aprobada' | 'rechazada';
}

export interface Inspection extends InspectionMetadata {
  respuestas: InspectionAnswers;
  cumplimiento: SheetCompliance[];
  createdAt: Date;
  updatedAt: Date;
}