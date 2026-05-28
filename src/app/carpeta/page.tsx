'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormEngine } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { RETIE_CARPETA_SCHEMA } from '@/schemas/retie/carpeta';
import { downloadCarpetaPDF } from '@/utils/pdfGeneratorCarpeta';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { EvidenceUploader } from '@/components/EvidenceUploader';

const SCHEMA = RETIE_CARPETA_SCHEMA as any;
const OPCIONES_R1 = ['SI', 'NO', 'N/A'];
const OPCIONES_CIERRE = ['SI', 'NO'];
const OPCIONES_DIGITAL = ['SI', 'NO'];

const COLOR_V1: Record<string, string> = {
  SI: 'bg-emerald-600 border-emerald-500 text-white',
  NO: 'bg-red-600 border-red-500 text-white',
  'N/A': 'bg-amber-600 border-amber-500 text-white',
};
const COLOR_CIERRE: Record<string, string> = {
  SI: 'bg-emerald-600 border-emerald-500 text-white',
  NO: 'bg-red-600 border-red-500 text-white',
};

export default function CarpetaPage() {
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_CARPETA`;
    }
    return 'RETIE-DEMO-2026_CARPETA';
  });
  const router = useRouter();
  const baseInspectionId = inspectionId.replace(/_(ACPSDEBCI|DISTRIBUCION|DISENO|CARPETA|UFR|UFIYC)$/, '');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvidencias() {
      if (!baseInspectionId) return;
      try {
        const cached = await offlineEngine.getExpediente(baseInspectionId);
        if (cached?.evidencias) setEvidencias(cached.evidencias);
      } catch (err) { console.error('Error loading evidences Carpeta:', err); }
    }
    loadEvidencias();
  }, [baseInspectionId]);

  const handleSaveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    if (!baseInspectionId) return;
    try {
      const cached = await offlineEngine.getExpediente(baseInspectionId) || {};
      await offlineEngine.saveExpediente(baseInspectionId, { ...cached, evidencias: updated });
    } catch (err) { console.error('Error saving evidences Carpeta:', err); }
  };

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 800,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (e: any) => console.error(e),
  });

  const { getValue } = formEngine;

// Compute missing digital selections
  const missingDigital = SCHEMA.items.filter((i: any) => {
    if (!i.archivo_digital) return false;
    const val = getValue(`${i.id}__digital`);
    return !(val === 'SI' || val === 'NO');
  });
  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () => setLastSaved(new Date().toLocaleTimeString()));
    return () => unsub();
  }, []);
 

  const allDigitalSet = SCHEMA.items.filter((i: any) => i.archivo_digital).every((item: any) => {
    const val = getValue(`${item.id}__digital`);
    return val === 'SI' || val === 'NO';
  });

  const handleFinalizar = async () => {
    if (!allDigitalSet) {
      alert('Debe completar la información de Archivo Digital para todos los ítems que lo requieren.');
      setShowFinalizar(false);
      return;
    }
    try {
      await (formEngine as any).save?.();
    } catch (e) {}
    alert('Carpeta finalizada correctamente.');
    setShowFinalizar(false);
    router.push(`/expediente?id=${baseInspectionId}`);
  };
  
  const handleLimpiar = async () => {
  if (confirm('¿Está seguro de que desea limpiar todos los campos? Esta acción no se puede deshacer.')) {
    const store = (formEngine as any).store;
    if (store) {
      store.resetInspection?.();
    }
    setLastSaved(null);
  }
};

  const handlePdf = () => {
    const answers = (formEngine as any).store?.answers || formEngine.answers || {};
    downloadCarpetaPDF({
      schema: SCHEMA,
      answers
    });
  };

  const setValue = useCallback((id: string, v: any) => formEngine.setValue(id, v), [formEngine]);

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
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-slate-700 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/expediente?id=${baseInspectionId}`} className="text-slate-400 hover:text-white text-xl">←</Link>
            <div>
              <h1 className="text-sm font-bold text-blue-300 leading-tight">📁 {SCHEMA.titulo}</h1>
              <p className="text-[10px] text-slate-400">{SCHEMA.codigo} · v{SCHEMA.version} · {SCHEMA.proceso}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs text-slate-400 font-mono mr-2">
              {lastSaved ? `💾 ${lastSaved}` : '⏱️ En espera...'}
            </div>
            <button onClick={handlePdf} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold transition-colors border border-purple-500">📄 PDF</button>
            <button onClick={handleLimpiar} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold transition-colors border border-slate-600">Limpiar</button>
            <button onClick={() => setShowFinalizar(true)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors" disabled={!allDigitalSet}>✅ Finalizar</button>
          </div>
        </div>
      </header>

      {showFinalizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-sm w-full">
            <h3 className="font-bold text-lg mb-2">Finalizar Carpeta</h3>
            <p className="text-sm text-slate-400 mb-6">¿Estás seguro de que deseas cerrar esta carpeta? Esta acción bloqueará la edición.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowFinalizar(false)} className="flex-1 py-2 bg-slate-700 rounded text-xs font-bold">Cancelar</button>
              <button onClick={handleFinalizar} className="flex-1 py-2 bg-green-600 rounded text-xs font-bold">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6">

        {/* INSTRUCCIONES */}
        <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl px-4 py-3">
          <p className="text-xs text-blue-300 italic mb-1">📌 {SCHEMA.instruccion_excel}</p>
          <p className="text-xs text-blue-300 italic">📌 {SCHEMA.subinstruccion_excel}</p>
        </div>

        {/* DATOS CONTEXTO */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">📋 Datos de la Inspección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SCHEMA.campos_contexto?.map((c: any) => (
              <div key={c.id}>
                <label className="block text-[10px] text-slate-400 mb-1">{c.label || c.id}</label>
                <input
                  type={c.tipo === 'date' ? 'date' : 'text'}
                  value={String(getValue(c.id) ?? '')}
                  onChange={(e) => setValue(c.id, e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* DOCUMENTOS PRINCIPALES */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950/60 to-slate-800 px-5 py-3 border-b border-slate-700">
            <h3 className="text-sm font-bold text-blue-200">Documentos carpeta de inspección</h3>
          </div>
          <div className="grid px-4 py-2 bg-slate-900/50 border-b border-slate-700 text-[10px] text-slate-500 uppercase tracking-wider"
            style={{ gridTemplateColumns: '2rem 1fr 5rem 7rem 5rem' }}>
            <span>Ítem</span><span>Descripción</span><span className="text-center">Archivo Digital</span>
            <span className="text-center">Revisión 1</span><span className="text-center">Cierre</span>
          </div>
          <div className="divide-y divide-slate-700/50">
            {SCHEMA.items.map((item: any) => {
              const v1Key = `${item.id}__revision_1`;
              const cKey = `${item.id}__cierre`;
              const dKey = `${item.id}__digital`;
              return (
                <div key={item.id} className={`px-4 py-3 hover:bg-slate-750 transition-colors ${missingDigital.some((m: any) => m.id === item.id) ? 'bg-red-900/30' : ''}`}>
                  <div className="grid gap-3 items-center" style={{ gridTemplateColumns: '2rem 1fr 5rem 7rem 5rem' }}>
                    <span className="text-[11px] font-mono text-slate-500">{item.numero}</span>
                    <p className="text-xs text-slate-200 leading-snug pr-2">{item.descripcion}</p>
                    <div className="flex gap-1 justify-center">
                      {item.archivo_digital ? OPCIONES_DIGITAL.map(opt => <RadioBtn key={opt} fieldKey={dKey} opt={opt} palette={{ SI: 'bg-blue-600 border-blue-500 text-white', NO: 'bg-slate-600 border-slate-500 text-white' }} />) : <span className="text-[10px] text-slate-600">-</span>}
                    </div>
                    <div className="flex gap-1 justify-center flex-wrap">
                      {OPCIONES_R1.map(opt => <RadioBtn key={opt} fieldKey={v1Key} opt={opt} palette={COLOR_V1} />)}
                    </div>
                    <div className="flex gap-1 justify-center">
                      {OPCIONES_CIERRE.map(opt => <RadioBtn key={opt} fieldKey={cKey} opt={opt} palette={COLOR_CIERRE} />)}
                    </div>
                  </div>
                  <div className="ml-8">
                    <EvidenceUploader
                      inspectionId={baseInspectionId}
                      formId="CARPETA"
                      questionId={item.id}
                      caption={item.descripcion}
                      evidencias={evidencias}
                      onSaveEvidencias={handleSaveEvidencias}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* DICTAMEN */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-blue-200 mb-4">📄 Dictamen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Número dictamen</label>
              <input type="text" value={String(getValue('numero_dictamen') ?? '')} onChange={(e) => setValue('numero_dictamen', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Subestación</label>
              <input type="text" value={String(getValue('dictamen_subestacion') ?? '')} onChange={(e) => setValue('dictamen_subestacion', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Distribución</label>
              <input type="text" value={String(getValue('dictamen_distribucion') ?? '')} onChange={(e) => setValue('dictamen_distribucion', e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Uso Final</label>
              <input type="text" value={String(getValue('dictamen_uso_final') ?? '')} onChange={(e) => setValue('dictamen_uso_final', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </section>

        {/* OTROS DOCUMENTOS */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-950/60 to-slate-800 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-200">35. Otros documentos</h3>
            <div className="flex gap-2">
              <div className="flex gap-1 items-center bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                <span className="text-[9px] text-slate-400 mr-1 uppercase">Rev.1</span>
                {OPCIONES_R1.map(opt => <RadioBtn key={opt} fieldKey="CARP-035__revision_1" opt={opt} palette={COLOR_V1} />)}
              </div>
              <div className="flex gap-1 items-center bg-slate-900/50 px-2 py-1 rounded border border-slate-700">
                <span className="text-[9px] text-slate-400 mr-1 uppercase">Cierre</span>
                {OPCIONES_CIERRE.map(opt => <RadioBtn key={opt} fieldKey="CARP-035__cierre" opt={opt} palette={COLOR_CIERRE} />)}
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {SCHEMA.otros_documentos.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono w-6">{item.ordinal}</span>
                <input type="text" placeholder="Descripción del documento..."
                  value={getValue(`${item.id}__desc`) ?? item.descripcion}
                  onChange={(e) => setValue(`${item.id}__desc`, e.target.value)}
                  className="flex-1 bg-slate-700 border border-slate-600 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <div className="flex gap-1">
                  {OPCIONES_R1.map(opt => <RadioBtn key={opt} fieldKey={`${item.id}__revision_1`} opt={opt} palette={COLOR_V1} />)}
                </div>
                <div className="flex gap-1">
                  {OPCIONES_CIERRE.map(opt => <RadioBtn key={opt} fieldKey={`${item.id}__cierre`} opt={opt} palette={COLOR_CIERRE} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OBSERVACIONES */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-300 mb-3">📝 Observaciones</h3>
                      <textarea rows={4} value={String(getValue('observaciones') ?? '')}
            onChange={(e) => setValue('observaciones', e.target.value)}
            placeholder="Observaciones generales..."
            className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </section>

        {/* FIRMAS */}
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-blue-300 mb-4">Carpeta cerrada y verificada, en constancia firma:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Ingeniero Inspector</label>
              <input type="text" placeholder="Nombre completo" value={getValue('firma_ingeniero_inspector') ?? ''} onChange={(e) => setValue('firma_ingeniero_inspector', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Director Técnico</label>
              <input type="text" placeholder="Nombre completo" value={getValue('firma_director_tecnico') ?? ''} onChange={(e) => setValue('firma_director_tecnico', e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2" />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
