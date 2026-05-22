'use client';

import React, { useState, useCallback } from 'react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { FormField, FieldOption } from '@/types/schema';
import { validateField } from '@/utils/validation';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface FieldRendererProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  field, 
  value, 
  onChange,
  error 
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleChange = useCallback((newValue: unknown) => {
    // Validar en tiempo real
    const validationError = validateField(field, newValue);
    setInternalError(validationError?.message || null);
    onChange(newValue);
  }, [field, onChange]);

  const baseInputClass = "w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-retie-accent focus:border-transparent transition-all";
  const errorClass = "border-red-500 focus:ring-red-500";

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-1">
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${error || internalError ? errorClass : ''}`}
          />
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1">
          <textarea
            value={value as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClass} ${error || internalError ? errorClass : ''}`}
          />
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1">
          <input
            type="number"
            value={value as number || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${error || internalError ? errorClass : ''}`}
          />
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'decimal':
      return (
        <div className="space-y-1">
          <input
            type="number"
            step="0.01"
            value={value as number || ''}
            onChange={(e) => handleChange(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${error || internalError ? errorClass : ''}`}
          />
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="space-y-1">
          <input
            type="date"
            value={value as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`${baseInputClass} ${error || internalError ? errorClass : ''}`}
          />
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-3">
            {field.options?.map((option: FieldOption) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                  (value as string[])?.includes(option.value)
                    ? 'bg-retie-accent/20 border-retie-accent text-white'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(value as string[])?.includes(option.value) || false}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleChange(newValues);
                  }}
                  className="sr-only"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'radio':
      return (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-3">
            {field.options?.map((option: FieldOption) => (
              <label
                key={option.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                  value === option.value
                    ? option.value === 'SI'
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : option.value === 'NO'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
              >
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(option.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1">
          <select
            value={value as string || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={`${baseInputClass} ${error || internalError ? errorClass : ''}`}
          >
            <option value="">Seleccione...</option>
            {field.options?.map((option: FieldOption) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(error || internalError) && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle size={14} />
              {error || internalError}
            </p>
          )}
        </div>
      );

    case 'section-title':
      return (
        <div className="py-4">
          <h3 className="text-lg font-semibold text-retie-accent">{field.label}</h3>
          {field.validation?.required && (
            <span className="text-red-400 text-sm">*</span>
          )}
        </div>
      );

    case 'group-fields':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-800/50 rounded-lg">
          {field.fields?.map((subField) => (
            <div key={subField.id} style={{ width: subField.width || '100%' }}>
              <label className="block text-sm text-slate-300 mb-1">
                {subField.label}
                {subField.validation?.required && <span className="text-red-400"> *</span>}
              </label>
              <FieldRenderer
                field={subField as any}
                value={(value as Record<string, unknown>)?.[String(subField.id)]}
                onChange={(newValue) => {
                  handleChange({
                    ...(value as Record<string, unknown>),
                    [String(subField.id)]: newValue,
                  });
                }}
              />
            </div>
          ))}
        </div>
      );

    default:
      return (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg text-yellow-400">
          Tipo de campo no soportado: {field.type}
        </div>
      );
  }
};

export default FieldRenderer;