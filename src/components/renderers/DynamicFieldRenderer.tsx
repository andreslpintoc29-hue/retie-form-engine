/**
 * =====================================================
 * DYNAMIC RENDERER - MAPEO JSON → COMPONENTES
 * =====================================================
 * 
 * El renderer debe:
 * JSON → Component Mapping → Render automático
 * 
 * Componentes:
 * - DynamicField
 * - DynamicSection
 * - DynamicTable
 * - DynamicGroup
 * - DynamicRuleRenderer
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Field,
  FieldType,
  TableColumn,
  ValidationRule,
  InspectionAnswers
} from '@/schemas/masterSchema';
import { RuleEngine, ruleEngine } from '@/engines/rules/ruleEngine';
import { ValidationEngine, validationEngine } from '@/engines/validation/validationEngine';
import { DynamicTableEngine } from '@/engines/tables/dynamicTableEngine';

// ============================================
// COMPONENTES DE UI
// ============================================

interface BaseProps {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  readOnly?: boolean;
}

// Campo de texto
const TextField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-300">
      {field.label}
      {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type="text"
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={field.metadata?.placeholder || field.metadata?.helpText}
      className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 
        focus:outline-none focus:ring-2 focus:ring-retie-accent transition-all
        ${errors?.[String(field.id)] ? 'border-red-500' : 'border-slate-600'}`}
    />
    {errors?.[String(field.id)] && (
      <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
    )}
  </div>
);

// Campo numérico
const NumberField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-300">
      {field.label}
      {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type="number"
      value={value as number ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={disabled}
      min={field.validation?.find((v: any) => v.type === 'min')?.value as number}
      max={field.validation?.find((v: any) => v.type === 'max')?.value as number}
      className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white 
        focus:outline-none focus:ring-2 focus:ring-retie-accent
        ${errors?.[String(field.id)] ? 'border-red-500' : 'border-slate-600'}`}
    />
    {errors?.[String(field.id)] && (
      <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
    )}
  </div>
);

// Campo decimal
const DecimalField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-300">
      {field.label}
      {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type="number"
      step="0.01"
      value={value as number ?? ''}
      onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white 
        focus:outline-none focus:ring-2 focus:ring-retie-accent
        ${errors?.[String(field.id)] ? 'border-red-500' : 'border-slate-600'}`}
    />
    {errors?.[String(field.id)] && (
      <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
    )}
  </div>
);

// Campo fecha
const DateField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-300">
      {field.label}
      {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type="date"
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white 
        focus:outline-none focus:ring-2 focus:ring-retie-accent
        ${errors?.[String(field.id)] ? 'border-red-500' : 'border-slate-600'}`}
    />
    {errors?.[String(field.id)] && (
      <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
    )}
  </div>
);

// Radio buttons (SI/NO/N/A)
const RadioField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => {
  const options = field.options || [
    { label: 'SI', value: 'SI' },
    { label: 'NO', value: 'NO' },
    { label: 'N/A', value: 'N/A' }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {field.label}
        {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.metadata?.helpText && (
        <p className="text-xs text-slate-500 mb-2">{field.metadata.helpText}</p>
      )}
      {field.metadata?.norma && (
        <p className="text-xs text-retie-accent mb-2">{field.metadata.norma}</p>
      )}
      <div className="flex flex-wrap gap-3">
        {options.map((opt: any) => {
          const isSelected = value === opt.value;
          let bgColor = 'bg-slate-700/50 border-slate-600 hover:border-slate-500';
          
          if (isSelected) {
            if (opt.value === 'SI') bgColor = 'bg-green-500/20 border-green-500 text-green-400';
            else if (opt.value === 'NO') bgColor = 'bg-red-500/20 border-red-500 text-red-400';
            else if (opt.value === 'N/A') bgColor = 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
          }

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg border cursor-pointer transition-all font-medium
                ${bgColor} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {errors?.[String(field.id)] && (
        <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
      )}
    </div>
  );
};

// Select
const SelectField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-300">
      {field.label}
      {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
    </label>
    <select
      value={value as string || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white 
        focus:outline-none focus:ring-2 focus:ring-retie-accent
        ${errors?.[String(field.id)] ? 'border-red-500' : 'border-slate-600'}`}
    >
      <option value="">Seleccione...</option>
      {field.options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {errors?.[String(field.id)] && (
      <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
    )}
  </div>
);

// Checkbox
const CheckboxField: React.FC<BaseProps> = ({ field, value, onChange, errors, disabled }) => {
  const selectedValues = (value as string[]) || [];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {field.label}
        {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="flex flex-wrap gap-3">
        {field.options?.map((opt: any) => (
          <label
            key={opt.value}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all
              ${selectedValues.includes(opt.value)
                ? 'bg-retie-accent/20 border-retie-accent text-white'
                : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
              }`}
          >
            <input
              type="checkbox"
              value={opt.value}
              checked={selectedValues.includes(opt.value)}
              onChange={(e) => {
                const newValues = e.target.checked
                  ? [...selectedValues, opt.value]
                  : selectedValues.filter((v: any) => v !== opt.value);
                onChange(newValues);
              }}
              disabled={disabled}
              className="sr-only"
            />
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
      {errors?.[String(field.id)] && (
        <p className="text-red-400 text-sm">{errors[String(field.id)]}</p>
      )}
    </div>
  );
};

// Título de sección
const SectionTitleField: React.FC<BaseProps> = ({ field }) => (
  <div className="py-4 border-b border-slate-700">
    <h3 className="text-lg font-semibold text-retie-accent">{field.label}</h3>
    {field.metadata?.description && (
      <p className="text-sm text-slate-400 mt-1">{field.metadata.description}</p>
    )}
  </div>
);

// Grupo de campos
const GroupFields: React.FC<BaseProps & { groupFields: Field[] }> = ({ 
  field, 
  groupFields, 
  value, 
  onChange, 
  errors,
  disabled 
}) => {
  const groupValue = (value as Record<string, unknown>) || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg">
      {groupFields.map((subField) => (
        <DynamicFieldRenderer
          key={String(subField.id)}
          field={subField}
          value={groupValue[String(subField.id)]}
          onChange={(newValue) => onChange({ ...groupValue, [String(subField.id)]: newValue })}
          errors={errors}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

// Tabla dinámica
const DynamicTableField: React.FC<BaseProps & { columns: TableColumn[] }> = ({
  field,
  columns,
  value,
  onChange,
  errors,
  disabled
}) => {
  const [rows, setRows] = useState<any[]>(
    (value as any)?.rows || []
  );
  const tableEngine = useMemo(() => new DynamicTableEngine(), []);

  const handleAddRow = () => {
    const newRows = tableEngine.addRow(rows, columns);
    setRows(newRows);
    onChange({ rows: newRows });
  };

  const handleRemoveRow = (rowId: string) => {
    const newRows = tableEngine.removeRow(rows, rowId);
    setRows(newRows);
    onChange({ rows: newRows });
  };

  const handleCellChange = (rowId: string, column: string, cellValue: unknown) => {
    const newRows = tableEngine.updateCell(rows, rowId, column, cellValue, columns);
    setRows(newRows);
    onChange({ rows: newRows });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          {field.label}
          {field.validation?.some((v: any) => v.type === 'required') && <span className="text-red-400 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={handleAddRow}
          disabled={disabled}
          className="px-3 py-1.5 bg-retie-accent/20 text-retie-accent rounded-lg hover:bg-retie-accent/30 transition-colors text-sm"
        >
          + Agregar fila
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-700">
              <th className="p-3 text-center text-xs font-semibold text-slate-300 w-12">#</th>
              {columns.map((col: any) => (
                <th key={col.field} className="p-3 text-center text-xs font-semibold text-slate-300">
                  {col.label}
                </th>
              ))}
              <th className="p-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-8 text-center text-slate-400">
                  Sin registros. Haga clic en "Agregar fila" para comenzar.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id as string || idx} className="border-b border-slate-700">
                  <td className="p-3 text-center text-slate-400">{idx + 1}</td>
                  {columns.map((col: any) => (
                    <td key={col.field} className="p-2">
                      <input
                        type={col.type === 'number' || col.type === 'decimal' ? 'number' : 'text'}
                        value={(row[col.field] as string) || ''}
                        onChange={(e) => handleCellChange(
                          row.id as string || String(idx),
                          col.field,
                          col.type === 'number' ? Number(e.target.value) : e.target.value
                        )}
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center"
                      />
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(row.id as string || String(idx))}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================
// RENDERER PRINCIPAL
// ============================================

interface DynamicFieldRendererProps {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  readOnly?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  errors,
  disabled = false,
  readOnly = false
}) => {
  // Evaluar reglas condicionales
  const { watch } = useForm();
  const answers = watch();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (field.conditional) {
      const actions = ruleEngine.getActionsForField(String(field.id), answers);
      const shouldHide = actions.some((a: any) => a.action === 'hide');
      setIsVisible(!shouldHide);
    }
  }, [field.conditional, answers]);

  if (!isVisible) return null;

  switch (field.type) {
    case 'text':
      return <TextField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'number':
      return <NumberField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'decimal':
      return <DecimalField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'date':
    case 'datetime':
      return <DateField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'radio':
      return <RadioField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'select':
      return <SelectField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'checkbox':
    case 'multi-select':
      return <CheckboxField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled || readOnly} />;
    
    case 'section-title':
      return <SectionTitleField field={field} value={value} onChange={onChange} errors={errors} disabled={disabled} />;
    
    case 'group-fields':
      if (!field.fields) return null;
      return <GroupFields field={field} groupFields={field.fields} value={value} onChange={onChange} errors={errors} disabled={disabled} />;
    
    case 'dynamic-table':
      if (!field.columns) return null;
      return <DynamicTableField field={field} columns={field.columns} value={value} onChange={onChange} errors={errors} disabled={disabled} />;
    
    default:
      return (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400">
          Tipo de campo no soportado: {field.type}
        </div>
      );
  }
};

export default DynamicFieldRenderer;