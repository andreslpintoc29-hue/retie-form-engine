// ============================================
// SHARED CONTRACTS - Type Contracts Between Engines
// ============================================

import type { RETIEMasterSchema, RETIESheetSchema, RETIEFieldSchema } from '../../schemas/masterSchema';
import type { WorkflowState, Role } from '../../engines/workflow/workflowEngine';

// ============================================
// FORM STATE CONTRACTS
// ============================================

export interface FormStateContract {
  inspectionId: string;
  inspectionCode: string;
  status: WorkflowState;
  currentUser: UserContract | null;
  currentSheet: string | null;
  answers: Record<string, unknown>;
  fields: Map<string, FieldStateContract>;
  sheets: Map<string, SheetStateContract>;
  compliance: Map<string, ComplianceContract>;
  computed: Map<string, ComputedValueContract>;
  metadata: FormMetadataContract;
}

export interface FieldStateContract {
  id: string;
  label: string;
  type: string;
  value: unknown;
  originalValue?: unknown;
  isValid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isVisible: boolean;
  isEnabled: boolean;
  errors: ValidationErrorContract[];
  warnings: string[];
  computedValue?: unknown;
  compliant?: boolean;
  severity?: 'critical' | 'major' | 'minor';
  metadata?: Record<string, unknown>;
}

export interface SheetStateContract {
  sheetCode: string;
  title: string;
  fields: string[];
  totalFields: number;
  completedFields: number;
  progress: number;
  isVisible: boolean;
  isValid: boolean;
}

export interface ComplianceContract {
  sheetCode: string;
  percentage: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  noConformitiesCount: number;
  criticalCount: number;
  lastCalculated: string;
}

export interface ComputedValueContract {
  fieldId: string;
  formula: string;
  value: unknown;
  dependencies: string[];
  computedAt: string;
  error?: string;
}

export interface FormMetadataContract {
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string;
  version: string;
  schemaVersion: string;
  deviceInfo?: DeviceInfoContract;
  location?: GeoLocationContract;
}

// ============================================
// VALIDATION CONTRACTS
// ============================================

export interface ValidationErrorContract {
  code: string;
  message: string;
  severity: 'error' | 'warning';
  fieldId: string;
  sheetCode?: string;
  metadata?: Record<string, unknown>;
}

export interface ValidationResultContract {
  isValid: boolean;
  errors: ValidationErrorContract[];
  warnings: ValidationErrorContract[];
  validatedAt: string;
  duration: number;
}

export interface FieldValidationContext {
  field: RETIEFieldSchema;
  value: unknown;
  allValues: Record<string, unknown>;
  sheet: RETIESheetSchema;
  inspection: RETIEMasterSchema;
}

// ============================================
// COMPLIANCE CONTRACTS
// ============================================

export interface ComplianceResultContract {
  sheetCode: string;
  totalFields: number;
  answeredFields: number;
  compliantFields: number;
  nonCompliantFields: number;
  criticalNonCompliant: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  noConformities: NoConformityContract[];
  calculatedAt: string;
}

export interface NoConformityContract {
  fieldId: string;
  fieldLabel: string;
  severity: 'critical' | 'major' | 'minor';
  currentValue: unknown;
  expectedValue?: string;
  description: string;
  recommendation: string;
}

// ============================================
// AUDIT CONTRACTS
// ============================================

export interface AuditEventContract {
  id: string;
  inspectionId: string;
  fieldId?: string;
  fieldLabel?: string;
  action: AuditActionContract;
  previousValue?: unknown;
  newValue?: unknown;
  userId: string;
  userName: string;
  userRole: Role;
  timestamp: string;
  deviceInfo?: DeviceInfoContract;
  location?: GeoLocationContract;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export type AuditActionContract = 
  | 'FIELD_CHANGED'
  | 'FIELD_CREATED'
  | 'FIELD_DELETED'
  | 'SHEET_STARTED'
  | 'SHEET_COMPLETED'
  | 'INSPECTION_CREATED'
  | 'INSPECTION_SUBMITTED'
  | 'INSPECTION_APPROVED'
  | 'INSPECTION_REJECTED'
  | 'INSPECTION_ARCHIVED'
  | 'ATTACHMENT_UPLOADED'
  | 'ATTACHMENT_DELETED'
  | 'OFFLINE_SYNC'
  | 'SCHEMA_MIGRATED';

export interface DeviceInfoContract {
  deviceId: string;
  deviceName: string;
  os: string;
  osVersion: string;
  browser?: string;
  appVersion: string;
}

export interface GeoLocationContract {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

// ============================================
// WORKFLOW CONTRACTS
// ============================================

export interface WorkflowTransitionContract {
  inspectionId: string;
  fromState: WorkflowState;
  toState: WorkflowState;
  userId: string;
  userRole: Role;
  userName: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowPermissionContract {
  role: Role;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canReject: boolean;
  canArchive: boolean;
}

// ============================================
// OFFLINE CONTRACTS
// ============================================

export interface OfflineOperationContract {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  payload: unknown;
  timestamp: string;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  error?: string;
}

export interface SyncResultContract {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  conflicts: ConflictContract[];
  duration: number;
  errors: string[];
}

export interface ConflictContract {
  entityId: string;
  localVersion: unknown;
  serverVersion: unknown;
  resolution: 'local' | 'server' | 'merged';
  resolvedAt: string;
}

// ============================================
// ATTACHMENT CONTRACTS
// ============================================

export interface AttachmentContract {
  id: string;
  inspectionId: string;
  fieldId?: string;
  type: 'photo' | 'video' | 'document' | 'signature';
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// USER CONTRACTS
// ============================================

export interface UserContract {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  tenantId?: string;
  permissions: string[];
  lastLoginAt: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// ORCHESTRATOR CONTRACTS
// ============================================

export interface PipelineContextContract {
  inspectionId: string;
  sheetCode: string;
  fieldId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  trigger: 'field_change' | 'form_init' | 'form_submit' | 'autosave' | 'manual';
}

export interface PipelineResultContract {
  success: boolean;
  executionId: string;
  phases: PhaseResultContract[];
  totalDuration: number;
  errors: string[];
  warnings: string[];
}

export interface PhaseResultContract {
  phase: string;
  success: boolean;
  duration: number;
  results: Record<string, unknown>;
  errors: string[];
  warnings: string[];
}