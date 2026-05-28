// ============================================
// DEMO PAGE - ASCENSORES CON UX PROFESIONAL
// Inspector Experience Optimized
// ============================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFormEngine, useComplianceMemo } from '@/core/useFormEngine';
import { eventBus } from '@/core/integration/eventBus';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { pdfEngine } from '@/engines/pdf/pdfEngine';
import { complianceRulesEngine, type ComplianceRuleResult, type GeneratedNoConformity } from '@/engines/compliance/complianceRules';
import { RETIE_ASCENSORES_SCHEMA } from '@/schemas/retie/ascensores';
import type { RETIEMasterSchema } from '@/schemas/masterSchema';
import { EvidenceUploader } from '@/components/EvidenceUploader';

const SCHEMA = RETIE_ASCENSORES_SCHEMA as RETIEMasterSchema;

function normalizeAscensoresAnswersForPdf(answers: Record<string, any>, schema: any) {
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

export default function AscensoresInspectorPage() {
  const router = useRouter();
  const [inspectionId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'RETIE-DEMO-2026';
      return `${id}_ASCENSORES`;
    }
    return 'RETIE-DEMO-2026_ASCENSORES';
  });

  const handleGoToExpediente = useCallback(() => {
    const baseId = inspectionId.replace('_ASCENSORES', '');
    router.push(`/expediente?id=${baseId}`);
  }, [inspectionId, router]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [showFinalizar, setShowFinalizar] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showNCModal, setShowNCModal] = useState(false);
  const [selectedNC, setSelectedNC] = useState<GeneratedNoConformity | null>(null);
  const [offlineStatus, setOfflineStatus] = useState({ online: true, pending: 0, lastSync: '' });
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const [evidencias, setEvidencias] = useState<any[]>([]);

  const baseInspectionId = inspectionId.replace('_ASCENSORES', '');

  useEffect(() => {
    async function loadEvidencias() {
      if (!baseInspectionId) return;
      try {
        const cached = await offlineEngine.getExpediente(baseInspectionId);
        if (cached?.evidencias) setEvidencias(cached.evidencias);
      } catch (err) { console.error('Error loading evidences Ascensores:', err); }
    }
    loadEvidencias();
  }, [baseInspectionId]);

  const handleSaveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    if (!baseInspectionId) return;
    try {
      const cached = await offlineEngine.getExpediente(baseInspectionId) || {};
      await offlineEngine.saveExpediente(baseInspectionId, { ...cached, evidencias: updated });
    } catch (err) { console.error('Error saving evidences Ascensores:', err); }
  };

  const formEngine = useFormEngine({
    inspectionId,
    schema: SCHEMA,
    autoSave: true,
    autoSaveDelay: 1000,
    onSave: () => setLastSaved(new Date().toLocaleTimeString()),
    onError: (error) => console.error('Save error:', error)
  });

  // Compliance calculation
  const [compliance, setCompliance] = useState<ComplianceRuleResult | null>(null);

  useEffect(() => {
    const answers = (formEngine as any).store?.answers || {};
    const fieldLabels: Record<string, string> = {};
    const sheets = SCHEMA.sheets || [SCHEMA];
    for (const sheet of sheets) {
      for (const section of sheet.secciones || sheet.sections || []) {
        for (const field of section.preguntas || section.fields || []) {
          fieldLabels[String(field.id)] = field.pregunta || field.label;
        }
      }
    }
    const result = complianceRulesEngine.evaluate(answers, fieldLabels);
    setCompliance(result);
  }, [(formEngine as any).store?.answers]);

  // Offline status
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

  // Auto-save event
  useEffect(() => {
    const unsub = eventBus.subscribe('AUTOSAVE_COMPLETED', () => {
      setLastSaved(new Date().toLocaleTimeString());
      setSyncLog(prev => [...prev.slice(-2), `💾 ${new Date().toLocaleTimeString()}`]);
    });
    return unsub;
  }, []);

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

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    formEngine.setValue(fieldId, value);
  }, [formEngine]);

  const getFieldValue = useCallback((fieldId: string) => {
    return formEngine.getValue(fieldId) as any;
  }, [formEngine]);

  const sheets = SCHEMA.sheets || [SCHEMA];
  const currentSheet = sheets[activeSheet];
  const currentSectionData = currentSheet?.secciones?.[activeSection] || currentSheet?.sections?.[activeSection];

  // Calculate sheet progress
  const getSheetProgress = (sheetIdx: number) => {
    const sheet = sheets[sheetIdx];
    const fields = sheet.secciones?.flatMap((s:any) => s.preguntas) || sheet.sections?.flatMap((s:any) => s.fields) || [];
    const answered = fields.filter((f:any) => {
      const val = getFieldValue(String(f.id));
      return val !== undefined && val !== null && val !== '';
    }).length;
    return fields.length > 0 ? Math.round((answered / fields.length) * 100) : 0;
  };

  // Calculate total progress
  const totalProgress = useMemo(() => {
    const allFields = sheets.flatMap((s:any) => s.secciones?.flatMap((sec:any) => sec.preguntas || []) || s.sections?.flatMap((sec:any) => sec.fields || []) || []);
    const answered = allFields.filter((f:any) => {
      const val = getFieldValue(String(f.id));
      return val !== undefined && val !== null && val !== '';
    }).length;
    return allFields.length > 0 ? Math.round((answered / allFields.length) * 100) : 0;
  }, [getFieldValue, sheets]);

  // Get pending fields
  const pendingFields = useMemo(() => {
    const pending: { sheet: string; section: string; field: string }[] = [];
    sheets.forEach((sheet:any) => {
      (sheet.secciones || sheet.sections || []).forEach((section:any) => {
        (section.preguntas || section.fields || []).forEach((field:any) => {
          const val = getFieldValue(String(field.id));
          if (field.required && (val === undefined || val === null || val === '')) {
            pending.push({ 
              sheet: sheet.codigo || sheet.hoja, 
              section: section.titulo, 
              field: field.pregunta || field.label 
            });
          }
        });
      });
    });
    return pending;
  }, [getFieldValue, sheets]);

  // Open NC details
  const openNCDetails = (nc: GeneratedNoConformity) => {
    setSelectedNC(nc);
    setShowNCModal(true);
  };

  const renderField = (field: any) => {
    const value = getFieldValue(String(field.id));
    const errors = formEngine.getErrors(String(field.id));
    const baseInputClass = 'w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all';

    const isRequired = field.required;
    const isAnswered = value !== undefined && value !== null && value !== '';
    const isError = errors.length > 0;
    const isNO = (field.tipo === 'radio' || field.type === 'radio') && value === 'NO';

    const renderInput = () => {
      if (field.tipo === 'radio' || field.type === 'radio') {
        const opciones = field.opciones || field.options || ['SI', 'NO', 'N/A'];
        return (
          <div className="flex gap-2 mt-2">
            {opciones.map((opt: string) => (
              <button
                key={opt}
                onClick={() => handleFieldChange(String(field.id), opt)}
                className={`flex-1 py-2 px-3 text-sm font-semibold rounded-lg border transition-colors ${
                  value === opt 
                    ? (opt === 'SI' ? 'bg-green-600 border-green-500 text-white' : 
                       opt === 'NO' ? 'bg-red-600 border-red-500 text-white' : 
                       'bg-yellow-600 border-yellow-500 text-white')
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }
      
      return (
        <input
          type={field.tipo === 'number' || field.type === 'number' || field.tipo === 'decimal' || field.type === 'decimal' ? 'number' : field.tipo === 'date' || field.type === 'date' ? 'date' : 'text'}
          step={field.tipo === 'decimal' || field.type === 'decimal' ? '0.01' : undefined}
          value={value ?? ''}
          onChange={(e) => {
            const val = field.tipo === 'number' || field.type === 'number' || field.tipo === 'decimal' || field.type === 'decimal'
              ? (e.target.value ? (field.tipo === 'decimal' || field.type === 'decimal' ? parseFloat(e.target.value) : Number(e.target.value)) : null)
              : e.target.value;
            handleFieldChange(String(field.id), val);
          }}
          className={`${baseInputClass} ${
            isError ? 'border-red-500 ring-1 ring-red-500' :
            isNO ? 'border-orange-500 ring-1 ring-orange-500' :
            isAnswered ? 'border-green-600' : 'border-slate-600'
          }`}
        />
      );
    };

    return (
      <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="flex items-start justify-between gap-4">
          <label className="block text-sm font-medium text-slate-200">
            {field.numero && <span className="inline-block px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded mr-2 text-xs">{field.numero}</span>}
            {field.pregunta || field.label}
            {isRequired && <span className="text-red-400 ml-1">*</span>}
            {field.norma && <span className="text-xs text-slate-500 block mt-1">Norma: {field.norma}</span>}
          </label>
          {isAnswered && !isRequired && (
            <span className="text-xl text-green-400 flex-shrink-0">✓</span>
          )}
        </div>
        
        {renderInput()}
        
        {/* Observaciones (if required) */}
        <textarea 
          placeholder="Observaciones..."
          className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          rows={1}
          value={getFieldValue(`${field.id}_obs`) ?? ''}
          onChange={(e) => handleFieldChange(`${field.id}_obs`, e.target.value)}
        />
        
        {isNO && (
          <div className="text-[10px] text-orange-400 flex items-center gap-1 mt-1">
            <span>⚠️</span> Generará No Conformidad
          </div>
        )}
        {isError && <p className="text-red-400 text-xs mt-1">{errors[0]}</p>}
        
        {/* Visual Resources */}
        {field.recursos_visuales && field.recursos_visuales.length > 0 && (
          <div className="mt-3 space-y-3">
            {field.recursos_visuales.map((img: any, idx: number) => (
              <div key={idx} className="bg-slate-900 p-2 rounded-lg border border-slate-700 flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-2">{img.descripcion}</div>
                {/* Simulated Image Placeholder */}
                <div 
                  className="w-full flex items-center justify-center bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg text-slate-500"
                  style={{ height: img.height ? `${Math.min(img.height, 300)}px` : '150px' }}
                >
                  <span className="text-sm">📷 {img.file}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!formEngine.isReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Inicializando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ===== TOP BAR ===== */}
      <div className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-blue-400">🏗️ ASCENSORES</h1>
              <div className="flex items-center gap-2">
                <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{totalProgress}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Offline Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                offlineStatus.online ? 'bg-green-900/30' : 'bg-orange-900/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${offlineStatus.online ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`} />
                <span className="text-xs">{offlineStatus.online ? 'Online' : 'Offline'}</span>
                {offlineStatus.pending > 0 && (
                  <span className="text-xs text-yellow-400">({offlineStatus.pending}🔄)</span>
                )}
              </div>

              {/* Save Status */}
              <div className="text-xs text-slate-400">
                {lastSaved ? `💾 ${lastSaved}` : '—'}
              </div>

              {/* Actions */}
              <button 
                onClick={async () => {
                  const answers = (formEngine as any).store?.answers || {};
                  const normalizedAnswers = normalizeAscensoresAnswersForPdf(answers, SCHEMA);
                  
                  const pdf = await pdfEngine.generateReport({
                    mode: 'single-form',
                    targetForm: 'ASCENSORES',
                    formAscensores: normalizedAnswers,
                    inspection: {
                      inspectionId: inspectionId,
                      inspectionCode: inspectionId,
                      status: 'in_progress',
                      siteName: answers['site_name'] || 'Ascensores Demo',
                      siteAddress: answers['site_address'] || 'Dirección',
                      inspectionDate: answers['inspection_date'] || new Date().toISOString(),
                      inspector: { id: 'demo', displayName: 'Inspector', role: 'inspector', email: '', permissions: [] },
                      schemaVersion: '1.0.0'
                    },
                    sheets: [],
                    compliance: compliance as any,
                    generatedBy: 'Inspector'
                  });
                  setPdfBlob(pdf);
                  setShowPdfPreview(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                📄 PDF
              </button>
                            <button onClick={handleLimpiar} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                🧹 Limpiar
              </button>
              <button onClick={handleFinalizar} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
                ✅ Finalizar
              </button>
              <button onClick={handleGoToExpediente} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors">
                ← Expediente
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Pendientes:</span>
              <span className={pendingFields.length > 0 ? 'text-yellow-400' : 'text-green-400'}>
                {pendingFields.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">No Conf.:</span>
              <span className="text-red-400">{compliance?.criticalCount || 0}</span>
              <span className="text-orange-400">{compliance?.majorCount || 0}</span>
              <span className="text-yellow-400">{compliance?.minorCount || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Score:</span>
              <span className={`font-bold ${
                compliance?.grade === 'A' ? 'text-green-400' :
                compliance?.grade === 'B' ? 'text-blue-400' :
                compliance?.grade === 'C' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {compliance?.grade} ({compliance?.compliancePercentage?.toFixed(0) || 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Sheet Navigation */}
        <div className="border-t border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
            {sheets.map((sheet:any, idx:number) => {
              const progress = getSheetProgress(idx);
              const ncCount = compliance?.noConformities.filter(nc => 
                nc.fieldId.includes((sheet.codigo || sheet.hoja).toLowerCase())
              ).length || 0;
              return (
                <button
                  key={sheet.codigo || sheet.hoja}
                  onClick={() => { setActiveSheet(idx); setActiveSection(0); }}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm transition-all ${
                    activeSheet === idx 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-medium">{sheet.titulo || sheet.nombre || sheet.hoja}</div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span>{progress}%</span>
                    {ncCount > 0 && <span className="text-red-400">•{ncCount} NC</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Area */}
          <div className="lg:col-span-3">
            {/* Sheet Page Headers */}
            {currentSheet?.recursos_visuales_hoja && currentSheet.recursos_visuales_hoja.length > 0 && (
              <div className="mb-6 space-y-4">
                {currentSheet.recursos_visuales_hoja.map((img: any, idx: number) => (
                  <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                    <div className="text-sm font-medium text-slate-300 mb-2">{img.descripcion}</div>
                    {/* Simulated Image Placeholder */}
                    <div 
                      className="w-full flex items-center justify-center bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg text-slate-500"
                      style={{ height: img.height ? `${Math.min(img.height, 300)}px` : '170px', maxWidth: img.width ? `${img.width}px` : '100%' }}
                    >
                      <span className="text-lg">📷 {img.file}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          
            {currentSheet && currentSectionData && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {/* Section Header */}
                <div className="bg-slate-750 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-blue-400">{currentSectionData.titulo}</h2>
                    <p className="text-xs text-slate-500">Sección {activeSection + 1} de {currentSheet.secciones?.length || currentSheet.sections?.length}</p>
                  </div>
                  <div className="flex gap-2">
                    {activeSection > 0 && (
                      <button 
                        onClick={() => setActiveSection(s => s - 1)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                      >
                        ← Anterior
                      </button>
                    )}
                    {activeSection < (currentSheet.secciones?.length || currentSheet.sections?.length || 1) - 1 && (
                      <button 
                        onClick={() => setActiveSection((s:number) => s + 1)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded text-sm"
                      >
                        Siguiente →
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {(currentSectionData.preguntas || currentSectionData.fields)?.map((field:any) => (
                      <div key={String(field.id)}>
                        {renderField(field)}
                        <EvidenceUploader
                          inspectionId={baseInspectionId}
                          formId="ASCENSORES"
                          questionId={String(field.id)}
                          caption={field.pregunta || field.label}
                          evidencias={evidencias}
                          onSaveEvidencias={handleSaveEvidencias}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Navigation */}
                <div className="px-6 py-4 bg-slate-750 border-t border-slate-700 flex justify-between">
                  <div className="flex gap-1">
                    {(currentSheet.secciones || currentSheet.sections)?.map((_:any, idx:number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSection(idx)}
                        className={`w-8 h-2 rounded ${idx === activeSection ? 'bg-blue-500' : 'bg-slate-600'}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">
                    Sección {activeSection + 1} / {currentSheet.secciones?.length || currentSheet.sections?.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== SIDEBAR ===== */}
          <div className="lg:col-span-1 space-y-4">
            {/* Progress Card */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📊 Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Progreso Total</span>
                  <span className="text-blue-400 font-bold">{totalProgress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Campos Llenos</span>
                  <span className="text-green-400 font-bold">
                    {Object.keys((formEngine as any).store?.answers || {}).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Pendientes</span>
                  <span className="text-yellow-400 font-bold">{pendingFields.length}</span>
                </div>
              </div>
            </div>

            {/* Compliance Score */}
            {compliance && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">✅ Cumplimiento</h3>
                <div className="text-center mb-3">
                  <div className={`text-4xl font-bold ${
                    compliance.grade === 'A' ? 'text-green-400' :
                    compliance.grade === 'B' ? 'text-blue-400' :
                    compliance.grade === 'C' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {compliance.grade}
                  </div>
                  <div className="text-sm text-slate-400">{compliance.compliancePercentage?.toFixed(1)}%</div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-red-900/20 rounded p-2">
                    <div className="text-lg font-bold text-red-400">{compliance.criticalCount}</div>
                    <div className="text-[10px] text-slate-400">Críticas</div>
                  </div>
                  <div className="bg-orange-900/20 rounded p-2">
                    <div className="text-lg font-bold text-orange-400">{compliance.majorCount}</div>
                    <div className="text-[10px] text-slate-400">Mayores</div>
                  </div>
                  <div className="bg-yellow-900/20 rounded p-2">
                    <div className="text-lg font-bold text-yellow-400">{compliance.minorCount}</div>
                    <div className="text-[10px] text-slate-400">Menores</div>
                  </div>
                </div>
              </div>
            )}

            {/* No Conformities */}
            {compliance && compliance.noConformities.length > 0 && (
              <div className="bg-slate-800 rounded-lg p-4 border border-red-700/50">
                <h3 className="text-sm font-semibold text-red-400 mb-3">
                  ⚠️ No Conformidades ({compliance.noConformities.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {compliance.noConformities.map((nc, idx) => (
                    <button
                      key={idx}
                      onClick={() => openNCDetails(nc)}
                      className={`w-full p-2 rounded text-left text-xs transition-colors ${
                        nc.severity === 'critical' ? 'bg-red-900/30 border-l-2 border-red-500 hover:bg-red-900/50' :
                        nc.severity === 'major' ? 'bg-orange-900/30 border-l-2 border-orange-500 hover:bg-orange-900/50' :
                        'bg-yellow-900/30 border-l-2 border-yellow-500 hover:bg-yellow-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`px-1 rounded text-[9px] font-bold ${
                          nc.severity === 'critical' ? 'bg-red-600' :
                          nc.severity === 'major' ? 'bg-orange-600' : 'bg-yellow-600'
                        }`}>
                          {nc.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-300 truncate">{nc.description}</div>
                      <div className="text-slate-500 text-[10px]">{nc.fieldLabel}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sync Log */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">💾 Estado</h3>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Online: {offlineStatus.online ? '✅' : '❌'}</div>
                <div>Cola: {offlineStatus.pending}</div>
                <div>Último guardado: {lastSaved || 'Nunca'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NC Details Modal */}
      {showNCModal && selectedNC && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 border border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">No Conformidad</h3>
                <p className="text-sm text-slate-400">{selectedNC.fieldLabel}</p>
              </div>
              <button onClick={() => setShowNCModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className={`p-3 rounded-lg mb-4 ${
              selectedNC.severity === 'critical' ? 'bg-red-900/30 border border-red-600' :
              selectedNC.severity === 'major' ? 'bg-orange-900/30 border border-orange-600' :
              'bg-yellow-900/30 border border-yellow-600'
            }`}>
              <span className={`text-sm font-bold ${
                selectedNC.severity === 'critical' ? 'text-red-400' :
                selectedNC.severity === 'major' ? 'text-orange-400' : 'text-yellow-400'
              }`}>
                {selectedNC.severity.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Descripción</label>
                <p className="text-sm text-slate-300">{selectedNC.description}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Recomendación</label>
                <p className="text-sm text-slate-300">{selectedNC.recommendation}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400">Estado</label>
                <select className="w-full mt-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm">
                  <option value="open">Abierta</option>
                  <option value="corrected">Corregida</option>
                  <option value="validated">Validada</option>
                  <option value="closed">Cerrada</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                📷 Agregar Evidencia
              </button>
              <button 
                onClick={() => setShowNCModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
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
                  const baseId = inspectionId.replace('_ASCENSORES', '');
                  router.push(`/expediente?id=${baseId}`);
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

      {/* PDF Preview */}
      {showPdfPreview && pdfBlob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
          <div className="bg-slate-800 p-6 rounded-lg max-w-xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">📄 PDF Generado</h3>
              <button onClick={() => setShowPdfPreview(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-400 mb-4">
              PDF con {compliance?.noConformities.length || 0} No Conformidades y {compliance?.compliancePercentage?.toFixed(0) || 0}% cumplimiento
            </p>
            <div className="flex gap-4">
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
              <button 
                onClick={() => setShowPdfPreview(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
