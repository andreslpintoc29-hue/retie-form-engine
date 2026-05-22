// ============================================
// DEMO PAGE - END-TO-END REAL DATA FLOW
// ============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { pdfEngine } from '@/engines/pdf/pdfEngine';
import { complianceEngine } from '@/engines/compliance/complianceEngine';
import type { RETIEMasterSchema } from '@/schemas/masterSchema';

const DEMO_SCHEMA: RETIEMasterSchema = {
  version: '1.0.0',
  lastUpdated: '2024-01-01',
  sheets: [
    {
      codigo: 'GENERAL',
      nombre: 'Información General',
      titulo: 'Datos Generales de la Inspección',
      type: 'inspection',
      sections: [
        {
          id: 's1',
          titulo: 'Datos del Sitio',
          fields: [
            { id: 'site_name', label: 'Nombre del Sitio', type: 'text', required: true },
            { id: 'site_address', label: 'Dirección', type: 'text', required: true },
            { id: 'site_type', label: 'Tipo de Instalación', type: 'select', required: true, options: [
              { label: 'Residencial', value: 'residential' },
              { label: 'Comercial', value: 'commercial' },
              { label: 'Industrial', value: 'industrial' }
            ]}
          ]
        },
        {
          id: 's2',
          titulo: 'Datos del Inspector',
          fields: [
            { id: 'inspector_name', label: 'Nombre del Inspector', type: 'text', required: true },
            { id: 'inspector_license', label: 'Número de Licencia', type: 'text', required: true },
            { id: 'inspection_date', label: 'Fecha de Inspección', type: 'date', required: true }
          ]
        }
      ]
    },
    {
      codigo: 'ELECTRICA',
      nombre: 'Instalación Eléctrica',
      titulo: 'Verificación de Sistema Eléctrico',
      type: 'inspection',
      sections: [
        {
          id: 'e1',
          titulo: 'Servicio Eléctrico',
          fields: [
            { id: 'has_service', label: '¿Tiene servicio eléctrico?', type: 'radio', required: true, options: [
              { label: 'SI', value: 'SI' },
              { label: 'NO', value: 'NO' }
            ]},
            { id: 'service_voltage', label: 'Voltaje del Servicio (V)', type: 'number' },
            { id: 'service_type', label: 'Tipo de Servicio', type: 'select', options: [
              { label: 'Monofásico', value: 'single' },
              { label: 'Trifásico', value: 'three' }
            ]}
          ]
        },
        {
          id: 'e2',
          titulo: 'Mediciones',
          fields: [
            { id: 'voltage_l1', label: 'Voltaje L1 (V)', type: 'decimal' },
            { id: 'voltage_l2', label: 'Voltaje L2 (V)', type: 'decimal' },
            { id: 'voltage_l3', label: 'Voltaje L3 (V)', type: 'decimal' },
            { id: 'avg_voltage', label: 'Voltaje Promedio (V)', type: 'decimal', computed: true },
            { id: 'current_amps', label: 'Corriente (A)', type: 'decimal' }
          ]
        },
        {
          id: 'e3',
          titulo: 'Protecciones',
          fields: [
            { id: 'has_main_breaker', label: '¿Tiene Interruptor Principal?', type: 'radio', required: true },
            { id: 'breaker_rating', label: 'Capacidad del Interruptor (A)', type: 'number' },
            { id: 'has_grounding', label: '¿Sistema de Puesta a Tierra?', type: 'radio', required: true },
            { id: 'grounding_resistance', label: 'Resistencia de Puesta a Tierra (Ω)', type: 'decimal' }
          ]
        }
      ]
    },
    {
      codigo: 'ILUMINACION',
      name: 'Iluminación',
      titulo: 'Niveles de Iluminación',
      type: 'inspection',
      sections: [
        {
          id: 'i1',
          titulo: 'Mediciones de Iluminancia',
          fields: [
            { id: 'lux_1', label: 'Punto 1 (lux)', type: 'number' },
            { id: 'lux_2', label: 'Punto 2 (lux)', type: 'number' },
            { id: 'lux_3', label: 'Punto 3 (lux)', type: 'number' },
            { id: 'lux_4', label: 'Punto 4 (lux)', type: 'number' },
            { id: 'lux_5', label: 'Punto 5 (lux)', type: 'number' },
            { id: 'avg_illuminance', label: 'Iluminancia Promedio (lux)', type: 'number', computed: true },
            { id: 'meets_minimum', label: '¿Cumple con mínimo (≥300 lux)?', type: 'radio' }
          ]
        }
      ]
    }
  ]
};

export default function DemoPage() {
  const [debugEvents, setDebugEvents] = useState<any[]>([]);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [compliance, setCompliance] = useState<Record<string, number>>({});
  const [offlineStatus, setOfflineStatus] = useState({ online: true, pending: 0 });
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [inspectionId] = useState(`INS-${Date.now()}`);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formEngine = useFormEngine({
    inspectionId,
    schema: DEMO_SCHEMA,
    autoSave: true,
    autoSaveDelay: 2000,
    onSave: () => {
      setLastSaved(new Date().toLocaleTimeString());
      setSyncLog(prev => [...prev.slice(-4), `💾 Saved at ${new Date().toLocaleTimeString()}`]);
    },
    onError: (error) => {
      setSyncLog(prev => [...prev.slice(-4), `❌ Error: ${error}`]);
    }
  });

  useEffect(() => {
    const unsubs = [
      eventBus.subscribe('FIELD_CHANGED', (event) => {
        setDebugEvents(prev => [...prev.slice(-29), {
          type: 'FIELD_CHANGED',
          field: event.metadata?.fieldId,
          value: event.payload,
          time: new Date().toLocaleTimeString()
        }]);
      }),
      eventBus.subscribe('VALIDATION_COMPLETED', () => {
        setDebugEvents(prev => [...prev.slice(-29), {
          type: 'VALIDATION_COMPLETED',
          time: new Date().toLocaleTimeString()
        }]);
      }),
      eventBus.subscribe('AUTOSAVE_COMPLETED', () => {
        setDebugEvents(prev => [...prev.slice(-29), {
          type: 'AUTOSAVE',
          time: new Date().toLocaleTimeString()
        }]);
        setSyncLog(prev => [...prev.slice(-4), `✅ Synced to IndexedDB`]);
      }),
      eventBus.subscribe('OFFLINE_SYNC_COMPLETED', (event: any) => {
        setSyncLog(prev => [...prev.slice(-4), `☁️ Synced to server`]);
      }),
      eventBus.subscribe('FORMULA_RECALCULATED', () => {
        setDebugEvents(prev => [...prev.slice(-29), {
          type: 'FORMULA_RECALCULATED',
          time: new Date().toLocaleTimeString()
        }]);
      }),
      eventBus.subscribe('COMPLIANCE_UPDATED', () => {
        updateCompliance();
      })
    ];

    const updateCompliance = () => {
      const newCompliance: Record<string, number> = {};
      for (const sheet of (DEMO_SCHEMA.sheets || [])) {
        newCompliance[sheet.codigo] = formEngine.getCompliance(sheet.codigo);
      }
      setCompliance(newCompliance);
    };

    const updateOfflineStatus = async () => {
      const status = offlineEngine.getStatus();
      const queueSize = await offlineEngine.getQueueSize();
      setOfflineStatus({ online: status.isOnline, pending: queueSize });
    };

    updateOfflineStatus();
    const interval = setInterval(updateOfflineStatus, 5000);

    return () => {
      unsubs.forEach(u => u());
      clearInterval(interval);
    };
  }, [formEngine]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    formEngine.setValue(fieldId, value);
  }, [formEngine]);

  const getFieldValue = useCallback((fieldId: string) => {
    return formEngine.getValue(fieldId) as any;
  }, [formEngine]);

  const handleGeneratePdf = async () => {
    setSyncLog(prev => [...prev.slice(-4), `📄 Generating PDF...`]);
    
    const answers = (formEngine as any).store?.answers || {};
    const pdf = await pdfEngine.generateReport({
      inspection: {
        inspectionId,
        inspectionCode: inspectionId,
        status: 'draft',
        siteName: answers['site_name'] || 'Demo Site',
        siteAddress: answers['site_address'] || 'Demo Address',
        inspectionDate: answers['inspection_date'] || new Date().toISOString(),
        inspector: { id: 'demo', displayName: 'Demo Inspector', role: 'inspector', email: '', permissions: [] },
        schemaVersion: '1.0.0'
      },
      sheets: [],
      generatedBy: 'Demo User'
    });

    setPdfBlob(pdf);
    setShowPdfPreview(true);
    setSyncLog(prev => [...prev.slice(-4), `✅ PDF generated!`]);
  };

  const handleForceSync = async () => {
    setSyncLog(prev => [...prev.slice(-4), `🔄 Force sync...`]);
    const result = await offlineEngine.forceSync();
    setSyncLog(prev => [...prev.slice(-4), `🔄 Synced: ${result.synced} items`]);
  };

  const renderField = (field: any) => {
    const value = getFieldValue(String(field.id));
    const errors = formEngine.getErrors(String(field.id));

    const baseInputClass = 'w-full px-3 py-2 bg-slate-700 border rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => handleFieldChange(String(field.id), e.target.value)}
            className={`${baseInputClass} ${errors.length > 0 ? 'border-red-500' : 'border-slate-600'}`}
            placeholder={field.label}
          />
        );

      case 'number':
      case 'decimal':
        return (
          <input
            type="number"
            step={field.type === 'decimal' ? '0.01' : '1'}
            value={value as number ?? ''}
            onChange={(e) => handleFieldChange(String(field.id), e.target.value ? (field.type === 'decimal' ? parseFloat(e.target.value) : Number(e.target.value)) : null)}
            className={`${baseInputClass} ${errors.length > 0 ? 'border-red-500' : 'border-slate-600'}`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleFieldChange(String(field.id), e.target.value)}
            className={`${baseInputClass} ${errors.length > 0 ? 'border-red-500' : 'border-slate-600'}`}
          />
        );

      case 'select':
        return (
          <select
            value={value as string || ''}
            onChange={(e) => handleFieldChange(String(field.id), e.target.value)}
            className={`${baseInputClass} ${errors.length > 0 ? 'border-red-500' : 'border-slate-600'}`}
          >
            <option value="">Seleccione...</option>
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );

      case 'radio':
        const options = field.options || [
          { label: 'SI', value: 'SI' },
          { label: 'NO', value: 'NO' }
        ];
        return (
          <div className="flex gap-2">
            {options.map((opt: any) => {
              const isSelected = value === opt.value;
              const bgClass = isSelected
                ? opt.value === 'SI' ? 'bg-green-600 border-green-500'
                  : opt.value === 'NO' ? 'bg-red-600 border-red-500'
                  : 'bg-yellow-600 border-yellow-500'
                : 'bg-slate-700 border-slate-600 hover:bg-slate-600';
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleFieldChange(String(field.id), opt.value)}
                  className={`px-4 py-2 rounded border font-medium text-sm transition-colors ${bgClass}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );

      default:
        return <div className="text-yellow-500 text-sm">Type: {field.type}</div>;
    }
  };

  if (!formEngine.isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Inicializando plataforma...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">🔧 RETIE Platform Demo</h1>
            <p className="text-slate-400 text-sm">Enterprise Inspection Platform • {inspectionId}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded ${offlineStatus.online ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
              <div className={`w-2 h-2 rounded-full ${offlineStatus.online ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs">{offlineStatus.online ? 'Online' : 'Offline'}</span>
              {offlineStatus.pending > 0 && (
                <span className="text-xs text-yellow-400">({offlineStatus.pending} pending)</span>
              )}
            </div>
            <button onClick={handleForceSync} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
              🔄 Sync
            </button>
            <button onClick={handleGeneratePdf} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm">
              📄 PDF
            </button>
            <button
              onClick={() => formEngine.submit()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
            >
              ✅ Submit
            </button>
          </div>
        </div>

        {syncLog.length > 0 && (
          <div className="mb-4 p-2 bg-slate-800 rounded text-xs font-mono text-slate-400">
            {syncLog.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-4 space-y-6">
            {(DEMO_SCHEMA.sheets || []).map((sheet) => (
              <div key={sheet.codigo} className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-400">{sheet.titulo}</h2>
                    <p className="text-xs text-slate-500">{sheet.nombre}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs">
                      <span className="text-slate-500">Cumplimiento: </span>
                      <span className={compliance[sheet.codigo] >= 80 ? 'text-green-400 font-bold' : compliance[sheet.codigo] >= 50 ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
                        {compliance[sheet.codigo]?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <div className="w-24 h-2 bg-slate-700 rounded overflow-hidden">
                      <div 
                        className={`h-full transition-all ${compliance[sheet.codigo] >= 80 ? 'bg-green-500' : compliance[sheet.codigo] >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${compliance[sheet.codigo] || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {sheet.sections?.map((section) => (
                  <div key={section.id} className="mb-5 last:mb-0">
                    <h3 className="text-sm font-medium text-slate-300 mb-3 pb-2 border-b border-slate-700 flex items-center gap-2">
                      <span className="w-6 h-6 bg-slate-700 rounded text-xs flex items-center justify-center">{section.id}</span>
                      {section.titulo}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.fields?.map((field) => (
                        <div key={String(field.id)} className="space-y-1">
                          <label className="block text-xs font-medium text-slate-400 flex items-center gap-1">
                            {field.label}
                            {field.required && <span className="text-red-400">*</span>}
                            {field.computed && <span className="text-blue-400 text-[10px] px-1 bg-blue-900/30 rounded">(calc)</span>}
                          </label>
                          {renderField(field)}
                          {formEngine.getErrors(String(field.id)).length > 0 && (
                            <p className="text-red-400 text-xs">
                              {formEngine.getErrors(String(field.id))[0]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📊 Real-time Events</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto text-xs font-mono">
                {debugEvents.slice(-15).map((evt, idx) => (
                  <div key={idx} className="border-l-2 border-slate-600 pl-2 py-1">
                    <span className="text-blue-400">{evt.type}</span>
                    {evt.field && <span className="text-yellow-400"> [{evt.field}]</span>}
                    <span className="text-slate-600 ml-2">{evt.time}</span>
                  </div>
                ))}
                {debugEvents.length === 0 && <div className="text-slate-500">No events yet...</div>}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📈 Cumplimiento</h3>
              <div className="space-y-3">
                {Object.entries(compliance).map(([code, pct]) => (
                  <div key={code}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{code}</span>
                      <span className={pct >= 80 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded overflow-hidden">
                      <div 
                        className={`h-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">🔧 Platform Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">State:</span>
                  <span className={formEngine.isReady ? 'text-green-400' : 'text-yellow-400'}>
                    {formEngine.isReady ? 'Ready' : 'Loading'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saving:</span>
                  <span className={formEngine.isSaving ? 'text-yellow-400' : 'text-green-400'}>
                    {formEngine.isSaving ? 'Saving...' : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sync:</span>
                  <span className={formEngine.isSyncing ? 'text-yellow-400' : 'text-green-400'}>
                    {formEngine.isSyncing ? 'Syncing...' : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Errors:</span>
                  <span className={formEngine.errors.length > 0 ? 'text-red-400' : 'text-green-400'}>
                    {formEngine.errors.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">💾 Data Flow</h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Schema → ✓ Loaded</div>
                <div>Form → ✓ Initialized</div>
                <div>Events → ✓ Connected</div>
                <div>Offline → ✓ Enabled</div>
                <div>Firebase → ⚠️ Not configured</div>
                <div>PDF → ✓ Ready</div>
              </div>
            </div>
          </div>
        </div>

        {showPdfPreview && pdfBlob && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">PDF Generated!</h3>
                <button onClick={() => setShowPdfPreview(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                PDF blob generated ({Math.round(pdfBlob.size / 1024)} KB). Ready for download or upload.
              </p>
              <button 
                onClick={() => {
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${inspectionId}.pdf`;
                  a.click();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}