'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { pdfEngine } from '@/engines/pdf/pdfEngine';
import { RETIE_UFR_SCHEMA } from '@/schemas/retie/ufr';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { EvidenceUploader } from '@/components/EvidenceUploader';

const SCHEMA = RETIE_UFR_SCHEMA as any;
const OPCIONES_V1 = ['SI', 'NO', 'N/A'];
const OPCIONES_CIERRE = ['SI', 'NO'];

function normalizeUfrAnswersForPdf(answers: Record<string, any>, schema: any) {
  const normalized: Record<string, any> = { ...answers };

  const mapToOption = (v: any) => {
    if (v === undefined || v === null) return undefined;
    if (typeof v === 'boolean') return v ? 'SI' : 'NO';
    if (typeof v === 'number') return v === 1 ? 'SI' : v === 0 ? 'NO' : String(v);
    const s = String(v).trim();
    if (!s) return undefined;
    const up = s.toUpperCase();
    if (up === 'SI' || up === 'NO' || up === 'N/A') return up;
    if (up === 'YES') return 'SI';
    return s;
  };

  schema.secciones?.forEach((sec: any) => {
    sec.preguntas?.forEach((p: any) => {
      const visitaKey = `${p.id}__visita_1`;
      const cierreKey = `${p.id}__cierre`;
      const obsKey = `${p.id}__visita_1__obs`;

      const visitaValueRaw = answers[visitaKey] ?? answers[`${p.id}_visita_1`] ?? answers[p.id] ?? answers[`${p.id}__v1`];
      const cierreValueRaw = answers[cierreKey] ?? answers[`${p.id}_cierre`];
      const obsValueRaw = answers[obsKey] ?? answers[`${p.id}_obs`] ?? answers[`${p.id}__obs`];

      const visitaValue = mapToOption(visitaValueRaw);
      const cierreValue = mapToOption(cierreValueRaw);
      const obsValue = obsValueRaw !== undefined && obsValueRaw !== null ? String(obsValueRaw) : undefined;

      if (visitaValue !== undefined) {
        normalized[p.id] = visitaValue;
      }
      if (cierreValue !== undefined) {
        normalized[`${p.id}_cierre`] = cierreValue;
      }
      if (obsValue !== undefined) {
        normalized[`${p.id}_obs`] = obsValue;
      }
    });
  });

  return normalized;
}

const COLOR_V1: Record<string, string> = {
  SI: 'bg-emerald-600 border-emerald-500 text-white',
  NO: 'bg-red-600 border-red-500 text-white',
  'N/A': 'bg-amber-600 border-amber-500 text-white',
};
const COLOR_CIERRE: Record<string, string> = {
  SI: 'bg-emerald-600 border-emerald-500 text-white',
  NO: 'bg-red-600 border-red-500 text-white',
};

export default function UfrPage() {
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_UFR`;
    }
    return 'RETIE-DEMO-2026_UFR';
  });
  const router = useRouter();
  const baseInspectionId = inspectionId.replace(/_(ACPSDEBCI|DISTRIBUCION|DISENO|CARPETA|UFR|UFIYC)$/, '');
  const [activeSeccion, setActiveSeccion] = useState(0);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvidencias() {
      if (!baseInspectionId) return;
      try {
        const cached = await offlineEngine.getExpediente(baseInspectionId);
        if (cached?.evidencias) setEvidencias(cached.evidencias);
      } catch (err) { console.error('Error loading evidences UFR:', err); }
    }
    loadEvidencias();
  }, [baseInspectionId]);

  const handleSaveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    if (!baseInspectionId) return;
    try {
      const cached = await offlineEngine.getExpediente(baseInspectionId) || {};
      await offlineEngine.saveExpediente(baseInspectionId, { ...cached, evidencias: updated });
    } catch (err) { console.error('Error saving evidences UFR:', err); }
  };

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 800,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (e: any) => console.error(e),
  });

  useEffect(() => {
    if (!formEngine.isReady) return;
    SCHEMA.campos_contexto?.forEach((c: any) => {
      if (!formEngine.getValue(c.id) && c.valor_excel) formEngine.setValue(c.id, c.valor_excel);
    });
  }, [formEngine.isReady]); // eslint-disable-line

  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () =>
      setLastSaved(new Date().toLocaleTimeString())
    );
    return unsub;
  }, []);

  const getValue = useCallback((id: string) => formEngine.getValue(id) as any, [formEngine]);
  const setValue = useCallback((id: string, v: any) => formEngine.setValue(id, v), [formEngine]);

  const secciones = SCHEMA.secciones || [];
  const seccionActual = secciones[activeSeccion] || secciones[0];

  const totalQ = useMemo(() => secciones.reduce((a: number, s: any) => a + (s.preguntas?.length || 0), 0), [secciones]);
  const answeredQ = useMemo(() => {
    let n = 0;
    secciones.forEach((s: any) => s.preguntas?.forEach((p: any) => { if (getValue(`${p.id}__visita_1`)) n++; }));
    return n;
  }, [secciones, getValue]);
  const progress = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;

  const handleFinalizar = () => {
    setShowFinalizar(true);
  };

  const handleLimpiar = async () => {
    if (window.confirm('¿Estás seguro de limpiar todos los datos? Esta acción no se puede deshacer.')) {
      if ((formEngine as any).store?.resetInspection) {
        (formEngine as any).store.resetInspection();
      }
    }
  };

  const RadioBtn = ({ fieldKey, opt, palette }: { fieldKey: string; opt: string; palette: Record<string, string> }) => {
    const val = getValue(fieldKey);
    const active = val === opt;
    return (
      <button
        onClick={() => setValue(fieldKey, active ? null : opt)}
        className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${active ? palette[opt] : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-400'}`}
      >{opt}</button>
    );
  };

  if (!formEngine.isReady) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="bg-slate-900/95 border-b border-slate-700 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href={`/expediente?id=${baseInspectionId}`} className="text-slate-400 hover:text-white text-xl">←</Link>
            <div>
              <h1 className="text-sm font-bold text-green-300 leading-tight">🏠 LISTA DE CHEQUEO USO FINAL RESIDENCIAL</h1>
              <p className="text-[10px] text-slate-400">F-GI-05 · v2 · {SCHEMA.proceso}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 bg-slate-700 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-green-300 font-mono">{progress}%</span>
            </div>
            {lastSaved && <span className="text-[10px] text-slate-500">💾 {lastSaved}</span>}
            <button
              onClick={async () => {
                const answers = (formEngine as any).store?.answers || {};
                const normalizedAnswers = normalizeUfrAnswersForPdf(answers, SCHEMA);
                const pdf = await pdfEngine.generateReport({
                  mode: 'single-form',
                  targetForm: 'UFR',
                  formUFR: normalizedAnswers,
                  inspection: {
                    inspectionId,
                    inspectionCode: inspectionId,
                    status: 'in_progress',
                    siteName: normalizedAnswers['site_name'] || 'Uso Final Residencial',
                    siteAddress: normalizedAnswers['site_address'] || 'Dirección',
                    inspectionDate: normalizedAnswers['fecha_inspeccion'] || new Date().toISOString(),
                    inspector: { id: 'demo', displayName: 'Inspector', role: 'inspector', email: '', permissions: [] },
                    schemaVersion: '1.0.0'
                  },
                  sheets: [],
                  generatedBy: 'Inspector'
                });
                setPdfBlob(pdf);
                setShowPdfPreview(true);
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold transition-colors"
            >
              📄 PDF
            </button>
            <button onClick={handleLimpiar} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold transition-colors border border-slate-600">Limpiar</button>
            <button onClick={handleFinalizar} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors">✅ Finalizar</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 py-6 space-y-5">

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">📋 Datos de la Inspección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SCHEMA.campos_contexto?.map((c: any) => (
              <div key={c.id}>
                <label className="block text-[10px] text-slate-400 mb-1">{c.label}</label>
                <input
                  type={c.tipo === 'date' ? 'date' : 'text'}
                  value={getValue(c.id) ?? c.valor_excel ?? ''}
                  onChange={(e) => setValue(c.id, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin flex-wrap">
          {secciones.map((sec: any, i: number) => {
            const answered = sec.preguntas?.filter((p: any) => getValue(`${p.id}__visita_1`)).length || 0;
            const total = sec.preguntas?.length || 0;
            return (
              <button key={sec.id} onClick={() => setActiveSeccion(i)}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left ${
                  activeSeccion === i ? 'bg-green-700 border-green-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-green-700 hover:text-green-300'}`}>
                <span className="block">{sec.titulo}</span>
                <span className="text-[9px] opacity-70">{answered}/{total}</span>
              </button>
            );
          })}
        </div>

        {seccionActual && (
          <section className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-950/60 to-slate-800 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-green-200">{seccionActual.titulo}</h3>
              <span className="text-[10px] text-slate-500">{seccionActual.preguntas?.length} preguntas</span>
            </div>
            <div className="grid px-5 py-2 bg-slate-900/50 border-b border-slate-700 text-[10px] text-slate-500 uppercase tracking-wider"
              style={{ gridTemplateColumns: '2rem 1fr 6rem 7rem 5rem' }}>
              <span>#</span><span>Pregunta</span><span className="text-center">Norma</span>
              <span className="text-center">Visita 1</span><span className="text-center">Cierre</span>
            </div>
            <div className="divide-y divide-slate-700/50">
              {seccionActual.preguntas?.map((p: any) => {
                const v1Key = `${p.id}__visita_1`;
                const cKey = `${p.id}__cierre`;
                const isNO = getValue(v1Key) === 'NO';
                return (
                  <div key={p.id} className={`px-5 py-3 transition-colors ${isNO ? 'bg-red-950/20' : 'hover:bg-slate-750'}`}>
                    <div className="grid gap-3 items-start" style={{ gridTemplateColumns: '2rem 1fr 6rem 7rem 5rem' }}>
                      <span className="text-[11px] font-mono text-slate-500 mt-0.5">{p.numero}</span>
                      <div>
                        <p className="text-sm text-slate-200 leading-snug">{p.pregunta}</p>
                        {isNO && (
                          <>
                            <span className="text-[10px] text-red-400 mt-1 block">⚠️ No Conformidad</span>
                            <textarea rows={2} placeholder="Observación..."
                              value={getValue(`${v1Key}__obs`) ?? ''}
                              onChange={(e) => setValue(`${v1Key}__obs`, e.target.value)}
                              className="mt-1.5 w-full bg-red-950/20 border border-red-800/40 text-red-200 text-xs rounded-lg px-2 py-1 focus:outline-none resize-none" />
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 text-center mt-0.5">{p.norma}</span>
                      <div className="flex gap-1 justify-center flex-wrap">
                        {OPCIONES_V1.map(opt => <RadioBtn key={opt} fieldKey={v1Key} opt={opt} palette={COLOR_V1} />)}
                      </div>
                      <div className="flex gap-1 justify-center">
                        {OPCIONES_CIERRE.map(opt => <RadioBtn key={opt} fieldKey={cKey} opt={opt} palette={COLOR_CIERRE} />)}
                      </div>
                    </div>
                    <div className="ml-8">
                      <EvidenceUploader
                        inspectionId={baseInspectionId}
                        formId="UFR"
                        questionId={p.id}
                        caption={p.pregunta}
                        evidencias={evidencias}
                        onSaveEvidencias={handleSaveEvidencias}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-3">📝 Observaciones</h3>
          <textarea rows={4} value={getValue('observaciones') ?? ''}
            onChange={(e) => setValue('observaciones', e.target.value)}
            placeholder="Observaciones generales..."
            className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
        </section>

        <section className="bg-gradient-to-br from-green-950/40 to-slate-800 border border-green-800/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-200">📊 Progreso</h3>
            <span className="text-lg font-bold text-green-300 font-mono">{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-gradient-to-r from-green-600 to-emerald-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">{answeredQ} de {totalQ} preguntas respondidas</p>
        </section>
      </main>
    
      {/* PDF Preview Modal */}
      {showPdfPreview && pdfBlob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-slate-800 p-6 rounded-lg max-w-xl w-full border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">📄 PDF Generado — UFR</h3>
              <button onClick={() => setShowPdfPreview(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-400 mb-4">
              Lista de Chequeo Uso Final Residencial lista para descargar.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${inspectionId}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
              >
                ⬇ Descargar PDF
              </button>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finalizar Modal */}
      {showFinalizar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">¿Finalizar Inspección?</h3>
            <p className="text-slate-300 mb-6">
              Al finalizar, se guardarán todos los datos y la inspección se marcará como completada.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  try {
                    await (formEngine as any).save?.();
                  } catch (e) {}
                  alert('Inspección finalizada correctamente.');
                  setShowFinalizar(false);
                  router.push(`/expediente?id=${baseInspectionId}`);
                }}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
              >
                Confirmar
              </button>
              <button 
                onClick={() => setShowFinalizar(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
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
