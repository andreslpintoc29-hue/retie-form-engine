// ============================================
// DEVTOOLS ENTERPRISE - DEBUGGING TOOLS
// ============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { eventBus, type FormEvent, type EventType } from './integration/eventBus';
import { useFormStateStore } from '@/engines/state/formStateEngine';
import { errorManager, type AppError, type ErrorCategory } from './errorManager';

interface DevToolsState {
  activeTab: 'events' | 'state' | 'validation' | 'rules' | 'formula' | 'performance' | 'errors';
  eventFilter: EventType | 'all';
  maxEvents: number;
  isRecording: boolean;
}

const DEFAULT_DEVTOOLS_STATE: DevToolsState = {
  activeTab: 'events',
  eventFilter: 'all',
  maxEvents: 100,
  isRecording: true
};

export function DevToolsPanel() {
  const [state, setState] = useState<DevToolsState>(DEFAULT_DEVTOOLS_STATE);
  const [events, setEvents] = useState<FormEvent[]>([]);
  const [errors, setErrors] = useState<AppError[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const store = useFormStateStore();
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = eventBus.subscribeGlobal((event) => {
      if (state.isRecording) {
        setEvents(prev => {
          const newEvents = [event, ...prev];
          return newEvents.slice(0, state.maxEvents);
        });
      }
    });

    return unsubscribe;
  }, [state.isRecording, state.maxEvents]);

  useEffect(() => {
    const unsubscribeErrors = errorManager.subscribe((error) => {
      setErrors(prev => [error, ...prev].slice(0, 50));
    });

    return unsubscribeErrors;
  }, []);

  useEffect(() => {
    let perfInterval: NodeJS.Timeout;
    
    if (state.activeTab === 'performance') {
      perfInterval = setInterval(() => {
        const perf = performance.now();
        setPerformanceData(prev => [...prev, {
          timestamp: new Date().toISOString(),
          memory: (performance as any).memory?.usedJSHeapSize || 0,
          latency: perf
        }].slice(-30));
      }, 1000);
    }

    return () => clearInterval(perfInterval);
  }, [state.activeTab]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const filteredEvents = state.eventFilter === 'all'
    ? events
    : events.filter(e => e.type === state.eventFilter);

  const tabs = [
    { id: 'events', label: 'Events', icon: '📡' },
    { id: 'state', label: 'State', icon: '📦' },
    { id: 'validation', label: 'Validation', icon: '✅' },
    { id: 'rules', label: 'Rules', icon: '📋' },
    { id: 'formula', label: 'Formula', icon: '🔢' },
    { id: 'performance', label: 'Perf', icon: '⚡' },
    { id: 'errors', label: 'Errors', icon: '🚨' }
  ] as const;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[70vh] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
        <span className="text-sm font-bold text-blue-400">🔧 DevTools</span>
        <div className="flex gap-2">
          <button
            onClick={() => setState(s => ({ ...s, isRecording: !s.isRecording }))}
            className={`text-xs px-2 py-1 rounded ${state.isRecording ? 'bg-green-600' : 'bg-slate-600'}`}
          >
            {state.isRecording ? 'Recording' : 'Paused'}
          </button>
          <button
            onClick={() => { setEvents([]); setErrors([]); }}
            className="text-xs px-2 py-1 bg-slate-600 rounded hover:bg-slate-500"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setState(s => ({ ...s, activeTab: tab.id as any }))}
            className={`flex-1 px-2 py-2 text-xs ${
              state.activeTab === tab.id
                ? 'bg-slate-700 text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {state.activeTab === 'events' && (
          <EventsPanel events={filteredEvents} filter={state.eventFilter} onFilterChange={(f) => setState(s => ({ ...s, eventFilter: f }))} />
        )}
        {state.activeTab === 'state' && <StatePanel store={store} />}
        {state.activeTab === 'validation' && <ValidationPanel />}
        {state.activeTab === 'rules' && <RulesPanel />}
        {state.activeTab === 'formula' && <FormulaPanel />}
        {state.activeTab === 'performance' && <PerformancePanel data={performanceData} />}
        {state.activeTab === 'errors' && <ErrorsPanel errors={errors} />}
      </div>

      <div ref={eventsEndRef} />
    </div>
  );
}

function EventsPanel({ events, filter, onFilterChange }: { events: FormEvent[]; filter: string; onFilterChange: (f: any) => void }) {
  const eventTypes = ['all', 'FIELD_CHANGED', 'VALIDATION_COMPLETED', 'RULE_TRIGGERED', 'FORMULA_RECALCULATED', 'COMPLIANCE_UPDATED', 'AUTOSAVE_COMPLETED', 'OFFLINE_SYNC_COMPLETED'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-2 border-b border-slate-700">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full bg-slate-800 text-xs text-slate-300 px-2 py-1 rounded border border-slate-600"
        >
          {eventTypes.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Events' : t}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {events.map((evt, idx) => (
          <div key={idx} className="text-xs font-mono border-l-2 border-slate-600 pl-2 py-1">
            <span className="text-blue-400">{evt.type}</span>
            <span className="text-slate-500 ml-2">{new Date(evt.timestamp).toLocaleTimeString()}</span>
            {evt.metadata?.fieldId && (
              <span className="text-yellow-400 ml-2">[{evt.metadata.fieldId}]</span>
            )}
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-xs text-slate-500 text-center py-4">No events recorded</div>
        )}
      </div>
    </div>
  );
}

function StatePanel({ store }: { store: any }) {
  const [expanded, setExpanded] = useState<string[]>(['answers']);

  const toggle = (key: string) => {
    setExpanded(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
      <div className="mb-2">
        <button onClick={() => toggle('inspection')} className="text-blue-400 hover:underline">
          {expanded.includes('inspection') ? '▼' : '▶'} inspection
        </button>
        {expanded.includes('inspection') && (
          <pre className="text-slate-400 ml-4 mt-1">
            {JSON.stringify({ inspectionId: store.inspectionId, status: store.status }, null, 2)}
          </pre>
        )}
      </div>
      <div className="mb-2">
        <button onClick={() => toggle('answers')} className="text-blue-400 hover:underline">
          {expanded.includes('answers') ? '▼' : '▶'} answers ({Object.keys(store.answers).length})
        </button>
        {expanded.includes('answers') && (
          <pre className="text-slate-400 ml-4 mt-1 max-h-32 overflow-y-auto">
            {JSON.stringify(store.answers, null, 2)}
          </pre>
        )}
      </div>
      <div className="mb-2">
        <button onClick={() => toggle('compliance')} className="text-blue-400 hover:underline">
          {expanded.includes('compliance') ? '▼' : '▶'} compliance ({store.compliance.size})
        </button>
        {expanded.includes('compliance') && (
          <pre className="text-slate-400 ml-4 mt-1">
            {JSON.stringify(Object.fromEntries(store.compliance), null, 2)}
          </pre>
        )}
      </div>
      <div className="mb-2">
        <button onClick={() => toggle('errors')} className="text-blue-400 hover:underline">
          {expanded.includes('errors') ? '▼' : '▶'} error count ({store.errors.length})
        </button>
        {expanded.includes('errors') && store.errors.length > 0 && (
          <pre className="text-slate-400 ml-4 mt-1">
            {JSON.stringify(store.errors.slice(0, 5), null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function ValidationPanel() {
  return (
    <div className="flex-1 p-2 text-xs">
      <div className="text-slate-400 mb-2">Validation Rules Active:</div>
      <div className="space-y-1 text-slate-300">
        <div>• required: Not empty</div>
        <div>• minLength / maxLength</div>
        <div>• min / max (numbers)</div>
        <div>• pattern (regex)</div>
        <div>• precision (decimals)</div>
        <div>• custom (function)</div>
      </div>
      <div className="mt-4 text-slate-400 mb-2">Cross-field validation:</div>
      <div className="text-slate-300 text-xs">
        ✓ Field-to-field comparison<br/>
        ✓ Formula-based validation<br/>
        ✓ Async validation support
      </div>
    </div>
  );
}

function RulesPanel() {
  return (
    <div className="flex-1 p-2 text-xs">
      <div className="text-slate-400 mb-2">Active Rule Conditions:</div>
      <div className="space-y-1 text-slate-300">
        <div>• equals / notEquals</div>
        <div>• contains / notContains</div>
        <div>• greaterThan / lessThan</div>
        <div>• isEmpty / isNotEmpty</div>
        <div>• startsWith / endsWith</div>
        <div>• matches (regex)</div>
        <div>• in (array)</div>
        <div>• and / or (composite)</div>
      </div>
      <div className="mt-4 text-slate-400 mb-2">Actions:</div>
      <div className="text-slate-300">
        show, hide, setValue, setVisible, setEnabled, setRequired, setSeverity
      </div>
    </div>
  );
}

function FormulaPanel() {
  return (
    <div className="flex-1 p-2 text-xs">
      <div className="text-slate-400 mb-2">Formula Functions:</div>
      <div className="space-y-1 text-slate-300">
        <div className="text-yellow-400">Basic:</div>
        <div className="ml-2">+, -, *, /, (, )</div>
        <div className="text-yellow-400">Math:</div>
        <div className="ml-2">SUM, AVG, COUNT, MIN, MAX, ROUND, ABS, POWER, SQRT</div>
        <div className="text-yellow-400">RETIE:</div>
        <div className="ml-2">ILLUMINANCE_AVG, COMPLIANCE_PCT, ISOLATION_RESISTANCE, POWER_FACTOR</div>
      </div>
      <div className="mt-4 text-slate-400 mb-2">Features:</div>
      <div className="text-slate-300 text-xs">
        ✓ Dependency graph<br/>
        ✓ Topological sort<br/>
        ✓ Precision control<br/>
        ✓ Cache computation
      </div>
    </div>
  );
}

function PerformancePanel({ data }: { data: any[] }) {
  return (
    <div className="flex-1 p-2 text-xs">
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-slate-400">Memory</div>
          <div className="text-green-400">
            {data.length > 0 ? `${(data[data.length - 1].memory / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
          </div>
        </div>
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-slate-400">Events/sec</div>
          <div className="text-blue-400">{data.length > 0 ? '~1' : 'N/A'}</div>
        </div>
      </div>
      <div className="text-slate-400 mb-2">Performance Tips:</div>
      <div className="text-slate-300 text-xs">
        • Use memoized selectors<br/>
        • Lazy load sections<br/>
        • Virtualize large tables<br/>
        • Debounce auto-save
      </div>
    </div>
  );
}

function ErrorsPanel({ errors }: { errors: AppError[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {errors.length === 0 ? (
        <div className="text-xs text-green-400 text-center py-4">No errors recorded ✓</div>
      ) : (
        errors.map((err, idx) => (
          <div key={idx} className={`text-xs mb-2 p-2 rounded border-l-2 ${
            err.severity === 'critical' ? 'border-red-500 bg-red-900/20' :
            err.severity === 'high' ? 'border-orange-500 bg-orange-900/20' :
            'border-yellow-500 bg-yellow-900/20'
          }`}>
            <div className="text-slate-300">{err.message}</div>
            <div className="text-slate-500 mt-1">
              {err.category} • {err.source} • {new Date(err.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default DevToolsPanel;
