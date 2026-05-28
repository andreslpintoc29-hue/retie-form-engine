'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { eventBus } from '@/core/integration/eventBus';
import { RETIE_DISTRIBUCION_SCHEMA } from '@/schemas/retie/distribucion';
import { downloadDistribucionPDF } from '@/utils/pdfGeneratorDistribucion';
import { EvidenceUploader } from '@/components/EvidenceUploader';

const SCHEMA = RETIE_DISTRIBUCION_SCHEMA as any;
const PUNTOS = [
  { id: 'punto_1', label: 'Punto 1' },
  { id: 'punto_2', label: 'Punto 2' },
  { id: 'punto_3', label: 'Punto 3' },
  { id: 'punto_4', label: 'Punto 4' },
  { id: 'punto_5', label: 'Punto 5' },
];

export default function DistribucionPage() {
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_DISTRIBUCION`;
    }
    return 'RETIE-DEMO-2026_DISTRIBUCION';
  });
  const router = useRouter();
  const baseInspectionId = inspectionId.replace(/_(ACPSDEBCI|DISTRIBUCION|DISENO|CARPETA|UFR|UFIYC)$/, '');
  const [activePunto, setActivePunto] = useState(0);
  const [activeSeccion, setActiveSeccion] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [offlineOk, setOfflineOk] = useState(true);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvidencias() {
      if (!baseInspectionId) return;
      try {
        const cached = await offlineEngine.getExpediente(baseInspectionId);
        if (cached?.evidencias) setEvidencias(cached.evidencias);
      } catch (err) { console.error('Error loading evidences Distribucion:', err); }
    }
    loadEvidencias();
  }, [baseInspectionId]);

  const handleSaveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    if (!baseInspectionId) return;
    try {
      const cached = await offlineEngine.getExpediente(baseInspectionId) || {};
      await offlineEngine.saveExpediente(baseInspectionId, { ...cached, evidencias: updated });
    } catch (err) { console.error('Error saving evidences Distribucion:', err); }
  };

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 800,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (e: any) => console.error(e),
  });

  const handlePdf = () => {
    const answers = (formEngine as any).store?.answers || formEngine.answers || {};
    downloadDistribucionPDF({
      schema: SCHEMA,
      answers
    });
  };

  const handleLimpiar = async () => {
    if (confirm('¿Está seguro de que desea limpiar todos los campos de este módulo? Esta acción no se puede deshacer.')) {
      const store = (formEngine as any).store;
      if (store) {
        store.resetInspection?.();
      }
      setLastSaved(null);
    }
  };

  const handleFinalizar = async () => {
    try {
      await (formEngine as any).save?.();
    } catch (e) {}
    alert('Distribución finalizada correctamente.');
    setShowFinalizar(false);
    router.push(`/expediente?id=${baseInspectionId}`);
  };

  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () =>
      setLastSaved(new Date().toLocaleTimeString())
    );
    return unsub;
  }, []);

  useEffect(() => {
    offlineEngine.getStatus && setOfflineOk(offlineEngine.getStatus().isOnline ?? true);
  }, []);

  const punto = PUNTOS[activePunto];
  const secciones = SCHEMA.secciones || [];
  const seccionActual = secciones[activeSeccion] || secciones[0];

  const fieldId = useCallback(
    (preguntaId: string, tipo: 'visita_1' | 'cierre') =>
      `${preguntaId}__${punto.id}__${tipo}`,
    [punto]
  );

  const getValue = useCallback(
    (id: string) => formEngine.getValue(id) as any,
    [formEngine]
  );

  const setValue = useCallback(
    (id: string, value: any) => formEngine.setValue(id, value),
    [formEngine]
  );

  const totalQuestions = useMemo(() => {
    let count = 0;
    secciones.forEach((s: any) =>
      s.preguntas?.forEach((p: any) => { if (p.id !== 'DIST-OBS') count++; })
    );
    return count * PUNTOS.length;
  }, [secciones]);

  const answeredQuestions = useMemo(() => {
    let count = 0;
    secciones.forEach((s: any) =>
      s.preguntas?.forEach((p: any) => {
        if (p.id === 'DIST-OBS') return;
        PUNTOS.forEach((pt) => {
          if (getValue(`${p.id}__${pt.id}__visita_1`)) count++;
        });
      })
    );
    return count;
  }, [secciones, getValue]);

  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const RadioGroup = ({ fieldKey, opciones }: { fieldKey: string; opciones: string[] }) => {
    const val = getValue(fieldKey);
    return (
      <div className="flex gap-1">
        {opciones.map((opt) => {
          const isSelected = val === opt;
          const color =
            opt === 'SI' ? (isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600 text-slate-400 hover:border-emerald-700') :
            opt === 'NO' ? (isSelected ? 'bg-red-600 border-red-500 text-white' : 'border-slate-600 text-slate-400 hover:border-red-700') :
            isSelected ? 'bg-amber-600 border-amber-500 text-white' : 'border-slate-600 text-slate-400 hover:border-amber-700';
          return (
            <button
              key={opt}
              onClick={() => setValue(fieldKey, isSelected ? null : opt)}
              className={`px-2 py-1 text-xs font-bold rounded border transition-all ${color}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const renderDistanciasEspeciales = (pregunta: any) => (
    <div className="mt-3 bg-slate-900/60 border border-purple-800/40 rounded-xl p-4">
      <p className="text-xs font-semibold text-purple-300 mb-3">📏 Distancias medidas en campo (metros):</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {pregunta.campos_distancia?.map((campo: any) => (
          <div key={campo.id}>
            <label className="block text-[10px] text-slate-400 mb-1">{campo.label}</label>
            <p className="text-[10px] text-slate-500 mb-1">{campo.descripcion}</p>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={getValue(`${pregunta.id}__${punto.id}__${campo.id}`) ?? ''}
              onChange={(e) => setValue(`${pregunta.id}__${punto.id}__${campo.id}`, e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-500 mb-2">📐 Diagramas de referencia RETIE:</p>
      <div className="grid grid-cols-3 gap-2">
        {pregunta.recursos_visuales?.map((rv: any) => (
          <div key={rv.id} className="bg-slate-800/80 border border-slate-700 rounded-lg p-2 flex flex-col items-center gap-1">
            <span className="text-2xl">📷</span>
            <span className="text-[10px] text-slate-400 text-center">{rv.descripcion}</span>
            <span className="text-[9px] text-slate-600">{rv.file}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfundidadEspecial = (pregunta: any) => (
    <div className="mt-3 bg-slate-900/60 border border-blue-800/40 rounded-xl p-4 space-y-4">
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
        <label className="block text-xs font-semibold text-blue-300 mb-1">
          📏 Profundidad medida en campo (m) para {punto.label}:
        </label>
        <p className="text-[10px] text-slate-500 mb-2">Ingrese el valor registrado físicamente para esta estructura/punto.</p>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          value={getValue(`DIST-047__${punto.id}__profundidad_medida`) ?? ''}
          onChange={(e) => setValue(`DIST-047__${punto.id}__profundidad_medida`, e.target.value ? parseFloat(e.target.value) : null)}
          className="w-full max-w-[200px] bg-slate-900 border border-slate-600 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <p className="text-xs font-semibold text-blue-300 mb-3">📋 Tabla RETIE — Profundidades mínimas de enterramiento:</p>
        <div className="overflow-x-auto mb-3">
          <table className="min-w-full text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-800">
                <th className="px-3 py-2 border border-slate-700 text-left">Tipo de circuito / Ubicación</th>
                <th className="px-3 py-2 border border-slate-700 text-center">Profundidad mínima (m)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Baja tensión bajo aceras, patios y zonas similares', '0.50'],
                ['Baja tensión bajo vías vehiculares', '0.70'],
                ['Media tensión bajo aceras, patios y zonas similares', '0.80'],
                ['Media tensión bajo vías vehiculares', '1.00'],
                ['Alta tensión bajo aceras, patios y zonas similares', '1.00'],
                ['Alta tensión bajo vías vehiculares', '1.20'],
              ].map(([desc, val], i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-800/40'}>
                  <td className="px-3 py-1.5 border border-slate-700">{desc}</td>
                  <td className="px-3 py-1.5 border border-slate-700 text-center font-mono text-blue-300">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pregunta.recursos_visuales?.map((rv: any) => (
        <div key={rv.id} className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 flex items-center gap-3">
          <span className="text-3xl">📷</span>
          <div>
            <p className="text-xs text-slate-300">{rv.descripcion}</p>
            <p className="text-[10px] text-slate-500">{rv.file}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (!formEngine.isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Cargando formulario de Distribución...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/95 border-b border-slate-700 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/expediente?id=${baseInspectionId}`} className="text-slate-400 hover:text-white transition-colors text-xl">←</Link>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">⚡ LISTA DE CHEQUEO DISTRIBUCIÓN</h1>
              <p className="text-[10px] text-slate-400">F-GI-11 · v2 · 01/08/2018 · RETIE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 bg-slate-700 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-purple-300 font-mono mr-2">{progress}%</span>
            </div>
            <button onClick={handlePdf} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold transition-colors border border-purple-500">📄 PDF</button>
            <button onClick={handleLimpiar} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold transition-colors border border-slate-600">Limpiar</button>
            <button onClick={() => setShowFinalizar(true)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors">✅ Finalizar</button>
            <span className={`w-2 h-2 rounded-full ${offlineOk ? 'bg-green-400' : 'bg-orange-400'}`} title={offlineOk ? 'Online' : 'Offline'} />
            {lastSaved && <span className="text-[10px] text-slate-500 font-mono">💾 {lastSaved}</span>}
          </div>
        </div>
      </header>

      {showFinalizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Finalizar Distribución</h3>
            <p className="text-sm text-slate-400 mb-6">¿Estás seguro de que deseas finalizar este módulo? Se guardarán todas las respuestas.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowFinalizar(false)} className="flex-1 py-2 bg-slate-700 rounded text-xs font-bold">Cancelar</button>
              <button onClick={handleFinalizar} className="flex-1 py-2 bg-green-600 rounded text-xs font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Contexto */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">📋 Datos de la Inspección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SCHEMA.campos_contexto?.map((campo: any) => (
              <div key={campo.id}>
                <label className="block text-[10px] text-slate-400 mb-1">{campo.label}</label>
                <input
                  type={campo.tipo === 'date' ? 'date' : 'text'}
                  value={getValue(campo.id) ?? ''}
                  onChange={(e) => setValue(campo.id, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Selector de Punto */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">🏗️ Punto / Estructura de Evaluación</h2>
          <div className="flex flex-wrap gap-2">
            {PUNTOS.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActivePunto(i)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  activePunto === i
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-purple-600 hover:text-purple-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Las respuestas de cada punto se guardan de forma independiente</p>
        </section>

        {/* Navegación de secciones */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {secciones.map((sec: any, i: number) => (
            <button
              key={sec.id}
              onClick={() => setActiveSeccion(i)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeSeccion === i
                  ? 'bg-purple-700 border-purple-600 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-700 hover:text-purple-300'
              }`}
            >
              {sec.titulo}
            </button>
          ))}
        </div>

        {/* Preguntas de la sección activa */}
        {seccionActual && (
          <section className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900/50 to-slate-800 px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-purple-200">{seccionActual.titulo}</h3>
              {seccionActual.imagen_seccion && (
                <div className="mt-2 flex items-center gap-2 bg-slate-900/40 rounded-lg p-2">
                  <span className="text-xl">📷</span>
                  <span className="text-[10px] text-slate-400">{seccionActual.imagen_seccion.descripcion} · {seccionActual.imagen_seccion.file}</span>
                </div>
              )}
            </div>

            {/* Cabecera tabla */}
            {seccionActual.id !== 'OBSERVACIONES' && (
              <div className="grid grid-cols-[1fr_auto] px-5 py-2 bg-slate-900/50 border-b border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Pregunta / Norma</span>
                <div className="flex gap-6 pr-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider w-28 text-center">Visita 1</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider w-20 text-center">Cierre</span>
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-700/50">
              {seccionActual.preguntas?.map((pregunta: any) => {
                if (pregunta.id === 'DIST-OBS') {
                  return (
                    <div key={pregunta.id} className="p-5">
                      <label className="block text-xs text-slate-300 mb-2 font-semibold">{pregunta.texto}</label>
                      <textarea
                        rows={4}
                        value={getValue('DIST-OBS') ?? ''}
                        onChange={(e) => setValue('DIST-OBS', e.target.value)}
                        placeholder="Anote aquí observaciones generales de la inspección de distribución..."
                        className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  );
                }

                const v1Key = fieldId(pregunta.id, 'visita_1');
                const cKey = fieldId(pregunta.id, 'cierre');
                const v1Val = getValue(v1Key);
                const isNO = v1Val === 'NO';

                return (
                  <div key={pregunta.id} className={`px-5 py-3 transition-colors ${isNO ? 'bg-red-950/20' : ''}`}>
                    <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
                      <div>
                        <div className="flex items-start gap-2">
                          {pregunta.numero && (
                            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded text-[9px] font-mono">{pregunta.numero}</span>
                          )}
                          <div>
                            <p className="text-sm text-slate-200 leading-snug">{pregunta.texto}</p>
                            {pregunta.norma && (
                              <span className="text-[10px] text-slate-500 mt-0.5 block">Norma: {pregunta.norma}</span>
                            )}
                            {isNO && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-red-400 mt-1">
                                ⚠️ No Conformidad — registrar observación
                              </span>
                            )}
                          </div>
                        </div>

                        {pregunta.tipo_especial === 'distancias_seguridad' && renderDistanciasEspeciales(pregunta)}
                        {pregunta.tipo_especial === 'profundidad_enterramiento' && renderProfundidadEspecial(pregunta)}

                        {isNO && (
                          <textarea
                            rows={2}
                            placeholder="Observación de no conformidad..."
                            value={getValue(`${v1Key}__obs`) ?? ''}
                            onChange={(e) => setValue(`${v1Key}__obs`, e.target.value)}
                            className="mt-2 w-full bg-red-950/20 border border-red-800/40 text-red-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-600 resize-none"
                          />
                        )}
                      </div>

                      <div className="flex gap-4 items-center pt-1">
                        <div className="w-28 flex flex-col items-center gap-1">
                          <RadioGroup fieldKey={v1Key} opciones={['SI', 'NO', 'N.A']} />
                        </div>
                        <div className="w-20 flex flex-col items-center gap-1">
                          <RadioGroup fieldKey={cKey} opciones={['SI', 'NO']} />
                        </div>
                      </div>
                    </div>
                    <EvidenceUploader
                      inspectionId={baseInspectionId}
                      formId="DISTRIBUCION"
                      questionId={pregunta.id}
                      caption={pregunta.texto}
                      evidencias={evidencias}
                      onSaveEvidencias={handleSaveEvidencias}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Firmas */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-4">✍️ Firmas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'firma_inspector', label: 'Inspector' },
              { id: 'firma_director', label: 'Director Técnico' },
            ].map((f) => (
              <div key={f.id}>
                <label className="block text-[10px] text-slate-400 mb-1">{f.label}</label>
                <input
                  type="text"
                  value={getValue(f.id) ?? ''}
                  onChange={(e) => setValue(f.id, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre completo"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Resumen de progreso */}
        <section className="bg-gradient-to-br from-purple-950/40 to-slate-800 border border-purple-800/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-purple-200">📊 Progreso Global (todos los puntos)</h3>
            <span className="text-lg font-bold text-purple-300">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-purple-600 to-violet-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{answeredQuestions} de {totalQuestions} evaluaciones registradas</p>
        </section>
      </main>
    </div>
  );
}
