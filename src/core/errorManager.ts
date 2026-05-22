// ============================================
// ERROR MANAGEMENT SYSTEM - PRODUCTION
// ============================================

import { eventBus } from './integration/eventBus';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 
  | 'validation'
  | 'network'
  | 'storage'
  | 'sync'
  | 'auth'
  | 'render'
  | 'engine'
  | 'system';

export interface AppError {
  id: string;
  message: string;
  stack?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  source: string;
  timestamp: string;
  context?: Record<string, unknown>;
  userId?: string;
  inspectionId?: string;
  resolved: boolean;
  resolvedAt?: string;
  resolution?: string;
}

export interface ErrorBoundaryConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  maxErrors: number;
  flushInterval: number;
}

const DEFAULT_CONFIG: ErrorBoundaryConfig = {
  enableLogging: true,
  enableReporting: true,
  maxErrors: 100,
  flushInterval: 30000
};

type ErrorHandler = (error: AppError) => void | Promise<void>;

export class ErrorManager {
  private config: ErrorBoundaryConfig;
  private errors: AppError[] = [];
  private handlers: Set<ErrorHandler> = new Set();
  private isProcessing = false;
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<ErrorBoundaryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.setupGlobalHandlers();
    this.startFlushTimer();
  }

  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        message: String(message),
        stack: error?.stack,
        category: 'system',
        severity: 'high',
        source: `window.onerror:${source}:${lineno}:${colno}`
      });
    };

    window.onunhandledrejection = (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        category: 'system',
        severity: 'critical',
        source: 'unhandledRejection'
      });
    };
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flushErrors();
    }, this.config.flushInterval);
  }

  // ============================================
  // ERROR CAPTURE
  // ============================================

  captureError(params: {
    message: string;
    stack?: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    source: string;
    context?: Record<string, unknown>;
    userId?: string;
    inspectionId?: string;
  }): AppError {
    const error: AppError = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: params.message,
      stack: params.stack,
      category: params.category,
      severity: params.severity,
      source: params.source,
      timestamp: new Date().toISOString(),
      context: params.context,
      userId: params.userId,
      inspectionId: params.inspectionId,
      resolved: false
    };

    this.errors.push(error);

    if (this.errors.length > this.config.maxErrors) {
      this.errors.shift();
    }

    if (this.config.enableLogging) {
      this.logError(error);
    }

    eventBus.emit('FORM_ERROR', { error, category: params.category });

    this.notifyHandlers(error);

    return error;
  }

  captureValidationError(fieldId: string, message: string, context?: Record<string, unknown>): AppError {
    return this.captureError({
      message: `[Validation] ${message}`,
      category: 'validation',
      severity: 'low',
      source: `validation:${fieldId}`,
      context: { fieldId, ...context }
    });
  }

  captureNetworkError(operation: string, status: number, details?: string): AppError {
    return this.captureError({
      message: `[Network] ${operation} failed: ${status}`,
      category: 'network',
      severity: status >= 500 ? 'high' : 'medium',
      source: `network:${operation}`,
      context: { status, details }
    });
  }

  captureSyncError(inspectionId: string, error: string): AppError {
    return this.captureError({
      message: `[Sync] Failed to sync inspection: ${error}`,
      category: 'sync',
      severity: 'high',
      source: 'sync:inspection',
      inspectionId
    });
  }

  captureEngineError(engine: string, operation: string, error: string): AppError {
    return this.captureError({
      message: `[Engine] ${engine}.${operation}: ${error}`,
      category: 'engine',
      severity: 'critical',
      source: `engine:${engine}`,
      context: { engine, operation }
    });
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  subscribe(handler: ErrorHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private notifyHandlers(error: AppError): void {
    this.handlers.forEach(handler => {
      try {
        handler(error);
      } catch (e) {
        console.error('Error in error handler:', e);
      }
    });
  }

  // ============================================
  // ERROR RETRIEVAL
  // ============================================

  getErrors(filters?: {
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    resolved?: boolean;
    since?: string;
  }): AppError[] {
    let result = [...this.errors];

    if (filters?.category) {
      result = result.filter(e => e.category === filters.category);
    }
    if (filters?.severity) {
      result = result.filter(e => e.severity === filters.severity);
    }
    if (filters?.resolved !== undefined) {
      result = result.filter(e => e.resolved === filters.resolved);
    }
    const since = filters?.since;
    if (since) {
      result = result.filter(e => e.timestamp >= since);
    }

    return result.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getError(id: string): AppError | undefined {
    return this.errors.find(e => e.id === id);
  }

  getErrorCount(category?: ErrorCategory): number {
    if (category) {
      return this.errors.filter(e => e.category === category).length;
    }
    return this.errors.length;
  }

  getErrorStats(): Record<ErrorCategory, number> {
    const stats: Record<string, number> = {};
    for (const error of this.errors) {
      stats[error.category] = (stats[error.category] || 0) + 1;
    }
    return stats as Record<ErrorCategory, number>;
  }

  // ============================================
  // ERROR RESOLUTION
  // ============================================

  resolveError(id: string, resolution: string): void {
    const error = this.errors.find(e => e.id === id);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      error.resolution = resolution;
      
      eventBus.emit('ERROR_RESOLVED' as any, { errorId: id, resolution });
    }
  }

  resolveAllErrors(category?: ErrorCategory): void {
    const toResolve = category 
      ? this.errors.filter(e => e.category === category && !e.resolved)
      : this.errors.filter(e => !e.resolved);

    for (const error of toResolve) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
      error.resolution = 'Bulk resolution';
    }
  }

  // ============================================
  // LOGGING
  // ============================================

  private logError(error: AppError): void {
    const severityPrefix = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    console[error.severity === 'critical' ? 'error' : 'warn'](
      `${severityPrefix[error.severity]} [${error.category.toUpperCase()}] ${error.message}`,
      {
        id: error.id,
        source: error.source,
        timestamp: error.timestamp,
        resolved: error.resolved,
        context: error.context
      }
    );
  }

  private flushErrors(): void {
    const unresolvedErrors = this.errors.filter(e => !e.resolved);
    
    if (unresolvedErrors.length > 0 && this.config.enableReporting) {
      console.log('📊 Flushing errors:', unresolvedErrors.length);
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  clearErrors(): void {
    this.errors = [];
  }

  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  importErrors(json: string): void {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        this.errors = [...this.errors, ...imported];
      }
    } catch (e) {
      console.error('Failed to import errors:', e);
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.handlers.clear();
  }
}

export const errorManager = new ErrorManager();

export default ErrorManager;