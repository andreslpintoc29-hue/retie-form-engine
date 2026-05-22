/**
 * =====================================================
 * DYNAMIC TABLE ENGINE - TABLAS DINÁMICAS PRO
 * =====================================================
 * 
 * Características:
 * - Agregar/eliminar filas
 * - Fórmulas
 * - Celdas calculadas
 * - Validaciones por columna
 * - Filas anidadas
 * - Filas por defecto
 * - Totales dinámicos
 * - Formato condicional
 */

import { TableColumn, TableAnswer } from '@/schemas/masterSchema';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// TIPOS
// ============================================

export interface TableConfig {
  allowAddRow: boolean;
  allowDeleteRow: boolean;
  allowReorder: boolean;
  minRows: number;
  maxRows: number;
  defaultRowCount: number;
  showTotals: boolean;
  showRowNumber: boolean;
  collapsible: boolean;
}

export interface TableRow {
  id: string;
  data: Record<string, unknown>;
  isCollapsed?: boolean;
  isCalculated?: boolean;
  isReadOnly?: boolean;
}

export interface TableTotals {
  [column: string]: number | string;
}

export interface CellValidation {
  isValid: boolean;
  errors: string[];
}

// ============================================
// MOTOR DE FÓRMULAS
// ============================================

export class FormulaEngine {
  // Evaluar fórmula
  evaluate(
    formula: string,
    row: Record<string, unknown>,
    allRows: Record<string, unknown>[]
  ): unknown {
    try {
      // Reemplazar referencias de celdas
      let parsed = formula;
      
      // Reemplazar referencias como ${fieldName}
      parsed = parsed.replace(/\$\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (_, fieldName) => {
        const value = row[fieldName];
        return typeof value === 'number' ? String(value) : '0';
      });
      
      // Funciones predefinidas
      parsed = this.replaceFunctions(parsed, row, allRows);
      
      // Evaluar expresión matemática segura
      return this.safeEval(parsed);
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return null;
    }
  }

  // Reemplazar funciones predefinidas
  private replaceFunctions(
    formula: string,
    row: Record<string, unknown>,
    allRows: Record<string, unknown>[]
  ): string {
    // SUM(column) - suma de columna
    formula = formula.replace(/SUM\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (_, col) => {
      const sum = allRows.reduce((acc, r) => {
        const val = Number(r[col]);
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      return String(sum);
    });
    
    // AVG(column) - promedio
    formula = formula.replace(/AVG\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (_, col) => {
      const values = allRows.map(r => Number(r[col])).filter(v => !isNaN(v));
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return String(avg);
    });
    
    // COUNT(column) - contar
    formula = formula.replace(/COUNT\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (_, col) => {
      const count = allRows.filter(r => r[col] !== null && r[col] !== undefined && r[col] !== '').length;
      return String(count);
    });
    
    // MIN(column) - mínimo
    formula = formula.replace(/MIN\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (_, col) => {
      const values = allRows.map(r => Number(r[col])).filter(v => !isNaN(v));
      const min = values.length > 0 ? Math.min(...values) : 0;
      return String(min);
    });
    
    // MAX(column) - máximo
    formula = formula.replace(/MAX\(([a-zA-Z_][a-zA-Z0-9_]*)\)/g, (_, col) => {
      const values = allRows.map(r => Number(r[col])).filter(v => !isNaN(v));
      const max = values.length > 0 ? Math.max(...values) : 0;
      return String(max);
    });
    
    // IF(condition, trueValue, falseValue)
    formula = formula.replace(/IF\(([^,]+),([^,]+),([^)]+)\)/g, (_, cond, trueVal, falseVal) => {
      try {
        // Evaluar condición simple
        const condition = cond.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*>\s*([0-9.]+)/, (_: string, field: string, val: string) => {
          return String(Number(row[field]) > Number(val));
        });
        return eval(condition) ? trueVal.trim() : falseVal.trim();
      } catch {
        return falseVal;
      }
    });
    
    // ROUND(value, decimals)
    formula = formula.replace(/ROUND\(([^,]+),([^)]+)\)/g, (_, val, decimals) => {
      const num = Number(val);
      const dec = parseInt(decimals);
      return isNaN(num) ? '0' : String(Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec));
    });
    
    return formula;
  }

  // Evaluación segura de expresiones matemáticas
  private safeEval(expression: string): number {
    // Solo permitir números, operadores y paréntesis
    const sanitized = expression.replace(/[^0-9+\-*/(). ]/g, '');
    return Function('"use strict"; return (' + sanitized + ')')();
  }
}

// ============================================
// ENGINE PRINCIPAL DE TABLAS
// ============================================

export class DynamicTableEngine {
  private formulaEngine: FormulaEngine;
  private config: TableConfig;
  
  constructor(config?: Partial<TableConfig>) {
    this.formulaEngine = new FormulaEngine();
    this.config = {
      allowAddRow: true,
      allowDeleteRow: true,
      allowReorder: false,
      minRows: 0,
      maxRows: 1000,
      defaultRowCount: 0,
      showTotals: true,
      showRowNumber: true,
      collapsible: false,
      ...config
    };
  }

  // Crear fila vacía con valores por defecto
  createRow(columns: TableColumn[], index: number): TableRow {
    const data: Record<string, unknown> = { id: uuidv4() };
    
    columns.forEach(col => {
      if (col.defaultValue !== undefined) {
        data[col.field] = col.defaultValue;
      } else if (col.type === 'number' || col.type === 'decimal') {
        data[col.field] = null;
      } else if (col.type === 'select') {
        data[col.field] = '';
      } else {
        data[col.field] = '';
      }
    });
    
    return {
      id: data.id as string,
      data,
      isCollapsed: false
    };
  }

  // Crear filas iniciales
  createInitialRows(columns: TableColumn[]): TableRow[] {
    const rows: TableRow[] = [];
    const count = this.config.defaultRowCount || 1;
    
    for (let i = 0; i < Math.min(count, this.config.maxRows); i++) {
      rows.push(this.createRow(columns, i));
    }
    
    return rows;
  }

  // Agregar fila
  addRow(currentRows: TableRow[], columns: TableColumn[]): TableRow[] {
    if (currentRows.length >= this.config.maxRows) {
      throw new Error(`Máximo ${this.config.maxRows} filas permitidas`);
    }
    
    return [...currentRows, this.createRow(columns, currentRows.length)];
  }

  // Eliminar fila
  removeRow(currentRows: TableRow[], rowId: string): TableRow[] {
    if (currentRows.length <= this.config.minRows) {
      throw new Error(`Mínimo ${this.config.minRows} filas requeridas`);
    }
    
    return currentRows.filter(row => row.id !== rowId);
  }

  // Actualizar celda
  updateCell(
    currentRows: TableRow[],
    rowId: string,
    column: string,
    value: unknown,
    columns: TableColumn[]
  ): TableRow[] {
    return currentRows.map(row => {
      if (row.id !== rowId) return row;
      
      const newData = { ...row.data, [column]: value };
      
      // Recalcular celdas con fórmulas
      columns.forEach(col => {
        if (col.formula) {
          newData[col.field] = this.formulaEngine.evaluate(
            col.formula,
            newData,
            currentRows.map(r => r.data)
          );
        }
      });
      
      return { ...row, data: newData };
    });
  }

  // Validar fila
  validateRow(row: TableRow, columns: TableColumn[]): CellValidation {
    const errors: string[] = [];
    
    columns.forEach(col => {
      const value = row.data[col.field];
      
      // Validar requerido
      if (col.required && (value === null || value === undefined || value === '')) {
        errors.push(`${col.label} es requerido`);
      }
      
      // Validar tipo number
      if (col.type === 'number' && value !== null && value !== undefined) {
        if (typeof value !== 'number' || isNaN(Number(value))) {
          errors.push(`${col.label} debe ser un número`);
        }
      }
      
      // Validar tipo decimal
      if (col.type === 'decimal' && value !== null && value !== undefined) {
        if (isNaN(parseFloat(String(value)))) {
          errors.push(`${col.label} debe ser un número decimal`);
        }
      }
      
      // Validar rango
      if (col.validation) {
        col.validation.forEach(rule => {
          if (rule.type === 'min' && Number(value) < Number(rule.value)) {
            errors.push(rule.message || `${col.label} mínimo: ${rule.value}`);
          }
          if (rule.type === 'max' && Number(value) > Number(rule.value)) {
            errors.push(rule.message || `${col.label} máximo: ${rule.value}`);
          }
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calcular totales
  calculateTotals(rows: TableRow[], columns: TableColumn[]): TableTotals {
    const totals: TableTotals = {};
    
    if (!this.config.showTotals) return totals;
    
    columns.forEach(col => {
      if (col.formula) {
        // Usar fórmula de totals si existe
        totals[col.field] = this.formulaEngine.evaluate(
          col.formula,
          {},
          rows.map(r => r.data)
        ) as string | number;
      } else if (col.type === 'number' || col.type === 'decimal') {
        // Sumar columna numérica
        const sum = rows.reduce((acc, row) => {
          const val = Number(row.data[col.field]);
          return acc + (isNaN(val) ? 0 : val);
        }, 0);
        
        totals[col.field] = col.type === 'decimal' ? Math.round(sum * 100) / 100 : sum;
      }
    });
    
    return totals;
  }

  // Reordenar filas (drag & drop)
  reorderRows(currentRows: TableRow[], fromIndex: number, toIndex: number): TableRow[] {
    if (!this.config.allowReorder) return currentRows;
    
    const rows = [...currentRows];
    const [removed] = rows.splice(fromIndex, 1);
    rows.splice(toIndex, 0, removed);
    
    return rows;
  }

  // Duplicar fila
  duplicateRow(currentRows: TableRow[], rowId: string, columns: TableColumn[]): TableRow[] {
    const rowToDuplicate = currentRows.find(r => r.id === rowId);
    if (!rowToDuplicate) return currentRows;
    
    const newRow = this.createRow(columns, currentRows.length);
    const duplicatedData = { ...rowToDuplicate.data };
    delete duplicatedData.id;
    
    return [...currentRows, { ...newRow, data: duplicatedData }];
  }

  // Importar datos (desde Excel/JSON)
  importData(
    data: Record<string, unknown>[],
    columns: TableColumn[]
  ): TableRow[] {
    return data.map((item, index) => ({
      id: item.id as string || uuidv4(),
      data: { ...item },
      isCollapsed: false
    }));
  }

  // Exportar datos (para Excel/JSON)
  exportData(rows: TableRow[]): Record<string, unknown>[] {
    return rows.map(row => ({ ...row.data }));
  }

  // Obtener datos para guardar en DB
  toTableAnswer(rows: TableRow[], columns: TableColumn[]): TableAnswer {
    const totals = this.calculateTotals(rows, columns);
    
    return {
      rows: rows.map(r => r.data),
      totals: Object.keys(totals).length > 0 ? totals : undefined,
      metadata: {
        addedRows: 0,
        deletedRows: 0,
        lastModified: new Date().toISOString()
      }
    };
  }

  // Cargar desde DB
  fromTableAnswer(answer: TableAnswer): TableRow[] {
    if (!answer.rows) return [];
    
    return answer.rows.map((data, index) => ({
      id: (data.id as string) || uuidv4(),
      data,
      isCollapsed: false
    }));
  }
}

// ============================================
// INSTANCIA GLOBAL
// ============================================

export const dynamicTableEngine = new DynamicTableEngine();

export default DynamicTableEngine;