// ============================================
// RETIE SCHEMA NORMALIZATION STANDARD
// ============================================

/**
 * ESTÁNDAR DE NOMENCLATURA PARA SCHEMAS RETIE
 * 
 * Este documento define las convenciones estándar para todos los schemas RETIE.
 * Debe seguirse rigurosamente para mantener consistencia.
 */

// ============================================
// 1. NOMENCLATURA DE COLECCIONES
// ============================================

export const COLLECTION_NAMING = {
  // Nombres de sheets (códigos)
  SHEETS: {
    GENERAL: 'GENERAL',
    ACOMETIDA: 'ACOMETIDA',
    TABLERO: 'TABLERO',
    MEDICIONES: 'MEDICIONES',
    RESULTADOS: 'RESULTADOS',
    PISCINAS: 'PISCINAS',
    ILUMINACION: 'ILUMINACION',
    ASCENSORES: 'ASCENSORES',
    DISTRIBUCION: 'DISTRIBUCION'
  } as const
} as const;

// ============================================
// 2. NOMENCLATURA DE CAMPOS
// ============================================

/**
 * Convenciones para IDs de campos:
 * - lowercase
 * - snake_case
 * - máximo 50 caracteres
 * - Prefijos por categoría:
 *   - site_ : Datos del sitio
 *   - applicant_ : Datos del solicitante
 *   - has_ : SI/NO preguntas
 *   - voltage_ : Mediciones de voltaje
 *   - current_ : Mediciones de corriente
 *   - grounding_ : Puesta a tierra
 *   - insulation_ : Aislamiento
 *   - ground_ : Continuidad de tierra
 *   - panel_ : Características de tablero
 *   - circuit_ : Circuitos derivados
 *   - meter_ : Medidor
 *   - breaker_ : Interruptores
 *   - compliance_ : Cumplimiento
 *   - obs_ : Observaciones
 *   - rec_ : Recomendaciones
 */

export const FIELD_ID_PATTERNS = {
  PREFIXES: {
    SITE: 'site_',
    APPLICANT: 'applicant_',
    HAS: 'has_',
    VOLTAGE: 'voltage_',
    CURRENT: 'current_',
    GROUNDING: 'grounding_',
    INSULATION: 'insulation_',
    GROUND: 'ground_',
    PANEL: 'panel_',
    CIRCUIT: 'circuit_',
    METER: 'meter_',
    BREAKER: 'breaker_',
    COMPLIANCE: 'compliance_',
    OBSERVATION: 'obs_',
    RECOMMENDATION: 'rec_',
    INSPECTOR: 'inspector_',
    PHOTO: 'photo_',
    ATTACHMENT: 'attachment_'
  },

  // Tipos de campo
  TYPES: {
    TEXT: 'text',
    NUMBER: 'number',
    DECIMAL: 'decimal',
    DATE: 'date',
    DATETIME: 'datetime',
    SELECT: 'select',
    RADIO: 'radio',
    CHECKBOX: 'checkbox',
    TEXTAREA: 'textarea',
    DYNAMIC_TABLE: 'dynamic-table',
    SECTION_TITLE: 'section-title'
  } as const
} as const;

// ============================================
// 3. NOMENCLATURA DE OPCIONES
// ============================================

/**
 * Opciones estándar para tipos comunes
 */

export const STANDARD_OPTIONS = {
  YES_NO: [
    { label: 'SI', value: 'SI' },
    { label: 'NO', value: 'NO' },
    { label: 'N/A', value: 'N/A' }
  ],

  YES_NO_REQUIRED: [
    { label: 'SI', value: 'SI' },
    { label: 'NO', value: 'NO' }
  ],

  RISK_LEVEL: [
    { label: 'Bajo', value: 'low' },
    { label: 'Medio', value: 'medium' },
    { label: 'Alto', value: 'high' }
  ],

  CATEGORY: [
    { label: 'Residencial', value: 'residential' },
    { label: 'Comercial', value: 'commercial' },
    { label: 'Industrial', value: 'industrial' },
    { label: 'Institucional', value: 'institutional' },
    { label: 'Rural', value: 'rural' },
    { label: 'Especial', value: 'special' }
  ],

  VOLTAGE_LEVEL: [
    { label: '120V', value: '120' },
    { label: '208V', value: '208' },
    { label: '240V', value: '240' },
    { label: '480V', value: '480' }
  ],

  PHASE_TYPE: [
    { label: 'Monofásico (1φ)', value: '1' },
    { label: 'Trifásico (3φ)', value: '3' }
  ],

  CONDUCTOR_TYPE: [
    { label: 'Cobre', value: 'copper' },
    { label: 'Aluminio', value: 'aluminum' }
  ],

  WEATHER: [
    { label: 'Soleado', value: 'sunny' },
    { label: 'Nublado', value: 'cloudy' },
    { label: 'Lluvioso', value: 'rainy' },
    { label: 'Ventoso', value: 'windy' }
  ]
} as const;

// ============================================
// 4. METADATA ESTÁNDAR
// ============================================

/**
 * Metadata estándar para campos
 */

export const FIELD_METADATA = {
  // Para todos los campos
  COMMON: {
    helpText: 'Texto de ayuda para el usuario',
    placeholder: 'Placeholder del campo',
    description: 'Descripción larga'
  },

  // Para campos RETIE específicos
  RETIE: {
    norma: 'Referencia normativa RETIE',
    article: 'Artículo específico',
    requirement: 'Requisito específico',
    minValue: 'Valor mínimo permitido',
    maxValue: 'Valor máximo permitido',
    unit: 'Unidad de medida'
  },

  // Para evidencias
  EVIDENCE: {
    requiredPhotos: 'Número de fotos requeridas',
    minPhotos: 'Fotos mínimas',
    maxPhotos: 'Fotos máximas',
    videoRequired: 'Video requerido',
    documentRequired: 'Documento requerido'
  }
} as const;

// ============================================
// 5. VALIDATION ESTÁNDAR
// ============================================

/**
 * Reglas de validación estándar
 */

export const STANDARD_VALIDATION = {
  REQUIRED: { type: 'required' as const },
  
  NUMBER_RANGE: (min: number, max: number) => [
    { type: 'min' as const, value: min },
    { type: 'max' as const, value: max }
  ],

  DECIMAL_PRECISION: (precision: number) => ({
    type: 'precision' as const, value: precision
  }),

  PATTERN: (regex: string, message: string) => ({
    type: 'pattern' as const, value: regex, message
  })
} as const;

// ============================================
// 6. COMPLIANCE ESTÁNDAR
// ============================================

/**
 * Definiciones de compliance para RETIE
 */

export const COMPLIANCE_STANDARDS = {
  // Niveles de severidad para no conformidades
  SEVERITY: {
    CRITICAL: {
      value: 'critical',
      label: 'Crítico',
      description: 'Riesgo directo a la vida o seguridad',
      autoCreateNC: true,
      weight: 5
    },
    MAJOR: {
      value: 'major',
      label: 'Mayor',
      description: 'Incumplimiento significativo de RETIE',
      autoCreateNC: true,
      weight: 3
    },
    MINOR: {
      value: 'minor',
      label: 'Menor',
      description: 'Desviación menor o cosmética',
      autoCreateNC: false,
      weight: 1
    }
  },

  // Grados de cumplimiento
  GRADE_THRESHOLDS: {
    A: { min: 90, color: '#10b981', label: 'A - Excelente' },
    B: { min: 75, color: '#3b82f6', label: 'B - Bueno' },
    C: { min: 60, color: '#f59e0b', label: 'C - Aceptable' },
    D: { min: 40, color: '#f97316', label: 'D - Insuficiente' },
    F: { min: 0, color: '#ef4444', label: 'F - No conforme' }
  },

  // Cálculo de score
  SCORE_CALCULATION: {
    basePercentage: 100,
    criticalPenalty: 5,
    majorPenalty: 2,
    minorPenalty: 0.5
  }
} as const;

// ============================================
// 7. TABLE STANDARDS
// ============================================

/**
 * Estándares para tablas dinámicas
 */

export const TABLE_STANDARDS = {
  // Columnas estándar
  STANDARD_COLUMNS: {
    ROW_NUMBER: { field: 'row_num', label: '#', type: 'number', width: 40 },
    DESCRIPTION: { field: 'description', label: 'Descripción', type: 'text', width: 200 },
    VALUE: { field: 'value', label: 'Valor', type: 'text', width: 100 },
    OBSERVATION: { field: 'observation', label: 'Observación', type: 'text', width: 200 },
    STATUS: { field: 'status', label: 'Estado', type: 'select', width: 80 },
    PHOTO: { field: 'photo', label: 'Foto', type: 'photo', width: 60 }
  },

  // Límites
  LIMITS: {
    MAX_ROWS: 500,
    MAX_COLUMNS: 20,
    DEFAULT_ROWS: 10
  }
} as const;

// ============================================
// 8. EVIDENCE STANDARDS
// ============================================

export const EVIDENCE_STANDARDS = {
  PHOTO: {
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    thumbnailWidth: 200,
    thumbnailHeight: 200,
    compressionQuality: 0.7
  },

  VIDEO: {
    maxSizeMB: 50,
    allowedTypes: ['video/mp4', 'video/webm'],
    maxDurationSeconds: 120
  },

  DOCUMENT: {
    maxSizeMB: 25,
    allowedTypes: ['application/pdf']
  },

  SIGNATURE: {
    maxSizeMB: 2,
    allowedTypes: ['image/png', 'image/jpeg']
  }
} as const;

// ============================================
// 9. RESULT STATUS DEFINITIONS
// ============================================

export const INSPECTION_STATUS = {
  DRAFT: { value: 'draft', label: 'Borrador', color: '#6b7280', next: ['in_progress'] },
  IN_PROGRESS: { value: 'in_progress', label: 'En Progreso', color: '#3b82f6', next: ['draft', 'submitted'] },
  SUBMITTED: { value: 'submitted', label: 'Enviada', color: '#8b5cf6', next: ['under_review'] },
  UNDER_REVIEW: { value: 'under_review', label: 'En Revisión', color: '#f59e0b', next: ['approved', 'rejected'] },
  APPROVED: { value: 'approved', label: 'Aprobada', color: '#10b981', next: ['closed'] },
  REJECTED: { value: 'rejected', label: 'Rechazada', color: '#ef4444', next: ['in_progress', 'draft'] },
  CLOSED: { value: 'closed', label: 'Cerrada', color: '#6366f1', next: ['archived'] },
  ARCHIVED: { value: 'archived', label: 'Archivada', color: '#9ca3af', next: [] }
} as const;

// ============================================
// 10. NON-CONFORMITY STATUS
// ============================================

export const NC_STATUS = {
  OPEN: { value: 'open', label: 'Abierta', color: '#ef4444' },
  CORRECTED: { value: 'corrected', label: 'Corregida', color: '#f59e0b' },
  VALIDATED: { value: 'validated', label: 'Validada', color: '#10b981' },
  CLOSED: { value: 'closed', label: 'Cerrada', color: '#6366f1' }
} as const;

export default COMPLIANCE_STANDARDS;