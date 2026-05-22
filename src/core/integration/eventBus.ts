// ============================================
// EVENT BUS - Internal Event System
// ============================================

export type EventType =
  | 'SCHEMA_LOADED'
  | 'FORM_INITIALIZED'
  | 'FIELD_CHANGED'
  | 'FIELD_BLURRED'
  | 'VALIDATION_STARTED'
  | 'VALIDATION_COMPLETED'
  | 'VALIDATION_FAILED'
  | 'RULE_TRIGGERED'
  | 'RULE_ACTION_EXECUTED'
  | 'FORMULA_RECALCULATED'
  | 'COMPLIANCE_UPDATED'
  | 'AUTOSAVE_TRIGGERED'
  | 'AUTOSAVE_COMPLETED'
  | 'OFFLINE_SYNC_STARTED'
  | 'OFFLINE_SYNC_COMPLETED'
  | 'OFFLINE_SYNC_FAILED'
  | 'AUDIT_LOGGED'
  | 'WORKFLOW_TRANSITION'
  | 'ATTACHMENT_UPLOADED'
  | 'ATTACHMENT_REMOVED'
  | 'TABLE_ROW_ADDED'
  | 'TABLE_ROW_REMOVED'
  | 'TABLE_CELL_CHANGED'
  | 'SECTION_VISIBLE'
  | 'SECTION_HIDDEN'
  | 'FORM_SUBMITTED'
  | 'CONFLICT_RESOLVED'
  | 'FORM_ERROR';

export interface FormEvent<T = unknown> {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  payload: T;
  metadata?: EventMetadata;
}

export interface EventMetadata {
  fieldId?: string;
  sheetCode?: string;
  inspectionId?: string;
  userId?: string;
  sessionId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  duration?: number;
  success?: boolean;
  error?: string;
}

type EventHandler<T = unknown> = (event: FormEvent<T>) => void | Promise<void>;

export class EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();
  private eventHistory: FormEvent[] = [];
  private maxHistorySize = 1000;
  private listeners: Map<string, Set<EventHandler>> = new Map();

  subscribe(eventType: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  subscribeMultiple(eventTypes: EventType[], handler: EventHandler): () => void {
    const unsubscribers: (() => void)[] = [];
    for (const type of eventTypes) {
      unsubscribers.push(this.subscribe(type, handler));
    }
    return () => unsubscribers.forEach(fn => fn());
  }

  emit<T = unknown>(type: EventType, payload: T, metadata?: EventMetadata): FormEvent<T> {
    const event: FormEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      source: 'event-bus',
      payload,
      metadata
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }

    this.emitGlobal(event);
    return event;
  }

  private emitGlobal<T>(event: FormEvent<T>): void {
    this.listeners.forEach((handlers) => {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error in global event handler:', error);
        }
      });
    });
  }

  subscribeGlobal(handler: EventHandler): () => void {
    const listenerId = `listener-${Date.now()}`;
    if (!this.listeners.has(listenerId)) {
      this.listeners.set(listenerId, new Set());
    }
    this.listeners.get(listenerId)!.add(handler);

    return () => {
      this.listeners.delete(listenerId);
    };
  }

  getHistory(eventType?: EventType, limit = 100): FormEvent[] {
    let events = this.eventHistory;
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    return events.slice(-limit);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  getEventStats(): Record<EventType, number> {
    const stats: Record<string, number> = {};
    for (const event of this.eventHistory) {
      stats[event.type] = (stats[event.type] || 0) + 1;
    }
    return stats as Record<EventType, number>;
  }
}

export const eventBus = new EventBus();