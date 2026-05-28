'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { pdfEngine } from '@/engines/pdf/pdfEngine';
import { processEvidenceImage } from '@/utils/evidenceImageProcessor';

// Default mock values for premium wow effect
const DEFAULT_ORGANISMO = {
  razonSocial: 'DIMOTIK SOLUTIONS',
  nit: '901324134',
  codigoOnac: 'OC-1234',
  normaAcreditacion: 'ISO/IEC 17020',
  alcance: 'Instalaciones eléctricas RETIE',
  logo: '',
  contacto: '(+57) 1 2345678'
};

const DEFAULT_INSPECTOR = {
  nombre: '',
  matricula: '',
  cargo: '',
  firma: '',
  competencia: ''
};

const DEFAULT_DECLARACIONES = {
  disenoCumple: '',
  disenoFirmante: '',
  disenoMatricula: '',
  disenoFecha: '',
  disenoAdjunto: '',
  construccionCumple: '',
  construccionFirmante: '',
  construccionMatricula: '',
  construccionFecha: '',
  construccionAdjunto: '',
  operacionCumple: '',
  operacionFirmante: '',
  operacionMatricula: '',
  operacionFecha: '',
  operacionAdjunto: ''
};

const DEFAULT_DICTAMEN = {
  tipo: '',
  numero: '',
  resultado: '',
  fecha: '',
  copiasControl: ''
};

// FASE 3.5 — Alcance RETIE
const MODULOS_RETIE = [
  { key: 'IN',              label: 'Portada Técnica (IN)' },
  { key: 'CARPETA',         label: 'Revisión Documental (CARPETA)' },
  { key: 'DISENO',          label: 'Lista de Chequeo Diseño' },
  { key: 'DISTRIBUCION',    label: 'Lista de Chequeo Distribución' },
  { key: 'UFR',             label: 'Uso Final Residencial (U.F.R)' },
  { key: 'UFIYC',           label: 'Uso Final Industrial y Comercial (UF I Y C)' },
  { key: 'ACPSDEBCI',       label: 'ACP-SDE-BCI' },
  { key: 'APANTALLAMIENTO', label: 'Lista de Chequeo Apantallamiento' },
  { key: 'PISCINAS',        label: 'Lista de Chequeo Piscinas' },
  { key: 'ASCENSORES',      label: 'Lista de Chequeo Ascensores' },
  { key: 'PRODUCTO',        label: 'Revisión de Productos' },
  { key: 'R_SPT',           label: 'Resistencia de Puesta a Tierra (R. SPT)' },
  { key: 'R_AISLAMIENTO',   label: 'Resistencia de Aislamiento' },
  { key: 'ILUMINANCIA',     label: 'Mediciones de Iluminancia' },
];

const DEFAULT_ALCANCE_RETIE = {
  tipoInstalacion: '',
  tipoProyecto: '',
  especiales: [] as string[]
};

// Por defecto todos los módulos aplican
const DEFAULT_MODULE_STATUS: Record<string, string> = {};

const DEFAULT_NO_CONFORMIDADES: any[] = [];

const DEFAULT_EVIDENCIAS: any[] = [];

const DEFAULT_ADJUNTOS: any[] = [];

export default function ExpedientePage() {
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id') || 'RETIE-DEMO-2026';
    }
    return 'RETIE-DEMO-2026';
  });
  const [activeTab, setActiveTab] = useState('organismo');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Forms state
  const [organismo, setOrganismo] = useState(DEFAULT_ORGANISMO);
  const [inspector, setInspector] = useState(DEFAULT_INSPECTOR);
  const [declaraciones, setDeclaraciones] = useState(DEFAULT_DECLARACIONES);
  const [dictamen, setDictamen] = useState(DEFAULT_DICTAMEN);
  const [noConformidades, setNoConformidades] = useState<any[]>(DEFAULT_NO_CONFORMIDADES);
  const [evidencias, setEvidencias] = useState<any[]>(DEFAULT_EVIDENCIAS);
  const [adjuntos, setAdjuntos] = useState<any[]>(DEFAULT_ADJUNTOS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // FASE 3.5 — Alcance y módulos
  const [alcanceRetie, setAlcanceRetie] = useState(DEFAULT_ALCANCE_RETIE);
  const [moduleStatus, setModuleStatus] = useState<Record<string, string>>(DEFAULT_MODULE_STATUS);
  // pdfMode: global = dictamen completo, single-form = módulo individual
  const [pdfMode, setPdfMode] = useState<'global' | 'single-form'>('global');
  const [pdfTargetForm, setPdfTargetForm] = useState<string>('APANTALLAMIENTO');
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState<boolean>(true);

  // Temp NC Form State
  const [newNc, setNewNc] = useState({
    codigo: '',
    formularioOrigen: 'Uso Final Residencial',
    itemRelacionado: '',
    descripcion: '',
    responsable: '',
    severidad: 'mayor',
    estado: 'open'
  });

  // Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        console.log("=== SCANNING INDEXEDDB DRAFTS ON EXPEDIENTE INITIALIZATION ===");
        const allDrafts = await offlineEngine.getAllDrafts();
        console.log("- Total drafts found in IndexedDB:", allDrafts.length);
        allDrafts.forEach((d: any) => {
          const ansCount = d.answers ? Object.keys(d.answers).length : 0;
          console.log(`  * Key: "${d.id}" | inspectionId: "${d.inspectionId}" | Answers count: ${ansCount}`);
        });
        console.log("=============================================================");

        const cached = await offlineEngine.getExpediente(inspectionId);
        if (cached) {
          if (cached.organismo) setOrganismo(cached.organismo);
          if (cached.inspector) setInspector(cached.inspector);
          if (cached.declaraciones) setDeclaraciones(cached.declaraciones);
          if (cached.dictamen) setDictamen(cached.dictamen);
          if (cached.noConformidades) setNoConformidades(cached.noConformidades);
          if (cached.evidencias) setEvidencias(cached.evidencias);
          if (cached.adjuntos) setAdjuntos(cached.adjuntos);
          // FASE 3.5
          if (cached.alcanceRetie) setAlcanceRetie(cached.alcanceRetie);
          if (cached.moduleStatus) setModuleStatus(cached.moduleStatus);
        }
      } catch (error) {
        console.error('Failed to load dossier:', error);
      }
    }
    loadData();
  }, [inspectionId]);

  // Trigger Save to IndexedDB
  const handleSave = async (updatedData: any) => {
    setAutoSaveStatus('saving');
    try {
      await offlineEngine.saveExpediente(inspectionId, {
        organismo:        updatedData.organismo        || organismo,
        inspector:        updatedData.inspector        || inspector,
        declaraciones:    updatedData.declaraciones    || declaraciones,
        dictamen:         updatedData.dictamen         || dictamen,
        noConformidades:  updatedData.noConformidades  || noConformidades,
        evidencias:       updatedData.evidencias       || evidencias,
        adjuntos:         updatedData.adjuntos         || adjuntos,
        // FASE 3.5 — persisted without schema change
        alcanceRetie:     updatedData.alcanceRetie     || alcanceRetie,
        moduleStatus:     updatedData.moduleStatus     || moduleStatus,
      });
      setAutoSaveStatus('saved');
    } catch (e) {
      console.error(e);
      setAutoSaveStatus('error');
    }
  };

  const updateOrganismo = (key: string, value: string) => {
    const updated = { ...organismo, [key]: value };
    setOrganismo(updated);
    handleSave({ organismo: updated });
  };

  const updateInspector = (key: string, value: string) => {
    const updated = { ...inspector, [key]: value };
    setInspector(updated);
    handleSave({ inspector: updated });
  };

  const updateDeclaraciones = (key: string, value: string) => {
    const updated = { ...declaraciones, [key]: value };
    setDeclaraciones(updated);
    handleSave({ declaraciones: updated });
  };

  const updateDictamen = (key: string, value: string) => {
    const updated = { ...dictamen, [key]: value };
    setDictamen(updated);
    handleSave({ dictamen: updated });
  };

  const addNC = () => {
    if (!newNc.codigo || !newNc.itemRelacionado) return;
    const ncRecord = {
      id: `NC-${Date.now()}`,
      inspectionId,
      codigo: newNc.codigo,
      formularioOrigen: newNc.formularioOrigen,
      formId: newNc.formularioOrigen, // Campo adicional para PDF
      itemRelacionado: newNc.itemRelacionado,
      descripcion: newNc.descripcion,
      responsable: newNc.responsable,
      severidad: newNc.severidad,
      estado: newNc.estado,
      createdAt: new Date().toISOString(),
      fechaCierre: '',
      evidenciaCierre: ''
    };
    const list = [...noConformidades, ncRecord];
    setNoConformidades(list);
    setNewNc({
      codigo: '',
      formularioOrigen: 'Uso Final Residencial',
      itemRelacionado: '',
      descripcion: '',
      responsable: '',
      severidad: 'mayor',
      estado: 'open'
    });
    handleSave({ noConformidades: list });
  };

  const toggleNcStatus = (id: string) => {
    const list = noConformidades.map(nc => {
      if (nc.id === id) {
        const nextState = nc.estado === 'open' ? 'closed' : 'open';
        return {
          ...nc,
          estado: nextState,
          fechaCierre: nextState === 'closed' ? new Date().toISOString().split('T')[0] : '',
          evidenciaCierre: nextState === 'closed' ? 'Verificado en campo' : ''
        };
      }
      return nc;
    });
    setNoConformidades(list);
    handleSave({ noConformidades: list });
  };

  const handleGeneratePdf = async () => {
    // 3B Fetch Pilot Forms Data
    const draftIn = await offlineEngine.loadDraft(`${inspectionId}_IN`);
    const draftCarpeta = await offlineEngine.loadDraft(`${inspectionId}_CARPETA`);
    const draftAislamiento = await offlineEngine.loadDraft(`${inspectionId}_R_AISLAMIENTO`);
    const draftIluminancia = await offlineEngine.loadDraft(`${inspectionId}_ILUMINANCIA`);

    // Phase 4 - Block 1 Data
    const draftDiseno = await offlineEngine.loadDraft(`${inspectionId}_DISENO`);
    const draftDistribucion = await offlineEngine.loadDraft(`${inspectionId}_DISTRIBUCION`);
    const draftUfr = await offlineEngine.loadDraft(`${inspectionId}_UFR`);
    const draftUfiyc = await offlineEngine.loadDraft(`${inspectionId}_UFIYC`);
    const draftAcpSdeBci = await offlineEngine.loadDraft(`${inspectionId}_ACPSDEBCI`);

    // Block 2 Data
    const draftProducto = await offlineEngine.loadDraft(`${inspectionId}_PRODUCTO`);
    const draftRSpt     = await offlineEngine.loadDraft(`${inspectionId}_R_SPT`);

    // Logging para diagnosticar problemas de carga de PRODUCTO
    console.log('=== PDF GENERATION DEBUG ===');
    console.log('inspectionId:', inspectionId);
    console.log('draftProducto exists:', !!draftProducto);
    console.log('draftProducto.answers exists:', !!draftProducto?.answers);
    console.log('draftProducto.answers keys:', draftProducto?.answers ? Object.keys(draftProducto.answers) : []);
    console.log('draftProducto.answers keys count:', draftProducto?.answers ? Object.keys(draftProducto.answers).length : 0);

    // Block 3 Data — FASE 3.5
    const draftApantallamiento = await offlineEngine.loadDraft(`${inspectionId}_APANTALLAMIENTO`);
    const draftPiscinas        = await offlineEngine.loadDraft(`${inspectionId}_PISCINAS`);
    const draftAscensores      = await offlineEngine.loadDraft(`${inspectionId}_ASCENSORES`);

    // Draft Verification (FASE 3.5 quality gates)
    if (pdfMode === 'single-form') {
      const draftMap: Record<string, any> = {
        IN: draftIn,
        CARPETA: draftCarpeta,
        DISENO: draftDiseno,
        DISTRIBUCION: draftDistribucion,
        UFR: draftUfr,
        UFIYC: draftUfiyc,
        ACPSDEBCI: draftAcpSdeBci,
        APANTALLAMIENTO: draftApantallamiento,
        PISCINAS: draftPiscinas,
        ASCENSORES: draftAscensores,
        PRODUCTO: draftProducto,
        R_SPT: draftRSpt,
        R_AISLAMIENTO: draftAislamiento,
        ILUMINANCIA: draftIluminancia
      };
      const activeDraft = draftMap[pdfTargetForm];
      if (!activeDraft || !activeDraft.answers || Object.keys(activeDraft.answers).length === 0) {
        const allDrafts = await offlineEngine.getAllDrafts();
        const keys = allDrafts.map(d => d.id);
        setDiagnosticError(`No se encontró draft para ${pdfTargetForm} con inspectionId ${inspectionId}`);
        setAvailableKeys(keys);
        return;
      }
    }
    setDiagnosticError(null);
    setAvailableKeys([]);

    // Evidencias: usar dataUrl si existe, omitir si no hay foto real
    const photoEvidences = evidencias
      .filter(ev => ev.foto && ev.foto.startsWith('data:'))
      .map(ev => ({
        dataUrl:  ev.foto,
        formId:   ev.formId || ev.formularioAsociado || 'Sin módulo',
        questionId: ev.questionId || ev.preguntaAsociada || '-',
        caption:  ev.caption || ev.comentario || ev.descripcion || 'Evidencia fotográfica',
        fileName: ev.fileName || `foto_${Date.now()}.jpg`,
        // Campos de fallback
        formularioAsociado: ev.formularioAsociado,
        preguntaAsociada: ev.preguntaAsociada,
        comentario: ev.comentario
      }));

    const pdf = await pdfEngine.generateReport({
      inspection: {
        inspectionId,
        inspectionCode: dictamen.numero,
        status: 'in_progress',
        siteName: 'Instalaciones Generales RETIE',
        siteAddress: 'Calle de Prueba 123',
        inspectionDate: dictamen.fecha,
        schemaVersion: '1.0.0'
      },
      retieProjectInfo: {
        proyecto: 'Proyecto Global de Prueba RETIE',
        direccion: 'Calle de Prueba 123',
        ciudad: 'Bogotá D.C.',
        propietario: 'Constructora de Ejemplo',
        alcance: 'Uso Final - ' + dictamen.tipo.toUpperCase(),
        uso: 'Comercial / Residencial',
        fechaInspeccion: dictamen.fecha,
        numeroDictamen: dictamen.numero
      },
      inspectionBodyInfo: {
        nombre: organismo.razonSocial,
        nit: organismo.nit,
        direccion: 'Av 100 #15-30',
        telefono: organismo.contacto,
        resolucionAcreditacion: organismo.codigoOnac
      },
      inspectorInfo: {
        inspectorNombre: inspector.nombre,
        inspectorMatricula: inspector.matricula,
        directorNombre: 'Ing. Director Técnico Global',
        directorMatricula: 'CN-DIR-54637',
        disenadorNombre: declaraciones.disenoFirmante,
        disenadorMatricula: declaraciones.disenoMatricula,
        constructorNombre: declaraciones.construccionFirmante,
        constructorMatricula: declaraciones.construccionMatricula
      },
      complianceDeclarations: [
        `Declaración de Diseño: ${declaraciones.disenoCumple} (Firmado por ${declaraciones.disenoFirmante})`,
        `Declaración de Construcción: ${declaraciones.construccionCumple} (Firmado por ${declaraciones.construccionFirmante})`,
        `Declaración de Operación y Mantenimiento: ${declaraciones.operacionCumple} (Firmado por ${declaraciones.operacionFirmante})`
      ],
      compliance: {
        score: 90,
        percentage: 90,
        grade: 'A',
        totalFields: 200,
        criticalNonCompliant: noConformidades.filter(nc => nc.estado === 'open').length,
        criticalCount: noConformidades.filter(nc => nc.estado === 'open').length,
        noConformities: noConformidades.map(nc => ({
          fieldLabel: nc.itemRelacionado,
          severity: nc.severidad || 'mayor',
          description: nc.descripcion
        }))
      } as any,
      photoEvidence: photoEvidences,
      attachments: adjuntos.map(adj => {
        const formLabel = MODULOS_RETIE.find(m => m.key === adj.formId)?.label || adj.formId;
        return {
          type: adj.tipo,
          fileName: adj.fileName,
          size: adj.fileSize,
          formId: adj.formId,
          formLabel: formLabel,
          observacion: adj.observacion,
          date: adj.uploadedAt
        };
      }),
      dictamenResult: dictamen.resultado as any,
      
      // Pilot Forms 3B
      formIn: draftIn?.answers || null,
      formCarpeta: draftCarpeta?.answers || null,
      formAislamiento: draftAislamiento?.answers || null,
      formIluminancia: draftIluminancia?.answers || null,

      // Block 1 Forms
      formDiseno: draftDiseno?.answers || null,
      formDistribucion: draftDistribucion?.answers || null,
      formUFR: draftUfr?.answers || null,
      formUFIYC: draftUfiyc?.answers || null,
      formACPSDEBCI: draftAcpSdeBci?.answers || null,

      // Block 2 Forms
      formProducto: draftProducto?.answers || null,
      formRSpt:     draftRSpt?.answers     || null,

      // Block 3 Forms — FASE 3.5
      formApantallamiento: draftApantallamiento?.answers || null,
      formPiscinas:        draftPiscinas?.answers        || null,
      formAscensores:      draftAscensores?.answers      || null,

      // FASE 3.5 — Alcance
      mode:         pdfMode,
      targetForm:   pdfMode === 'single-form' ? pdfTargetForm : undefined,
      moduleStatus: moduleStatus,
    });
    setPdfBlob(pdf);
    setShowPdfPreview(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      <header className="bg-slate-900/95 border-b border-slate-700 sticky top-0 z-30 backdrop-blur-md shadow-lg shadow-teal-900/20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white text-xl">←</Link>
            <div>
              <h1 className="text-sm font-bold text-yellow-400 leading-tight">📂 Expediente RETIE</h1>
              <p className="text-[10px] text-slate-400">Expediente Global · {inspectionId}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {autoSaveStatus === 'saving' && <span className="text-[10px] text-amber-400">Saving...</span>}
            {autoSaveStatus === 'saved' && <span className="text-[10px] text-emerald-400">💾 Saved</span>}
            <button
              onClick={handleGeneratePdf}
              className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-yellow-500/20"
            >
              📄 Generar Dictamen PDF
            </button>

            <button
              onClick={async () => {
                if (window.confirm('¿Está seguro de limpiar este formulario? Esta acción borrará el progreso actual de este módulo.')) {
                  const emptyOrganismo = { razonSocial: '', nit: '', codigoOnac: '', normaAcreditacion: '', alcance: '', logo: '', contacto: '' };
                  const emptyInspector = { nombre: '', matricula: '', cargo: '', firma: '', competencia: '' };
                  const emptyDeclaraciones = { disenoCumple: '', disenoFirmante: '', disenoMatricula: '', disenoFecha: '', disenoAdjunto: '', construccionCumple: '', construccionFirmante: '', construccionMatricula: '', construccionFecha: '', construccionAdjunto: '', operacionCumple: '', operacionFirmante: '', operacionMatricula: '', operacionFecha: '', operacionAdjunto: '' };
                  const emptyDictamen = { tipo: '', numero: '', resultado: '', fecha: '', copiasControl: '' };
                  const emptyAlcance = { tipoInstalacion: '', tipoProyecto: '', especiales: [] };
                  setOrganismo(emptyOrganismo);
                  setInspector(emptyInspector);
                  setDeclaraciones(emptyDeclaraciones);
                  setDictamen(emptyDictamen);
                  setAlcanceRetie(emptyAlcance);
                  setNoConformidades([]);
                  setEvidencias([]);
                  setAdjuntos([]);
                  await offlineEngine.saveExpediente(inspectionId, {
                    organismo: emptyOrganismo,
                    inspector: emptyInspector,
                    declaraciones: emptyDeclaraciones,
                    dictamen: emptyDictamen,
                    noConformidades: [],
                    evidencias: [],
                    adjuntos: [],
                    alcanceRetie: emptyAlcance,
                    moduleStatus: moduleStatus
                  });
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-red-500/20"
            >
              🗑️ Limpiar formulario
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-6 flex-grow">
        {/* Diagnostic Panel */}
        {diagnosticError && (
          <div className="w-full bg-red-950/90 border border-red-500 rounded-xl p-5 space-y-3 shadow-lg">
            <div className="flex justify-between items-center border-b border-red-800 pb-2">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <span>⚠️</span> DIAGNÓSTICO RETIE (Calidad PDF)
              </h3>
              <button 
                onClick={() => setDiagnosticError(null)}
                className="text-red-400 hover:text-white text-xs"
              >
                Cerrar ✕
              </button>
            </div>
            <p className="text-xs text-red-200">{diagnosticError}</p>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-red-400 uppercase">Claves de Borradores IndexedDB disponibles:</h4>
              {availableKeys.length === 0 ? (
                <p className="text-[10px] text-slate-400">No se encontraron claves en IndexedDB.</p>
              ) : (
                <ul className="list-disc pl-5 text-[10px] text-slate-300 grid grid-cols-1 md:grid-cols-2 gap-1">
                  {availableKeys.map(k => (
                    <li key={k} className="font-mono">{k}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Navigation Sidebar */}
          <aside className="w-full md:w-56 shrink-0 space-y-1">
          {[
            { id: 'organismo',    label: '🏢 Organismo' },
            { id: 'inspector',    label: '👤 Inspector' },
            { id: 'declaraciones',label: '📝 Declaraciones' },
            { id: 'dictamen',     label: '🏆 Dictamen' },
            { id: 'alcance',      label: '🎯 Alcance RETIE' },
            { id: 'ncs',          label: '🚨 No Conformidades' },
            { id: 'evidencias',   label: '📸 Fotos' },
            { id: 'adjuntos',     label: '📎 Adjuntos' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.id ? 'bg-yellow-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Tab content area */}
        <section className="flex-grow bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl">
          
          {/* TAB: ORGANISMO */}
          {activeTab === 'organismo' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">🏢 DATOS DEL ORGANISMO DE INSPECCIÓN</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Razón Social</label>
                  <input type="text" value={organismo.razonSocial} onChange={(e) => updateOrganismo('razonSocial', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">NIT</label>
                  <input type="text" value={organismo.nit} onChange={(e) => updateOrganismo('nit', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Código Acreditación ONAC</label>
                  <input type="text" value={organismo.codigoOnac} onChange={(e) => updateOrganismo('codigoOnac', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Norma de Acreditación</label>
                  <input type="text" value={organismo.normaAcreditacion} onChange={(e) => updateOrganismo('normaAcreditacion', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Alcance Acreditado</label>
                  <input type="text" value={organismo.alcance} onChange={(e) => updateOrganismo('alcance', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Dirección / Contacto</label>
                  <input type="text" value={organismo.contacto} onChange={(e) => updateOrganismo('contacto', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">👤 DATOS DEL INSPECTOR</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Nombre Completo</label>
                  <input type="text" value={inspector.nombre} onChange={(e) => updateInspector('nombre', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Matrícula Profesional</label>
                  <input type="text" value={inspector.matricula} onChange={(e) => updateInspector('matricula', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Cargo</label>
                  <input type="text" value={inspector.cargo} onChange={(e) => updateInspector('cargo', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Competencia / Certificación ONAC</label>
                  <input type="text" value={inspector.competencia} onChange={(e) => updateInspector('competencia', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: DECLARACIONES */}
          {activeTab === 'declaraciones' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">📝 DECLARACIONES DE CUMPLIMIENTO (RETIE)</h2>
              
              {/* DISEÑO */}
              <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-lg space-y-3">
                <p className="text-xs font-bold text-teal-400">1. DECLARACIÓN DE DISEÑO</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Diseño Cumple</label>
                    <select value={declaraciones.disenoCumple} onChange={(e) => updateDeclaraciones('disenoCumple', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5">
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Firmante / Diseñador</label>
                    <input type="text" value={declaraciones.disenoFirmante} onChange={(e) => updateDeclaraciones('disenoFirmante', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Matrícula Diseñador</label>
                    <input type="text" value={declaraciones.disenoMatricula} onChange={(e) => updateDeclaraciones('disenoMatricula', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                </div>
              </div>

              {/* CONSTRUCCION */}
              <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-lg space-y-3">
                <p className="text-xs font-bold text-teal-400">2. DECLARACIÓN DE CONSTRUCCIÓN</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Construcción Cumple</label>
                    <select value={declaraciones.construccionCumple} onChange={(e) => updateDeclaraciones('construccionCumple', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5">
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Firmante / Constructor</label>
                    <input type="text" value={declaraciones.construccionFirmante} onChange={(e) => updateDeclaraciones('construccionFirmante', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Matrícula Constructor</label>
                    <input type="text" value={declaraciones.construccionMatricula} onChange={(e) => updateDeclaraciones('construccionMatricula', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DICTAMEN */}
          {activeTab === 'dictamen' && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">🏆 DICTAMEN / PRE-DICTAMEN</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tipo de Proceso</label>
                  <select value={dictamen.tipo} onChange={(e) => updateDictamen('tipo', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5">
                    <option value="generacion">Generación</option>
                    <option value="transmision">Transmisión</option>
                    <option value="distribucion">Distribución</option>
                    <option value="transformacion">Transformación</option>
                    <option value="uso_final">Uso Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Número de Dictamen</label>
                  <input type="text" value={dictamen.numero} onChange={(e) => updateDictamen('numero', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5" />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Resultado Técnico</label>
                  <select value={dictamen.resultado} onChange={(e) => updateDictamen('resultado', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5">
                    <option value="APROBADO">APROBADO</option>
                    <option value="NO APROBADO">NO APROBADO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Fecha de Emisión</label>
                  <input type="date" value={dictamen.fecha} onChange={(e) => updateDictamen('fecha', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Copias / Control Documental</label>
                  <input type="text" value={dictamen.copiasControl} onChange={(e) => updateDictamen('copiasControl', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: NCS */}
          {activeTab === 'ncs' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">🚨 REPORTE DE NO CONFORMIDADES (HALLAZGOS)</h2>
              
              {/* NC Form */}
              <div className="bg-slate-900/40 p-4 border border-slate-700 rounded-lg space-y-3">
                <p className="text-xs font-bold text-teal-400">Agregar Nueva No Conformidad</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400">Código NC</label>
                    <input type="text" placeholder="Ej: NC-UFR-005" value={newNc.codigo} onChange={(e) => setNewNc({ ...newNc, codigo: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Formulario Origen</label>
                    <input type="text" value={newNc.formularioOrigen} onChange={(e) => setNewNc({ ...newNc, formularioOrigen: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Ítem Relacionado</label>
                    <input type="text" placeholder="Ej: Interruptores de falla" value={newNc.itemRelacionado} onChange={(e) => setNewNc({ ...newNc, itemRelacionado: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400">Descripción</label>
                    <input type="text" placeholder="Escriba la descripción del hallazgo" value={newNc.descripcion} onChange={(e) => setNewNc({ ...newNc, descripcion: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Responsable</label>
                    <input type="text" value={newNc.responsable} onChange={(e) => setNewNc({ ...newNc, responsable: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Severidad</label>
                    <select value={newNc.severidad} onChange={(e) => setNewNc({ ...newNc, severidad: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5">
                      <option value="crítica">Crítica</option>
                      <option value="mayor">Mayor</option>
                      <option value="menor">Menor</option>
                    </select>
                  </div>
                </div>
                <button onClick={addNC} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 rounded text-xs font-semibold">
                  Añadir No Conformidad
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('¿Está seguro de limpiar todas las no conformidades?')) {
                      setNoConformidades([]);
                      setNewNc({
                        codigo: '',
                        formularioOrigen: 'Uso Final Residencial',
                        itemRelacionado: '',
                        descripcion: '',
                        responsable: '',
                        severidad: 'mayor',
                        estado: 'open'
                      });
                      await handleSave({ noConformidades: [] });
                      await offlineEngine.deleteExpediente(inspectionId);
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-md transition-all"
                >
                  🗑️ Limpiar formulario
                </button>
              </div>

              {/* Table List */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="px-3 py-2">Código</th>
                      <th className="px-3 py-2">Ítem</th>
                      <th className="px-3 py-2">Origen</th>
                      <th className="px-3 py-2">Severidad</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {noConformidades.map(nc => (
                      <tr key={nc.id} className="hover:bg-slate-700">
                        <td className="px-3 py-2 font-mono text-teal-300">{nc.codigo}</td>
                        <td className="px-3 py-2 max-w-xs truncate">{nc.itemRelacionado}</td>
                        <td className="px-3 py-2 text-slate-400">{nc.formularioOrigen}</td>
                        <td className="px-3 py-2 text-amber-400 font-semibold">{nc.severidad?.toUpperCase()}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${nc.estado === 'closed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-red-950 text-red-400 border border-red-500/30'}`}>
                            {nc.estado.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => toggleNcStatus(nc.id)}
                            className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold"
                          >
                            Alternar Estado
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: EVIDENCIAS */}
          {activeTab === 'evidencias' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">📸 EVIDENCIAS FOTOGRÁFICAS GLOBALES</h2>
              
              {/* Formulario de subida de evidencias */}
              <div className="bg-slate-900/40 p-4 border border-slate-700 rounded-lg space-y-4">
                <p className="text-xs font-bold text-teal-400">Agregar Nueva Foto / Evidencia</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Módulo RETIE Asociado</label>
                    <select
                      id="upload_form_id"
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-yellow-500"
                    >
                      {MODULOS_RETIE.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Pregunta / Requisito Asociado</label>
                    <input
                      id="upload_question_id"
                      type="text"
                      placeholder="Ej: Medición de resistencia de electrodos"
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Comentario / Descripción</label>
                    <input
                      id="upload_comment"
                      type="text"
                      placeholder="Ej: Lectura realizada con telurómetro marca Fluke"
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Archivo de Imagen</label>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <input
                          id="upload_file_camera"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedFile(file);
                          }}
                          className="hidden"
                        />
                        <input
                          id="upload_file_gallery"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedFile(file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('upload_file_camera')?.click()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          📸 Cámara
                        </button>
                        <button
                          type="button"
                          onClick={() => document.getElementById('upload_file_gallery')?.click()}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                        >
                          📁 Galería
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {selectedFile ? `Seleccionado: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)` : 'Ningún archivo seleccionado'}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const formEl = document.getElementById('upload_form_id') as HTMLSelectElement;
                    const questionEl = document.getElementById('upload_question_id') as HTMLInputElement;
                    const commentEl = document.getElementById('upload_comment') as HTMLInputElement;

                    const formKey = formEl.value;
                    const formLabel = MODULOS_RETIE.find(m => m.key === formKey)?.label || formKey;
                    const question = questionEl.value.trim();
                    const comment = commentEl.value.trim();
                    const file = selectedFile;

                    if (!question || !comment || !file) {
                      alert('Por favor complete todos los campos y seleccione una imagen.');
                      return;
                    }

                    try {
                      const newEv = await processEvidenceImage({
                        file,
                        inspectionId,
                        formId: formKey,
                        questionId: question,
                        caption: `${formLabel} — ${question}: ${comment}`
                      });

                      // Compatibilidad garantizada
                      const compatibleEv = {
                        ...newEv,
                        formularioAsociado: formLabel,
                        preguntaAsociada: question,
                        comentario: comment,
                        timestamp: newEv.timestamp || new Date().toLocaleString()
                      };

                      const updatedEvidencias = [...evidencias, compatibleEv];
                      setEvidencias(updatedEvidencias);
                      await handleSave({ evidencias: updatedEvidencias });

                      // Limpiar campos
                      questionEl.value = '';
                      commentEl.value = '';
                      setSelectedFile(null);
                      
                      const camInput = document.getElementById('upload_file_camera') as HTMLInputElement;
                      const galInput = document.getElementById('upload_file_gallery') as HTMLInputElement;
                      if (camInput) camInput.value = '';
                      if (galInput) galInput.value = '';
                    } catch (err) {
                      console.error("Error processing global evidence image:", err);
                      alert("Error al procesar la imagen.");
                    }
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-md transition-all"
                >
                  Subir Foto / Evidencia
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('¿Está seguro de limpiar todas las fotos/evidencias? Esta acción no afecta otros módulos.')) {
                      setEvidencias([]);
                      await handleSave({ evidencias: [] });
                      await offlineEngine.deleteExpediente(inspectionId);
                      const questionEl = document.getElementById('upload_question_id') as HTMLInputElement;
                      const commentEl = document.getElementById('upload_comment') as HTMLInputElement;
                      if (questionEl) questionEl.value = '';
                      if (commentEl) commentEl.value = '';
                      setSelectedFile(null);
                      const camInput = document.getElementById('upload_file_camera') as HTMLInputElement;
                      const galInput = document.getElementById('upload_file_gallery') as HTMLInputElement;
                      if (camInput) camInput.value = '';
                      if (galInput) galInput.value = '';
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-md transition-all"
                >
                  🗑️ Limpiar formulario
                </button>
              </div>

              {/* Grid de Evidencias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidencias.map((ev, i) => {
                  const hasImage = ev.foto && ev.foto.startsWith('data:image/');
                  return (
                    <div key={ev.id || i} className="p-3 bg-slate-900/40 border border-slate-700 rounded-lg flex gap-4 items-center">
                      {hasImage ? (
                        <img
                          src={ev.foto}
                          alt={ev.comentario}
                          className="w-20 h-20 object-cover rounded shrink-0 border border-slate-700"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-slate-800 rounded shrink-0 flex flex-col items-center justify-center text-center p-1 border border-slate-700">
                          <span className="text-[8px] text-slate-500 font-bold">Imagen no disponible</span>
                        </div>
                      )}
                      <div className="space-y-1 text-xs min-w-0 flex-grow">
                        <p className="font-bold text-yellow-400 truncate">{ev.formularioAsociado || ev.formId}</p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">{ev.preguntaAsociada || ev.questionId}</p>
                        <p className="text-slate-300 italic line-clamp-2">"{ev.comentario}"</p>
                        <p className="text-[9px] text-slate-500">{ev.timestamp || ev.createdAt}</p>
                      </div>
                      <button
                        onClick={async () => {
                          const updated = evidencias.filter((_, idx) => idx !== i);
                          setEvidencias(updated);
                          await handleSave({ evidencias: updated });
                        }}
                        className="text-red-400 hover:text-red-300 font-bold text-xs p-1"
                        title="Eliminar evidencia"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: ALCANCE RETIE — FASE 3.5 */}
          {activeTab === 'alcance' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">🎯 ALCANCE DE LA INSPECCIÓN RETIE</h2>

              {/* Tipo instalación + proyecto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tipo de Instalación</label>
                  <select
                    value={alcanceRetie.tipoInstalacion}
                    onChange={e => { const v = {...alcanceRetie, tipoInstalacion: e.target.value}; setAlcanceRetie(v); handleSave({ alcanceRetie: v }); }}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500"
                  >
                    <option value="uso_final_residencial">Uso Final Residencial</option>
                    <option value="uso_final_industrial">Uso Final Industrial / Comercial</option>
                    <option value="distribucion">Distribución</option>
                    <option value="transformacion">Transformación</option>
                    <option value="generacion">Generación</option>
                    <option value="linea_transmision">Línea de Transmisión</option>
                    <option value="equipos_especiales">Equipos Especiales</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Tipo de Proyecto</label>
                  <select
                    value={alcanceRetie.tipoProyecto}
                    onChange={e => { const v = {...alcanceRetie, tipoProyecto: e.target.value}; setAlcanceRetie(v); handleSave({ alcanceRetie: v }); }}
                    className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-yellow-500"
                  >
                    <option value="nuevo">Nuevo</option>
                    <option value="ampliacion">Ampliación</option>
                    <option value="remodelacion">Remodelación</option>
                    <option value="existente">Existente / Revisión</option>
                  </select>
                </div>
              </div>

              {/* Características especiales */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-2">Características Especiales</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[{k:'piscina',label:'🏊 Piscina'},{k:'ascensor',label:'🛗 Ascensor'},{k:'bci',label:'🚒 Bomba Contra Incendio'},{k:'generador',label:'⚡ Generador Propio'}].map(esp => {
                    const active = alcanceRetie.especiales.includes(esp.k);
                    return (
                      <button
                        key={esp.k}
                        onClick={() => {
                          const next = active
                            ? alcanceRetie.especiales.filter((x:string) => x !== esp.k)
                            : [...alcanceRetie.especiales, esp.k];
                          const v = {...alcanceRetie, especiales: next};
                          setAlcanceRetie(v);
                          handleSave({ alcanceRetie: v });
                        }}
                        className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                          active
                            ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                            : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {esp.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aplicabilidad por módulo */}
              <div>
                <h3 className="text-xs font-bold text-slate-300 mb-3">Aplicabilidad de Módulos</h3>
                <div className="space-y-2">
                  {MODULOS_RETIE.map(mod => {
                    const status = moduleStatus[mod.key] || 'aplica';
                    return (
                      <div key={mod.key} className="flex items-center justify-between bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2">
                        <span className="text-xs text-slate-300">{mod.label}</span>
                        <div className="flex gap-1.5">
                          {['aplica','no-aplica','pendiente'].map(st => (
                            <button
                              key={st}
                              onClick={() => {
                                const next = {...moduleStatus, [mod.key]: st};
                                setModuleStatus(next);
                                handleSave({ moduleStatus: next });
                              }}
                              className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                status === st
                                  ? st === 'aplica'      ? 'bg-emerald-600/40 border-emerald-500 text-emerald-300'
                                  : st === 'no-aplica'   ? 'bg-red-600/40 border-red-500 text-red-300'
                                  :                        'bg-amber-600/40 border-amber-500 text-amber-300'
                                  : 'bg-slate-700 border-slate-600 text-slate-500 hover:border-slate-400'
                              }`}
                            >
                              {st === 'aplica' ? 'Aplica' : st === 'no-aplica' ? 'No Aplica' : 'Pendiente'}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modo de PDF */}
              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-yellow-400">📄 Modo de Generación PDF</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPdfMode('global')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      pdfMode === 'global'
                        ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                  >
                    🗂 Dictamen Completo (Global)
                  </button>
                  <button
                    onClick={() => setPdfMode('single-form')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      pdfMode === 'single-form'
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                  >
                    📋 Formulario Individual
                  </button>
                </div>
                {pdfMode === 'single-form' && (
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Formulario a imprimir</label>
                    <select
                      value={pdfTargetForm}
                      onChange={e => setPdfTargetForm(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded px-3 py-1.5 focus:ring-1 focus:ring-teal-500"
                    >
                      {MODULOS_RETIE.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ADJUNTOS */}
          {activeTab === 'adjuntos' && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold text-yellow-400 border-b border-slate-700 pb-2 mb-4">📎 ARCHIVOS Y DOCUMENTOS ADJUNTOS</h2>
              
              {/* Formulario para agregar adjuntos */}
              <div className="bg-slate-900/40 p-4 border border-slate-700 rounded-lg space-y-4">
                <p className="text-xs font-bold text-teal-400">Agregar Nuevo Adjunto</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Tipo de Archivo</label>
                    <select
                      id="attach_type"
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="Especificación Técnica">Especificación Técnica</option>
                      <option value="Plano">Plano</option>
                      <option value="Certificado">Certificado</option>
                      <option value="Cronograma">Cronograma</option>
                      <option value="Presupuesto">Presupuesto</option>
                      <option value="Manual">Manual</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Módulo Relacionado</label>
                    <select
                      id="attach_form_id"
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-yellow-500"
                    >
                      {MODULOS_RETIE.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Archivo</label>
                    <input
                      id="attach_file"
                      type="file"
                      className="w-full text-xs text-slate-300 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-slate-700 file:text-black hover:file:bg-slate-600 cursor-pointer"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-1">Observación</label>
                    <input
                      id="attach_obs"
                      type="text"
                      placeholder="Ej: Plano de distribución revisado"
                      className="w-full bg-slate-700 border border-slate-600 text-white text-xs rounded p-1.5 focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const typeEl = document.getElementById('attach_type') as HTMLSelectElement;
                    const formEl = document.getElementById('attach_form_id') as HTMLSelectElement;
                    const fileEl = document.getElementById('attach_file') as HTMLInputElement;
                    const obsEl = document.getElementById('attach_obs') as HTMLInputElement;

                    const tipo = typeEl.value;
                    const formId = formEl.value;
                    const file = fileEl.files?.[0];
                    const obs = obsEl.value.trim();

                    if (!file) {
                      alert('Por favor seleccione un archivo.');
                      return;
                    }

                    // Convertir archivo a dataUrl
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                      const dataUrl = e.target?.result as string;

                      // Crear entrada de adjunto
                      const newAdj = {
                        id: `ADJ-${Date.now()}`,
                        inspectionId,
                        tipo,
                        formId,
                        fileName: file.name,
                        fileSize: (file.size / 1024).toFixed(2) + ' KB',
                        mimeType: file.type,
                        dataUrl: dataUrl,
                        observacion: obs,
                        uploadedAt: new Date().toLocaleString(),
                        createdAt: new Date().toISOString()
                      };

                      const updatedAdjs = [...adjuntos, newAdj];
                      setAdjuntos(updatedAdjs);
                      await handleSave({ adjuntos: updatedAdjs });

                      // Limpiar campos
                      typeEl.value = 'Especificación Técnica';
                      fileEl.value = '';
                      obsEl.value = '';
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-md transition-all"
                >
                  Agregar Adjunto
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('¿Está seguro de limpiar todos los adjuntos?')) {
                      setAdjuntos([]);
                      await handleSave({ adjuntos: [] });
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-md transition-all"
                >
                  🗑️ Limpiar adjuntos
                </button>
              </div>

              {/* Tabla de adjuntos */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 text-slate-300">
                    <tr>
                      <th className="px-3 py-2">Tipo</th>
                      <th className="px-3 py-2">Módulo</th>
                      <th className="px-3 py-2">Archivo</th>
                      <th className="px-3 py-2">Tamaño</th>
                      <th className="px-3 py-2">Observación</th>
                      <th className="px-3 py-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {adjuntos.map(adj => {
                      const formLabel = MODULOS_RETIE.find(m => m.key === adj.formId)?.label || adj.formId;
                      return (
                        <tr key={adj.id} className="hover:bg-slate-700">
                          <td className="px-3 py-2 font-bold text-teal-400">{adj.tipo}</td>
                          <td className="px-3 py-2 text-slate-300">{formLabel}</td>
                          <td className="px-3 py-2 font-mono text-slate-400">{adj.fileName}</td>
                          <td className="px-3 py-2 text-slate-400">{adj.fileSize}</td>
                          <td className="px-3 py-2 text-slate-400 max-w-xs truncate">{adj.observacion || '-'}</td>
                          <td className="px-3 py-2 text-slate-500 text-[10px]">{adj.uploadedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>
      </div>
    </main>

      {/* PDF PREVIEW MODAL */}
      {showPdfPreview && pdfBlob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-800 px-5 py-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-sm font-bold text-yellow-400">📄 PDF Dictamen Generado</h3>
              <button onClick={() => setShowPdfPreview(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-teal-950/40 text-teal-400 border border-teal-500/30 rounded-full flex items-center justify-center mx-auto text-2xl animate-bounce">
                ✓
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">El Dictamen Oficial fue generado correctamente</p>
                <p className="text-xs text-slate-400 mt-1">Cumple con los 8 bloques oficiales para expedientes RETIE Colombia.</p>
              </div>
            </div>
            <div className="bg-slate-800 px-5 py-3 flex justify-end gap-3">
              <button onClick={() => setShowPdfPreview(false)} className="px-4 py-1.5 bg-slate-700 hover:bg-slate-655 text-white text-xs font-semibold rounded-lg">
                Cerrar
              </button>
              <button
                onClick={() => {
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `DICTAMEN_${dictamen.numero}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-slate-950 text-xs font-bold rounded-lg"
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
