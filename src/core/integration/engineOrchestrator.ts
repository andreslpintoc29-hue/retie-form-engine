// ============================================
// ENGINE ORCHESTRATOR - Central Coordination
// ============================================

import { eventBus, FormEvent, EventType } from './eventBus';
import { useFormStateStore, type FieldState, type SheetState, type InspectionState } from '../../engines/state/formStateEngine';
import { formulaEngine, type FormulaContext } from '../../engines/formulas/formulaEngine';
import { validationEngine, type ValidationResult } from '../../engines/validation/validationEngine';
import { ruleEngine } from '../../engines/rules/ruleEngine';
import { complianceEngine, type ComplianceResult } from '../../engines/compliance/complianceEngine';
import { auditEngine } from '../../engines/audit/auditEngine';
import { workflowEngine } from '../../engines/workflow/workflowEngine';
import { offlineEngine } from '../../engines/offline/indexedDB';
import type { RETIEMasterSchema, RETIESheetSchema, RETIEFieldSchema } from '../../schemas/masterSchema';

export type ExecutionPhase = 
  | 'init'
  | 'validation'
  | 'rules'
  | 'formulas'
  | 'compliance'
  | 'autosave'
  | 'audit'
  | 'sync'
  | 'complete';

export interface OrchestratorConfig {
  enableValidation: boolean;
  enableRules: boolean;
  enableFormulas: boolean;
  enableCompliance: boolean;
  enableAutosave: boolean;
  enableAudit: boolean;
  enableSync: boolean;
  autosaveDelay: number;
  maxRetries: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  enableValidation: true,
  enableRules: true,
  enableFormulas: true,
  enableCompliance: true,
  enableAutosave: true,
  enableAudit: true,
  enableSync: true,
  autosaveDelay: 2000,
  maxRetries: 3
};

export interface OrchestratorResult {
  success: boolean;
  phase: ExecutionPhase;
  duration: number;
  results: Record<string, unknown>;
  errors: string[];
  warnings: string[];
}

type PhaseHandler = (context: OrchestratorContext) => Promise<OrchestratorResult>;

export interface OrchestratorContext {
  inspectionId: string;
  sheetCode: string;
  fieldId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  schema: RETIEMasterSchema;
  sheet: RETIESheetSchema;
  field?: RETIEFieldSchema;
  store: ReturnType<typeof useFormStateStore.getState>;
}

export class EngineOrchestrator {
  private config: OrchestratorConfig;
  private isProcessing = false;
  private queue: OrchestratorContext[] = [];
  private retryCount: Map<string, number> = new Map();

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    eventBus.subscribe('FIELD_CHANGED', async (event) => {
      await this.handleFieldChange(event);
    });

    eventBus.subscribe('FORM_INITIALIZED', async () => {
      await this.handleFormInit();
    });
  }

  private async handleFieldChange(event: FormEvent): Promise<void> {
    if (this.isProcessing) {
      this.queue.push(event.payload as any);
      return;
    }

    await this.executePipeline({
      inspectionId: event.metadata?.inspectionId || '',
      sheetCode: event.metadata?.sheetCode || '',
      fieldId: event.metadata?.fieldId,
      previousValue: event.metadata?.previousValue,
      newValue: event.metadata?.newValue,
      schema: {} as RETIEMasterSchema,
      sheet: {} as RETIESheetSchema,
      store: useFormStateStore.getState()
    });
  }

  private async handleFormInit(): Promise<void> {
    await this.executePipeline({
      inspectionId: '',
      sheetCode: '',
      schema: {} as RETIEMasterSchema,
      sheet: {} as RETIESheetSchema,
      store: useFormStateStore.getState()
    });
  }

  async executePipeline(context: OrchestratorContext): Promise<OrchestratorResult> {
    if (this.isProcessing) {
      this.queue.push(context);
      return { success: true, phase: 'queued' as any, duration: 0, results: {}, errors: [], warnings: [] };
    }

    this.isProcessing = true;
    const startTime = Date.now();
    const results: Record<string, unknown> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (this.config.enableValidation) {
        const validationResult = await this.executePhase('validation', context);
        results.validation = validationResult;
        if (!validationResult.success) errors.push(...validationResult.errors);
      }

      if (this.config.enableRules) {
        const rulesResult = await this.executePhase('rules', context);
        results.rules = rulesResult;
        if (!rulesResult.success) warnings.push(...rulesResult.warnings);
      }

      if (this.config.enableFormulas) {
        const formulasResult = await this.executePhase('formulas', context);
        results.formulas = formulasResult;
      }

      if (this.config.enableCompliance) {
        const complianceResult = await this.executePhase('compliance', context);
        results.compliance = complianceResult;
      }

      if (this.config.enableAudit) {
        const auditResult = await this.executePhase('audit', context);
        results.audit = auditResult;
      }

      if (this.config.enableAutosave) {
        await this.executePhase('autosave', context);
      }

      if (this.config.enableSync && offlineEngine.getOnlineStatus()) {
        const syncResult = await this.executePhase('sync', context);
        results.sync = syncResult;
      }

      eventBus.emit('FORMULA_RECALCULATED', { context, results });
    } catch (error) {
      errors.push(`Pipeline error: ${error}`);
      eventBus.emit('FORM_ERROR', { error, context });
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }

    return {
      success: errors.length === 0,
      phase: 'complete',
      duration: Date.now() - startTime,
      results,
      errors,
      warnings
    };
  }

  private async executePhase(phase: ExecutionPhase, context: OrchestratorContext): Promise<OrchestratorResult> {
    const startTime = Date.now();

    try {
      switch (phase) {
        case 'validation':
          return this.runValidation(context);
        case 'rules':
          return this.runRules(context);
        case 'formulas':
          return this.runFormulas(context);
        case 'compliance':
          return this.runCompliance(context);
        case 'audit':
          return this.runAudit(context);
        case 'autosave':
          return this.runAutosave(context);
        case 'sync':
          return this.runSync(context);
        default:
          return { success: true, phase, duration: 0, results: {}, errors: [], warnings: [] };
      }
    } catch (error) {
      return {
        success: false,
        phase,
        duration: Date.now() - startTime,
        results: {},
        errors: [`Phase ${phase} failed: ${error}`],
        warnings: []
      };
    }
  }

  private async runValidation(context: OrchestratorContext): Promise<OrchestratorResult> {
    eventBus.emit('VALIDATION_STARTED', { fieldId: context.fieldId }, { fieldId: context.fieldId });

    const fieldState = context.store.getFieldState(context.fieldId || '');
    const result: ValidationResult = validationEngine.validateField(
      context.field!,
      fieldState?.value
    );

    if (context.fieldId) {
      context.store.setFieldErrors(context.fieldId, result.errors.map((e: any) => e.message));
    }

    eventBus.emit('VALIDATION_COMPLETED', result, { fieldId: context.fieldId });

    return {
      success: result.isValid,
      phase: 'validation',
      duration: 0,
      results: { validation: result },
      errors: result.errors.map((e: any) => e.message),
      warnings: result.warnings.map((w: any) => w.message)
    };
  }

  private async runRules(context: OrchestratorContext): Promise<OrchestratorResult> {
    const triggeredRules = ruleEngine.evaluate(context.store.answers, context.sheet);

    for (const rule of triggeredRules) {
      eventBus.emit('RULE_TRIGGERED', rule);

      const actions = ruleEngine.executeRule(rule, context.store);
      for (const action of actions) {
        eventBus.emit('RULE_ACTION_EXECUTED', action);
      }
    }

    return {
      success: true,
      phase: 'rules',
      duration: 0,
      results: { triggeredRules },
      errors: [],
      warnings: triggeredRules.map(r => `Rule triggered: ${r.name}`)
    };
  }

  private async runFormulas(context: OrchestratorContext): Promise<OrchestratorResult> {
    const formulaContext: FormulaContext = {
      values: context.store.answers,
      rows: [],
      globals: {}
    };

    const computed = formulaEngine.computeAll(formulaContext);

    for (const value of computed) {
      if (value.fieldId && value.value !== null) {
        context.store.setFieldValue(value.fieldId, value.value);
      }
    }

    return {
      success: true,
      phase: 'formulas',
      duration: 0,
      results: { computed },
      errors: [],
      warnings: []
    };
  }

  private async runCompliance(context: OrchestratorContext): Promise<OrchestratorResult> {
    const fieldStates = context.store.fields;
    const sheetFields = context.sheet.sections?.flatMap(sec => sec.fields.map(f => String(f.id))) || [];

    const result = complianceEngine.calculateSheetCompliance({
      sheetCode: context.sheetCode,
      fields: sheetFields
    } as any, fieldStates);

    context.store.setSheetCompliance(context.sheetCode, {
      sheetCode: context.sheetCode,
      percentage: result.percentage,
      score: result.score,
      grade: result.grade,
      noConformitiesCount: result.noConformities.length,
      criticalCount: result.criticalNonCompliant,
      lastCalculated: new Date().toISOString()
    });

    eventBus.emit('COMPLIANCE_UPDATED', result);

    return {
      success: true,
      phase: 'compliance',
      duration: 0,
      results: { compliance: result },
      errors: [],
      warnings: []
    };
  }

  private async runAudit(context: OrchestratorContext): Promise<OrchestratorResult> {
    if (!context.fieldId) {
      return { success: true, phase: 'audit', duration: 0, results: {}, errors: [], warnings: [] };
    }

    auditEngine.logChange({
      inspectionId: context.inspectionId,
      fieldId: context.fieldId,
      fieldLabel: context.field?.label || context.fieldId,
      previousValue: context.previousValue,
      newValue: context.newValue,
      userId: context.store.currentUser?.id || 'system',
      timestamp: new Date().toISOString()
    });

    eventBus.emit('AUDIT_LOGGED', { fieldId: context.fieldId });

    return {
      success: true,
      phase: 'audit',
      duration: 0,
      results: {},
      errors: [],
      warnings: []
    };
  }

  private async runAutosave(context: OrchestratorContext): Promise<OrchestratorResult> {
    eventBus.emit('AUTOSAVE_TRIGGERED', { inspectionId: context.inspectionId });

    await offlineEngine.saveDraft(context.inspectionId, {
      answers: context.store.answers,
      fields: Object.fromEntries(context.store.fields),
      sheets: Object.fromEntries(context.store.sheets),
      lastSaved: new Date().toISOString()
    });

    eventBus.emit('AUTOSAVE_COMPLETED', { inspectionId: context.inspectionId });

    return {
      success: true,
      phase: 'autosave',
      duration: 0,
      results: {},
      errors: [],
      warnings: []
    };
  }

  private async runSync(context: OrchestratorContext): Promise<OrchestratorResult> {
    eventBus.emit('OFFLINE_SYNC_STARTED', { inspectionId: context.inspectionId });

    const syncResult = await offlineEngine.forceSync();

    eventBus.emit(syncResult.success ? 'OFFLINE_SYNC_COMPLETED' : 'OFFLINE_SYNC_FAILED', syncResult);

    return {
      success: syncResult.success,
      phase: 'sync',
      duration: syncResult.duration || 0,
      results: syncResult as any,
      errors: syncResult.errors || [],
      warnings: []
    };
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;
    const next = this.queue.shift();
    if (next) this.executePipeline(next);
  }

  setConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

export const engineOrchestrator = new EngineOrchestrator();