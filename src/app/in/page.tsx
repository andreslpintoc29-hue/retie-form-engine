'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { RETIE_IN_SCHEMA } from '@/schemas/retie/in';
import { downloadINPDF } from '@/utils/pdfGeneratorIN';

const SCHEMA = RETIE_IN_SCHEMA as any;
const OPCIONES = ['SI', 'NO', 'N.A'];
const OPCIONES_CUMPLE = ['SI', 'NO'];

export default function InPage() {
  const router = useRouter();

  const [inspectionId, setInspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_IN`;
    }
    return 'RETIE-DEMO-2026_IN';
  });

  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [offlineStatus, setOfflineStatus] = useState({ online: true, pending: 0, lastSync: '' });
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [showLimpiar, setShowLimpiar] = useState(false);
  const [activeSection, setActiveSection] = useState('contexto');

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 800,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (e: any) => console.error(e),
  });

  const { isReady, getValue: rawGetValue, setValue: rawSetValue } = formEngine;

  // Sync inspection ID dynamically from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      setInspectionId(`${id}_IN`);
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

  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () =>
      setLastSaved(new Date().toLocaleTimeString())
    );
    return unsub;
  }, []);

  const getValue = useCallback((id: string) => rawGetValue(id) as any, [rawGetValue]);
  const setValue = useCallback((id: string, v: any) => rawSetValue(id, v), [rawSetValue]);

  // --- Action Handlers ---
  const handleBack = () => {
    const baseId = inspectionId.replace('_IN', '');
    router.push(`/expediente?id=${baseId}`);
  };

  const handlePdf = async () => {
    const answers = (formEngine as any).answers || {};
    await downloadINPDF({ schema: SCHEMA, answers });
  };

  const handleLimpiar = async () => {
    const store = (formEngine as any).store;
    if (store) {
      store.resetInspection?.();
    }
    setLastSaved(null);
    setShowLimpiar(false);
  };

  const handleFinalizar = async () => {
    await (formEngine as any).save?.();
    const baseId = inspectionId.replace('_IN', '');
    router.push(`/expediente?id=${baseId}`);
  };

  // --- RadioBtn Component ---
  const RadioBtn = ({ fieldKey, opt, palette }: { fieldKey: string; opt: string; palette: Record<string, string> }) => {
    const val = getValue(fieldKey);
    const active = val === opt;
    return (
      <button
        onClick={() => setValue(fieldKey, active ? null : opt)}
        className={`px-2 py-1 text-[11px] font-bold rounded border transition-all duration-200 ${active ? palette[opt] : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-400 hover:text-slate-200'}`}
      >{opt}</button>
    );
  };

  const paletteBasic = { SI: 'bg-teal-600 border-teal-500 text-white shadow-teal-500/30 shadow-md', NO: 'bg-red-600 border-red-500 text-white shadow-red-500/30 shadow-md', 'N.A': 'bg-amber-600 border-amber-500 text-white shadow-amber-500/30 shadow-md' };
  const paletteCumple = { SI: 'bg-teal-600 border-teal-500 text-white shadow-teal-500/30 shadow-md', NO: 'bg-red-600 border-red-500 text-white shadow-red-500/30 shadow-md' };

  // --- Section navigation items ---
  const sections = [
    { id: 'contexto', label: '📋 Contexto', icon: '📋' },
    { id: 'modulos', label: '📦 Módulos', icon: '📦' },
    { id: 'spt', label: '⚡ SPT', icon: '⚡' },
    { id: 'aislamiento', label: '🔌 Aislamiento', icon: '🔌' },
    { id: 'iluminancia', label: '💡 Iluminancia', icon: '💡' },
  ];

  if (!isReady) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 animate-pulse">Cargando Hoja IN — Índice y Resumen...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* ── STICKY TOP NAVBAR ── */}
      <div className="sticky top-0 z-50 bg-slate-800/95 border-b border-slate-700 shadow-lg shadow-teal-900/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📑</span>
              <div>
                <h1 className="text-base font-bold text-teal-400 leading-none">{SCHEMA.titulo}</h1>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                  Hoja {SCHEMA.hoja} · Resumen del Servicio de Inspección
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="text-xs text-slate-400 font-mono mr-2">
                {lastSaved ? `💾 ${lastSaved}` : '⏱️ En espera...'}
              </div>
              <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${offlineStatus.online ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                {offlineStatus.online ? '🟢 Online' : '🔴 Offline'}
                {offlineStatus.pending > 0 && ` · ${offlineStatus.pending} pendientes`}
              </div>
              <button
                onClick={handleBack}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold transition-colors"
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
                🗑️ Limpiar
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

        {/* ── Section Tabs ── */}
        <div className="max-w-7xl mx-auto px-4 pb-2">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {sections.map(sec => (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  document.getElementById(`section-${sec.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`px-3 py-1.5 text-[11px] font-semibold rounded-t-lg transition-all whitespace-nowrap border-b-2 ${
                  activeSection === sec.id
                    ? 'bg-teal-900/40 text-teal-300 border-teal-400'
                    : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ── Header Visual Panel ── */}
        <div className="bg-gradient-to-r from-teal-900/20 via-slate-800 to-slate-800 rounded-xl border border-slate-700 p-5">
          <span className="inline-block px-2.5 py-0.5 bg-teal-500/20 text-teal-400 rounded-full text-xs font-semibold mb-2">
            Hoja IN · Índice
          </span>
          <h2 className="text-xl font-bold text-white">Información General e Índice del Servicio</h2>
          <p className="text-xs text-slate-400 mt-0.5">Resumen de módulos, mediciones SPT, aislamiento e iluminancia aplicables al servicio de inspección.</p>
        </div>

        {/* ═════════════ CONTEXTO ═════════════ */}
        <section id="section-contexto" className="scroll-mt-36">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-teal-400 mb-4 border-b border-slate-700 pb-2 uppercase tracking-wide flex items-center gap-2">
              📋 Datos del Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Context fields */}
              {SCHEMA.campos_contexto?.map((c: any) => (
                <div key={c.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wide">{c.label || c.id}</label>
                  <input
                    type={c.tipo === 'date' ? 'date' : 'text'}
                    value={getValue(c.id) ?? c.valor_excel ?? ''}
                    onChange={(e) => setValue(c.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                    placeholder="Ingrese valor..."
                  />
                </div>
              ))}

              {/* Dictamen fields */}
              {['dictamen_uf', 'dictamen_di', 'dictamen_se'].map(id => (
                <div key={id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wide">
                    Dictamen {id.split('_')[1].toUpperCase()}
                  </label>
                  <input
                    type="text"
                    value={getValue(id) ?? ''}
                    onChange={(e) => setValue(id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                    placeholder="Nro. Dictamen..."
                  />
                </div>
              ))}

              {/* Equipment fields */}
              {['equipo_tierra', 'equipo_aislamiento', 'equipo_iluminancia'].map(id => (
                <div key={id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-350 uppercase tracking-wide">
                    Equipo {id.split('_').slice(1).join(' ').toUpperCase()}
                  </label>
                  <input
                    type="text"
                    value={getValue(id) ?? ''}
                    onChange={(e) => setValue(id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                    placeholder="Código del equipo..."
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════ MÓDULOS APLICABLES ═════════════ */}
        <section id="section-modulos" className="scroll-mt-36">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-teal-950/60 to-slate-800 px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-teal-200 flex items-center gap-2">
                📦 Selección de Módulos Aplicables
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Marque SI, NO o N.A según aplique cada módulo a esta inspección.</p>
            </div>
            <div className="divide-y divide-slate-700/50">
              {SCHEMA.modulos.map((m: any, idx: number) => (
                <div key={m.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-750 transition-colors group">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-xs text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded shrink-0 mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                    <p className="text-sm text-slate-200 font-medium">{m.descripcion}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {OPCIONES.map(opt => <RadioBtn key={opt} fieldKey={`${m.id}__aplica`} opt={opt} palette={paletteBasic} />)}
                  </div>
                  {m.caracteristicas_acometida && (
                    <div className="w-full md:w-auto flex flex-col gap-2 mt-2 md:mt-0 p-3 bg-slate-900 rounded-lg border border-slate-700">
                      <p className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Características Acometida</p>
                      {[
                        { label: 'ALUMINIO', key: 'acometida_aluminio' },
                        { label: 'AÉREA', key: 'acometida_aerea' },
                        { label: 'SUBTERRÁNEA', key: 'acometida_subterranea' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between gap-4">
                          <span className="text-xs text-slate-400">{item.label}</span>
                          <div className="flex gap-1">
                            {OPCIONES.map(opt => <RadioBtn key={opt} fieldKey={item.key} opt={opt} palette={paletteBasic} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════════ SPT ═════════════ */}
        <section id="section-spt" className="scroll-mt-36">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-teal-950/60 to-slate-800 px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-teal-200 flex items-center gap-2">
                ⚡ Resumen Medida Resistencia de Puesta a Tierra
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Descripción / Punto Medido</label>
                <input type="text" value={getValue('spt_desc') ?? 'PUNTO NEUTRO DE ACOMETIDA EN BT'} onChange={(e) => setValue('spt_desc', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wide">Valor D (Ω)</label>
                <input type="number" value={getValue('spt_valor_d') ?? ''} onChange={(e) => setValue('spt_valor_d', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono" />
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-400 font-semibold">Cumple:</span>
                {OPCIONES_CUMPLE.map(opt => <RadioBtn key={opt} fieldKey="spt_cumple" opt={opt} palette={paletteCumple} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ═════════════ AISLAMIENTO ═════════════ */}
        <section id="section-aislamiento" className="scroll-mt-36">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
            <div className="bg-gradient-to-r from-teal-950/60 to-slate-800 px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-teal-200 flex items-center gap-2">
                🔌 Resumen Medida Resistencia de Aislamiento
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{SCHEMA.aislamiento?.length || 0} circuitos registrados</p>
            </div>
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Medida en</th>
                  <th className="px-4 py-2.5 font-semibold w-16 text-center">Fases</th>
                  <th className="px-2 py-2.5 font-semibold w-20 text-center">L1-T</th>
                  <th className="px-2 py-2.5 font-semibold w-20 text-center">L2-T</th>
                  <th className="px-2 py-2.5 font-semibold w-20 text-center">L3-T</th>
                  <th className="px-2 py-2.5 font-semibold w-20 text-center">L1-L2</th>
                  <th className="px-2 py-2.5 font-semibold w-20 text-center">L1-L3</th>
                  <th className="px-2 py-2.5 font-semibold w-20 text-center">L2-L3</th>
                  <th className="px-4 py-2.5 font-semibold w-24 text-center">Cumple</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {SCHEMA.aislamiento.map((item: any, i: number) => (
                  <tr key={item.id} className="hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-2">
                      <input type="text" value={getValue(`${item.id}__lugar`) ?? item.lugar} onChange={(e) => setValue(`${item.id}__lugar`, e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:ring-1 focus:ring-teal-500" />
                    </td>
                    <td className="px-4 py-2 text-center text-slate-300 font-mono font-bold">{item.fases}</td>
                    {['l1_t', 'l2_t', 'l3_t', 'l1_l2', 'l1_l3', 'l2_l3'].map(k => (
                      <td key={k} className="px-1 py-2">
                        <input type="number" value={getValue(`${item.id}__${k}`) ?? ''} onChange={(e) => setValue(`${item.id}__${k}`, e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-center text-white focus:ring-1 focus:ring-teal-500" />
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">
                      <div className="flex gap-1 justify-center">{OPCIONES_CUMPLE.map(opt => <RadioBtn key={opt} fieldKey={`${item.id}__cumple`} opt={opt} palette={paletteCumple} />)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ═════════════ ILUMINANCIA ═════════════ */}
        <section id="section-iluminancia" className="scroll-mt-36">
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
            <div className="bg-gradient-to-r from-teal-950/60 to-slate-800 px-5 py-3 border-b border-slate-700">
              <h3 className="text-sm font-bold text-teal-200 flex items-center gap-2">
                💡 Resumen Medida de Iluminancia
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{SCHEMA.iluminancia?.length || 0} puntos de medida</p>
            </div>
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Lugar de Medida</th>
                  <th className="px-2 py-2.5 font-semibold w-24 text-center">Medida 1</th>
                  <th className="px-2 py-2.5 font-semibold w-24 text-center">Medida 2</th>
                  <th className="px-2 py-2.5 font-semibold w-24 text-center">Medida 3</th>
                  <th className="px-2 py-2.5 font-semibold w-24 text-center text-teal-300">Promedio</th>
                  <th className="px-4 py-2.5 font-semibold w-24 text-center">Cumple</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {SCHEMA.iluminancia.map((item: any) => {
                  const m1 = parseFloat(getValue(`${item.id}__m1`) || '0');
                  const m2 = parseFloat(getValue(`${item.id}__m2`) || '0');
                  const m3 = parseFloat(getValue(`${item.id}__m3`) || '0');
                  let count = 0;
                  let sum = 0;
                  if (m1 > 0) { count++; sum += m1; }
                  if (m2 > 0) { count++; sum += m2; }
                  if (m3 > 0) { count++; sum += m3; }
                  const prom = count > 0 ? (sum / count).toFixed(2) : '0.00';

                  return (
                    <tr key={item.id} className="hover:bg-slate-750 transition-colors">
                      <td className="px-4 py-2">
                        <input type="text" value={getValue(`${item.id}__lugar`) ?? item.lugar} onChange={(e) => setValue(`${item.id}__lugar`, e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:ring-1 focus:ring-teal-500" />
                      </td>
                      <td className="px-2 py-2"><input type="number" step="0.01" value={getValue(`${item.id}__m1`) ?? ''} onChange={(e) => setValue(`${item.id}__m1`, e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-center text-white focus:ring-1 focus:ring-teal-500" /></td>
                      <td className="px-2 py-2"><input type="number" step="0.01" value={getValue(`${item.id}__m2`) ?? ''} onChange={(e) => setValue(`${item.id}__m2`, e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-center text-white focus:ring-1 focus:ring-teal-500" /></td>
                      <td className="px-2 py-2"><input type="number" step="0.01" value={getValue(`${item.id}__m3`) ?? ''} onChange={(e) => setValue(`${item.id}__m3`, e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-center text-white focus:ring-1 focus:ring-teal-500" /></td>
                      <td className="px-2 py-2 text-center font-mono text-teal-300 font-bold text-sm">{prom} lx</td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex gap-1 justify-center">{OPCIONES_CUMPLE.map(opt => <RadioBtn key={opt} fieldKey={`${item.id}__cumple`} opt={opt} palette={paletteCumple} />)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* ── MODAL FINALIZAR ── */}
      {showFinalizar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-700 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-bold text-white mb-2">¿Finalizar Hoja IN?</h3>
            <p className="text-sm text-slate-400 mb-4">
              Se guardarán todas las respuestas del índice y resumen del servicio. Se regresará al expediente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleFinalizar}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
              >
                ✅ Sí, Finalizar
              </button>
              <button
                onClick={() => setShowFinalizar(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL LIMPIAR ── */}
      {showLimpiar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-red-700 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-bold text-red-400 mb-2">🗑️ Limpiar Hoja IN</h3>
            <p className="text-sm text-slate-400 mb-4">
              Se borrarán todas las respuestas del módulo IN. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLimpiar}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
              >
                🗑️ Sí, Limpiar Todo
              </button>
              <button
                onClick={() => setShowLimpiar(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
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
