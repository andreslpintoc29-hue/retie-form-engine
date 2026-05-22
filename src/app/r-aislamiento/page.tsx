"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { RETIE_R_AISLAMIENTO_SCHEMA } from '@/schemas/retie/rAislamiento';
import { downloadRAislamientoPDF } from '@/utils/pdfGeneratorRAislamiento';
import { DynamicTableRenderer } from '@/components/DynamicTableRenderer';

const SCHEMA = RETIE_R_AISLAMIENTO_SCHEMA as any;

export default function RAislamientoPage() {
  const router = useRouter();
  
  const [inspectionId, setInspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_R_AISLAMIENTO`;
    }
    return 'RETIE-DEMO-2026_R_AISLAMIENTO';
  });

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [offlineStatus, setOfflineStatus] = useState({ online: true, pending: 0, lastSync: '' });
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
      setInspectionId(`${id}_R_AISLAMIENTO`);
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
    const baseId = inspectionId.replace('_R_AISLAMIENTO', '');
    router.push(`/expediente?id=${baseId}`);
  };

  const handlePdf = async () => {
    const answers = formEngine.answers || {};
    await downloadRAislamientoPDF({
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
        if (!key.startsWith('Valores_medidos') && !key.startsWith('Observaciones')) {
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
    const baseId = inspectionId.replace('_R_AISLAMIENTO', '');
    router.push(`/expediente?id=${baseId}`);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Cargando formulario de aislamiento...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Top sticky navigation bar */}
      <div className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h1 className="text-base font-bold text-blue-400 leading-none">{SCHEMA.titulo}</h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                  Proceso: {SCHEMA.proceso} | Código: {SCHEMA.codigo} | Ver: {SCHEMA.version}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-slate-400 font-mono mr-2">
                {lastSaved ? `💾 Guardado: ${lastSaved}` : '⏱️ En espera...'}
              </div>
              <button 
                onClick={handleBack} 
                className="px-3 py-1.5 bg-slate-705 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold transition-colors"
              >
                ← Expediente
              </button>
              <button 
                onClick={handlePdf} 
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold transition-colors"
              >
                📄 PDF
              </button>
              <button 
                onClick={() => setShowLimpiar(true)} 
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 rounded text-xs font-semibold transition-colors"
              >
                🗑️ Limpiar Módulo
              </button>
              <button 
                onClick={() => setShowFinalizar(true)} 
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-all shadow-sm"
              >
                ✅ Finalizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Header visual panel */}
        <div className="bg-gradient-to-r from-blue-900/20 via-slate-800 to-slate-800 rounded-xl border border-slate-700 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold mb-2">
              F-GI-18 Version 3
            </span>
            <h2 className="text-xl font-bold text-white">Inspección de Resistencia de Aislamiento</h2>
            <p className="text-xs text-slate-400 mt-0.5">El valor de resistencia de aislamiento debe medirse en todos los conductores activos con respecto a tierra.</p>
          </div>
          <div className="shrink-0 max-w-xs w-full">
            <div className="rounded-lg overflow-hidden border border-slate-700 shadow-lg bg-slate-900">
              <img 
                src={`/${SCHEMA.recursos_visuales_hoja[0].file}`} 
                alt={SCHEMA.recursos_visuales_hoja[0].descripcion} 
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-[9px] text-slate-500 mt-1 text-center font-mono">📷 {SCHEMA.recursos_visuales_hoja[0].file}</p>
          </div>
        </div>

        {/* Context Fields Form */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2 uppercase tracking-wide">
            Información del Servicio e Instrumentación
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCHEMA.campos_contexto.map((campo: any) => (
              <div key={campo.id} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wide">
                  {campo.label}
                </label>
                <input
                  type={campo.id === 'fecha_inspeccion' ? 'text' : campo.tipo}
                  value={getFieldValue(campo.id) ?? campo.valor_excel ?? ''}
                  onChange={(e) => handleFieldChange(campo.id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                  placeholder="Ingrese valor..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* Technical Tables */}
        {SCHEMA.secciones.map((sec: any, sIdx: number) => {
          
          if (sec.tipo === 'dynamic-table') {
            return (
              <div key={sIdx} className="space-y-2">
                <DynamicTableRenderer section={sec} formEngine={formEngine} sectionIndex={sIdx} />
              </div>
            );
          }

          if (sec.tipo === 'informativo_con_imagen') {
            const visualRes = sec.recursos_visuales?.[0];
            return (
              <div key={sIdx} className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col lg:flex-row gap-6 items-center shadow-sm">
                <div className="flex-1 space-y-4">
                  <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wide border-b border-slate-700 pb-2">
                    ⚖️ {sec.titulo}
                  </h3>
                  {sec.campos?.map((campo: any) => (
                    <div key={campo.id} className="bg-slate-900/40 rounded-lg p-4 border border-slate-700 shadow-inner">
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">
                        {campo.valor_excel}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex flex-col justify-center items-center p-5 bg-slate-900 rounded-xl border border-slate-700 shadow-md min-h-[180px] w-full">
                  <span className="text-2xl mb-1">📋</span>
                  <p className="text-slate-350 text-xs font-bold uppercase tracking-wider mb-0.5">
                    Tabla de Criterios de Aceptación
                  </p>
                  <p className="text-slate-500 text-[10px] italic mb-3 text-center px-4">
                    {visualRes?.descripcion}
                  </p>
                  
                  {/* REAL INFOGRAPHIC DISPLAY */}
                  {visualRes?.file && (
                    <div className="w-full max-w-sm rounded-lg overflow-hidden border border-slate-700 bg-slate-800 shadow-inner">
                      <img 
                        src={`/${visualRes.file}`} 
                        alt={visualRes.descripcion} 
                        className="w-full h-auto object-contain" 
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (sec.tipo === 'textarea') {
            const fieldId = `${sec.titulo.replace(/\s+/g, '_')}_${sec.campo.id}`;
            const value = getFieldValue(fieldId) ?? '';
            return (
              <div key={sIdx} className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-sm">
                <h3 className="font-bold text-blue-400 text-sm uppercase tracking-wide mb-3">{sec.titulo}</h3>
                <textarea
                  value={value}
                  onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                  placeholder="Describa aquí las observaciones técnicas observadas en la medición de aislamiento..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-medium placeholder-slate-500"
                />
              </div>
            );
          }

          return null;
        })}

      </div>

      {/* Modal Finalizar */}
      {showFinalizar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">¿Finalizar módulo R.AISLAMIENTO?</h3>
            <p className="text-sm text-slate-400 mb-4">
              Se guardarán todas las respuestas y se volverá al expediente. Los datos se conservarán.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleFinalizar} 
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium"
              >
                ✅ Sí, Finalizar
              </button>
              <button 
                onClick={() => setShowFinalizar(false)} 
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Limpiar */}
      {showLimpiar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-red-750 border-red-700">
            <h3 className="text-lg font-bold text-red-400 mb-2">🗑️ Limpiar Módulo</h3>
            <p className="text-sm text-slate-400 mb-4">
              Se borrarán todas las respuestas del módulo R.AISLAMIENTO. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleLimpiar} 
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
              >
                🗑️ Sí, Limpiar Todo
              </button>
              <button 
                onClick={() => setShowLimpiar(false)} 
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm"
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
