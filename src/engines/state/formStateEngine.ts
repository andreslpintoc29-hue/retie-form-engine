import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface FieldState {
  value: unknown;
  isTouched: boolean;
  isDirty: boolean;
  isVisible: boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isValidating?: boolean;
}

export interface SheetState {
  completedFields: number;
  totalFields: number;
  isValid: boolean;
  isDirty?: boolean;
}

export interface InspectionState {
  metadata: any | null;
  currentSchema: any | null;
  currentUser: any | null;
  answers: Record<string, unknown>;
  fields: Map<string, FieldState>;
  sheets: Map<string, SheetState>;
  compliance: Map<string, { percentage: number }>;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  lastSaved: number | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  error: string | null;
}

interface FormStateActions {
  initInspection: (metadata: any) => void;
  initializeInspection: (metadata: any) => void;
  loadInspection: (metadata: any, answers: any) => void;
  resetInspection: () => void;
  getInspection: () => any;
  setAnswers: (answers: Record<string, unknown>) => void;
  
  setFieldValue: (fieldId: string, value: unknown) => void;
  setFieldTouched: (fieldId: string, touched: boolean) => void;
  setFieldDirty: (fieldId: string, dirty: boolean) => void;
  setFieldErrors: (fieldId: string, errors: string[]) => void;
  getFieldState: (fieldId: string) => FieldState | undefined;
  setSheetCompliance: (sheetCode: string, result: any) => void;
  
  // Legacy actions (no-ops or simple wrappers to prevent runtime crashes)
  addTableRow: (sheetName: string, tableId: string) => void;
  updateTableCell: (sheetName: string, tableId: string, rowId: string, column: string, value: unknown) => void;
  removeTableRow: (sheetName: string, tableId: string, rowId: string) => void;
  reorderTableRows: (sheetName: string, tableId: string, fromIndex: number, toIndex: number) => void;
  setMultipleFields: (sheetName: string, fields: Record<string, unknown>) => void;
  importSheetData: (sheetName: string, data: Record<string, unknown>) => void;
  setComplianceResult: (sheetName: string, result: any) => void;
  clearCompliance: (sheetName: string) => void;
  setComputedValue: (key: string, value: unknown) => void;
  clearComputedValues: () => void;
  markDirty: () => void;
  markClean: (sheetName?: string) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setAutoSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setError: (error: string | null) => void;
  getFieldValue: (sheetName: string, fieldId: string) => unknown;
  getSheetAnswers: (sheetName: string) => Record<string, unknown>;
  getAllAnswers: () => Record<string, Record<string, unknown>>;
  getDirtyFields: (sheetName: string) => string[];
  getValidationErrors: (sheetName: string) => any[];
  getComplianceResult: (sheetName: string) => any | null;
}

export const useFormStateStore = create<InspectionState & FormStateActions>()(
  subscribeWithSelector((set, get) => ({
    metadata: null,
    currentSchema: null,
    currentUser: { id: 'inspector-1', role: 'inspector', displayName: 'Inspector de Prueba' },
    answers: {},
    fields: new Map(),
    sheets: new Map(),
    compliance: new Map(),
    isLoading: false,
    isSaving: false,
    isDirty: false,
    lastSaved: null,
    autoSaveStatus: 'idle',
    error: null,

    initInspection: (metadata) => {
      set({
        metadata,
        answers: {},
        fields: new Map(),
        sheets: new Map(),
        compliance: new Map(),
        isDirty: false,
        lastSaved: null,
        autoSaveStatus: 'idle',
        error: null
      });
    },

    initializeInspection: (metadata) => {
      get().initInspection(metadata);
    },

    loadInspection: (metadata, answers) => {
      const answersMap = answers || {};
      const fields = new Map<string, FieldState>();
      const sheets = new Map<string, SheetState>();

      // Flatten and populate fields
      Object.entries(answersMap).forEach(([fieldId, value]) => {
        fields.set(fieldId, {
          value,
          isTouched: false,
          isDirty: false,
          isVisible: true,
          isValid: true,
          errors: [],
          warnings: []
        });
      });

      set({
        metadata,
        answers: answersMap,
        fields,
        sheets,
        isDirty: false,
        lastSaved: Date.now()
      });
    },

    resetInspection: () => {
      set({
        metadata: null,
        answers: {},
        fields: new Map(),
        sheets: new Map(),
        compliance: new Map(),
        isDirty: false,
        lastSaved: null,
        autoSaveStatus: 'idle',
        error: null
      });
    },

    getInspection: () => {
      const state = get();
      return {
        id: state.metadata?.inspectionId || 'unknown',
        metadata: state.metadata,
        answers: state.answers,
        createdAt: new Date().toISOString(),
        status: state.metadata?.status || 'draft'
      };
    },

    setAnswers: (answers) => {
      const fields = new Map(get().fields);
      Object.entries(answers).forEach(([fieldId, value]) => {
        const existing = fields.get(fieldId);
        fields.set(fieldId, {
          value,
          isTouched: existing?.isTouched || false,
          isDirty: existing?.isDirty || false,
          isVisible: existing?.isVisible !== false,
          isValid: existing?.isValid !== false,
          errors: existing?.errors || [],
          warnings: existing?.warnings || []
        });
      });

      set({
        answers,
        fields,
        isDirty: true
      });
    },

    setFieldValue: (fieldId, value) => {
      const fields = new Map(get().fields);
      const existing = fields.get(fieldId);
      
      fields.set(fieldId, {
        value,
        isTouched: true,
        isDirty: true,
        isVisible: existing?.isVisible !== false,
        isValid: existing?.isValid !== false,
        errors: existing?.errors || [],
        warnings: existing?.warnings || []
      });

      set((state) => ({
        answers: {
          ...state.answers,
          [fieldId]: value
        },
        fields,
        isDirty: true,
        autoSaveStatus: 'idle'
      }));
    },

    setFieldTouched: (fieldId, touched) => {
      const fields = new Map(get().fields);
      const existing = fields.get(fieldId);
      if (existing) {
        fields.set(fieldId, {
          ...existing,
          isTouched: touched
        });
        set({ fields });
      }
    },

    setFieldDirty: (fieldId, dirty) => {
      const fields = new Map(get().fields);
      const existing = fields.get(fieldId);
      if (existing) {
        fields.set(fieldId, {
          ...existing,
          isDirty: dirty
        });
        set({ fields });
      }
    },

    setFieldErrors: (fieldId, errors) => {
      const fields = new Map(get().fields);
      const existing = fields.get(fieldId);
      fields.set(fieldId, {
        value: existing?.value ?? null,
        isTouched: existing?.isTouched || false,
        isDirty: existing?.isDirty || false,
        isVisible: existing?.isVisible !== false,
        isValid: errors.length === 0,
        errors,
        warnings: existing?.warnings || []
      });
      set({ fields });
    },

    getFieldState: (fieldId) => {
      return get().fields.get(fieldId);
    },
    setSheetCompliance: (sheetCode, result) => {
      const compliance = new Map(get().compliance);
      compliance.set(sheetCode, result);
      set({ compliance });
    },

    // Legacy or wrappers
    addTableRow: () => {},
    updateTableCell: () => {},
    removeTableRow: () => {},
    reorderTableRows: () => {},
    setMultipleFields: (_, fields) => {
      Object.entries(fields).forEach(([fieldId, value]) => {
        get().setFieldValue(fieldId, value);
      });
    },
    importSheetData: (_, data) => {
      get().setAnswers(data);
    },
    setComplianceResult: () => {},
    clearCompliance: () => {},
    setComputedValue: () => {},
    clearComputedValues: () => {},
    markDirty: () => set({ isDirty: true }),
    markClean: () => set({ isDirty: false, autoSaveStatus: 'saved' }),
    setLoading: (loading) => set({ isLoading: loading }),
    setSaving: (saving) => set({ isSaving: saving }),
    setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),
    setError: (error) => set({ error }),
    
    getFieldValue: (_, fieldId) => {
      return get().answers[fieldId];
    },
    getSheetAnswers: () => {
      return get().answers;
    },
    getAllAnswers: () => {
      return { default: get().answers };
    },
    getDirtyFields: () => {
      const dirty: string[] = [];
      get().fields.forEach((state, fieldId) => {
        if (state.isDirty) dirty.push(fieldId);
      });
      return dirty;
    },
    getValidationErrors: () => {
      const errors: any[] = [];
      get().fields.forEach((state, fieldId) => {
        state.errors.forEach(msg => {
          errors.push({ fieldId, message: msg });
        });
      });
      return errors;
    },
    getComplianceResult: () => null
  }))
);

// Optimized selectors helpers
export const selectField = (sheetName: string, fieldId: string) => 
  useFormStateStore.getState().fields.get(fieldId);

export const selectFieldValue = (sheetName: string, fieldId: string) => 
  useFormStateStore.getState().answers[fieldId];

export const selectFieldErrors = (sheetName: string, fieldId: string) =>
  useFormStateStore.getState().fields.get(fieldId)?.errors ?? [];

export const selectIsDirty = () => 
  useFormStateStore(state => state.isDirty);

export const selectAutoSaveStatus = () => 
  useFormStateStore(state => state.autoSaveStatus);

export const selectSheetAnswers = () =>
  useFormStateStore.getState().answers;

export const selectSheetCompliance = () => null;

export default useFormStateStore;