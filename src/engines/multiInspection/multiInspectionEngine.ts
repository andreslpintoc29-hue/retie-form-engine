/**
 * =====================================================
 * MULTI INSPECTION ENGINE - MÚLTIPLES INSPECCIONES
 * =====================================================
 * 
 * Características:
 * - Múltiples inspecciones simultáneas
 * - Draft recovery
 * - Sesiones
 * - Clonación
 * - Plantillas
 */

import { v4 as uuidv4 } from 'uuid';
import { InspectionMetadata, InspectionAnswers, MasterSchema } from '@/schemas/masterSchema';
import { useFormStateStore } from '../state/formStateEngine';

export interface InspectionSession {
  id: string;
  inspectionId: string;
  createdAt: number;
  lastActiveAt: number;
  autoSavedAt?: number;
  status: 'active' | 'idle' | 'closed';
}

export interface InspectionTemplate {
  id: string;
  name: string;
  description: string;
  schemaVersion: string;
  prefillFields: Record<string, Record<string, unknown>>;
  createdAt: string;
  createdBy: string;
}

export class MultiInspectionEngine {
  private sessions: Map<string, InspectionSession> = new Map();
  private templates: Map<string, InspectionTemplate> = new Map();
  private maxConcurrent: number = 5;
  private autoSaveInterval: number = 30000; // 30s

  // Crear nueva inspección
  createInspection(metadata: Partial<InspectionMetadata>): string {
    const id = metadata.id || uuidv4();
    
    // Inicializar en store
    useFormStateStore.getState().initInspection({
      id,
      proyecto: metadata.proyecto || '',
      direccion: metadata.direccion || '',
      fecha: metadata.fecha || new Date().toISOString().split('T')[0],
      inspector: metadata.inspector || '',
      inspectorId: metadata.inspectorId || '',
      codigo: metadata.codigo || `R&F-${Date.now().toString().slice(-8)}`,
      estado: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Crear sesión
    this.createSession(id);

    return id;
  }

  // Crear sesión
  private createSession(inspectionId: string): InspectionSession {
    const session: InspectionSession = {
      id: uuidv4(),
      inspectionId,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      status: 'active'
    };

    this.sessions.set(inspectionId, session);
    return session;
  }

  // Cambiar a inspección específica
  switchToInspection(inspectionId: string): boolean {
    const sessions = Array.from(this.sessions.values());
    const existingSession = sessions.find(s => s.inspectionId === inspectionId);

    if (existingSession) {
      // Marcar como activa
      existingSession.lastActiveAt = Date.now();
      existingSession.status = 'active';
      
      // Marcar otras como idle
      sessions.forEach(s => {
        if (s.inspectionId !== inspectionId) {
          s.status = 'idle';
        }
      });
      
      return true;
    }

    // No existe sesión, crear nueva
    this.createSession(inspectionId);
    return true;
  }

  // Clonar inspección existente
  cloneInspection(
    sourceId: string,
    newMetadata: Partial<InspectionMetadata>
  ): string | null {
    const currentAnswers = useFormStateStore.getState().getAllAnswers();
    const sourceSheetAnswers = currentAnswers[sourceId];
    
    if (!sourceSheetAnswers) return null;

    const newId = this.createInspection({
      ...newMetadata,
      proyecto: `${newMetadata.proyecto} (Copia)`
    });

    // Importar datos
    Object.entries(sourceSheetAnswers).forEach(([fieldId, value]) => {
      useFormStateStore.getState().setFieldValue(fieldId, value);
    });

    return newId;
  }

  // Crear desde plantilla
  createFromTemplate(templateId: string): string | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const inspectionId = this.createInspection({
      proyecto: `Nueva inspección desde ${template.name}`
    });

    // Aplicar prefill
    Object.entries(template.prefillFields).forEach(([sheetName, fields]) => {
      useFormStateStore.getState().setMultipleFields(sheetName, fields);
    });

    return inspectionId;
  }

  // Guardar plantilla
  saveAsTemplate(
    name: string,
    description: string,
    createdBy: string
  ): string {
    const answers = useFormStateStore.getState().getAllAnswers();
    
    const template: InspectionTemplate = {
      id: uuidv4(),
      name,
      description,
      schemaVersion: '1.0.0',
      prefillFields: answers,
      createdAt: new Date().toISOString(),
      createdBy
    };

    this.templates.set(template.id, template);
    return template.id;
  }

  // Obtener sesiones activas
  getActiveSessions(): InspectionSession[] {
    return Array.from(this.sessions.values())
      .filter(s => s.status === 'active')
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  }

  // Obtener todas las sesiones
  getAllSessions(): InspectionSession[] {
    return Array.from(this.sessions.values());
  }

  // Cerrar sesión
  closeSession(inspectionId: string): void {
    const session = this.sessions.get(inspectionId);
    if (session) {
      session.status = 'closed';
      session.lastActiveAt = Date.now();
    }
  }

  // Eliminar sesión
  deleteSession(inspectionId: string): void {
    this.sessions.delete(inspectionId);
    useFormStateStore.getState().resetInspection();
  }

  // Auto-save
  async autoSave(): Promise<void> {
    const activeSessions = this.getActiveSessions();
    
    for (const session of activeSessions) {
      if (session.status !== 'active') continue;

      // Guardar en store
      const answers = useFormStateStore.getState().getAllAnswers();
      
      // Guardar en IndexedDB (offline)
      // await offlineEngine.saveInspection(...);

      session.autoSavedAt = Date.now();
    }
  }

  // Obtener plantillas
  getTemplates(): InspectionTemplate[] {
    return Array.from(this.templates.values());
  }

  // Eliminar plantilla
  deleteTemplate(templateId: string): void {
    this.templates.delete(templateId);
  }

  // Obtener sesiones que necesitan atención (sin guardar recientemente)
  getSessionsNeedingAttention(): InspectionSession[] {
    const now = Date.now();
    const threshold = 5 * 60 * 1000; // 5 min

    return this.getActiveSessions().filter(s => 
      !s.autoSavedAt || (now - s.autoSavedAt > threshold)
    );
  }

  // Obtener inspection ID desde sesión activa
  getActiveInspectionId(): string | null {
    const activeSessions = this.getActiveSessions();
    return activeSessions[0]?.inspectionId || null;
  }
}

export const multiInspectionEngine = new MultiInspectionEngine();
export default MultiInspectionEngine;