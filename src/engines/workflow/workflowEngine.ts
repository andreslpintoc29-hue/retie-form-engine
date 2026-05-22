// ============================================
// WORKFLOW ENGINE - State Machine with Roles
// ============================================

import type { InspectionState } from '../state/formStateEngine';

export type WorkflowState = 
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'closed'
  | 'archived';

export type Role = 'inspector' | 'supervisor' | 'admin';

export interface StateTransition {
  from: WorkflowState;
  to: WorkflowState;
  allowedRoles: Role[];
  conditions?: TransitionCondition[];
  onTransition?: string;
}

export interface TransitionCondition {
  type: 'field' | 'formula' | 'time' | 'attachment';
  field?: string;
  formula?: string;
  value?: unknown;
  message?: string;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  fromState: WorkflowState;
  toState: WorkflowState;
  userId: string;
  userRole: Role;
  userName: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowContext {
  inspection: InspectionState;
  userId: string;
  userRole: Role;
  userName: string;
}

export const workflowStates: Record<WorkflowState, { label: string; color: string; description: string }> = {
  draft: { label: 'Borrador', color: '#6b7280', description: 'Inspección iniciada sin guardar' },
  in_progress: { label: 'En Progreso', color: '#3b82f6', description: 'Inspección en curso' },
  submitted: { label: 'Enviada', color: '#8b5cf6', description: 'Inspección enviada para revisión' },
  under_review: { label: 'En Revisión', color: '#f59e0b', description: 'En proceso de evaluación' },
  approved: { label: 'Aprobada', color: '#10b981', description: 'Cumple con requisitos RETIE' },
  rejected: { label: 'Rechazada', color: '#ef4444', description: 'No cumple requisitos' },
  closed: { label: 'Cerrada', color: '#6366f1', description: 'Inspección finalizada' },
  archived: { label: 'Archivada', color: '#9ca3af', description: 'Archivo histórico' }
};

const TRANSITIONS: StateTransition[] = [
  { from: 'draft', to: 'in_progress', allowedRoles: ['inspector'] },
  { from: 'in_progress', to: 'draft', allowedRoles: ['inspector'], onTransition: 'allow' },
  { from: 'in_progress', to: 'submitted', allowedRoles: ['inspector'] },
  { from: 'submitted', to: 'under_review', allowedRoles: ['supervisor', 'admin'] },
  { from: 'under_review', to: 'approved', allowedRoles: ['supervisor', 'admin'] },
  { from: 'under_review', to: 'rejected', allowedRoles: ['supervisor', 'admin'] },
  { from: 'approved', to: 'closed', allowedRoles: ['supervisor', 'admin'] },
  { from: 'rejected', to: 'in_progress', allowedRoles: ['inspector'] },
  { from: 'rejected', to: 'draft', allowedRoles: ['inspector'] },
  { from: 'closed', to: 'archived', allowedRoles: ['admin'] },
  { from: 'closed', to: 'in_progress', allowedRoles: ['admin'], conditions: [{ type: 'field', field: 'reopen_allowed', value: true }] },
  { from: 'archived', to: 'closed', allowedRoles: ['admin'] }
];

export class WorkflowEngine {
  private customTransitions: StateTransition[] = [];
  private logs: Map<string, WorkflowLog[]> = new Map();

  addTransition(transition: StateTransition): void {
    this.customTransitions.push(transition);
  }

  getAvailableTransitions(currentState: WorkflowState, role: Role): WorkflowState[] {
    const allTransitions = [...TRANSITIONS, ...this.customTransitions];
    const available = allTransitions
      .filter(t => t.from === currentState && t.allowedRoles.includes(role))
      .map(t => t.to);
    return available.filter((v, i, a) => a.indexOf(v) === i);
  }

  canTransition(from: WorkflowState, to: WorkflowState, role: Role): { allowed: boolean; reason?: string } {
    const allTransitions = [...TRANSITIONS, ...this.customTransitions];
    const transition = allTransitions.find(t => t.from === from && t.to === to);

    if (!transition) {
      return { allowed: false, reason: `Transición de ${from} a ${to} no permitida` };
    }

    if (!transition.allowedRoles.includes(role)) {
      return { allowed: false, reason: `Rol ${role} no tiene permiso para esta transición` };
    }

    return { allowed: true };
  }

  async transition(
    context: WorkflowContext,
    toState: WorkflowState,
    reason?: string
  ): Promise<{ success: boolean; log?: WorkflowLog; error?: string }> {
    const { inspection, userId, userRole, userName } = context;
    const fromState = (inspection.metadata?.status || 'draft') as WorkflowState;

    const permission = this.canTransition(fromState, toState, userRole);
    if (!permission.allowed) {
      return { success: false, error: permission.reason };
    }

    const log: WorkflowLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      fromState,
      toState,
      userId,
      userRole,
      userName,
      reason
    };

    const inspId = inspection.metadata?.inspectionId || 'unknown';
    const inspectionLogs = this.logs.get(inspId) || [];
    inspectionLogs.push(log);
    this.logs.set(inspId, inspectionLogs);

    return { success: true, log };
  }

  getLogs(inspectionId: string): WorkflowLog[] {
    return this.logs.get(inspectionId) || [];
  }

  getWorkflowProgress(state: WorkflowState): number {
    const stateOrder: WorkflowState[] = ['draft', 'in_progress', 'submitted', 'under_review', 'approved', 'closed'];
    const index = stateOrder.indexOf(state);
    if (index < 0) return 0;
    const progress = ((index + 1) / stateOrder.length) * 100;
    return Math.round(progress * 100) / 100;
  }

  validateTransition(inspection: InspectionState, toState: WorkflowState): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (toState === 'submitted') {
      if (!inspection.metadata?.siteName) issues.push('Falta nombre del sitio');
      if (!inspection.metadata?.inspectionDate) issues.push('Falta fecha de inspección');
    }

    if (toState === 'approved' || toState === 'rejected') {
      const currentState = (inspection.metadata?.status || 'draft') as WorkflowState;
      if (currentState !== 'under_review') {
        issues.push('Solo se puede aprobar/rechazar en estado "En Revisión"');
      }
    }

    return { valid: issues.length === 0, issues };
  }

  getStatePermissions(role: Role): Record<WorkflowState, { canView: boolean; canEdit: boolean }> {
    const permissions: Record<WorkflowState, { canView: boolean; canEdit: boolean }> = {} as any;

    for (const state of Object.keys(workflowStates) as WorkflowState[]) {
      permissions[state] = {
        canView: true,
        canEdit: role === 'admin' || (role === 'supervisor' && ['under_review', 'approved', 'rejected', 'closed'].includes(state)) ||
          (role === 'inspector' && ['draft', 'in_progress', 'submitted'].includes(state))
      };
    }

    return permissions;
  }
}

export const workflowEngine = new WorkflowEngine();