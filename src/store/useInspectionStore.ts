import { create } from 'zustand';
import { 
  FormSheet, 
  InspectionAnswers, 
  InspectionMetadata, 
  SheetCompliance,
  ComplianceResult 
} from '@/types/schema';
import { v4 as uuidv4 } from 'uuid';

interface InspectionState {
  // Datos base
  baseDatos: FormSheet[] | null;
  currentSheet: FormSheet | null;
  currentSheetIndex: number;
  
  // Respuestas
  respuestas: InspectionAnswers;
  currentSection: number;
  isDirty: boolean;
  
  // Metadata
  metadata: InspectionMetadata | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  
  // Acciones
  setBaseDatos: (data: FormSheet[]) => void;
  setCurrentSheet: (index: number) => void;
  setMetadata: (metadata: Partial<InspectionMetadata>) => void;
  
  // Respuestas
  setFieldAnswer: (sheetName: string, fieldId: string, value: unknown) => void;
  setTableRow: (sheetName: string, tableId: string, rowId: string, column: string, value: unknown) => void;
  addTableRow: (sheetName: string, tableId: string) => void;
  removeTableRow: (sheetName: string, tableId: string, rowId: string) => void;
  setSheetAnswers: (sheetName: string, answers: Record<string, unknown>) => void;
  
  // Navegación
  nextSection: () => void;
  prevSection: () => void;
  goToSection: (index: number) => void;
  
  // Estado
  markDirty: () => void;
  markClean: () => void;
  resetAnswers: () => void;
  initNewInspection: () => void;
  
  // Cumplimiento
  calculateCompliance: (sheetName: string) => ComplianceResult;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAutoSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
}

const initialMetadata: InspectionMetadata = {
  id: '',
  proyecto: '',
  direccion: '',
  fecha: new Date().toISOString().split('T')[0],
  inspector: '',
  codigo: `R&F-${Date.now().toString().slice(-8)}`,
  estado: 'borrador',
};

export const useInspectionStore = create<InspectionState>((set, get) => ({
  // Estado inicial
  baseDatos: null,
  currentSheet: null,
  currentSheetIndex: 0,
  respuestas: {},
  currentSection: 0,
  isDirty: false,
  metadata: initialMetadata,
  isLoading: false,
  error: null,
  autoSaveStatus: 'idle',

  // Acciones
  setBaseDatos: (data) => set({ baseDatos: data }),

  setCurrentSheet: (index) => {
    const { baseDatos } = get();
    if (baseDatos && baseDatos[index]) {
      set({ 
        currentSheetIndex: index, 
        currentSheet: baseDatos[index],
        currentSection: 0 
      });
    }
  },

  setMetadata: (metadata) => set((state) => {
    if (!state.metadata) return {};
    return {
      metadata: { ...state.metadata, ...metadata } as InspectionMetadata
    };
  }),

  // Respuestas
  setFieldAnswer: (sheetName, fieldId, value) => {
    set((state) => ({
      respuestas: {
        ...state.respuestas,
        [sheetName]: {
          ...state.respuestas[sheetName],
          [fieldId]: value,
        },
      },
      isDirty: true,
      autoSaveStatus: 'idle',
    }));
  },

  setTableRow: (sheetName, tableId, rowId, column, value) => {
    set((state) => {
      const currentTable = (state.respuestas[sheetName] as Record<string, unknown>)?.[tableId] as Record<string, unknown> || {};
      const rows = (currentTable.rows as Record<string, unknown>[]) || [];
      const updatedRows = rows.map((row) => 
        row.id === rowId ? { ...row, [column]: value } : row
      );
      
      return {
        respuestas: {
          ...state.respuestas,
          [sheetName]: {
            ...state.respuestas[sheetName],
            [tableId]: {
              ...currentTable,
              rows: updatedRows,
            },
          },
        },
        isDirty: true,
        autoSaveStatus: 'idle',
      };
    });
  },

  addTableRow: (sheetName, tableId) => {
    set((state) => {
      const currentTable = (state.respuestas[sheetName] as Record<string, unknown>)?.[tableId] as Record<string, unknown> || {};
      const rows = (currentTable.rows as Record<string, unknown>[]) || [];
      const newRow = { id: uuidv4() };
      
      return {
        respuestas: {
          ...state.respuestas,
          [sheetName]: {
            ...state.respuestas[sheetName],
            [tableId]: {
              ...currentTable,
              rows: [...rows, newRow],
            },
          },
        },
        isDirty: true,
        autoSaveStatus: 'idle',
      };
    });
  },

  removeTableRow: (sheetName, tableId, rowId) => {
    set((state) => {
      const currentTable = (state.respuestas[sheetName] as Record<string, unknown>)?.[tableId] as Record<string, unknown> || {};
      const rows = (currentTable.rows as Record<string, unknown>[]) || [];
      const filteredRows = rows.filter((row) => row.id !== rowId);
      
      return {
        respuestas: {
          ...state.respuestas,
          [sheetName]: {
            ...state.respuestas[sheetName],
            [tableId]: {
              ...currentTable,
              rows: filteredRows,
            },
          },
        },
        isDirty: true,
        autoSaveStatus: 'idle',
      };
    });
  },

  setSheetAnswers: (sheetName, answers) => set((state) => ({
    respuestas: {
      ...state.respuestas,
      [sheetName]: answers,
    },
    isDirty: true,
  })),

  // Navegación
  nextSection: () => {
    const { currentSheet, currentSection } = get();
    if (currentSheet?.secciones && currentSection < currentSheet.secciones.length - 1) {
      set({ currentSection: currentSection + 1 });
    }
  },

  prevSection: () => {
    const { currentSection } = get();
    if (currentSection > 0) {
      set({ currentSection: currentSection - 1 });
    }
  },

  goToSection: (index) => set({ currentSection: index }),

  // Estado
  markDirty: () => set({ isDirty: true, autoSaveStatus: 'idle' }),
  markClean: () => set({ isDirty: false, autoSaveStatus: 'saved' }),
  
  resetAnswers: () => set({ respuestas: {}, currentSection: 0, isDirty: false }),

  initNewInspection: () => set({
    respuestas: {},
    currentSheetIndex: 0,
    currentSection: 0,
    isDirty: false,
    metadata: {
      ...initialMetadata,
      id: uuidv4(),
      codigo: `R&F-${Date.now().toString().slice(-8)}`,
    },
  }),

  // Cálculo de cumplimiento
  calculateCompliance: (sheetName) => {
    const { respuestas } = get();
    const sheetAnswers = respuestas[sheetName] as Record<string, unknown> || {};
    
    let total = 0;
    let conforme = 0;
    let noConforme = 0;
    let noAplica = 0;

    // Contar respuestas
    Object.entries(sheetAnswers).forEach(([key, value]) => {
      if (key === 'obs' || key === 'seccion') return;
      
      if (typeof value === 'object' && value !== null && 'rows' in value) {
        // Es una tabla dinámica
        const tableData = value as { rows: Record<string, unknown>[] };
        total += tableData.rows?.length || 0;
      } else if (value !== null && value !== undefined) {
        total++;
        if (value === 'SI') conforme++;
        else if (value === 'NO') noConforme++;
        else if (value === 'N/A') noAplica++;
      }
    });

    const porcentaje = total > 0 ? Math.round((conforme / (total - noAplica)) * 100) : 0;
    
    return {
      total,
      conforme,
      noConforme,
      noAplica,
      porcentaje,
      estado: porcentaje >= 80 ? 'aprobado' : porcentaje > 0 ? 'rechazado' : 'pendiente',
    };
  },

  // UI
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setAutoSaveStatus: (status) => set({ autoSaveStatus: status }),
}));