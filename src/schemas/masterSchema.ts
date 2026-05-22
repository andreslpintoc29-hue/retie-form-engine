/**
 * =====================================================
 * JSON SCHEMA MAESTRO UNIVERSAL - RETIE INSPECTION FRAMEWORK
 * =====================================================
 * Schema único que soporta TODAS las hojas RETIE actuales y futuras
 * 
 * Características:
 * - Sections y Subsections
 * - Todos los tipos de campos
 * - Validaciones complejas
 * - Reglas condicionales
 * - Fórmulas
 * - Metadatos
 * - Adjuntos
 * - Firmas
 * - Cumplimiento
 * - Observaciones
 * - Scoring
 * - Severidad
 * - Evidencia
 * - Workflow states
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const FieldTypeEnum = z.enum([
  'text', 'textarea', 'number', 'decimal', 'date', 'datetime',
  'checkbox', 'radio', 'select', 'multi-select',
  'dynamic-table', 'group-fields', 'section-title', 'file-upload',
  'signature', 'location', 'qr-code', 'calculated', 'status'
]);

export const ValidationTypeEnum = z.enum([
  'required', 'min', 'max', 'minLength', 'maxLength',
  'pattern', 'custom', 'cross-field', 'table', 'conditional'
]);

export const OperatorEnum = z.enum([
  'equals', 'not-equals', 'contains', 'not-contains',
  'greater-than', 'less-than', 'greater-or-equal', 'less-or-equal',
  'between', 'in', 'not-in', 'is-empty', 'is-not-empty'
]);

export const SeverityEnum = z.enum([
  'critical', 'major', 'minor', 'observation'
]);

export const ComplianceStatusEnum = z.enum([
  'conforme', 'no-conforme', 'no-aplica', 'pendiente'
]);

export const WorkflowStateEnum = z.enum([
  'draft', 'in-progress', 'completed', 'approved', 'rejected', 'archived'
]);

export const UserRoleEnum = z.enum([
  'inspector', 'supervisor', 'admin', 'viewer'
]);

// ============================================
// SCHEMAS BASE
// ============================================

// Opciones para select, radio, checkbox
export const FieldOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  color: z.string().optional(),
  icon: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

// Validación individual
export const ValidationRuleSchema = z.object({
  type: ValidationTypeEnum,
  value: z.union([z.string(), z.number(), z.array(z.unknown())]).optional(),
  message: z.string().optional(),
  severity: SeverityEnum.optional()
});

// Validación cross-field
export const CrossFieldValidationSchema = z.object({
  targetField: z.string(),
  operator: OperatorEnum,
  value: z.union([z.string(), z.number()]),
  message: z.string()
});

// Metadatos de campo
export const FieldMetadataSchema = z.object({
  section: z.string().optional(),
  subsection: z.string().optional(),
  category: z.string().optional(),
  norma: z.string().optional(),
  requirement: z.string().optional(),
  tags: z.array(z.string()).optional(),
  helpText: z.string().optional(),
  placeholder: z.string().optional()
});

// Columna de tabla dinámica
export const TableColumnSchema = z.object({
  field: z.string(),
  label: z.string(),
  type: FieldTypeEnum,
  width: z.string().optional(),
  sortable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  options: z.array(FieldOptionSchema).optional(),
  formula: z.string().optional(),
  validation: z.array(ValidationRuleSchema).optional(),
  metadata: FieldMetadataSchema.optional()
});

// Grupo de campos
export const FieldGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.literal('group-fields'),
  fields: z.array(z.lazy(() => FieldSchema)),
  layout: z.enum(['horizontal', 'vertical', 'grid']).optional(),
  columns: z.number().optional(),
  conditional: z.object({
    field: z.string(),
    operator: OperatorEnum,
    value: z.unknown()
  }).optional()
});

// Campo individual
export const FieldSchema: z.ZodType<any> = z.object({
  id: z.union([z.string(), z.number()]),
  key: z.string().optional(), // Identificador único para referencing
  label: z.string(),
  type: FieldTypeEnum,
  
  // Opciones para tipos específicos
  options: z.array(FieldOptionSchema).optional(),
  columns: z.array(TableColumnSchema).optional(),
  fields: z.array(z.lazy(() => FieldSchema)).optional(),
  
  // Validación
  validation: z.array(ValidationRuleSchema).optional(),
  crossFieldValidation: z.array(CrossFieldValidationSchema).optional(),
  
  // Condicionales
  conditional: z.object({
    field: z.string(),
    operator: OperatorEnum,
    value: z.unknown(),
    action: z.enum(['show', 'hide', 'enable', 'disable', 'require', 'set-value'])
  }).optional(),
  
  // Fórmulas
  formula: z.string().optional(),
  computedFrom: z.array(z.string()).optional(),
  
  // Metadatos
  metadata: FieldMetadataSchema.optional(),
  
  // Configuración UI
  width: z.string().optional(),
  order: z.number().optional(),
  visible: z.boolean().optional(),
  editable: z.boolean().optional(),
  
  // Severidad para NO conforme
  nonConformitySeverity: SeverityEnum.optional(),
  
  // Scoring
  scoreWeight: z.number().optional(),
  maxScore: z.number().optional()
});

// ============================================
// SECCIONES
// ============================================

export const SubsectionSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  titulo: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  orden: z.number().optional(),
  fields: z.array(FieldSchema),
  conditional: z.object({
    field: z.string(),
    operator: OperatorEnum,
    value: z.unknown()
  }).optional()
}).catchall(z.any());

export const SectionSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  titulo: z.string().optional(),
  description: z.string().optional(),
  order: z.number().optional(),
  orden: z.number().optional(),
  fields: z.array(FieldSchema),
  subsections: z.array(SubsectionSchema).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  conditional: z.object({
    field: z.string(),
    operator: OperatorEnum,
    value: z.unknown()
  }).optional()
}).catchall(z.any());

// ============================================
// HOJA (SHEET)
// ============================================

export const SheetSchema = z.object({
  // Identificación
  nombre: z.string().optional(),
  codigo: z.string(),
  titulo: z.string(),
  version: z.string().optional(),
  tipo: z.string().optional(),
  orden: z.number().optional(),
  order: z.number().optional(),
  
  // Estructura
  sections: z.array(SectionSchema).optional(),
  fields: z.array(FieldSchema).optional(), // Fields raíz si no hay sections
  
  // Configuración
  config: z.object({
    allowPartialSave: z.boolean().optional(),
    requireAllFields: z.boolean().optional(),
    autoSaveInterval: z.number().optional(),
    maxAttachments: z.number().optional(),
    allowMultipleSubmissions: z.boolean().optional(),
    workflowEnabled: z.boolean().optional(),
    complianceCalculation: z.enum(['weighted', 'simple', 'custom']).optional()
  }).optional(),
  
  // Metadatos
  metadata: z.object({
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
}).catchall(z.any());

// ============================================
// INSPECCIÓN COMPLETA
// ============================================

// Respuesta de campo
export const FieldAnswerSchema = z.object({
  value: z.unknown(),
  timestamp: z.string().optional(),
  userId: z.string().optional(),
  evidence: z.array(z.string()).optional(), // URLs de archivos
  observation: z.string().optional(),
  isNonConformity: z.boolean().optional(),
  severity: SeverityEnum.optional(),
  closedAt: z.string().optional(),
  closureObservation: z.string().optional()
});

// Respuesta de tabla
export const TableAnswerSchema = z.object({
  rows: z.array(z.record(z.string(), z.unknown())),
  totals: z.record(z.string(), z.unknown()).optional(),
  metadata: z.object({
    addedRows: z.number().optional(),
    deletedRows: z.number().optional(),
    lastModified: z.string().optional()
  }).optional()
});

// Respuesta de sección
export const SectionAnswerSchema = z.record(z.union([z.string(), z.number()]), z.unknown());

// Metadata de inspección
export const InspectionMetadataSchema = z.object({
  id: z.string(),
  projectId: z.string().optional(),
  proyecto: z.string(),
  direccion: z.string(),
  fecha: z.string(),
  inspector: z.string(),
  inspectorId: z.string().optional(),
  supervisor: z.string().optional(),
  supervisorId: z.string().optional(),
  codigo: z.string(),
  estado: WorkflowStateEnum,
  tipo: z.string().optional(),
  
  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
  submittedAt: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  
  // Local tracking
  localId: z.string().optional(), // Para offline
  syncStatus: z.enum(['pending', 'synced', 'conflict']).optional(),
  lastSyncedAt: z.string().optional()
});

// Inspections answers
export const InspectionAnswersSchema = z.record(z.string(), z.unknown());

// ============================================
// CUMPLIMIENTO
// ============================================

export const ComplianceItemSchema = z.object({
  fieldId: z.string(),
  status: ComplianceStatusEnum,
  score: z.number().optional(),
  maxScore: z.number().optional(),
  severity: SeverityEnum.optional(),
  nonConformityId: z.string().optional()
});

export const SectionComplianceSchema = z.object({
  sectionId: z.string(),
  total: z.number(),
  conforme: z.number(),
  noConforme: z.number(),
  noAplica: z.number(),
  percentage: z.number(),
  items: z.array(ComplianceItemSchema)
});

export const SheetComplianceSchema = z.object({
  sheetName: z.string(),
  sectionCompliance: z.array(SectionComplianceSchema),
  overallPercentage: z.number(),
  status: z.enum(['aprobado', 'rechazado', 'pendiente']),
  criticalNonConformities: z.number(),
  majorNonConformities: z.number()
});

// ============================================
// NO CONFORMIDADES
// ============================================

export const NonConformitySchema = z.object({
  id: z.string(),
  fieldId: z.string(),
  sheetName: z.string(),
  sectionId: z.string().optional(),
  severity: SeverityEnum,
  description: z.string(),
  evidence: z.array(z.string()).optional(),
  observation: z.string().optional(),
  
  // Cierre
  closed: z.boolean().optional(),
  closureDate: z.string().optional(),
  closureObservation: z.string().optional(),
  closedBy: z.string().optional(),
  
  // Tracking
  createdAt: z.string(),
  updatedAt: z.string()
});

// ============================================
// SCHEMA EXPORTADOS
// ============================================

export type FieldType = z.infer<typeof FieldTypeEnum>;
export type ValidationType = z.infer<typeof ValidationTypeEnum>;
export type Operator = z.infer<typeof OperatorEnum>;
export type Severity = z.infer<typeof SeverityEnum>;
export type ComplianceStatus = z.infer<typeof ComplianceStatusEnum>;
export type WorkflowState = z.infer<typeof WorkflowStateEnum>;
export type UserRole = z.infer<typeof UserRoleEnum>;

export type FieldOption = z.infer<typeof FieldOptionSchema>;
export type ValidationRule = z.infer<typeof ValidationRuleSchema>;
export type CrossFieldValidation = z.infer<typeof CrossFieldValidationSchema>;
export type FieldMetadata = z.infer<typeof FieldMetadataSchema>;
export type TableColumn = z.infer<typeof TableColumnSchema>;
export type FieldGroup = z.infer<typeof FieldGroupSchema>;
export type Field = z.infer<typeof FieldSchema>;

export type Subsection = z.infer<typeof SubsectionSchema>;
export type Section = z.infer<typeof SectionSchema>;

export type Sheet = z.infer<typeof SheetSchema>;

export type FieldAnswer = z.infer<typeof FieldAnswerSchema>;
export type TableAnswer = z.infer<typeof TableAnswerSchema>;
export type SectionAnswer = z.infer<typeof SectionAnswerSchema>;
export type InspectionMetadata = z.infer<typeof InspectionMetadataSchema>;
export type InspectionAnswers = z.infer<typeof InspectionAnswersSchema>;

export type ComplianceItem = z.infer<typeof ComplianceItemSchema>;
export type SectionCompliance = z.infer<typeof SectionComplianceSchema>;
export type SheetCompliance = z.infer<typeof SheetComplianceSchema>;

export type NonConformity = z.infer<typeof NonConformitySchema>;

// Aliases for historical RETIE schema compatibility
export type RETIEMasterSchema = MasterSchema;
export type RETIEFieldSchema = Field;
export type RETIESheetSchema = Sheet;
export type RETIESectionSchema = Section;
export type RETIESection = Section;


// ============================================
// MAESTRO COMPLETO
// ============================================

export const MasterSchemaSchema = z.object({
  version: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  sheets: z.array(SheetSchema).optional(),
  
  // Configuraciones globales
  globalConfig: z.object({
    defaultLanguage: z.string().optional(),
    dateFormat: z.string().optional(),
    decimalSeparator: z.string().optional(),
    currency: z.string().optional(),
    timezone: z.string().optional(),
    complianceThreshold: z.number().optional(),
    criticalThreshold: z.number().optional()
  }).optional()
}).catchall(z.any());

export type MasterSchema = z.infer<typeof MasterSchemaSchema>;

// ============================================
// VALIDATOR FUNCTIONS
// ============================================

export const validateField = (field: Field, value: unknown): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!field.validation) {
    return { valid: true, errors: [] };
  }
  
  for (const rule of field.validation) {
    switch (rule.type) {
      case 'required':
        if (value === null || value === undefined || value === '') {
          errors.push(rule.message || `${field.label} es requerido`);
        }
        break;
        
      case 'min':
        if (typeof value === 'number' && value < (rule.value as number)) {
          errors.push(rule.message || `Valor mínimo: ${rule.value}`);
        }
        break;
        
      case 'max':
        if (typeof value === 'number' && value > (rule.value as number)) {
          errors.push(rule.message || `Valor máximo: ${rule.value}`);
        }
        break;
        
      case 'minLength':
        if (typeof value === 'string' && value.length < (rule.value as number)) {
          errors.push(rule.message || `Mínimo ${rule.value} caracteres`);
        }
        break;
        
      case 'maxLength':
        if (typeof value === 'string' && value.length > (rule.value as number)) {
          errors.push(rule.message || `Máximo ${rule.value} caracteres`);
        }
        break;
        
      case 'pattern':
        if (typeof value === 'string') {
          const regex = new RegExp(rule.value as string);
          if (!regex.test(value)) {
            errors.push(rule.message || 'Formato inválido');
          }
        }
        break;
    }
  }
  
  return { valid: errors.length === 0, errors };
};

export const calculateCompliance = (
  fields: Field[],
  answers: Record<string, unknown>
): { percentage: number; conforme: number; noConforme: number; noAplica: number; total: number } => {
  let conforme = 0;
  let noConforme = 0;
  let noAplica = 0;
  let total = 0;
  
  fields.forEach(field => {
    if (field.type === 'section-title' || field.type === 'group-fields') return;
    
    const value = answers[field.id as string];
    
    // Skip fields without validation rules or computed fields
    if (!field.validation?.some((v: any) => v.type === 'required')) return;
    
    total++;
    
    if (value === 'SI' || value === 'CONFORME') {
      conforme++;
    } else if (value === 'NO' || value === 'NO CONFORME') {
      noConforme++;
    } else if (value === 'N/A' || value === 'NO APLICA') {
      noAplica++;
    }
  });
  
  const validTotal = total - noAplica;
  const percentage = validTotal > 0 ? Math.round((conforme / validTotal) * 100) : 0;
  
  return { percentage, conforme, noConforme, noAplica, total };
};

export default MasterSchemaSchema;