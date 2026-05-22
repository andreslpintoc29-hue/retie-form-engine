// ============================================
// PRODUCTO PAGE - Normalizado con PDF, Evidencias, Finalizar
// ============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { pdfEngine } from '@/engines/pdf/pdfEngine';
import { RETIE_PRODUCTO_SCHEMA } from '@/schemas/retie/producto';
import { downloadProductoPDF } from '@/utils/pdfGeneratorProducto';

export default function ProductoPage() {
  const router = useRouter();
  const [inspectionId, setInspectionId] = useState('DEMO-LOCAL_PRODUCTO');
  const [evidencias, setEvidencias] = useState<any[]>([]);
  const evidenciasRef = useRef<any[]>([]);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [showLimpiar, setShowLimpiar] = useState(false);

  const handleLimpiar = async () => {
    const baseId = inspectionId.replace('_PRODUCTO', '');
    const draftKey = `draft_${inspectionId}`;
    
    // Limpiar evidencias del producto
    const cached = await offlineEngine.getExpediente(baseId) || {};
    const filteredEvidencias = (cached.evidencias || []).filter((e: any) => e.formId !== 'PRODUCTO');
    await offlineEngine.saveExpediente(baseId, { ...cached, evidencias: filteredEvidencias });
    
    // Limpiar estado local
    setEvidencias(filteredEvidencias);
    
    // Limpiar answers en el store
    const store = (form as any).store;
    if (store) {
      const currentAnswers = store.answers || {};
      const cleanedAnswers: Record<string, unknown> = {};
      Object.keys(currentAnswers).forEach(key => {
        if (!key.startsWith('P')) {
          cleanedAnswers[key] = currentAnswers[key];
        }
      });
      store.setAnswers?.(cleanedAnswers);
      store.resetInspection?.();
    }
    
    setLastSaved(null);
    setShowLimpiar(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'TEST-2026';
      setInspectionId(`${id}_PRODUCTO`);
    }
  }, []);

  useEffect(() => {
    evidenciasRef.current = evidencias;
  }, [evidencias]);

  useEffect(() => {
    async function loadEvidencias() {
      if (!inspectionId) return;
      const baseId = inspectionId.replace('_PRODUCTO', '');
      const cached = await offlineEngine.getExpediente(baseId);
      if (cached && cached.evidencias) {
        setEvidencias(cached.evidencias);
      }
    }
    loadEvidencias();
  }, [inspectionId]);

  const saveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    evidenciasRef.current = updated;
    const baseId = inspectionId.replace('_PRODUCTO', '');
    const cached = await offlineEngine.getExpediente(baseId) || {};
    await offlineEngine.saveExpediente(baseId, { ...cached, evidencias: updated });
  };

  const form = useFormEngine({
    inspectionId: inspectionId || 'PENDING',
    schema: RETIE_PRODUCTO_SCHEMA as any,
    autoSave: true,
    autoSaveDelay: 1000,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (error) => console.error('Save error:', error)
  });

  const handleChange = useCallback((fieldId: string, value: any) => {
    form.setValue(fieldId, value);
  }, [form]);

  const getValue = useCallback((fieldId: string) => {
    return form.getValue(fieldId);
  }, [form]);

  const secciones = RETIE_PRODUCTO_SCHEMA.secciones || [];
  const currentSeccion = secciones[0];
  const preguntas = currentSeccion?.preguntas || [];

  const answeredCount = Object.keys(form.answers || {}).filter(k => !k.endsWith('_obs')).length;
  const totalProgress = preguntas.length > 0 ? Math.round((answeredCount / preguntas.length) * 100) : 0;

  const handlePdf = async () => {
    const answers = (form as any).store?.answers || form.answers || {};
    const productoEvidences = evidencias.filter(e => e.formId === 'PRODUCTO');
    
    downloadProductoPDF({
      schema: RETIE_PRODUCTO_SCHEMA,
      answers,
      photoEvidence: productoEvidences
    });
  };

  const handleFinalizar = async () => {
    await form.save?.();
    const baseId = inspectionId.replace('_PRODUCTO', '');
    router.push(`/expediente?id=${baseId}`);
  };

  const handleBack = () => {
    const baseId = inspectionId.replace('_PRODUCTO', '');
    router.push(`/expediente?id=${baseId}`);
  };

  if (!form.isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Inicializando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-400">
              {RETIE_PRODUCTO_SCHEMA.titulo}
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${totalProgress}%` }} />
              </div>
              <span className="text-xs text-slate-400">{totalProgress}%</span>
              <span className="text-xs text-slate-500">{lastSaved ? `💾 ${lastSaved}` : '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={handleBack} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm">
              ← Expediente
            </button>
            <button onClick={handlePdf} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium">
              📄 PDF
            </button>
            <button onClick={() => setShowLimpiar(true)} className="px-4 py-1.5 bg-red-700 hover:bg-red-800 rounded text-sm font-medium">
              🗑️ Limpiar Módulo
            </button>
            <button onClick={() => setShowFinalizar(true)} className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm font-medium">
              ✅ Finalizar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="space-y-4">
          {preguntas.map((pregunta: any) => {
            const value = getValue(pregunta.id);
            const isAnswered = value !== undefined && value !== null && value !== '';
            const pregEvidencias = evidencias.filter(e => e.formId === 'PRODUCTO' && e.questionId === pregunta.id);

            return (
              <div 
                key={pregunta.id}
                className={`p-4 bg-slate-800 rounded-lg border ${
                  isAnswered 
                    ? (value === 'SI' ? 'border-green-500/50' : 'border-red-500/50') 
                    : 'border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded mr-2 text-xs font-mono">
                      {pregunta.numero}
                    </span>
                    <span className="text-sm text-slate-200">
                      {pregunta.pregunta}
                    </span>
                  </div>
                  {isAnswered && (
                    <span className={`text-xl ${value === 'SI' ? 'text-green-400' : 'text-red-400'}`}>✓</span>
                  )}
                </div>

                {/* Opciones SI/NO */}
                <div className="mt-3 flex gap-2">
                  {['SI', 'NO'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleChange(pregunta.id, opt)}
                      className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg border transition-colors ${
                        value === opt 
                          ? (opt === 'SI' ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white')
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Observación */}
                <textarea
                  placeholder="Observaciones..."
                  className="mt-2 w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-slate-300 resize-none"
                  rows={1}
                  value={String(getValue(`${pregunta.id}_obs`) || '')}
                  onChange={(e) => handleChange(`${pregunta.id}_obs`, e.target.value)}
                />

                {/* Evidencias */}
                <div className="mt-3 space-y-2 border-t border-slate-700/50 pt-2">
                  <label className="block text-xs font-semibold text-slate-400">📸 Evidencias:</label>
                  
                  {pregEvidencias.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {pregEvidencias.map((ev: any) => (
                        <div key={ev.id} className="relative bg-slate-900 p-2 rounded border border-slate-700">
                          <img src={ev.dataUrl || ev.foto} alt={ev.fileName} className="w-full h-20 object-cover rounded" />
                          <div className="text-[10px] text-slate-400 mt-1 truncate">{ev.fileName}</div>
                          <button 
                            onClick={async () => {
                              const filtered = evidencias.filter(e => e.id !== ev.id);
                              await saveEvidencias(filtered);
                            }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        const newEv = {
                          id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          inspectionId: inspectionId.replace('_PRODUCTO', ''),
                          formId: 'PRODUCTO',
                          questionId: pregunta.id,
                          fileName: file.name,
                          mimeType: file.type,
                          dataUrl,
                          foto: dataUrl,
                          caption: `Evidencia ${pregunta.numero}`,
                          createdAt: new Date().toISOString()
                        };
                        setEvidencias(prev => {
                          const updated = [...prev, newEv];
                          const baseId = inspectionId.replace('_PRODUCTO', '');
                          (async () => {
                            const cached = await offlineEngine.getExpediente(baseId) || {};
                            await offlineEngine.saveExpediente(baseId, { ...cached, evidencias: updated });
                          })();
                          return updated;
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen */}
        <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">📊 Resumen</h3>
          <div className="flex gap-6 text-xs text-slate-400">
            <span>Respuestas: {answeredCount}/{preguntas.length}</span>
            <span>Guardadas: {Object.keys(form.answers || {}).length}</span>
            <span>Evidencias: {evidencias.filter(e => e.formId === 'PRODUCTO').length}</span>
            <span>isReady: {form.isReady ? 'TRUE' : 'FALSE'}</span>
          </div>
        </div>
      </div>

{/* Modal Finalizar */}
      {showFinalizar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-2">¿Finalizar módulo PRODUCTO?</h3>
            <p className="text-sm text-slate-400 mb-4">
              Se guardarán todas las respuestas y se volverá al expediente. Los datos se conservarán.
            </p>
            <div className="flex gap-3">
              <button onClick={handleFinalizar} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium">
                ✅ Sí, Finalizar
              </button>
              <button onClick={() => setShowFinalizar(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Limpiar */}
      {showLimpiar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-red-700">
            <h3 className="text-lg font-bold text-red-400 mb-2">🗑️ Limpiar Módulo</h3>
            <p className="text-sm text-slate-400 mb-4">
              Se borrarán todas las respuestas y evidencias del módulo PRODUCTO. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={handleLimpiar} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium">
                🗑️ Sí, Limpiar Todo
              </button>
              <button onClick={() => setShowLimpiar(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview */}
      {showPdfPreview && pdfBlob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">📄 PDF Generado</h3>
            <p className="text-sm text-slate-400 mb-4">
              {Object.keys(form.answers || {}).length} respuestas | {evidencias.filter(e => e.formId === 'PRODUCTO').length} evidencias
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${inspectionId}.pdf`;
                  a.click();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Descargar
              </button>
              <button onClick={() => setShowPdfPreview(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}