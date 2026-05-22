// ============================================
// FORM LIFECYCLE MANAGER
// ============================================

import { eventBus, type EventType, type FormEvent } from './integration/eventBus';
import { engineOrchestrator, type OrchestratorContext } from './integration/engineOrchestrator';
import { useFormStateStore, type InspectionState } from '../engines/state/formStateEngine';
import { offlineEngine } from '../engines/offline/indexedDB';
import { auditEngine } from '../engines/audit/auditEngine';
import { workflowEngine } from '../engines/workflow/workflowEngine';
import type { RETIEMasterSchema } from '../schemas/masterSchema';

export type LifecyclePhase = 
  | 'idle'
  | 'loading_schema'
  | 'initializing'
  | 'ready'
  | 'field_updating'
  | 'validating'
  | 'saving'
  | 'syncing'
  | 'submitting'
  | 'completed'
  | 'error';

export interface LifecycleState {
  phase: LifecyclePhase;
  inspectionId: string | null;
  schemaVersion: string | null;
  startedAt: string | null;
  lastActionAt: string | null;
  errors: string[];
  warnings: string[];
}

export interface LifecycleCallbacks {
  onSchemaLoaded?: (schema: RETIEMasterSchema) => void;
  onFormReady?: (inspectionId: string) => void;
  onFieldChanged?: (fieldId: string, value: unknown) => void;
  onValidationError?: (errors: string[]) => void;
  onSaveComplete?: () => void;
  onSyncComplete?: (success: boolean) => void;
  onError?: (error: string) => void;
}

export class FormLifecycleManager {
  private state: LifecycleState = {
    phase: 'idle',
    inspectionId: null,
    schemaVersion: null,
    startedAt: null,
    lastActionAt: null,
    errors: [],
    warnings: []
  };

  private callbacks: LifecycleCallbacks = {};
  private listeners: Set<(state: LifecycleState) => void> = new Set();

  setCallbacks(callbacks: LifecycleCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  subscribe(listener: (state: LifecycleState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private setPhase(phase: LifecyclePhase): void {
    this.state.phase = phase;
    this.state.lastActionAt = new Date().toISOString();
    this.notify();
  }

  async loadSchema(schema: RETIEMasterSchema): Promise<void> {
    this.setPhase('loading_schema');
    this.state.schemaVersion = schema.version ?? null;
    this.state.errors = [];

    try {
      await offlineEngine.loadSchema(schema);
      this.callbacks.onSchemaLoaded?.(schema);
      eventBus.emit('SCHEMA_LOADED', schema);
    } catch (error) {
      this.state.errors.push(`Schema load failed: ${error}`);
      this.setPhase('error');
      throw error;
    }
  }

  async initializeForm(inspectionId: string, schema: RETIEMasterSchema): Promise<void> {
    this.setPhase('initializing');
    this.state.inspectionId = inspectionId;
    this.state.startedAt = new Date().toISOString();
    this.state.errors = [];

    const store = useFormStateStore.getState();

    store.initializeInspection({
      inspectionId,
      inspectionCode: `INS-${Date.now()}`,
      status: 'draft',
      siteName: '',
      siteAddress: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      inspector: null,
      schemaVersion: schema.version
    });

    auditEngine.logAction({
      inspectionId,
      action: 'INSPECTION_CREATED',
      userId: store.currentUser?.id || 'system',
      timestamp: new Date().toISOString()
    });

    this.setPhase('ready');
    eventBus.emit('FORM_INITIALIZED', { inspectionId, schema });
    this.callbacks.onFormReady?.(inspectionId);
  }

  async handleFieldChange(
    fieldId: string,
    value: unknown,
    schema: RETIEMasterSchema,
    sheetCode: string
  ): Promise<void> {
    if (this.state.phase === 'error') {
      this.state.errors.push('Cannot change field in error state');
      return;
    }

    const store = useFormStateStore.getState();
    const previousValue = store.answers[fieldId];

    store.setFieldValue(fieldId, value);
    store.setFieldTouched(fieldId, true);
    store.setFieldDirty(fieldId, true);

    this.setPhase('field_updating');
    eventBus.emit('FIELD_CHANGED', 
      { fieldId, value, previousValue },
      { fieldId, sheetCode, inspectionId: this.state.inspectionId!, previousValue, newValue: value }
    );

    this.callbacks.onFieldChanged?.(fieldId, value);
  }

  async triggerValidation(fieldId: string): Promise<boolean> {
    this.setPhase('validating');

    const store = useFormStateStore.getState();
    const fieldState = store.getFieldState(fieldId);

    const errors = this.validateField(fieldId, fieldState?.value, store.answers);
    
    store.setFieldErrors(fieldId, errors);

    if (errors.length > 0) {
      this.setPhase('ready');
      this.callbacks.onValidationError?.(errors);
      return false;
    }

    this.setPhase('ready');
    return true;
  }

  private validateField(fieldId: string, value: unknown, allValues: Record<string, unknown>): string[] {
    return [];
  }

  async save(): Promise<void> {
    if (!this.state.inspectionId) return;

    this.setPhase('saving');

    try {
      const store = useFormStateStore.getState();
      
      await offlineEngine.saveDraft(this.state.inspectionId, {
        answers: store.answers,
        fields: Object.fromEntries(store.fields),
        sheets: Object.fromEntries(store.sheets),
        lastSaved: new Date().toISOString()
      });

      eventBus.emit('AUTOSAVE_COMPLETED', { inspectionId: this.state.inspectionId });
      this.setPhase('ready');
      this.callbacks.onSaveComplete?.();
    } catch (error) {
      this.state.errors.push(`Save failed: ${error}`);
      this.setPhase('error');
      this.callbacks.onError?.(`Save failed: ${error}`);
    }
  }

  async sync(): Promise<void> {
    if (!this.state.inspectionId || !offlineEngine.getOnlineStatus()) return;

    this.setPhase('syncing');

    try {
      const result = await offlineEngine.forceSync();
      
      if (result.success) {
        eventBus.emit('OFFLINE_SYNC_COMPLETED', result);
        this.callbacks.onSyncComplete?.(true);
      } else {
        this.state.errors.push(...(result.errors || []));
        eventBus.emit('OFFLINE_SYNC_FAILED', result);
        this.callbacks.onSyncComplete?.(false);
      }

      this.setPhase('ready');
    } catch (error) {
      this.state.errors.push(`Sync failed: ${error}`);
      this.setPhase('error');
    }
  }

  async submit(): Promise<{ success: boolean; error?: string }> {
    if (!this.state.inspectionId) {
      return { success: false, error: 'No inspection ID' };
    }

    this.setPhase('submitting');

    const store = useFormStateStore.getState();
    const inspection = store.getInspection();

    const validation = workflowEngine.validateTransition(inspection, 'submitted');
    if (!validation.valid) {
      this.state.errors.push(...validation.issues);
      this.setPhase('ready');
      return { success: false, error: validation.issues.join(', ') };
    }

    const result = await workflowEngine.transition(
      {
        inspection,
        userId: store.currentUser?.id || 'system',
        userRole: store.currentUser?.role || 'inspector',
        userName: store.currentUser?.displayName || 'System'
      },
      'submitted',
      'Formulario enviado para revisión'
    );

    if (result.success) {
      await this.save();
      eventBus.emit('FORM_SUBMITTED', { inspectionId: this.state.inspectionId });
      this.setPhase('completed');
    } else {
      this.state.errors.push(result.error || 'Unknown error');
      this.setPhase('error');
    }

    return { success: result.success, error: result.error };
  }

  async recoverDraft(): Promise<void> {
    const store = useFormStateStore.getState();
    
    if (this.state.inspectionId) {
      const draft = await offlineEngine.loadDraft(this.state.inspectionId);
      if (draft) {
        store.setAnswers(draft.answers);
      }
    }

    this.state.errors = [];
    this.setPhase('ready');
  }

  getState(): LifecycleState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      phase: 'idle',
      inspectionId: null,
      schemaVersion: null,
      startedAt: null,
      lastActionAt: null,
      errors: [],
      warnings: []
    };
    this.notify();
  }
}

export const formLifecycle = new FormLifecycleManager();