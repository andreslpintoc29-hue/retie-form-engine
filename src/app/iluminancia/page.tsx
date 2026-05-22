"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { RETIE_ILUMINACION_SCHEMA } from '@/schemas/retie/iluminacion';
import { downloadIluminanciaPDF } from '@/utils/pdfGeneratorIluminancia';
import { DynamicTableRenderer } from '@/components/DynamicTableRenderer';

const SCHEMA = RETIE_ILUMINACION_SCHEMA as any;

export default function IluminanciaPage() {
  const router = useRouter();

  const [inspectionId, setInspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_ILUMINANCIA`;
    }
    return 'RETIE-DEMO-2026_ILUMINANCIA';
  });

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [offlineStatus, setOfflineStatus] = useState({ online: true, pending: 0, lastSync: '' });
  const [activeTab, setActiveTab] = useState(0); // Switches between Página 1, 2, 3, 4 (sections)
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [showLimpiar, setShowLimpiar] = useState(false);

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 1000,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (error: any) => console.error('Save error:', error)
  });

  const { isReady, getValue, setValue } = formEngine;

  // Sync inspection ID dynamically from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      setInspectionId(`${id}_ILUMINANCIA`);
    }
  }, []);

  // Offline status updater
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

  // Sync event listener
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

  // Handlers for premium actions
  const handleBack = () => {
    const baseId = inspectionId.replace('_ILUMINANCIA', '');
    router.push(`/expediente?id=${baseId}`);
  };

  const handlePdf = async () => {
    const answers = formEngine.answers || {};
    await downloadIluminanciaPDF({
      schema: SCHEMA,
      answers
    });
  };

  const handleLimpiar = async () => {
    const store = (formEngine as any).store;
    if (store) {
      const currentAnswers = store.answers || {};
      const cleanedAnswers: Record<string, unknown> = {};
      Object.keys(currentAnswers).forEach(key => {
        // Clear all technical answers starting with section title prefix, keep other metadata
        if (!key.startsWith('Valores_medidos_') && !key.startsWith('obs_iluminancia_') && !key.includes('_context_')) {
          cleanedAnswers[key] = currentAnswers[key];
        }
      });
      store.setAnswers?.(cleanedAnswers);
      store.resetInspection?.();
    }
    setLastSaved(null);
    setShowLimpiar(false);
  };

  const handleFinalizar = async () => {
    await formEngine.save?.();
    const baseId = inspectionId.replace('_ILUMINANCIA', '');
    router.push(`/expediente?id=${baseId}`);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse flex items-center gap-3">
          <span className="text-2xl animate-spin">💡</span>
          Cargando mediciones de iluminancia técnica...
        </div>
      </div>
    );
  }

  const activeSec = SCHEMA.secciones[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Premium sticky header navigation */}
      <div className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 leading-none">
                  {SCHEMA.titulo}
                </h1>
                <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-semibold tracking-wider flex items-center gap-2">
                  <span>Proceso: {SCHEMA.proceso}</span>
                  <span className="text-slate-600">•</span>
                  <span>Código: {SCHEMA.codigo}</span>
                  <span className="text-slate-600">•</span>
                  <span>Versión: {SCHEMA.version}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
              <div className="text-xs text-slate-400 font-mono mr-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${offlineStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                {lastSaved ? `💾 Guardado: ${lastSaved}` : '⏱️ En espera...'}
              </div>
              <button 
                onClick={handleBack} 
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all active:scale-95 border border-slate-700"
              >
                ← Expediente
              </button>
              <button 
                onClick={handlePdf} 
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-purple-900/20"
              >
                📄 PDF
              </button>
              <button 
                onClick={() => setShowLimpiar(true)} 
                className="px-3 py-1.5 bg-red-700 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-red-900/20"
              >
                🗑️ Limpiar Módulo
              </button>
              <button 
                onClick={() => setShowFinalizar(true)} 
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-900/20 active:scale-95"
              >
                ✅ Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        
        {/* Dynamic visual page description card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 rounded-2xl border border-slate-850 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-yellow-500/20">
                Formato F-GI-19 ({SCHEMA.fecha_formato})
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-blue-500/20">
                Multihoja
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Registro General de Mediciones de Iluminancia</h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {SCHEMA.descripcion_tipo_respuesta}
            </p>
          </div>
          
          {/* Header page image mockup metadata indicator */}
          {activeSec.recursos_visuales_hoja?.[0] && (
            <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 group hover:border-slate-700 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                🖼️
              </div>
              <div>
                <p className="font-bold text-slate-300">Cabecera de Página ({activeSec.titulo}):</p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">{activeSec.recursos_visuales_hoja[0].file}</p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Selector representing the 4 spreadsheet sheets */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 border-b border-slate-850 pb-3">
            {SCHEMA.secciones.map((sec: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`
                  px-5 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-wide border flex items-center gap-2
                  ${activeTab === idx 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30 translate-y-[-1px]' 
                    : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }
                `}
              >
                <span>📄</span> {sec.titulo}
              </button>
            ))}
          </div>

          {/* Active sheet body content */}
          <div className="space-y-8 animate-fadeIn" key={activeTab}>
            
            {/* Context Fields Section for the active tab */}
            {activeSec.campos_contexto && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-850 p-6 shadow-lg">
                <h3 className="text-xs font-bold text-blue-400 mb-5 uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> Información de Contexto y Calibración ({activeSec.titulo})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(activeSec.campos_contexto).map(([key, campo]: [string, any]) => {
                    const fieldId = `${activeSec.titulo}_context_${key}`;
                    const val = getFieldValue(fieldId) ?? campo.valor_excel ?? '';
                    return (
                      <div key={key} className="space-y-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {campo.label}
                        </label>
                        <input
                          type={campo.tipo === 'date' ? 'text' : campo.tipo}
                          value={val}
                          onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-700 transition-all font-mono"
                          placeholder={`Ingrese ${campo.label.toLowerCase()}...`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Criterios de Medicion / Metodo & Recursos Visuales */}
            {activeSec.instrucciones && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-850 p-6 shadow-lg flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span>📏</span> Criterios y Métodos de Medición
                  </h3>
                  <div className="bg-slate-950/40 rounded-xl p-5 border border-slate-850 shadow-inner">
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                      {activeSec.instrucciones.texto}
                    </p>
                  </div>
                </div>

                {/* Embedded visuals (luxometer & distribution method diagrams) */}
                {activeSec.instrucciones.recursos_visuales && (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeSec.instrucciones.recursos_visuales.map((img: any) => (
                      <div key={img.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2 py-0.5 bg-slate-900 text-slate-400 rounded text-[9px] font-mono border border-slate-800">
                            {img.rol === 'recurso_visual_equipo_luxometro' ? 'LUXÓMETRO' : 'DISTRIBUCIÓN'}
                          </span>
                          <span className="text-slate-600 text-xs">📷</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-4">
                          {img.descripcion}
                        </p>
                        <div className="px-3 py-2.5 bg-slate-900 rounded-lg border border-slate-850/60 text-[9px] text-slate-500 font-mono text-center truncate group-hover:text-blue-400 transition-colors">
                          🖼️ {img.file}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Render sheet's dynamic measurement values table with title prefix to prevent clashing */}
            {activeSec.tabla_valores_medidos && (
              <div className="space-y-2">
                <DynamicTableRenderer 
                  section={{
                    ...activeSec.tabla_valores_medidos,
                    titulo: `Valores medidos ${activeSec.titulo}`
                  }} 
                  formEngine={formEngine} 
                  sectionIndex={activeTab} 
                />
              </div>
            )}

            {/* Observations textbox per sheet page */}
            {activeSec.observaciones && (
              <div className="bg-slate-900/60 rounded-2xl border border-slate-850 p-6 shadow-lg">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span>📝</span> Observaciones Técnicas ({activeSec.titulo})
                </h3>
                <textarea
                  value={getFieldValue(activeSec.observaciones.campo.id) ?? ''}
                  onChange={(e) => handleFieldChange(activeSec.observaciones.campo.id, e.target.value)}
                  placeholder={`Describa aquí las observaciones observadas en las mediciones de ${activeSec.titulo.toLowerCase()}...`}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-700 transition-all font-medium placeholder-slate-600"
                />
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Modal Finalizar */}
      {showFinalizar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-800 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 text-xl">
              ✅
            </div>
            <h3 className="text-lg font-bold text-white mb-2">¿Finalizar módulo ILUMINANCIA?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Se guardarán todas las mediciones de las 4 hojas y regresará al expediente de inspección.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleFinalizar} 
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 active:scale-95"
              >
                Sí, Finalizar
              </button>
              <button 
                onClick={() => setShowFinalizar(false)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Limpiar */}
      {showLimpiar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-red-500/20 shadow-2xl animate-scaleUp">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4 text-xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-red-400 mb-2">¿Limpiar Mediciones?</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Se borrarán de forma permanente todas las mediciones ingresadas en las 4 pestañas de iluminancia. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleLimpiar} 
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950/40 active:scale-95"
              >
                Sí, Limpiar Módulo
              </button>
              <button 
                onClick={() => setShowLimpiar(false)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
