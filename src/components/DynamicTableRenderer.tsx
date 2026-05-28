import React, { FC, useState, useEffect } from 'react';
import { useFormStateStore } from '@/engines/state/formStateEngine';
import { offlineEngine } from '@/engines/offline/indexedDB';
import { EvidenceUploader } from './EvidenceUploader';

interface Column {
  field: string;
  label: string;
  tipo: string;
  opciones?: string[];
}

interface DynamicTableProps {
  section: any;
  formEngine: any;
  sectionIndex: number;
}

export const DynamicTableRenderer: FC<DynamicTableProps> = ({ section, formEngine, sectionIndex }) => {
  const { getValue, setValue } = formEngine;

  const metadata = useFormStateStore(state => state.metadata);
  const rawInspectionId = metadata?.inspectionId || 'RETIE-DEMO-2026_R_SPT';
  const match = rawInspectionId.match(/_(ACPSDEBCI|DISTRIBUCION|DISENO|CARPETA|UFR|UFIYC|R_SPT|R_AISLAMIENTO|ILUMINANCIA|IN|PISCINAS|ASCENSORES|PRODUCTO|APANTALLAMIENTO)$/);
  const formId = match ? match[1] : 'R_SPT';
  const baseId = rawInspectionId.replace(/_(ACPSDEBCI|DISTRIBUCION|DISENO|CARPETA|UFR|UFIYC|R_SPT|R_AISLAMIENTO|ILUMINANCIA|IN|PISCINAS|ASCENSORES|PRODUCTO|APANTALLAMIENTO)$/, '');

  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    async function loadEvidencias() {
      if (!baseId) return;
      try {
        const cached = await offlineEngine.getExpediente(baseId);
        if (cached && cached.evidencias) {
          setEvidencias(cached.evidencias);
        }
      } catch (err) {
        console.error("Error loading evidences in DynamicTableRenderer:", err);
      }
    }
    loadEvidencias();
  }, [baseId]);

  const handleSaveEvidencias = async (updated: any[]) => {
    setEvidencias(updated);
    if (!baseId) return;
    try {
      const cached = await offlineEngine.getExpediente(baseId) || {};
      await offlineEngine.saveExpediente(baseId, { ...cached, evidencias: updated });
    } catch (err) {
      console.error("Error saving evidences in DynamicTableRenderer:", err);
    }
  };

  // Render a flat table
  if (section.tipo === 'dynamic-table') {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
        <div className="bg-slate-900/50 border-b border-slate-700 p-4">
          <h3 className="font-bold text-blue-400 text-lg">{section.titulo}</h3>
          {section.descripcion && <p className="text-sm text-slate-400 mt-1">{section.descripcion}</p>}
        </div>
        
        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-300 table-fixed">
            <thead>
              <tr className="bg-slate-900/30 border-b border-slate-700">
                {section.columnas?.map((col: Column, idx: number) => {
                  let widthClass = "w-auto";
                  if (col.label.toLowerCase() === 'ítem' || col.label.toLowerCase() === 'item') widthClass = "w-16";
                  else if (col.label.toLowerCase() === 'norma') widthClass = "w-24";
                  else if (col.tipo === 'radio') widthClass = "w-40";
                  
                  return (
                    <th key={idx} className={`p-3 text-xs font-semibold text-slate-400 break-words whitespace-pre-wrap ${widthClass}`}>
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {section.filas?.map((fila: any, filaIdx: number) => (
                <tr key={filaIdx} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                  {section.columnas?.map((col: Column, colIdx: number) => {
                    const fieldId = `${section.titulo.replace(/\s+/g, '_')}_fila_${filaIdx}_${col.field.replace(/\./g, '_')}`;
                    const value = getValue(fieldId) ?? fila[col.field]?.valor_excel ?? fila[col.field] ?? '';
                    
                    return (
                      <td key={colIdx} className="p-3 align-top">
                        {col.tipo === 'text' || col.tipo === 'number' ? (
                          <input
                            type={col.tipo}
                            value={value}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setValue(fieldId, newVal);
                              
                              // Dynamic SPT regular ground calculations
                              if (section.titulo === 'Valores medidos - TERRENO REGULAR' && col.field === 'distancia_d_m') {
                                const dVal = parseFloat(newVal);
                                const x61_8Field = fieldId.replace('distancia_d_m', 'distancia_x_61_8');
                                const x52Field = fieldId.replace('distancia_d_m', 'distancia_x_52');
                                const x72Field = fieldId.replace('distancia_d_m', 'distancia_x_72');
                                
                                if (!isNaN(dVal)) {
                                  setValue(x61_8Field, (dVal * 0.618).toFixed(2));
                                  setValue(x52Field, (dVal * 0.52).toFixed(2));
                                  setValue(x72Field, (dVal * 0.72).toFixed(2));
                                } else {
                                  setValue(x61_8Field, '');
                                  setValue(x52Field, '');
                                  setValue(x72Field, '');
                                }
                              }

                              // Dynamic Lux Average Calculator
                              const isMeasure = ['medida_1', 'medida_2', 'medida_3', 'medida_1_lux', 'medida_2_lux', 'medida_3_lux'].includes(col.field);
                              if (isMeasure) {
                                const suffix = col.field.endsWith('_lux') ? '_lux' : '';
                                const m1Field = fieldId.replace(col.field, 'medida_1' + suffix);
                                const m2Field = fieldId.replace(col.field, 'medida_2' + suffix);
                                const m3Field = fieldId.replace(col.field, 'medida_3' + suffix);
                                const promedioField = fieldId.replace(col.field, 'promedio' + suffix);

                                const getActiveValue = (fName: string, fId: string) => {
                                  const ansVal = getValue(fId);
                                  if (ansVal !== undefined && ansVal !== null) return String(ansVal);
                                  const schemaFilaVal = fila[fName]?.valor_excel ?? fila[fName] ?? '';
                                  return String(schemaFilaVal);
                                };

                                const val1Str = col.field === ('medida_1' + suffix) ? newVal : getActiveValue('medida_1' + suffix, m1Field);
                                const val2Str = col.field === ('medida_2' + suffix) ? newVal : getActiveValue('medida_2' + suffix, m2Field);
                                const val3Str = col.field === ('medida_3' + suffix) ? newVal : getActiveValue('medida_3' + suffix, m3Field);

                                const v1 = val1Str !== '' && !isNaN(parseFloat(val1Str)) ? parseFloat(val1Str) : null;
                                const v2 = val2Str !== '' && !isNaN(parseFloat(val2Str)) ? parseFloat(val2Str) : null;
                                const v3 = val3Str !== '' && !isNaN(parseFloat(val3Str)) ? parseFloat(val3Str) : null;

                                if (v1 === null || v2 === null || v3 === null) {
                                  setValue(promedioField, '');
                                } else {
                                  const sum = v1 + v2 + v3;
                                  const avg = (sum / 3).toFixed(2);
                                  setValue(promedioField, avg);
                                }
                              }
                            }}
                            className="w-full min-w-[120px] bg-slate-700 border border-slate-600 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                            placeholder="..."
                          />
                        ) : col.tipo === 'computed' ? (
                          <div className="bg-slate-900/60 border border-slate-700/60 rounded px-3 py-1.5 min-h-[32px] flex items-center justify-center font-mono text-xs text-blue-400 font-bold w-full min-w-[80px]">
                            {value !== '' && !isNaN(parseFloat(value)) ? parseFloat(value).toFixed(2) : value || '—'}
                          </div>
                        ) : col.tipo === 'radio' ? (
                          <div className="flex flex-col space-y-2 min-w-[100px]">
                            {col.opciones?.map(opcion => (
                              <label key={opcion} className="flex items-center space-x-1.5 cursor-pointer select-none">
                                <input
                                  type="radio"
                                  name={fieldId}
                                  value={opcion}
                                  checked={value === opcion}
                                  onChange={(e) => setValue(fieldId, e.target.value)}
                                  className="w-4 h-4 text-blue-600 border-slate-600 focus:ring-blue-500 bg-slate-700 cursor-pointer"
                                />
                                <span className="text-xs text-slate-350 font-semibold">{opcion}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-slate-300 break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                            {value}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE/TABLET CARDS VIEW */}
        <div className="lg:hidden flex flex-col gap-4 p-4">
          {section.filas?.map((fila: any, filaIdx: number) => (
            <div key={filaIdx} className="bg-slate-900/40 border border-slate-700 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
              {section.columnas?.map((col: Column, colIdx: number) => {
                const fieldId = `${section.titulo.replace(/\s+/g, '_')}_fila_${filaIdx}_${col.field.replace(/\./g, '_')}`;
                const value = getValue(fieldId) ?? fila[col.field]?.valor_excel ?? fila[col.field] ?? '';
                
                return (
                  <div key={colIdx} className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">{col.label}</span>
                    {col.tipo === 'text' || col.tipo === 'number' ? (
                      <input
                        type={col.tipo}
                        value={value}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setValue(fieldId, newVal);
                          
                          // Dynamic SPT regular ground calculations
                          if (section.titulo === 'Valores medidos - TERRENO REGULAR' && col.field === 'distancia_d_m') {
                            const dVal = parseFloat(newVal);
                            const x61_8Field = fieldId.replace('distancia_d_m', 'distancia_x_61_8');
                            const x52Field = fieldId.replace('distancia_d_m', 'distancia_x_52');
                            const x72Field = fieldId.replace('distancia_d_m', 'distancia_x_72');
                            
                            if (!isNaN(dVal)) {
                              setValue(x61_8Field, (dVal * 0.618).toFixed(2));
                              setValue(x52Field, (dVal * 0.52).toFixed(2));
                              setValue(x72Field, (dVal * 0.72).toFixed(2));
                            } else {
                              setValue(x61_8Field, '');
                              setValue(x52Field, '');
                              setValue(x72Field, '');
                            }
                          }

                           // Dynamic Lux Average Calculator
                           const isMeasure = ['medida_1', 'medida_2', 'medida_3', 'medida_1_lux', 'medida_2_lux', 'medida_3_lux'].includes(col.field);
                           if (isMeasure) {
                             const suffix = col.field.endsWith('_lux') ? '_lux' : '';
                             const m1Field = fieldId.replace(col.field, 'medida_1' + suffix);
                             const m2Field = fieldId.replace(col.field, 'medida_2' + suffix);
                             const m3Field = fieldId.replace(col.field, 'medida_3' + suffix);
                             const promedioField = fieldId.replace(col.field, 'promedio' + suffix);

                             const getActiveValue = (fName: string, fId: string) => {
                               const ansVal = getValue(fId);
                               if (ansVal !== undefined && ansVal !== null) return String(ansVal);
                               const schemaFilaVal = fila[fName]?.valor_excel ?? fila[fName] ?? '';
                               return String(schemaFilaVal);
                             };

                             const val1Str = col.field === ('medida_1' + suffix) ? newVal : getActiveValue('medida_1' + suffix, m1Field);
                             const val2Str = col.field === ('medida_2' + suffix) ? newVal : getActiveValue('medida_2' + suffix, m2Field);
                             const val3Str = col.field === ('medida_3' + suffix) ? newVal : getActiveValue('medida_3' + suffix, m3Field);

                             const v1 = val1Str !== '' && !isNaN(parseFloat(val1Str)) ? parseFloat(val1Str) : null;
                             const v2 = val2Str !== '' && !isNaN(parseFloat(val2Str)) ? parseFloat(val2Str) : null;
                             const v3 = val3Str !== '' && !isNaN(parseFloat(val3Str)) ? parseFloat(val3Str) : null;

                             if (v1 === null || v2 === null || v3 === null) {
                               setValue(promedioField, '');
                             } else {
                               const sum = v1 + v2 + v3;
                               const avg = (sum / 3).toFixed(2);
                               setValue(promedioField, avg);
                             }
                           }
                        }}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-medium"
                        placeholder="..."
                      />
                    ) : col.tipo === 'computed' ? (
                      <div className="bg-slate-900/60 border border-slate-700/60 rounded px-3 py-2 flex items-center font-mono text-sm text-blue-400 font-bold w-full">
                        {value !== '' && !isNaN(parseFloat(value)) ? parseFloat(value).toFixed(2) : value || '—'}
                      </div>
                    ) : col.tipo === 'radio' ? (
                      <div className="flex flex-wrap gap-3 mt-1">
                        {col.opciones?.map(opcion => (
                          <label key={opcion} className={`flex items-center justify-center px-4 py-2 rounded-lg border cursor-pointer transition-all ${value === opcion ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 text-slate-300'}`}>
                            <input
                              type="radio"
                              name={`${fieldId}_mobile`}
                              value={opcion}
                              checked={value === opcion}
                              onChange={(e) => setValue(fieldId, e.target.value)}
                              className="sr-only"
                            />
                            <span className="text-sm font-semibold">{opcion}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-slate-200 break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        {value}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render a grouped table
  if (section.tipo === 'dynamic-table-grouped') {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-6">
        <div className="bg-slate-900/50 border-b border-slate-700 p-4">
          <h3 className="font-bold text-blue-400 text-lg">{section.titulo}</h3>
          {section.descripcion && <p className="text-sm text-slate-400 mt-1">{section.descripcion}</p>}
        </div>
        
        {/* DESKTOP TABLE VIEW */}
        <div className="p-6 hidden lg:grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.grupos?.map((grupo: any, grupoIdx: number) => (
            <div key={grupoIdx} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/40">
              <div className="bg-slate-900/30 px-3 py-2 border-b border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-blue-400 text-xs">Grupo {grupo.id}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-slate-300 table-fixed">
                  <thead>
                    <tr className="bg-slate-900/20 border-b border-slate-700">
                      {grupo.columnas?.map((col: Column, idx: number) => {
                        let widthClass = "w-auto";
                        if (col.label.toLowerCase() === 'ítem' || col.label.toLowerCase() === 'item') widthClass = "w-12";
                        else if (col.label.toLowerCase() === 'fase' || col.label.toLowerCase() === 'hilo') widthClass = "w-16";
                        return (
                          <th key={idx} className={`p-2 text-[10px] font-semibold text-slate-400 break-words whitespace-pre-wrap ${widthClass}`}>
                            {col.label}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.filas?.map((fila: any, filaIdx: number) => (
                      <tr key={filaIdx} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/20">
                        {grupo.columnas?.map((col: Column, colIdx: number) => {
                          const fieldId = `${section.titulo.replace(/\s+/g, '_')}_g_${grupo.id}_fila_${filaIdx}_${col.field}`;
                          const value = getValue(fieldId) ?? fila[col.field] ?? '';
                          
                          return (
                            <td key={colIdx} className="p-2 align-top">
                              {col.tipo === 'label' ? (
                                <div className="text-xs text-slate-300 font-medium break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                  {value}
                                </div>
                              ) : col.tipo === 'text' || col.tipo === 'number' ? (
                                <input
                                  type={col.tipo}
                                  value={value}
                                  onChange={(e) => setValue(fieldId, e.target.value)}
                                  className="w-full min-w-[80px] bg-slate-700 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* MOBILE/TABLET CARDS VIEW */}
        <div className="lg:hidden flex flex-col gap-4 p-4">
          {section.grupos?.map((grupo: any, grupoIdx: number) => (
            <div key={grupoIdx} className="bg-slate-900/40 border border-slate-700 rounded-lg p-4 flex flex-col gap-3 shadow-sm">
              <h4 className="font-semibold text-blue-400 text-sm border-b border-slate-700 pb-2 mb-2">Grupo {grupo.id}</h4>
              {grupo.filas?.map((fila: any, filaIdx: number) => (
                <div key={filaIdx} className="border border-slate-700/50 rounded p-3 mb-2 bg-slate-800/60 flex flex-col gap-2">
                  {grupo.columnas?.map((col: Column, colIdx: number) => {
                    const fieldId = `${section.titulo.replace(/\s+/g, '_')}_g_${grupo.id}_fila_${filaIdx}_${col.field}`;
                    const value = getValue(fieldId) ?? fila[col.field] ?? '';
                    
                    return (
                      <div key={colIdx} className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase mb-1">{col.label}</span>
                        {col.tipo === 'label' ? (
                          <div className="text-sm font-medium text-slate-200 break-words whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                            {value}
                          </div>
                        ) : col.tipo === 'text' || col.tipo === 'number' ? (
                          <input
                            type={col.tipo}
                            value={value}
                            onChange={(e) => setValue(fieldId, e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* GRAFICA BLOCK */}
        {section.grafica && (
          <div className="p-6 border-t border-slate-700 bg-slate-900/30">
            <h4 className="font-bold text-blue-400 text-sm mb-3">⚡ Análisis de Resistencia Constante</h4>
            {section.grafica.observacion_excel && (
              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/50 mb-4">
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {section.grafica.observacion_excel}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-350">
                  {section.grafica.valor_resistencia_constante?.label || 'Valor de resistencia constante (Ω)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={getValue(`${section.titulo.replace(/\s+/g, '_')}_grafica_valor_resistencia_constante`) ?? ''}
                  onChange={(e) => setValue(`${section.titulo.replace(/\s+/g, '_')}_grafica_valor_resistencia_constante`, e.target.value)}
                  placeholder="0.00"
                  className="w-full max-w-xs bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors font-mono font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-350">
                  ¿Cumple con la zona de potencial plano?
                </label>
                <div className="flex gap-2">
                  {['SI', 'NO'].map((opcion: string) => {
                    const fieldId = `${section.titulo.replace(/\s+/g, '_')}_grafica_cumple`;
                    const cumpleVal = getValue(fieldId) ?? '';
                    return (
                      <button
                        key={opcion}
                        type="button"
                        onClick={() => setValue(fieldId, opcion)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                          cumpleVal === opcion
                            ? (opcion === 'SI' ? 'bg-green-600 border-green-500 text-white' : 'bg-red-600 border-red-500 text-white')
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {opcion}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
