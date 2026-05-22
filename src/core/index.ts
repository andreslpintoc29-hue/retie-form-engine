// ============================================
// CORE PLATFORM - INTEGRATION LAYER
// ============================================

// Event System
export { eventBus, type FormEvent, type EventType, type EventMetadata } from './integration/eventBus';

// Engine Orchestrator
export { 
  engineOrchestrator, 
  EngineOrchestrator, 
  type OrchestratorConfig, 
  type OrchestratorResult,
  type OrchestratorContext,
  type ExecutionPhase
} from './integration/engineOrchestrator';

// Shared Contracts
export type {
  FormStateContract,
  FieldStateContract,
  SheetStateContract,
  ComplianceContract,
  ComputedValueContract,
  ValidationErrorContract,
  ValidationResultContract,
  AuditEventContract,
  AuditActionContract,
  DeviceInfoContract,
  GeoLocationContract,
  WorkflowTransitionContract,
  WorkflowPermissionContract,
  OfflineOperationContract,
  SyncResultContract,
  AttachmentContract,
  UserContract,
  PipelineContextContract,
  PipelineResultContract,
  PhaseResultContract
} from './integration/contracts';

// Form Lifecycle
export { 
  formLifecycle, 
  FormLifecycleManager,
  type LifecyclePhase,
  type LifecycleState,
  type LifecycleCallbacks
} from './formLifecycle';

// Form Engine Hooks
export {
  useFormEngine,
  useField,
  useSheet,
  useFieldMemo,
  useComplianceMemo,
  type UseFormEngineOptions,
  type UseFormEngineReturn,
  type UseFieldOptions,
  type UseFieldReturn,
  type UseSheetOptions,
  type UseSheetReturn
} from './useFormEngine';