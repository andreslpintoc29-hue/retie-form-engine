"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { RETIE_R_SPT_SCHEMA } from '@/schemas/retie/rSpt';
import { DynamicTableRenderer } from '@/components/DynamicTableRenderer';
import { downloadRSptPDF } from '@/utils/pdfGeneratorRSpt';

const SCHEMA = RETIE_R_SPT_SCHEMA as any;

export default function RSptPage() {
  const router = useRouter();
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_R_SPT`;
    }
    return 'RETIE-DEMO-2026_R_SPT';
  });
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [offlineStatus, setOfflineStatus] = useState({ online: true, pending: 0, lastSync: '' });

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 1000,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (error: any) => console.error('Save error:', error)
  });

  const { isReady, getValue, setValue } = formEngine;

  // Offline status
  useEffect(() => {
    const update = async () => {
      const status = offlineEngine.getStatus();
      const queueSize = await offlineEngine.getQueueSize();
      setOfflineStatus({ 
        online: status.isOnline, 
        pending: queueSize,
        lastSync: localStorage.getItem('lastSyncAt') || ''
      });
    };
    update();
    const interval = setInterval(update, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save event
  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () => {
      setLastSaved(new Date().toLocaleTimeString());
    });
    return unsub;
  }, []);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setValue(fieldId, value);
  }, [setValue]);

  const getFieldValue = useCallback((fieldId: string) => {
    return getValue(fieldId) as any;
  }, [getValue]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Inicializando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const baseId = inspectionId.replace('_R_SPT', '');
                  router.push(`/expediente?id=${baseId}`);
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all"
              >
                ← Regresar
              </button>
              <span className="text-slate-650">|</span>
              <h1 className="text-xl font-bold text-blue-400">⚡ {SCHEMA.titulo}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400">
                {lastSaved ? `💾 ${lastSaved}` : '—'}
              </div>
              <button
                onClick={() => {
                  downloadRSptPDF({
                    schema: SCHEMA,
                    answers: formEngine.getAnswers()
                  });
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors text-white flex items-center gap-2"
              >
                📄 Descargar PDF
              </button>
              <button
                onClick={async () => {
                  await formEngine.save();
                  const baseId = inspectionId.replace('_R_SPT', '');
                  router.push(`/expediente?id=${baseId}`);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors text-white"
              >
                ✅ Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Context Fields */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2">Información de Inspección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SCHEMA.campos_contexto.map((campo: any) => (
              <div key={campo.id} className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-300">
                  {campo.label}
                </label>
                <input
                  type={campo.tipo === 'date_or_text' ? 'text' : campo.tipo}
                  value={getFieldValue(campo.id) ?? campo.valor_excel ?? ''}
                  onChange={(e) => handleFieldChange(campo.id, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Render sections */}
        {SCHEMA.secciones.map((sec: any, sIdx: number) => {
          
          if (sec.tipo === 'informativo_con_imagen') {
            return (
              <div key={sIdx} className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4">
                  <h3 className="font-bold text-blue-400 text-lg">{sec.titulo}</h3>
                  {sec.campos?.map((campo: any) => (
                    <div key={campo.id} className="bg-slate-900/40 rounded-lg p-3 border border-slate-700 shadow-sm">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        <span className="font-bold text-blue-500 mr-2">{campo.label}:</span>
                        {campo.valor_excel}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-950 rounded-xl border border-slate-700 shadow-lg min-h-[280px] w-full">
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">💡 Diagrama del Método de Caída de Potencial (61.8%)</span>
                  <svg width="100%" height="180" viewBox="0 0 500 180" className="max-w-[420px] text-slate-350">
                    {/* Ground Level */}
                    <line x1="20" y1="120" x2="480" y2="120" stroke="#475569" strokeWidth="3" />
                    
                    {/* Earth hatchings */}
                    <path d="M 40,120 L 30,130 M 120,120 L 110,130 M 200,120 L 190,130 M 280,120 L 270,130 M 360,120 L 350,130 M 440,120 L 430,130" stroke="#334155" strokeWidth="1.5" />
                    
                    {/* Instrument Box (Telurómetro) */}
                    <rect x="200" y="20" width="100" height="50" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                    <text x="250" y="42" fill="#60a5fa" fontSize="10" fontWeight="bold" textAnchor="middle">TELURÓMETRO</text>
                    <circle cx="225" cy="55" r="3" fill="#ef4444" />
                    <circle cx="250" cy="55" r="3" fill="#eab308" />
                    <circle cx="275" cy="55" r="3" fill="#22c55e" />
                    
                    {/* Electrode SPT */}
                    <line x1="80" y1="100" x2="80" y2="150" stroke="#f59e0b" strokeWidth="4" />
                    <line x1="72" y1="100" x2="88" y2="100" stroke="#f59e0b" strokeWidth="2" />
                    <text x="80" y="165" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">SPT (Bajo Prueba)</text>
                    
                    {/* Electrode P */}
                    <line x1="290" y1="110" x2="290" y2="145" stroke="#a855f7" strokeWidth="3" />
                    <line x1="284" y1="110" x2="296" y2="110" stroke="#a855f7" strokeWidth="2" />
                    <text x="290" y="160" fill="#c084fc" fontSize="9" fontWeight="bold" textAnchor="middle">Estaca P (Tensión)</text>
                    
                    {/* Electrode C */}
                    <line x1="420" y1="110" x2="420" y2="145" stroke="#ef4444" strokeWidth="3" />
                    <line x1="414" y1="110" x2="426" y2="110" stroke="#ef4444" strokeWidth="2" />
                    <text x="420" y="160" fill="#f87171" fontSize="9" fontWeight="bold" textAnchor="middle">Estaca C (Corriente)</text>
                    
                    {/* Connection Wires */}
                    <path d="M 80,100 L 80,45 L 200,45" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <path d="M 250,70 L 250,90 L 290,90 L 290,110" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                    <path d="M 300,45 L 370,45 L 370,85 L 420,85 L 420,110" fill="none" stroke="#ef4444" strokeWidth="1.5" />
                    
                    {/* Distances indicators */}
                    <line x1="80" y1="135" x2="290" y2="135" stroke="#c084fc" strokeWidth="1" />
                    <polygon points="80,135 85,132 85,138" fill="#c084fc" />
                    <polygon points="290,135 285,132 285,138" fill="#c084fc" />
                    <text x="185" y="147" fill="#c084fc" fontSize="9" fontWeight="semibold" textAnchor="middle">x = 61.8% · d</text>
                    
                    <line x1="80" y1="10" x2="420" y2="10" stroke="#f87171" strokeWidth="1" />
                    <polygon points="80,10 85,7 85,13" fill="#f87171" />
                    <polygon points="420,10 415,7 415,13" fill="#f87171" />
                    <text x="250" y="8" fill="#f87171" fontSize="9" fontWeight="semibold" textAnchor="middle">Distancia d</text>
                  </svg>
                  <p className="text-[10px] text-slate-500 mt-2 text-center max-w-sm">
                    {sec.recursos_visuales?.[0]?.descripcion} ({sec.recursos_visuales?.[0]?.file})
                  </p>
                </div>
              </div>
            );
          }

          if (sec.tipo === 'dynamic-table' || sec.tipo === 'dynamic-table-grouped') {
            return <DynamicTableRenderer key={sIdx} section={sec} formEngine={formEngine} sectionIndex={sIdx} />;
          }

          if (sec.tipo === 'checklist') {
            return (
              <div key={sIdx} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
                <div className="bg-slate-900/50 border-b border-slate-700 p-4">
                  <h3 className="font-bold text-blue-400 text-lg">{sec.titulo}</h3>
                </div>
                <div className="divide-y divide-slate-700">
                  {sec.preguntas?.map((p: any) => {
                    const fieldId = `${sec.titulo.replace(/\s+/g, '_')}_preg_${p.numero}`;
                    const value = getFieldValue(fieldId) ?? p.valor_excel ?? '';
                    
                    return (
                      <div key={p.id} className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-800/30 transition-colors">
                        <div className="flex-1 pr-4">
                          <p className="text-sm font-medium text-slate-350 whitespace-pre-wrap leading-relaxed">
                            <span className="inline-block px-1.5 py-0.5 bg-slate-900 rounded text-blue-400 text-xs font-bold mr-2">{p.numero}</span>
                            {p.pregunta}
                          </p>
                        </div>
                        <div className="flex space-x-1 shrink-0 bg-slate-900 p-1 rounded-lg border border-slate-750">
                          {sec.opciones.map((opcion: string) => (
                            <button
                              key={opcion}
                              onClick={() => handleFieldChange(fieldId, opcion)}
                              className={`
                                px-4 py-2 rounded-md text-xs font-bold transition-all
                                ${value === opcion 
                                  ? (opcion === 'SI' ? 'bg-green-600 text-white shadow-sm' : 
                                     opcion === 'NO' ? 'bg-red-600 text-white shadow-sm' : 
                                     'bg-slate-650 text-white shadow-sm')
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }
                              `}
                            >
                              {opcion}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          if (sec.tipo === 'textarea') {
            const fieldId = `${sec.titulo.replace(/\s+/g, '_')}_${sec.campo.id}`;
            const value = getFieldValue(fieldId) ?? '';
            return (
              <div key={sIdx} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="font-bold text-blue-400 text-lg mb-4">{sec.titulo}</h3>
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                  placeholder="Escriba las observaciones aquí..."
                  className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y"
                />
              </div>
            );
          }

          return null;
        })}

      </div>
    </div>
  );
}
