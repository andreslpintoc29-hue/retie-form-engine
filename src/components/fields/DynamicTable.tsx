'use client';

import React, { useState, useCallback } from 'react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { FormField, TableColumn } from '@/types/schema';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DynamicTableProps {
  field: FormField;
  value: { rows: Record<string, any>[] } | undefined;
  onChange: (value: { rows: Record<string, any>[] }) => void;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({ field, value, onChange }) => {
  const columns = field.columns || [];
  const rows = value?.rows || [];

  const addRow = useCallback(() => {
    const newRow = { id: uuidv4() };
    onChange({ rows: [...rows, newRow] });
  }, [rows, onChange]);

  const removeRow = useCallback((rowId: string) => {
    onChange({ rows: rows.filter(row => row.id !== rowId) });
  }, [rows, onChange]);

  const updateCell = useCallback((rowId: string, column: string, cellValue: any) => {
    const updatedRows = rows.map(row => {
      if (row.id === rowId) {
        return { ...row, [column]: cellValue };
      }
      return row;
    });
    onChange({ rows: updatedRows });
  }, [rows, onChange]);

  const renderCell = (row: Record<string, any>, column: TableColumn, rowId: string) => {
    const cellValue = row[column.field];

    switch (column.type) {
      case 'number':
        return (
          <input
            type="number"
            value={cellValue as number || ''}
            onChange={(e) => updateCell(rowId, column.field, e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-retie-accent"
            placeholder="0"
          />
        );

      case 'decimal':
        return (
          <input
            type="number"
            step="0.01"
            value={cellValue as number || ''}
            onChange={(e) => updateCell(rowId, column.field, e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-center focus:outline-none focus:ring-2 focus:ring-retie-accent"
            placeholder="0.00"
          />
        );

      case 'select':
        return (
          <select
            value={cellValue as string || ''}
            onChange={(e) => updateCell(rowId, column.field, e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-retie-accent"
          >
            <option value="">Seleccione</option>
            {column.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={cellValue as string || ''}
            onChange={(e) => updateCell(rowId, column.field, e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-retie-accent"
          />
        );

      default:
        return (
          <input
            type="text"
            value={cellValue as string || ''}
            onChange={(e) => updateCell(rowId, column.field, e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-retie-accent"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          {field.label}
          {field.validation?.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-2 px-3 py-1.5 bg-retie-accent/20 text-retie-accent rounded-lg hover:bg-retie-accent/30 transition-colors text-sm"
        >
          <Plus size={16} />
          Agregar fila
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-700">
              <th className="p-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider w-10">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.field}
                  className="p-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              <th className="p-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="p-8 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <Plus size={24} className="text-slate-500" />
                    </div>
                    <p>No hay registros</p>
                    <button
                      type="button"
                      onClick={addRow}
                      className="text-retie-accent hover:underline text-sm"
                    >
                      Agregar primera fila
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-800/30">
                  <td className="p-3 text-slate-400 text-sm text-center">
                    {index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.field} className="p-2">
                      {renderCell(row, col, String(row.id))}
                    </td>
                  ))}
                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(String(row.id))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Eliminar fila"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      {rows.length > 0 && (
        <div className="flex justify-between items-center text-sm text-slate-400 px-2">
          <span>Total de registros: {rows.length}</span>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;