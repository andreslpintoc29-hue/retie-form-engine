// ============================================
// RETIE INSPECTION PLATFORM - HOME DASHBOARD
// ============================================

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const MODULES = [
  { href: 'expediente', label: 'EXPEDIENTE RETIE', icon: '📂', color: 'yellow', desc: 'Expediente Técnico, Declaraciones, Dictamen, Hallazgos y Evidencias' },
  { href: 'producto', label: 'PRODUCTO', icon: '🛡️', color: 'emerald', desc: 'Lista de Chequeo Certificado de Producto' },
  { href: 'r-spt', label: 'R. SPT', icon: '⚡', color: 'indigo', desc: 'Resistencia de Puesta a Tierra' },
  { href: 'r-aislamiento', label: 'R. AISLAMIENTO', icon: '🔌', color: 'fuchsia', desc: 'Resistencia de Aislamiento Activo' },
  { href: 'iluminancia', label: 'ILUMINANCIA', icon: '💡', color: 'amber', desc: 'Medición de Niveles de Lux (Multi-hoja)' },
  { href: 'in', label: 'HOJA IN', icon: '📑', color: 'teal', desc: 'Índice y Resumen del Servicio' },
  { href: 'carpeta', label: 'CARPETA', icon: '📁', color: 'blue', desc: 'Checklist Documental Carpeta (34 ítems)' },
  { href: 'distribucion', label: 'Distribución', icon: '⚡', color: 'purple', desc: 'Lista de Chequeo Redes de Distribución' },
  { href: 'diseno', label: 'Diseño', icon: '📐', color: 'cyan', desc: 'Revisión Documental de Diseños' },
  { href: 'ufr', label: 'U.F.R', icon: '🏠', color: 'green', desc: 'Uso Final Residencial (159 ítems)' },
  { href: 'uf-i-y-c', label: 'UF I Y C', icon: '🏭', color: 'orange', desc: 'Uso Final Industrial y Comercial (227 ítems)' },
  { href: 'acp-sde-bci', label: 'ACP · SDE · BCI', icon: '⚡', color: 'violet', desc: 'Alta Conc. Personas / Emergencia / Incendios (85 ítems)' },
  { href: 'apantallamiento', label: 'APANTALLAMIENTO', icon: '🌩️', color: 'yellow', desc: 'Lista de Chequeo Apantallamiento' },
  { href: 'piscinas', label: 'PISCINAS', icon: '🏊', color: 'blue-400', desc: 'Inspección de Piscinas y Sistemas Acuáticos' },
  { href: 'ascensores', label: 'ASCENSORES', icon: '🛗', color: 'rose', desc: 'Lista de Chequeo Ascensores' },
];

const COLOR_BORDERS: Record<string, string> = {
  yellow: 'border-l-yellow-500 hover:border-yellow-500',
  emerald: 'border-l-emerald-500 hover:border-emerald-500',
  indigo: 'border-l-indigo-500 hover:border-indigo-500',
  fuchsia: 'border-l-fuchsia-500 hover:border-fuchsia-500',
  amber: 'border-l-amber-500 hover:border-amber-500',
  teal: 'border-l-teal-500 hover:border-teal-500',
  blue: 'border-l-blue-500 hover:border-blue-500',
  purple: 'border-l-purple-500 hover:border-purple-500',
  cyan: 'border-l-cyan-500 hover:border-cyan-500',
  green: 'border-l-green-500 hover:border-green-500',
  orange: 'border-l-orange-500 hover:border-orange-500',
  violet: 'border-l-violet-500 hover:border-violet-500',
  'blue-400': 'border-l-blue-400 hover:border-blue-400',
  rose: 'border-l-rose-500 hover:border-rose-500',
};

export default function HomePage() {
  const [inspectionId, setInspectionId] = useState<string>('RETIE-DEMO-2026');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      setInspectionId(id);
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-sans">
      <div className="max-w-4xl text-center p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-blue-400 mb-2 tracking-tight">
            🏭 RETIE Inspection Platform
          </h1>
          <p className="text-lg text-slate-400">
            Plataforma de Inspección Eléctrica Offline — DIMOTIK SOLUTIONS
          </p>
          <p className="text-sm text-slate-500 mt-3">
            ID actual: <span className="font-mono text-yellow-400">{inspectionId}</span>
          </p>
        </div>
        
        {/* Core inspection forms grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MODULES.map((module, idx) => {
            const isExpediente = module.href === 'expediente';
            const colSpan = isExpediente ? 'col-span-1 sm:col-span-2 lg:col-span-1' : '';
            const href = `/${module.href}?id=${inspectionId}`;
            const borderClass = COLOR_BORDERS[module.color] || 'border-l-blue-500 hover:border-blue-500';
            
            return (
              <Link 
                key={idx}
                href={href}
                className={`block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 ${borderClass} ${colSpan}`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{module.icon}</div>
                <div className="text-sm font-bold text-white uppercase tracking-wider text-yellow-400">{module.label}</div>
                <p className="text-[11px] text-slate-400 mt-1">{module.desc}</p>
              </Link>
            );
          })}
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 space-y-1">
          <p>🔒 Sistema preparado para trabajo de campo sin conexión (Offline-First via IndexedDB)</p>
          <p>📁 Cumple 100% con los formatos normalizados ONAC y la reglamentación RETIE vigente</p>
        </div>
      </div>
    </div>
  );
}