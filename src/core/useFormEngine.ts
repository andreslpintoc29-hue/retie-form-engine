// ============================================
// USE FORM ENGINE - Connect FormStateEngine with UI
// ============================================

'use client';

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useFormStateStore, type FieldState, type SheetState } from '../engines/state/formStateEngine';
import { formLifecycle } from '../core/formLifecycle';
import { eventBus } from '../core/integration/eventBus';
import type { RETIEMasterSchema, RETIESheetSchema, RETIEFieldSchema } from '../schemas/masterSchema';

export interface UseFormEngineOptions {
  inspectionId: string;
  schema: RETIEMasterSchema;
  autoSave?: boolean;
  autoSaveDelay?: number;
  onError?: (error: string) => void;
  onSave?: () => void;
  skipSchemaCache?: boolean;
}

export interface UseFormEngineReturn {
  // State
  isReady: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  errors: string[];
  
  // Getters
  getValue: (fieldId: string) => any;
  getFieldState: (fieldId: string) => FieldState | undefined;
  getSheetState: (sheetCode: string) => SheetState | undefined;
  getErrors: (fieldId: string) => string[];
  getCompliance: (sheetCode: string) => number;
  isFieldTouched: (fieldId: string) => boolean;
  isFieldDirty: (fieldId: string) => boolean;
  isFieldVisible: (fieldId: string) => boolean;
  isFieldValid: (fieldId: string) => boolean;
  
  // Actions
  setValue: (fieldId: string, value: unknown) => void;
  setFieldTouched: (fieldId: string, touched: boolean) => void;
  validateField: (fieldId: string) => Promise<boolean>;
  validateSheet: (sheetCode: string) => Promise<boolean>;
  save: () => Promise<void>;
  sync: () => Promise<void>;
  submit: () => Promise<{ success: boolean; error?: string }>;
  reset: () => void;

  // Diagnostics and PDF support
  store: any;
  answers: Record<string, unknown>;
  getAnswers: () => Record<string, unknown>;
}

export function useFormEngine(options: UseFormEngineOptions): UseFormEngineReturn {
  const { inspectionId, schema, autoSave = true, autoSaveDelay = 2000, onError, onSave, skipSchemaCache } = options;
  
  const store = useFormStateStore();
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    let active = true;

const init = async () => {
      const startTime = Date.now();
      console.log("=== INIT FORM ENGINE START ===", new Date().toISOString());
      console.log("inspectionId:", inspectionId);
      console.log("schema type:", schema?.constructor?.name);
      console.log("schema secciones count:", schema?.secciones?.length);
      
      // Safety timeout: if not ready in 10s, force ready
      initTimeoutRef.current = setTimeout(() => {
        console.log("⚠️ INIT TIMEOUT at", Date.now() - startTime, "ms: forcing isReady=true after 10s");
        setIsReady(true);
      }, 10000);
      
      try {
        console.log("[STEP 1] loadSchema - START at", Date.now() - startTime, "ms");
        if (options.skipSchemaCache) {
          console.log("[STEP 1] skipSchemaCache=true, skipping offlineEngine.loadSchema");
        } else {
          await formLifecycle.loadSchema(schema);
        }
        console.log("[STEP 1] loadSchema - DONE at", Date.now() - startTime, "ms");
      } catch (err) {
        console.warn("⚠️ Schema load failed: continuing empty", err);
        if (active) setErrors(prev => [...prev, `Schema load failed: ${err}`]);
      }
      
      if (!active) { console.log("ABORT: active=false after loadSchema"); return; }
      
      try {
        console.log("[STEP 2] initializeForm - START at", Date.now() - startTime, "ms");
        await formLifecycle.initializeForm(inspectionId, schema);
        console.log("[STEP 2] initializeForm - DONE at", Date.now() - startTime, "ms");
      } catch (err) {
        console.warn("⚠️ Form initialization failed", err);
        if (active) setErrors(prev => [...prev, `Form initialization failed: ${err}`]);
      }
      
      if (!active) { console.log("ABORT: active=false after initializeForm"); return; }
      
      try {
        console.log("[STEP 3] recoverDraft - START at", Date.now() - startTime, "ms");
        await formLifecycle.recoverDraft();
        console.log("[STEP 3] recoverDraft - DONE at", Date.now() - startTime, "ms");
      } catch (err) {
        console.warn("⚠️ Recover draft failed: continuing empty", err);
        if (active) setErrors(prev => [...prev, `Recover draft failed: ${err}`]);
      }
      
clearTimeout(initTimeoutRef.current);
      console.log("=== INIT FORM ENGINE END at", Date.now() - startTime, "ms, setting isReady=true ===");
      if (active) setIsReady(true);
    };

    init();

    const unsubscribeSave = eventBus.subscribe('AUTOSAVE_COMPLETED', () => {
      if (!active) return;
      setIsSaving(false);
      onSave?.();
    });

    const unsubscribeError = eventBus.subscribe('FORM_ERROR', (event) => {
      if (!active) return;
      setErrors(prev => [...prev, event.payload as string]);
    });

    return () => {
      active = false;
      unsubscribeSave();
      unsubscribeError();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
    };
  }, [inspectionId, schema]);

  const triggerAutoSave = useCallback(() => {
    if (!autoSave) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      await formLifecycle.save();
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay]);

  const getValue = useCallback((fieldId: string): any => {
    return store.answers[fieldId];
  }, [store.answers]);

  const getFieldState = useCallback((fieldId: string): FieldState | undefined => {
    return store.fields.get(fieldId);
  }, [store.fields]);

  const getSheetState = useCallback((sheetCode: string): SheetState | undefined => {
    return store.sheets.get(sheetCode);
  }, [store.sheets]);

  const getErrors = useCallback((fieldId: string): string[] => {
    return store.fields.get(fieldId)?.errors || [];
  }, [store.fields]);

  const getCompliance = useCallback((sheetCode: string): number => {
    return store.compliance.get(sheetCode)?.percentage || 0;
  }, [store.compliance]);

  const isFieldTouched = useCallback((fieldId: string): boolean => {
    return store.fields.get(fieldId)?.isTouched || false;
  }, [store.fields]);

  const isFieldDirty = useCallback((fieldId: string): boolean => {
    return store.fields.get(fieldId)?.isDirty || false;
  }, [store.fields]);

  const isFieldVisible = useCallback((fieldId: string): boolean => {
    return store.fields.get(fieldId)?.isVisible !== false;
  }, [store.fields]);

  const isFieldValid = useCallback((fieldId: string): boolean => {
    return store.fields.get(fieldId)?.isValid !== false;
  }, [store.fields]);

  const setValue = useCallback(async (fieldId: string, value: unknown) => {
    const currentSchema = store.currentSchema || schema;
    const field = findFieldInSchema(currentSchema, fieldId);
    const sheetCode = findSheetOfField(currentSchema, fieldId);
    
    await formLifecycle.handleFieldChange(fieldId, value, currentSchema, sheetCode || 'default');
    triggerAutoSave();
  }, [store.currentSchema, schema, triggerAutoSave]);

  const setFieldTouched = useCallback((fieldId: string, touched: boolean) => {
    store.setFieldTouched(fieldId, touched);
  }, []);

  const validateField = useCallback(async (fieldId: string): Promise<boolean> => {
    return formLifecycle.triggerValidation(fieldId);
  }, []);

  const validateSheet = useCallback(async (sheetCode: string): Promise<boolean> => {
    const sheet = schema?.sheets?.find(s => s.codigo === sheetCode);
    if (!sheet) return false;

    const fields = sheet.sections?.flatMap(s => s.fields) || [];
    let allValid = true;

    for (const field of fields) {
      const isValid = await formLifecycle.triggerValidation(String(field.id));
      if (!isValid) allValid = false;
    }

    return allValid;
  }, [schema]);

  const save = useCallback(async () => {
    setIsSaving(true);
    await formLifecycle.save();
    setIsSaving(false);
  }, []);

  const sync = useCallback(async () => {
    setIsSyncing(true);
    await formLifecycle.sync();
    setIsSyncing(false);
  }, []);

  const submit = useCallback(async () => {
    return formLifecycle.submit();
  }, []);

  const reset = useCallback(() => {
    formLifecycle.reset();
    store.resetInspection();
  }, [store]);

  return {
    isReady,
    isSaving,
    isSyncing,
    errors,
    getValue,
    getFieldState,
    getSheetState,
    getErrors,
    getCompliance,
    isFieldTouched,
    isFieldDirty,
    isFieldVisible,
    isFieldValid,
    setValue,
    setFieldTouched,
    validateField,
    validateSheet,
    save,
    sync,
    submit,
    reset,
    store,
    answers: store.answers,
    getAnswers: () => store.answers
  };
}

function findFieldInSchema(schema: RETIEMasterSchema, fieldId: string): RETIEFieldSchema | undefined {
  for (const sheet of schema.sheets || []) {
    for (const section of sheet.sections || []) {
      const field = section.fields?.find(f => String(f.id) === fieldId);
      if (field) return field;
    }
  }
  return undefined;
}

function findSheetOfField(schema: RETIEMasterSchema, fieldId: string): string | undefined {
  for (const sheet of schema.sheets || []) {
    for (const section of sheet.sections || []) {
      const field = section.fields?.find(f => String(f.id) === fieldId);
      if (field) return sheet.codigo;
    }
  }
  return undefined;
}

// ============================================
// USE FIELD - Hook individual por campo
// ============================================

export interface UseFieldOptions {
  fieldId: string;
  formEngine: UseFormEngineReturn;
}

export interface UseFieldReturn {
  value: unknown;
  onChange: (value: unknown) => void;
  error: string;
  isTouched: boolean;
  isDirty: boolean;
  isVisible: boolean;
  isValid: boolean;
}

export function useField(options: UseFieldOptions): UseFieldReturn {
  const { fieldId, formEngine } = options;
  
  const value = formEngine.getValue(fieldId);
  const errors = formEngine.getErrors(fieldId);
  const isTouched = formEngine.isFieldTouched(fieldId);
  const isDirty = formEngine.isFieldDirty(fieldId);
  const isVisible = formEngine.isFieldVisible(fieldId);
  const isValid = formEngine.isFieldValid(fieldId);

  const onChange = useCallback((newValue: unknown) => {
    formEngine.setValue(fieldId, newValue);
  }, [fieldId, formEngine]);

  return {
    value,
    onChange,
    error: errors[0] || '',
    isTouched,
    isDirty,
    isVisible,
    isValid
  };
}

// ============================================
// USE SHEET - Hook para hoja completa
// ============================================

export interface UseSheetOptions {
  sheetCode: string;
  formEngine: UseFormEngineReturn;
}

export interface UseSheetReturn {
  state: SheetState | undefined;
  compliance: number;
  progress: number;
  isComplete: boolean;
  validate: () => Promise<boolean>;
}

export function useSheet(options: UseSheetOptions): UseSheetReturn {
  const { sheetCode, formEngine } = options;

  const state = formEngine.getSheetState(sheetCode);
  const compliance = formEngine.getCompliance(sheetCode);
  const progress = state ? (state.completedFields / state.totalFields) * 100 : 0;
  const isComplete = state?.isValid || false;

  const validate = useCallback(async () => {
    return formEngine.validateSheet(sheetCode);
  }, [sheetCode, formEngine]);

  return {
    state,
    compliance,
    progress,
    isComplete,
    validate
  };
}

// ============================================
// MEMOIZED SELECTORS
// ============================================

export function useFieldMemo(fieldId: string): {
  value: unknown;
  errors: string[];
  isTouched: boolean;
  isDirty: boolean;
  isValid: boolean;
} {
  const store = useFormStateStore();
  
  return useMemo(() => {
    const fieldState = store.fields.get(fieldId);
    return {
      value: store.answers[fieldId],
      errors: fieldState?.errors || [],
      isTouched: fieldState?.isTouched || false,
      isDirty: fieldState?.isDirty || false,
      isValid: fieldState?.isValid !== false
    };
  }, [fieldId, store.answers, store.fields]);
}

export function useComplianceMemo(sheetCode: string): number {
  const store = useFormStateStore();
  
  return useMemo(() => {
    return store.compliance.get(sheetCode)?.percentage || 0;
  }, [sheetCode, store.compliance]);
}