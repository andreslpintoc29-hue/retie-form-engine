// ============================================
// FORMULA ENGINE - Parser & Computed Values
// ============================================

export interface FormulaDefinition {
  id: string;
  name: string;
  formula: string;
  targetField: string;
  dependencies: string[];
  type: 'number' | 'percentage' | 'boolean' | 'string';
  precision?: number;
}

export interface ComputedValue {
  fieldId: string;
  value: number | string | boolean | null;
  dependencies: string[];
  computedAt: string;
  error?: string;
}

export interface FormulaContext {
  values: Record<string, unknown>;
  rows?: Record<string, unknown>[];
  globals?: Record<string, unknown>;
}

const FUNCTIONS = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'ROUND', 'IF', 'ABS', 'POWER', 'SQRT'];

const RETIE_FORMULAS: Record<string, (ctx: FormulaContext) => unknown> = {
  RESISTANCE: (ctx) => {
    const r = ctx.values['resistencia'];
    const i = ctx.values['corriente'];
    return r && i ? Number(r) * Number(i) : null;
  },
  ILLUMINANCE_AVG: (ctx) => {
    const vals = ['lux1', 'lux2', 'lux3', 'lux4', 'lux5', 'lux6', 'lux7', 'lux8', 'lux9']
      .map(k => ctx.values[k] as number)
      .filter(v => typeof v === 'number' && v !== null);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  },
  COMPLIANCE_PCT: (ctx) => {
    const total = Number(ctx.values['total_campos']) || 0;
    const compliant = Number(ctx.values['campos_conformes']) || 0;
    return total > 0 ? (compliant / total) * 100 : null;
  },
  ISOLATION_RESISTANCE: (ctx) => {
    const v = ctx.values['voltaje'];
    const i = ctx.values['corriente_fuga'];
    return i && v && Number(i) > 0 ? Number(v) / Number(i) : null;
  },
  POWER_FACTOR: (ctx) => {
    const p = ctx.values['potencia_activa'];
    const q = ctx.values['potencia_reactiva'];
    if (p === undefined || q === undefined || p === null || q === null) return null;
    const s = Math.sqrt(Number(p) * Number(p) + Number(q) * Number(q));
    return s > 0 ? Number(p) / s : null;
  }
};

export class FormulaEngine {
  private formulas: Map<string, FormulaDefinition> = new Map();
  private dependencyGraph: Map<string, string[]> = new Map();
  private computedValues: Map<string, ComputedValue> = new Map();

  registerFormula(formula: FormulaDefinition): void {
    this.formulas.set(formula.id, formula);
    const deps = this.extractDependencies(formula.formula);
    this.dependencyGraph.set(formula.id, deps);
  }

  private extractDependencies(formula: string): string[] {
    const varMatches = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    // Extract actual function calls (e.g. "COUNT(")
    const functionCalls = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*\s*\(/g) || [];
    const funcNames = functionCalls.map(f => f.replace(/\s*\(/, '').toUpperCase());

    const dependencies = Array.from(new Set(varMatches)).filter(v => {
      const isFunction = FUNCTIONS.includes(v.toUpperCase()) && funcNames.includes(v.toUpperCase());
      return !isFunction;
    });
    return dependencies;
  }

  compute(formulaId: string, context: FormulaContext): ComputedValue {
    let formula = this.formulas.get(formulaId);
    if (!formula && formulaId in RETIE_FORMULAS) {
      formula = {
        id: formulaId,
        name: formulaId,
        formula: formulaId,
        targetField: formulaId,
        dependencies: [],
        type: 'number'
      };
    }

    if (!formula) {
      return {
        fieldId: formulaId,
        value: null,
        dependencies: [],
        computedAt: new Date().toISOString(),
        error: `Fórmula ${formulaId} no encontrada`
      };
    }

    try {
      // 1. If it's a RETIE built-in formula, evaluate it directly!
      if (formula.formula in RETIE_FORMULAS) {
        const fn = RETIE_FORMULAS[formula.formula];
        let res = fn(context);
        const precision = formula.precision !== undefined ? formula.precision : 2;
        if (typeof res === 'number') {
          res = Math.round(res * Math.pow(10, precision)) / Math.pow(10, precision);
        }
        const computed: ComputedValue = {
          fieldId: formula.targetField,
          value: typeof res === 'number' ? res : null,
          dependencies: this.dependencyGraph.get(formulaId) || [],
          computedAt: new Date().toISOString()
        };
        this.computedValues.set(formulaId, computed);
        return computed;
      }

      // 2. Otherwise, parse and evaluate the math expression!
      let expr = formula.formula;
      const variables = this.extractDependencies(expr);

      let hasMissing = false;
      for (const v of variables) {
        const val = context.values[v];
        if (val === undefined || val === null) {
          hasMissing = true;
          break;
        }
      }

      if (hasMissing) {
        const computed: ComputedValue = {
          fieldId: formula.targetField,
          value: null,
          dependencies: this.dependencyGraph.get(formulaId) || [],
          computedAt: new Date().toISOString()
        };
        this.computedValues.set(formulaId, computed);
        return computed;
      }

      // Replace variables with their numeric values
      const sortedVars = [...variables].sort((a, b) => b.length - a.length);
      for (const v of sortedVars) {
        const val = Number(context.values[v]);
        expr = expr.replace(new RegExp('\\b' + v + '\\b', 'g'), String(val));
      }

      const sanitized = expr.replace(/[^0-9+\-*/(). ]/g, '');
      let result = Function('"use strict"; return (' + sanitized + ')')();

      if (typeof result === 'number' && formula.precision !== undefined) {
        result = Math.round(result * Math.pow(10, formula.precision)) / Math.pow(10, formula.precision);
      }

      const computed: ComputedValue = {
        fieldId: formula.targetField,
        value: typeof result === 'number' ? result : null,
        dependencies: this.dependencyGraph.get(formulaId) || [],
        computedAt: new Date().toISOString()
      };

      this.computedValues.set(formulaId, computed);
      return computed;
    } catch (error) {
      return {
        fieldId: formula.targetField,
        value: null,
        dependencies: this.dependencyGraph.get(formulaId) || [],
        computedAt: new Date().toISOString(),
        error: `Error al evaluar: ${error}`
      };
    }
  }

  computeAll(context: FormulaContext): ComputedValue[] {
    const results: ComputedValue[] = [];
    const sorted = this.topologicalSort();
    
    for (const formulaId of sorted) {
      const computed = this.compute(formulaId, context);
      if (computed.value !== null) {
        context.values[computed.fieldId] = computed.value;
      }
      results.push(computed);
    }
    
    return results;
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = this.dependencyGraph.get(id) || [];
      for (const dep of deps) {
        const depFormula = Array.from(this.formulas.values()).find(f => f.targetField === dep);
        if (depFormula) visit(depFormula.id);
      }

      result.push(id);
    };

    for (const id of Array.from(this.formulas.keys())) {
      visit(id);
    }

    return result;
  }

  getComputedValue(fieldId: string): ComputedValue | undefined {
    for (const computed of Array.from(this.computedValues.values())) {
      if (computed.fieldId === fieldId) return computed;
    }
    return undefined;
  }

  validateFormula(formula: string): { valid: boolean; error?: string } {
    try {
      if (/[\+\-\*\/]{2,}/.test(formula)) {
        return { valid: false, error: 'Operadores consecutivos no válidos' };
      }
      let parens = 0;
      for (const char of formula) {
        if (char === '(') parens++;
        if (char === ')') parens--;
        if (parens < 0) return { valid: false, error: 'Paréntesis desbalanceados' };
      }
      if (parens !== 0) return { valid: false, error: 'Paréntesis desbalanceados' };
      return { valid: true };
    } catch (error) {
      return { valid: false, error: `Fórmula inválida: ${error}` };
    }
  }
}

export const formulaEngine = new FormulaEngine();

export const retieFormulas = {
  RESISTANCE: 'R * I',
  ILLUMINANCE_AVG: 'AVG(lux1, lux2, lux3, ..., lux9)',
  COMPLIANCE_PCT: '(conform_fields / total_fields) * 100',
  ISOLATION_RESISTANCE: 'V / I_leakage',
  POWER_FACTOR: 'P / SQRT(P² + Q²)'
};