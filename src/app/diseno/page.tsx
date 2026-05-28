// ============================================
// HOJA DISEÑO — Revisión Documental de Diseños
// Enhanced UX: sidebar, compliance, NC modal, PDF preview
// ============================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { eventBus } from '@/core/integration/eventBus';
import { RETIE_DISENO_SCHEMA } from '@/schemas/retie/diseno';
import { downloadDisenoPDF } from '@/utils/pdfGeneratorDiseno';
import { EvidenceUploader } from '@/components/EvidenceUploader';

const SCHEMA = RETIE_DISENO_SCHEMA as any;
const OPCIONES_V1: (string)[] = ['SI', 'NO', 'N/A'];
const OPCIONES_CIERRE: (string)[] = ['SI', 'NO'];

const COLOR_V1: Record<string, string> = {
  SI: 'bg-emerald-600 border-emerald-500 text-white',
  NO: 'bg-red-600 border-red-500 text-white',
  'N/A': 'bg-amber-600 border-amber-500 text-white',
};
const COLOR_CIERRE: Record<string, string> = {
  SI: 'bg-emerald-600 border-emerald-500 text-white',
  NO: 'bg-red-600 border-red-500 text-white',
};

interface NCEntry {
  id: string;
  pregunta: string;
  preguntaNumero: number;
  observacion: string;
}

export default function DisenoPage() {
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_DISENO`;
    }
    return 'RETIE-DEMO-2026_DISENO';
  });
  const router = useRouter();
  const baseInspectionId = inspectionId.replace(/_(ACPSDEBCI|DISTRIBUCION|DISENO|CARPETA|UFR|UFIYC)$/, '');
  const [activeSeccion, setActiveSeccion] = useState(0);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [offlineStatus, setOfflineStatus] = useState<{ online: boolean; pending: number }>({ online: true, pending: 0 });
  const [showNCModal, setShowNCModal] = useState(false);
  const [activeNCEntry, setActiveNCEntry] = useState<{ preguntaId: string; pregunta: string; numero: number } | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvidencias() {
      if (!baseInspectionId) return;
      try {
        const cached = await offlineEngine.getExpediente(baseInspectionId);
        if (cached?.evidencias) setEvidencias(cached.evidencias);
      } catch (err) { console.error('Error loading evidences Diseno:', err); }
    }
    loadEvidencias();
  }, [baseInspectionId]);

  const handleSaveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    if (!baseInspectionId) return;
    try {
      const cached = await offlineEngine.getExpediente(baseInspectionId) || {};
      await offlineEngine.saveExpediente(baseInspectionId, { ...cached, evidencias: updated });
    } catch (err) { console.error('Error saving evidences Diseno:', err); }
  };

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 800,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (e: any) => console.error(e),
  });

  // Pre-cargar valores del Excel al iniciar
  useEffect(() => {
    if (!formEngine.isReady) return;
    SCHEMA.campos_contexto?.forEach((c: any) => {
      if (!formEngine.getValue(c.id) && c.valor_excel) {
        formEngine.setValue(c.id, c.valor_excel);
      }
    });
    SCHEMA.secciones?.forEach((sec: any) => {
      sec.preguntas?.forEach((p: any) => {
        const k = `${p.id}__visita_1`;
        if (!formEngine.getValue(k) && p.valor_excel) {
          formEngine.setValue(k, p.valor_excel);
        }
      });
    });
  }, [formEngine.isReady]);

  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () => setLastSaved(new Date().toLocaleTimeString()));
    return unsub;
  }, []);

  // Offline status polling
  useEffect(() => {
    const update = async () => {
      try {
        const status = offlineEngine?.getStatus?.();
        const queueSize = await offlineEngine?.getQueueSize?.();
        if (status) setOfflineStatus({ online: status.isOnline, pending: queueSize || 0 });
      } catch { /* ignore */ }
    };
    update();
    const interval = setInterval(update, 3000);
    return () => clearInterval(interval);
  }, []);

  const getValue = useCallback((id: string) => formEngine.getValue(id) as any, [formEngine]);
  const setValue = useCallback((id: string, v: any) => formEngine.setValue(id, v), [formEngine]);

  const secciones = SCHEMA.secciones || [];
  const seccionActual = secciones[activeSeccion] || secciones[0];

  // ── Progress stats ──────────────────────────────
  const totalQ = useMemo(
    () => secciones.reduce((a: number, s: any) => a + (s.preguntas?.length || 0), 0),
    [secciones]
  );
  const totalConCierre = useMemo(
    () => secciones.reduce((a: number, s: any) => a + (s.preguntas?.length || 0), 0),
    [secciones]
  );
  const answeredV1 = useMemo(() => {
    let n = 0;
    secciones.forEach((s: any) => s.preguntas?.forEach((p: any) => { if (getValue(`${p.id}__visita_1`)) n++; }));
    return n;
  }, [secciones, getValue]);
  const answeredCierre = useMemo(() => {
    let n = 0;
    secciones.forEach((s: any) => s.preguntas?.forEach((p: any) => { if (getValue(`${p.id}__cierre`)) n++; }));
    return n;
  }, [secciones, getValue]);
  const progressV1 = totalQ > 0 ? Math.round((answeredV1 / totalQ) * 100) : 0;
  const progressCierre = totalConCierre > 0 ? Math.round((answeredCierre / totalConCierre) * 100) : 0;
  const overallProgress = totalQ > 0 ? Math.round(((answeredV1 + answeredCierre) / (totalQ * 2)) * 100) : 0;

  // NC list from NO responses
  const ncList: NCEntry[] = useMemo(() => {
    const list: NCEntry[] = [];
    secciones.forEach((sec: any) => {
      sec.preguntas?.forEach((p: any) => {
        if (getValue(`${p.id}__visita_1`) === 'NO') {
          list.push({
            id: p.id,
            pregunta: p.pregunta,
            preguntaNumero: p.numero,
            observacion: getValue(`${p.id}__visita_1__obs`) || '',
          });
        }
      });
    });
    return list;
  }, [secciones, getValue]);

  // ── Compliance Score ──────────────────────────
  const complianceScore = useMemo(() => {
    let score = 0;
    const breakdown = { si: 0, no: 0, na: 0, sinResponder: totalQ };
    secciones.forEach((sec: any) => {
      sec.preguntas?.forEach((p: any) => {
        const v = getValue(`${p.id}__visita_1`);
        if (v === 'SI') { score++; breakdown.si++; breakdown.sinResponder--; }
        else if (v === 'NO') { breakdown.no++; breakdown.sinResponder--; }
        else if (v === 'N/A') { breakdown.na++; breakdown.sinResponder--; }
      });
    });
    const answered = totalQ - breakdown.sinResponder;
    const pct = answered > 0 ? Math.round((score / answered) * 100) : 0;
    let grade: string;
    if (pct >= 90) grade = 'A';
    else if (pct >= 75) grade = 'B';
    else if (pct >= 60) grade = 'C';
    else if (pct >= 40) grade = 'D';
    else grade = 'F';
    return { score, total: answered, pct, grade, breakdown };
  }, [secciones, getValue, totalQ]);

  // Missing closure items
  const missingCierre = useMemo(() => {
    const missing: { id: string; pregunta: string; numero: number }[] = [];
    secciones.forEach((sec: any) => {
      sec.preguntas?.forEach((p: any) => {
        const v1 = getValue(`${p.id}__visita_1`);
        const cierre = getValue(`${p.id}__cierre`);
        if ((v1 === 'SI' || v1 === 'N/A') && !cierre) {
          missing.push({ id: p.id, pregunta: p.pregunta, numero: p.numero });
        }
      });
    });
    return missing;
  }, [secciones, getValue]);

  const handlePdf = () => {
    const answers = (formEngine as any).store?.answers || {};
    downloadDisenoPDF({ schema: SCHEMA, answers });
  };

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

  const handleOpenNCModal = (preguntaId: string, pregunta: string, numero: number) => {
    setActiveNCEntry({ preguntaId, pregunta, numero });
    setShowNCModal(true);
  };

  const handleGeneratePdfPreview = async () => {
    const answers = (formEngine as any).store?.answers || {};
    const blob = await (downloadDisenoPDF as any)({ schema: SCHEMA, answers });
    if (blob) setPdfBlob(blob);
    setShowPdfPreview(true);
  };

  const getGradeBadgeClass = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-600';
      case 'B': return 'bg-blue-600';
      case 'C': return 'bg-yellow-600';
      case 'D': return 'bg-orange-600';
      default: return 'bg-red-600';
    }
  };

  const RadioBtn = ({ fieldKey, opt, palette }: { fieldKey: string; opt: string; palette: Record<string, string> }) => {
    const val = getValue(fieldKey);
    const active = val === opt;
    return (
      <button
        onClick={() => setValue(fieldKey, active ? null : opt)}
        className={`px-2 py-1 text-[11px] font-bold rounded border transition-all ${
          active ? palette[opt] : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-400 active:scale-95'
        }`}
      >
        {opt}
      </button>
    );
  };

  if (!formEngine.isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Cargando revisión de Diseños...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">

      {/* ═══════════════════════════════════════════════ */}
      {/*  TOP BAR — shared patterns Piscinas / Carpeta   */}
      {/* ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-cyan-800/40 backdrop-blur-md shadow-lg shadow-cyan-900/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Row 1: Title + Status + Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href={`/expediente?id=${baseInspectionId}`} className="text-slate-400 hover:text-white text-xl transition-colors">←</Link>
              <div>
                <h1 className="text-base font-bold text-cyan-300 leading-tight">📐 Revisión Documental de Diseños</h1>
                <p className="text-[10px] text-slate-500">{SCHEMA.codigo} · {SCHEMA.proceso} · {inspectionId.replace('_DISENO','')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {/* Offline indicator */}
              <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                offlineStatus.online ? 'bg-emerald-950/50 text-emerald-400' : 'bg-orange-950/50 text-orange-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${offlineStatus.online ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
                {offlineStatus.online ? 'Online' : 'Offline'}
                {offlineStatus.pending > 0 && <span className="text-yellow-400">({offlineStatus.pending}🔄)</span>}
              </div>

              {/* Last saved */}
              {lastSaved && <span className="text-[10px] text-slate-500">💾 {lastSaved}</span>}

              {/* Gradient pill */}
              <div className="hidden sm:block px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-900/60 to-teal-900/60 border border-cyan-700/50">
                <span className="text-cyan-300 font-mono text-xs">{overallProgress}% completo</span>
              </div>

              {/* Action buttons */}
              <button
                onClick={handlePdf}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-semibold transition-all shadow-md border border-indigo-500"
              >
                📄 PDF
              </button>
              <button onClick={handleLimpiar} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all border border-slate-600">Limpiar</button>
              <button onClick={handleFinalizar} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-semibold transition-all shadow-md">✅ Finalizar</button>
            </div>
          </div>

          {/* Row 2: Combined progress bar — Visita 1 + Cierre */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] text-slate-500 w-10 shrink-0">Visita 1</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progressV1}%` }} />
              </div>
              <span className="text-[10px] text-emerald-400 font-mono w-10 text-right">{progressV1}%</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] text-slate-500 w-10 shrink-0">Cierre</span>
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${progressCierre}%` }} />
              </div>
              <span className="text-[10px] text-blue-400 font-mono w-10 text-right">{progressCierre}%</span>
            </div>
            <div className="hidden sm:block px-2.5 py-0.5 rounded bg-red-950/40 border border-red-800/40 text-[10px] text-red-400 font-mono">
              {ncList.length} NC
            </div>
          </div>
        </div>

        {/* Sheet Navigation Tabs */}
        <div className="border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
            {secciones.map((sec: any, i: number) => {
              const answered = sec.preguntas?.filter((p: any) => getValue(`${p.id}__visita_1`)).length || 0;
              const total = sec.preguntas?.length || 0;
              const ncInSec = sec.preguntas?.filter((p: any) => getValue(`${p.id}__visita_1`) === 'NO').length || 0;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSeccion(i)}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all text-left min-w-[130px] ${
                    activeSeccion === i
                      ? 'bg-cyan-700 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-cyan-700 hover:text-cyan-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{sec.titulo}</span>
                    {ncInSec > 0 && <span className="text-[9px] text-red-400 font-bold">•{ncInSec} NC</span>}
                  </div>
                  <div className="text-[9px] opacity-70">{answered}/{total} respondidas</div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════ */}
      {/*  MAIN + SIDEBAR                                 */}
      {/* ═══════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-5">

        {/* ── LEFT: Form content ──────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Encabezado imagen */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-28 h-14 bg-slate-700 border border-dashed border-slate-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-2xl opacity-40">📷</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold">PROCESO: {SCHEMA.proceso}</p>
              <p className="text-xs text-slate-400">CÓDIGO: {SCHEMA.codigo} · VERSIÓN: {SCHEMA.version} · {SCHEMA.fecha_formato}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 italic">"{SCHEMA.instruccion_excel}"</p>
            </div>
          </div>

          {/* Contexto */}
          <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-3">📋 Datos de la Inspección</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SCHEMA.campos_contexto?.map((c: any) => (
                <div key={c.id}>
                  <label className="block text-[10px] text-slate-400 mb-1">{c.label}</label>
                  <input
                    type={c.tipo === 'date' ? 'date' : 'text'}
                    value={getValue(c.id) ?? c.valor_excel ?? ''}
                    onChange={(e) => setValue(c.id, e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── SECCIÓN ACTUAL: prev/next nav ───── */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveSeccion(s => Math.max(s - 1, 0))}
              disabled={activeSeccion === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-all"
            >
              ← Anterior
            </button>
            <div className="flex gap-1.5">
              {secciones.map((_: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveSeccion(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === activeSeccion ? 'bg-cyan-500 ring-2 ring-cyan-500/30' : 'bg-slate-600 hover:bg-slate-500'}
                  `}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveSeccion(s => Math.min(s + 1, secciones.length - 1))}
              disabled={activeSeccion === secciones.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-all"
            >
              Siguiente →
            </button>
          </div>

          {/* ── SECTION TITLE ───────────────────── */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-cyan-200">
              {activeSeccion + 1}. {seccionActual.titulo}
            </h2>
            <span className="text-[10px] text-slate-500">{seccionActual.preguntas?.length} ítems</span>
          </div>

          {/* ── QUESTION TABLE ──────────────────── */}
          {seccionActual && (
            <section className="bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-950/60 to-slate-800 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-cyan-200">{seccionActual.titulo}</h3>
                <span className="text-[10px] text-slate-500">{seccionActual.preguntas?.length} ítems</span>
              </div>

              {/* Column headers */}
              <div className="grid px-5 py-2 bg-slate-900/50 border-b border-slate-700 text-[10px] text-slate-500 uppercase tracking-wider"
                style={{ gridTemplateColumns: '2rem 1fr 5.5rem 6.5rem 4.5rem' }}>
                <span>#</span>
                <span>Pregunta / Requisito</span>
                <span className="text-center">Norma</span>
                <span className="text-center">V1 · Visita 1</span>
                <span className="text-center">Cierre</span>
              </div>

              <div className="divide-y divide-slate-700/40">
                {seccionActual.preguntas?.map((p: any) => {
                  const v1Key = `${p.id}__visita_1`;
                  const cKey = `${p.id}__cierre`;
                  const v1Val = getValue(v1Key);
                  const cierreVal = getValue(cKey);
                  const isNO = v1Val === 'NO';

                  return (
                    <div
                      key={p.id}
                      className={`px-5 py-3 transition-colors ${
                        isNO
                          ? 'bg-red-950/25 border-l-2 border-l-red-500'
                          : 'hover:bg-slate-700/40 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="grid gap-3 items-start" style={{ gridTemplateColumns: '2rem 1fr 5.5rem 6.5rem 4.5rem' }}>
                        {/* Number */}
                        <span className="text-[11px] font-mono text-slate-500 mt-0.5">{p.numero}</span>

                        {/* Question */}
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm text-slate-200 leading-snug">{p.pregunta}</p>
                            {isNO && (
                              <button
                                onClick={() => handleOpenNCModal(p.id, p.pregunta, p.numero)}
                                className="shrink-0 px-1.5 py-0.5 bg-red-900/50 border border-red-700/50 text-[10px] font-bold text-red-300 rounded hover:bg-red-800/60 transition-colors"
                              >
                                ⚠️ NC
                              </button>
                            )}
                          </div>
                          {/* Norma ref */}
                          <span className="text-[9px] px-1.5 py-0.5 bg-slate-700/60 text-cyan-400/80 rounded mt-1 inline-block border border-cyan-900/30">
                            R. {p.norma}
                          </span>

                          {/* NO — expanded OC row */}
                          {isNO && (
                            <div className="mt-2 space-y-2">
                              <textarea
                                rows={2}
                                placeholder="Describa la observación de no conformidad (ítem {p.numero})..."
                                value={getValue(`${v1Key}__obs`) ?? ''}
                                onChange={(e) => setValue(`${v1Key}__obs`, e.target.value)}
                                className="w-full bg-red-950/30 border border-red-800/40 text-red-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none placeholder-red-500/40"
                              />
                            </div>
                          )}
                        </div>

                        {/* Norma */}
                        <span className="text-[10px] text-slate-500 text-center mt-0.5 self-center">{p.norma}</span>

                        {/* Visita 1 */}
                        <div className="flex gap-1 justify-center self-center">
                          {OPCIONES_V1.map((opt) => (
                            <RadioBtn key={opt} fieldKey={v1Key} opt={opt} palette={COLOR_V1} />
                          ))}
                        </div>

                        {/* Cierre */}
                        <div className="flex gap-1 justify-center self-center">
                          {OPCIONES_CIERRE.map((opt) => (
                            <RadioBtn key={opt} fieldKey={cKey} opt={opt} palette={COLOR_CIERRE} />
                          ))}
                        </div>
                      </div>
                      <div className="ml-8 mt-1">
                        <EvidenceUploader
                          inspectionId={baseInspectionId}
                          formId="DISENO"
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

          {/* Observaciones generales */}
          <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-3">📝 Observaciones Generales</h3>
            <textarea
              rows={4}
              value={getValue('observaciones') ?? ''}
              onChange={(e) => setValue('observaciones', e.target.value)}
              placeholder="Anote aquí las observaciones generales de la revisión documental de diseños..."
              className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-all"
            />
          </section>

          {/* Firmas */}
          <section className="bg-slate-800/80 border border-slate-700 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-300 mb-3">✍️ Firmas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ id: 'firma_inspector', label: 'Inspector' }, { id: 'firma_director', label: 'Director Técnico' }].map((f) => (
                <div key={f.id}>
                  <label className="block text-[10px] text-slate-400 mb-1">{f.label}</label>
                  <input
                    type="text"
                    value={getValue(f.id) ?? ''}
                    onChange={(e) => setValue(f.id, e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── RIGHT: Sidebar ────────────────────── */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">

          {/* Progreso */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">📊 Progreso</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold text-cyan-300 font-mono">{overallProgress}%</span>
              <span className="text-[10px] text-slate-400">completo</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
              <div className="bg-gradient-to-r from-cyan-600 to-teal-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-slate-700/50 rounded px-2 py-1.5">
                <p className="text-emerald-400 font-bold">{answeredV1}/{totalQ}</p>
                <p className="text-slate-500">V1 respondidas</p>
              </div>
              <div className="bg-slate-700/50 rounded px-2 py-1.5">
                <p className="text-blue-400 font-bold">{answeredCierre}/{totalQ}</p>
                <p className="text-slate-500">Cierre marcado</p>
              </div>
            </div>
          </div>

          {/* Cumplimiento */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">✅ Cumplimiento</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ${getGradeBadgeClass(complianceScore.grade)}`}>
                {complianceScore.grade}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">{complianceScore.pct}%</p>
                <p className="text-[10px] text-slate-400">{complianceScore.total} de {totalQ} ítems</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[9px]">
              <div className="bg-emerald-950/30 rounded py-1.5">
                <p className="text-emerald-400 font-bold">{complianceScore.breakdown.si}</p>
                <p className="text-slate-500">SI</p>
              </div>
              <div className="bg-amber-950/30 rounded py-1.5">
                <p className="text-amber-400 font-bold">{complianceScore.breakdown.na}</p>
                <p className="text-slate-500">N/A</p>
              </div>
              <div className="bg-red-950/30 rounded py-1.5">
                <p className="text-red-400 font-bold">{complianceScore.breakdown.no}</p>
                <p className="text-slate-500">NO</p>
              </div>
            </div>
          </div>

          {/* No Conformidades */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">🚨 No Conformidades</h3>
            <p className="text-[10px] text-slate-500 mb-2">ítems con respuesta NO en Visita 1</p>
            {ncList.length === 0 ? (
              <div className="text-center py-3 text-emerald-400 text-xs border border-emerald-900/30 rounded-lg bg-emerald-950/20">
                ✅ Sin NC detectadas
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ncList.map((nc) => (
                  <button
                    key={nc.id}
                    onClick={() => handleOpenNCModal(nc.id, nc.pregunta, nc.preguntaNumero)}
                    className="w-full p-2 rounded-lg border border-red-800/30 bg-red-950/30 text-left hover:bg-red-900/40 transition-all"
                  >
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-red-600 rounded text-white">{nc.preguntaNumero}</span>
                      <span className="text-red-400 font-bold text-[10px]">NO</span>
                    </div>
                    <p className="text-slate-300 text-[11px] line-clamp-2">{nc.pregunta}</p>
                    {nc.observacion && (
                      <p className="text-red-300/70 text-[9px] mt-1 line-clamp-1 italic">"{nc.observacion}"</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cierre pendiente */}
          {missingCierre.length > 0 && (
            <div className="bg-slate-800/80 border border-amber-700/40 rounded-xl p-4">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">⏳ Cierre Pendiente</h3>
              <p className="text-[10px] text-slate-400 mb-2">{missingCierre.length} ítems sin cerrar</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {missingCierre.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-mono text-amber-400">{item.numero}</span>
                    <span className="truncate">{item.pregunta}</span>
                  </div>
                ))}
                {missingCierre.length > 5 && (
                  <p className="text-[9px] text-slate-500">...y {missingCierre.length - 5} más</p>
                )}
              </div>
            </div>
          )}

          {/* Context quick summary */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">📋 Resumen Ítems</h3>
            {SCHEMA.campos_contexto?.map((c: any) => (
              <div key={c.id} className="text-[10px]">
                <span className="text-slate-500">{c.label}</span>
                <p className="text-slate-200 font-mono truncate">{getValue(c.id) || c.valor_excel || '—'}</p>
              </div>
            ))}
          </div>

        </aside>
      </main>

      {/* ═══════════════════════════════════════════════ */}
      {/*  NC MODAL                                      */}
      {/* ═══════════════════════════════════════════════ */}
      {showNCModal && activeNCEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShowNCModal(false)}>
          <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 border border-red-700/50 shadow-2xl shadow-red-900/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">⚠️ No Conformidad — Ítem #{activeNCEntry.numero}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{activeNCEntry.pregunta}</p>
              </div>
              <button onClick={() => setShowNCModal(false)} className="text-slate-400 hover:text-white text-lg leading-none ml-4">✕</button>
            </div>

            <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-300">
                Esta no conformidad será incluida en el reporte final. Complete la descripción para documentar el hallazgo.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Observación de No Conformidad</label>
                <textarea
                  rows={3}
                  value={getValue(`${activeNCEntry.preguntaId}__visita_1__obs`) ?? ''}
                  onChange={(e) => setValue(`${activeNCEntry.preguntaId}__visita_1__obs`, e.target.value)}
                  placeholder="Describa la desviación encontrada, su ubicación y las evidencias relacionadas."
                  className="w-full bg-slate-700 border border-slate-600 text-red-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none placeholder-red-400/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Severidad</label>
                  <select
                    value={getValue(`${activeNCEntry.preguntaId}__nc_severidad`) ?? 'mayor'}
                    onChange={(e) => setValue(`${activeNCEntry.preguntaId}__nc_severidad`, e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5"
                  >
                    <option value="menor">Menor</option>
                    <option value="mayor">Mayor</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Responsable</label>
                  <input
                    type="text"
                    placeholder="Nombre del responsable"
                    value={getValue(`${activeNCEntry.preguntaId}__nc_responsable`) ?? ''}
                    onChange={(e) => setValue(`${activeNCEntry.preguntaId}__nc_responsable`, e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-2 py-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Acción Correctiva Recomendada</label>
                <input
                  type="text"
                  placeholder="Describa la acción que debe tomar el responsable..."
                  value={getValue(`${activeNCEntry.preguntaId}__nc_recomendacion`) ?? ''}
                  onChange={(e) => setValue(`${activeNCEntry.preguntaId}__nc_recomendacion`, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-1.5"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  // Quick-fill: set V1 to NO with empty observation
                  setValue(`${activeNCEntry.preguntaId}__visita_1`, 'NO');
                  setShowNCModal(false);
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-300 transition-colors border border-slate-600"
              >
                Solo Marcar NO
              </button>
              <button
                onClick={() => setShowNCModal(false)}
                className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-xs font-semibold text-white transition-colors"
              >
                Guardar Detalle NC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/*  PDF PREVIEW MODAL                              */}
      {/* ═══════════════════════════════════════════════ */}
      {showPdfPreview && pdfBlob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-8" onClick={() => setShowPdfPreview(false)}>
          <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 border border-slate-700 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">📄 Vista Previa PDF</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Documento generado · {complianceScore.pct}% cumplimiento · {ncList.length} NC
                </p>
              </div>
              <button onClick={() => setShowPdfPreview(false)} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
            </div>

            <div className="bg-slate-900/80 rounded-lg p-4 mb-5 border border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Documento</span>
                <span className="text-cyan-300 font-semibold">Hoja DISEÑO</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Código</span>
                <span className="text-slate-200 font-mono">{SCHEMA.codigo} v{SCHEMA.version}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Preguntas</span>
                <span className="text-slate-200">{totalQ} · {answeredV1} respondidas</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">No Conformidades</span>
                <span className="text-red-400 font-bold">{ncList.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Calificación</span>
                <span className={`px-2 py-0.5 rounded text-white text-xs font-bold ${getGradeBadgeClass(complianceScore.grade)}`}>
                  {complianceScore.grade} — {complianceScore.pct}%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Hoja_DISENO_Revision_${getValue('codigo_servicio') || 'DEMO'}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setShowPdfPreview(false);
                }}
                className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold text-white transition-colors shadow-md"
              >
                ⬇ Descargar PDF
              </button>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold text-slate-300 transition-colors border border-slate-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/*  SAVE TOAST                                     */}
      {/* ═══════════════════════════════════════════════ */}
      {showSaveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-emerald-900/40 text-sm font-semibold animate-pulse">
          ✅ Guardado en IndexedDB
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
