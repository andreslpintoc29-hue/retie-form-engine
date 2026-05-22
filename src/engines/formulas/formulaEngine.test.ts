// ============================================
// FORMULA ENGINE TESTS
// ============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormulaEngine, formulaEngine } from './formulaEngine';

describe('FormulaEngine', () => {
  beforeEach(() => {
    formulaEngine['formulas'].clear();
    formulaEngine['dependencyGraph'].clear();
    formulaEngine['computedValues'].clear();
  });

  describe('registerFormula', () => {
    it('should register a formula', () => {
      const formula: any = {
        id: 'avg-lux',
        name: 'Average Illuminance',
        formula: '(lux1 + lux2 + lux3) / 3',
        targetField: 'illuminance_avg',
        dependencies: ['lux1', 'lux2', 'lux3'],
        type: 'number'
      };

      formulaEngine.registerFormula(formula);
      const formulas = [...formulaEngine['formulas'].values()];
      
      expect(formulas).toHaveLength(1);
      expect(formulas[0].id).toBe('avg-lux');
    });

    it('should extract dependencies from formula', () => {
      const formula: any = {
        id: 'test-formula',
        name: 'Test Formula',
        formula: 'field_a + field_b * field_c',
        targetField: 'result',
        dependencies: [],
        type: 'number'
      };

      formulaEngine.registerFormula(formula);
      const deps = formulaEngine['dependencyGraph'].get('test-formula');

      expect(deps).toContain('field_a');
      expect(deps).toContain('field_b');
      expect(deps).toContain('field_c');
    });
  });

  describe('compute', () => {
    it('should compute simple addition', () => {
      formulaEngine.registerFormula({
        id: 'add',
        name: 'Add',
        formula: 'a + b',
        targetField: 'result',
        dependencies: ['a', 'b'],
        type: 'number'
      });

      const context = { values: { a: 5, b: 3 } };
      const result = formulaEngine.compute('add', context);

      expect(result.value).toBe(8);
      expect(result.error).toBeUndefined();
    });

    it('should compute simple multiplication', () => {
      formulaEngine.registerFormula({
        id: 'mult',
        name: 'Multiply',
        formula: 'voltage * current',
        targetField: 'power',
        dependencies: ['voltage', 'current'],
        type: 'number'
      });

      const context = { values: { voltage: 120, current: 10 } };
      const result = formulaEngine.compute('mult', context);

      expect(result.value).toBe(1200);
    });

    it('should handle division', () => {
      formulaEngine.registerFormula({
        id: 'divide',
        name: 'Divide',
        formula: 'total / count',
        targetField: 'average',
        dependencies: ['total', 'count'],
        type: 'number'
      });

      const context = { values: { total: 100, count: 4 } };
      const result = formulaEngine.compute('divide', context);

      expect(result.value).toBe(25);
    });

    it('should handle parentheses', () => {
      formulaEngine.registerFormula({
        id: 'formula-parens',
        name: 'Formula with Parens',
        formula: '(a + b) * c',
        targetField: 'result',
        dependencies: ['a', 'b', 'c'],
        type: 'number'
      });

      const context = { values: { a: 2, b: 3, c: 4 } };
      const result = formulaEngine.compute('formula-parens', context);

      expect(result.value).toBe(20);
    });

    it('should handle missing dependencies gracefully', () => {
      formulaEngine.registerFormula({
        id: 'missing-dep',
        name: 'Missing Dependency',
        formula: 'a + b',
        targetField: 'result',
        dependencies: ['a', 'b'],
        type: 'number'
      });

      const context = { values: { a: 5 } };
      const result = formulaEngine.compute('missing-dep', context);

      expect(result.value).toBeNull();
    });

    it('should apply precision', () => {
      formulaEngine.registerFormula({
        id: 'precise',
        name: 'Precise Formula',
        formula: 'a / b',
        targetField: 'result',
        dependencies: ['a', 'b'],
        type: 'number',
        precision: 2
      });

      const context = { values: { a: 10, b: 3 } };
      const result = formulaEngine.compute('precise', context);

      expect(result.value).toBe(3.33);
    });
  });

  describe('RETIE functions', () => {
    it('should compute ILLUMINANCE_AVG', () => {
      const context = {
        values: {
          lux1: 300,
          lux2: 350,
          lux3: 320,
          lux4: null,
          lux5: null
        }
      };

      const result = formulaEngine.compute('ILLUMINANCE_AVG', context);
      
      expect(result.value).toBe(323.33);
    });

    it('should compute COMPLIANCE_PCT', () => {
      const context = {
        values: {
          total_campos: 20,
          campos_conformes: 18
        }
      };

      const result = formulaEngine.compute('COMPLIANCE_PCT', context);
      
      expect(result.value).toBe(90);
    });

    it('should compute ISOLATION_RESISTANCE', () => {
      const context = {
        values: {
          voltaje: 220,
          corriente_fuga: 0.002
        }
      };

      const result = formulaEngine.compute('ISOLATION_RESISTANCE', context);
      
      expect(result.value).toBe(110000);
    });

    it('should compute POWER_FACTOR', () => {
      const context = {
        values: {
          potencia_activa: 1000,
          potencia_reactiva: 600
        }
      };

      const result = formulaEngine.compute('POWER_FACTOR', context);
      
      expect(result.value).toBeCloseTo(0.857, 2);
    });
  });

  describe('dependency graph', () => {
    it('should compute formulas in correct order', () => {
      formulaEngine.registerFormula({
        id: 'sum',
        name: 'Sum',
        formula: 'a + b',
        targetField: 'sum_result',
        dependencies: ['a', 'b'],
        type: 'number'
      });

      formulaEngine.registerFormula({
        id: 'mult',
        name: 'Multiply',
        formula: 'sum_result * c',
        targetField: 'final_result',
        dependencies: ['sum_result'],
        type: 'number'
      });

      const context = { values: { a: 2, b: 3, c: 10 } };
      const results = formulaEngine.computeAll(context);

      const sumResult = results.find(r => r.fieldId === 'sum_result');
      const finalResult = results.find(r => r.fieldId === 'final_result');

      expect(sumResult?.value).toBe(5);
      expect(finalResult?.value).toBe(50);
    });

    it('should prevent circular dependencies', () => {
      formulaEngine.registerFormula({
        id: 'a',
        name: 'A',
        formula: 'b + 1',
        targetField: 'a',
        dependencies: ['b'],
        type: 'number'
      });

      formulaEngine.registerFormula({
        id: 'b',
        name: 'B',
        formula: 'a + 1',
        targetField: 'b',
        dependencies: ['a'],
        type: 'number'
      });

      const context = { values: { a: 1, b: 1 } };
      const result = formulaEngine.computeAll(context);

      expect(result.length).toBe(2);
    });
  });

  describe('validateFormula', () => {
    it('should validate correct formula', () => {
      const result = formulaEngine.validateFormula('a + b * c');
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate formula with functions', () => {
      const result = formulaEngine.validateFormula('SUM(a, b)');
      
      expect(result.valid).toBe(true);
    });

    it('should detect invalid formula', () => {
      const result = formulaEngine.validateFormula('a ++ b');
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getComputedValue', () => {
    it('should return computed value by field ID', () => {
      formulaEngine.registerFormula({
        id: 'calc',
        name: 'Calculate',
        formula: 'a + b',
        targetField: 'result_field',
        dependencies: ['a', 'b'],
        type: 'number'
      });

      const context = { values: { a: 10, b: 20 } };
      formulaEngine.compute('calc', context);

      const computed = formulaEngine.getComputedValue('result_field');
      
      expect(computed?.value).toBe(30);
      expect(computed?.dependencies).toContain('a');
      expect(computed?.dependencies).toContain('b');
    });

    it('should return undefined for non-existent field', () => {
      const computed = formulaEngine.getComputedValue('nonexistent');
      
      expect(computed).toBeUndefined();
    });
  });

  describe('performance', () => {
    it('should handle many formulas efficiently', () => {
      for (let i = 0; i < 50; i++) {
        formulaEngine.registerFormula({
          id: `formula-${i}`,
          name: `Formula ${i}`,
          formula: `field${i}_a + field${i}_b`,
          targetField: `result${i}`,
          dependencies: [`field${i}_a`, `field${i}_b`],
          type: 'number'
        });
      }

      const values: Record<string, number> = {};
      for (let i = 0; i < 50; i++) {
        values[`field${i}_a`] = i;
        values[`field${i}_b`] = i * 2;
      }

      const context = { values };
      const start = Date.now();
      const results = formulaEngine.computeAll(context);
      const duration = Date.now() - start;

      expect(results).toHaveLength(50);
      expect(duration).toBeLessThan(100);
    });
  });
});