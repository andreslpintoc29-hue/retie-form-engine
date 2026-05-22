/**
 * =====================================================
 * AUDIT / HISTORY ENGINE - TRAZABILIDAD COMPLETA
 * =====================================================
 * 
 * Guarda:
 * - quién modificó
 * - cuándo
 * - valor anterior
 * - valor nuevo
 * - dispositivo
 * - offline sync history
 */

import { v4 as uuidv4 } from 'uuid';

// ============================================
// TIPOS
// ============================================

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'approve' 
  | 'reject' 
  | 'submit' 
  | 'restore'
  | 'export';

export type AuditEntityType = 
  | 'inspection' 
  | 'field' 
  | 'table' 
  | 'attachment' 
  | 'comment'
  | 'compliance'
  | 'workflow';

export interface AuditEntry {
  // Identificador único
  id: string;
  
  // Metadata de la auditoría
  timestamp: number;
  dateTime: string;
  timezone: string;
  
  // Quién realizó la acción
  userId: string;
  userName: string;
  userRole: string;
  
  // La inspección afectada
  inspectionId: string;
  inspectionCode?: string;
  
  // Entidad afectada
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  
  // Acción realizada
  action: AuditAction;
  
  // Valores (traza completa)
  previousValue: unknown;
  newValue: unknown;
  valueChanged: boolean;
  
  // Contexto adicional
  fieldName?: string;
  sheetName?: string;
  sectionName?: string;
  norma?: string;
  
  // Metadata del dispositivo
  deviceInfo: DeviceInfo;
  
  // Ubicación (GPS)
  location?: GeoLocation;
  
  // Offline sync
  syncStatus: 'pending' | 'synced';
  syncedAt?: number;
  
  // Notas opcionales
  notes?: string;
  reason?: string;
  
  // metadata adicional
  metadata?: Record<string, unknown>;
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser?: string;
  appVersion: string;
  sessionId: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface AuditFilter {
  inspectionId?: string;
  userId?: string;
  entityType?: AuditEntityType;
  action?: AuditAction;
  fromDate?: number;
  toDate?: number;
  syncStatus?: 'pending' | 'synced';
}

export interface AuditStats {
  totalEntries: number;
  byAction: Record<AuditAction, number>;
  byUser: Record<string, number>;
  byEntityType: Record<AuditEntityType, number>;
  lastSyncedAt?: number;
  pendingCount: number;
}

// ============================================
// ENGINE
// ============================================

export class AuditEngine {
  private entries: AuditEntry[] = [];
  private currentSessionId: string;
  private deviceInfo: DeviceInfo;
  private isOnline: boolean = true;
  private syncQueue: AuditEntry[] = [];

  constructor() {
    this.currentSessionId = uuidv4();
    this.deviceInfo = this.getDeviceInfo();
    this.setupNetworkListeners();
  }

  // Obtener información del dispositivo
  private getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        os: 'Server',
        appVersion: '1.0.0',
        sessionId: this.currentSessionId
      };
    }

    const ua = navigator.userAgent;
    let type: 'desktop' | 'tablet' | 'mobile' = 'desktop';
    
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      type = 'tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
      type = 'mobile';
    }

    let os = 'Unknown';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/mac/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/ios|iphone|ipad/i.test(ua)) os = 'iOS';

    return {
      type,
      os,
      browser: this.getBrowser(ua),
      appVersion: '1.0.0', // Obtener de config
      sessionId: this.currentSessionId
    };
  }

  private getBrowser(ua: string): string {
    if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
    if (/edge/i.test(ua)) return 'Edge';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/msie|trident/i.test(ua)) return 'IE';
    return 'Unknown';
  }

  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingEntries();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
      this.isOnline = navigator.onLine;
    }
  }

  // ============================================
  // REGISTRAR ACCIONES
  // ============================================

  // Registrar cambio de campo
  logFieldChange(
    inspectionId: string,
    userId: string,
    userName: string,
    userRole: string,
    sheetName: string,
    fieldId: string,
    fieldName: string,
    previousValue: unknown,
    newValue: unknown,
    location?: GeoLocation
  ): AuditEntry {
    return this.log({
      inspectionId,
      userId,
      userName,
      userRole,
      entityType: 'field',
      entityId: fieldId,
      entityName: fieldName,
      action: previousValue === null ? 'create' : 'update',
      previousValue,
      newValue,
      metadata: { sheetName }
    }, location);
  }

  // Registrar creación de inspección
  logInspectionCreate(
    inspectionId: string,
    userId: string,
    userName: string,
    userRole: string,
    inspectionData: Record<string, unknown>,
    location?: GeoLocation
  ): AuditEntry {
    return this.log({
      inspectionId,
      userId,
      userName,
      userRole,
      entityType: 'inspection',
      entityId: inspectionId,
      action: 'create',
      previousValue: null,
      newValue: inspectionData
    }, location);
  }

  logAction(params: {
    inspectionId: string;
    action: string;
    userId: string;
    timestamp: string;
  }): AuditEntry {
    return this.log({
      inspectionId: params.inspectionId,
      userId: params.userId,
      userName: 'System',
      userRole: 'system',
      entityType: 'inspection',
      entityId: params.inspectionId,
      action: 'create',
      previousValue: null,
      newValue: { action: params.action },
      notes: `Action logged: ${params.action}`
    });
  }

  // Registrar aprobación/rechazo
  logWorkflowAction(
    inspectionId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: 'approve' | 'reject' | 'submit',
    previousStatus: string,
    newStatus: string,
    notes?: string,
    location?: GeoLocation
  ): AuditEntry {
    return this.log({
      inspectionId,
      userId,
      userName,
      userRole,
      entityType: 'workflow',
      entityId: inspectionId,
      action,
      previousValue: previousStatus,
      newValue: newStatus,
      notes
    }, location);
  }

  // Registrar descarga/export
  logExport(
    inspectionId: string,
    userId: string,
    userName: string,
    userRole: string,
    exportType: string,
    format: string,
    location?: GeoLocation
  ): AuditEntry {
    return this.log({
      inspectionId,
      userId,
      userName,
      userRole,
      entityType: 'inspection',
      entityId: inspectionId,
      action: 'export',
      previousValue: null,
      newValue: { type: exportType, format },
      notes: `Exportado como ${format}`
    }, location);
  }

  // Registrar adjuntos
  logAttachment(
    inspectionId: string,
    userId: string,
    userName: string,
    userRole: string,
    fieldId: string,
    fileName: string,
    action: 'create' | 'delete',
    fileSize?: number,
    location?: GeoLocation
  ): AuditEntry {
    return this.log({
      inspectionId,
      userId,
      userName,
      userRole,
      entityType: 'attachment',
      entityId: fieldId,
      entityName: fileName,
      action,
      previousValue: action === 'delete' ? { fileName } : null,
      newValue: action === 'create' ? { fileName, size: fileSize } : null,
      metadata: { fileSize }
    }, location);
  }

  // Método base de logging
  private log(
    base: {
      inspectionId: string;
      userId: string;
      userName: string;
      userRole: string;
      entityType: AuditEntityType;
      entityId: string;
      entityName?: string;
      action: AuditAction;
      previousValue: unknown;
      newValue: unknown;
      metadata?: Record<string, unknown>;
      notes?: string;
    },
    location?: GeoLocation
  ): AuditEntry {
    const entry: AuditEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      dateTime: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      userId: base.userId,
      userName: base.userName,
      userRole: base.userRole,
      
      inspectionId: base.inspectionId,
      
      entityType: base.entityType,
      entityId: base.entityId,
      entityName: base.entityName,
      
      action: base.action,
      
      previousValue: base.previousValue,
      newValue: base.newValue,
      valueChanged: JSON.stringify(base.previousValue) !== JSON.stringify(base.newValue),
      
      deviceInfo: this.deviceInfo,
      location,
      
      syncStatus: this.isOnline ? 'synced' : 'pending',
      syncedAt: this.isOnline ? Date.now() : undefined,
      
      notes: base.notes,
      metadata: base.metadata
    };

    this.entries.push(entry);
    
    // Agregar a cola de sync si offline
    if (!this.isOnline) {
      this.syncQueue.push(entry);
    }

    return entry;
  }

  // ============================================
  // CONSULTAS
  // ============================================

  // Obtener historial de inspección
  getInspectionHistory(inspectionId: string): AuditEntry[] {
    return this.entries
      .filter(e => e.inspectionId === inspectionId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Obtener historial de campo
  getFieldHistory(inspectionId: string, fieldId: string): AuditEntry[] {
    return this.entries
      .filter(e => e.inspectionId === inspectionId && e.entityId === fieldId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  // Obtener todas las entradas con filtros
  query(filter: AuditFilter): AuditEntry[] {
    return this.entries.filter(entry => {
      if (filter.inspectionId && entry.inspectionId !== filter.inspectionId) return false;
      if (filter.userId && entry.userId !== filter.userId) return false;
      if (filter.entityType && entry.entityType !== filter.entityType) return false;
      if (filter.action && entry.action !== filter.action) return false;
      if (filter.fromDate && entry.timestamp < filter.fromDate) return false;
      if (filter.toDate && entry.timestamp > filter.toDate) return false;
      if (filter.syncStatus && entry.syncStatus !== filter.syncStatus) return false;
      return true;
    });
  }

  // Obtener última acción de usuario
  getLastUserAction(userId: string): AuditEntry | null {
    const userEntries = this.entries.filter(e => e.userId === userId);
    return userEntries.sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  getStats(): AuditStats {
    const byAction: Record<AuditAction, number> = {
      create: 0, update: 0, delete: 0, view: 0,
      approve: 0, reject: 0, submit: 0, restore: 0,
      export: 0
    };
    
    const byUser: Record<string, number> = {};
    const byEntityType: Record<AuditEntityType, number> = {
      inspection: 0, field: 0, table: 0,
      attachment: 0, comment: 0, compliance: 0, workflow: 0
    };

    for (const entry of this.entries) {
      byAction[entry.action]++;
      byUser[entry.userId] = (byUser[entry.userId] || 0) + 1;
      byEntityType[entry.entityType]++;
    }

    const pendingEntries = this.entries.filter(e => e.syncStatus === 'pending');
    const lastSynced = this.entries
      .filter(e => e.syncStatus === 'synced')
      .sort((a, b) => (b.syncedAt || 0) - (a.syncedAt || 0))[0];

    return {
      totalEntries: this.entries.length,
      byAction,
      byUser,
      byEntityType,
      lastSyncedAt: lastSynced?.syncedAt,
      pendingCount: pendingEntries.length + this.syncQueue.length
    };
  }

  // ============================================
  // EXPORTAR / IMPORTAR
  // ============================================

  exportToJSON(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  importFromJSON(json: string): void {
    try {
      const imported = JSON.parse(json) as AuditEntry[];
      this.entries = [...this.entries, ...imported];
    } catch (error) {
      console.error('Error importing audit log:', error);
      throw new Error('Invalid audit log format');
    }
  }

  // ============================================
  // LIMPIEZA
  // ============================================

  clear(): void {
    this.entries = [];
    this.syncQueue = [];
  }

  clearOldEntries(beforeDate: number): void {
    this.entries = this.entries.filter(e => e.timestamp >= beforeDate);
  }

  // ============================================
  // SYNC
  // ============================================

  private async syncPendingEntries(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const toSync = [...this.syncQueue];
    this.syncQueue = [];

    // En producción, aquí se enviaría a Firebase
    // await firebaseService.syncAuditLogs(toSync);

    // Marcar como synced
    toSync.forEach(entry => {
      const index = this.entries.findIndex(e => e.id === entry.id);
      if (index >= 0) {
        this.entries[index].syncStatus = 'synced';
        this.entries[index].syncedAt = Date.now();
      }
    });
  }

  // Obtener entradas pendientes de sync
  getPendingEntries(): AuditEntry[] {
    return this.entries.filter(e => e.syncStatus === 'pending');
  }

  // Forzar sync manual
  async forceSync(): Promise<number> {
    const pending = this.getPendingEntries();
    await this.syncPendingEntries();
    return pending.length;
  }

  // Wrapper para logChange usado por engineOrchestrator
  logChange(params: {
    inspectionId: string;
    fieldId: string;
    fieldLabel: string;
    previousValue: unknown;
    newValue: unknown;
    userId: string;
    timestamp: string;
  }): AuditEntry {
    return this.logFieldChange(
      params.inspectionId,
      params.userId,
      'System',
      'system',
      '',
      params.fieldId,
      params.fieldLabel,
      params.previousValue,
      params.newValue
    );
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const auditEngine = new AuditEngine();

export default AuditEngine;