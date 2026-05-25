// ============================================
// RETIE INSPECTION PLATFORM - HOME DASHBOARD
// ============================================

import Link from 'next/link';

export default function HomePage() {
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
        </div>
        
        {/* Core inspection forms grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* 0. EXPEDIENTE RETIE (GLOBAL SYSTEM) */}
          <Link href="/expediente" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-yellow-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-yellow-500 col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📂</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider text-yellow-400">EXPEDIENTE RETIE</div>
            <p className="text-[11px] text-slate-400 mt-1">Expediente Técnico, Declaraciones, Dictamen, Hallazgos y Evidencias</p>
          </Link>

          {/* 1. PRODUCTO */}
          <Link href="/producto" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-emerald-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-emerald-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛡️</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">PRODUCTO</div>
            <p className="text-[11px] text-slate-400 mt-1">Lista de Chequeo Certificado de Producto</p>
          </Link>

          {/* 2. R. SPT */}
          <Link href="/r-spt" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-indigo-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">R. SPT</div>
            <p className="text-[11px] text-slate-400 mt-1">Resistencia de Puesta a Tierra</p>
          </Link>

          {/* 3. R. AISLAMIENTO */}
          <Link href="/r-aislamiento" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-fuchsia-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-fuchsia-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔌</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">R. AISLAMIENTO</div>
            <p className="text-[11px] text-slate-400 mt-1">Resistencia de Aislamiento Activo</p>
          </Link>

          {/* 4. ILUMINANCIA */}
          <Link href="/iluminancia" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-amber-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-amber-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💡</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">ILUMINANCIA</div>
            <p className="text-[11px] text-slate-400 mt-1">Medición de Niveles de Lux (Multi-hoja)</p>
          </Link>

          {/* 5. IN */}
          <Link href="/in" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-teal-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-teal-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📑</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">HOJA IN</div>
            <p className="text-[11px] text-slate-400 mt-1">Índice y Resumen del Servicio</p>
          </Link>

          {/* 6. CARPETA */}
          <Link href="/carpeta" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-blue-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📁</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">CARPETA</div>
            <p className="text-[11px] text-slate-400 mt-1">Checklist Documental Carpeta (34 ítems)</p>
          </Link>

          {/* 7. DISTRIBUCIÓN */}
          <Link href="/distribucion" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-purple-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-purple-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">Distribución</div>
            <p className="text-[11px] text-slate-400 mt-1">Lista de Chequeo Redes de Distribución</p>
          </Link>

          {/* 8. DISEÑO */}
          <Link href="/diseno" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-cyan-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-cyan-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📐</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">Diseño</div>
            <p className="text-[11px] text-slate-400 mt-1">Revisión Documental de Diseños</p>
          </Link>

          {/* 9. U.F.R */}
          <Link href="/ufr" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-green-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-green-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏠</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">U.F.R</div>
            <p className="text-[11px] text-slate-400 mt-1">Uso Final Residencial (159 ítems)</p>
          </Link>

          {/* 10. UF I Y C */}
          <Link href="/uf-i-y-c" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-orange-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-orange-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏭</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">UF I Y C</div>
            <p className="text-[11px] text-slate-400 mt-1">Uso Final Industrial y Comercial (227 ítems)</p>
          </Link>

          {/* 11. ACP-SDE-BCI */}
          <Link href="/acp-sde-bci" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-violet-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-violet-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">ACP · SDE · BCI</div>
            <p className="text-[11px] text-slate-400 mt-1">Alta Conc. Personas / Emergencia / Incendios (85 ítems)</p>
          </Link>

          {/* 12. APANTALLAMIENTO */}
          <Link href="/apantallamiento" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-yellow-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-yellow-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌩️</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">APANTALLAMIENTO</div>
            <p className="text-[11px] text-slate-400 mt-1">Lista de Chequeo Apantallamiento</p>
          </Link>

          {/* 13. PISCINAS */}
          <Link href="/piscinas" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-400 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-blue-400">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏊</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">PISCINAS</div>
            <p className="text-[11px] text-slate-400 mt-1">Inspección de Piscinas y Sistemas Acuáticos</p>
          </Link>

          {/* 14. ASCENSORES */}
          <Link href="/ascensores" className="block p-5 bg-slate-800 border border-slate-700 rounded-xl hover:border-rose-500 hover:bg-slate-750 transition-all text-center shadow-md group border-l-4 border-l-rose-500">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛗</div>
            <div className="text-sm font-bold text-white uppercase tracking-wider">ASCENSORES</div>
            <p className="text-[11px] text-slate-400 mt-1">Lista de Chequeo Ascensores</p>
          </Link>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 space-y-1">
          <p>🔒 Sistema preparado para trabajo de campo sin conexión (Offline-First via IndexedDB)</p>
          <p>📁 Cumple 100% con los formatos normalizados ONAC y la reglamentación RETIE vigente</p>
        </div>
      </div>
    </div>
  );
}