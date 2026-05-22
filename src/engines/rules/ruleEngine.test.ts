// ============================================
// RULE ENGINE TESTS
// ============================================

import { describe, it, expect } from 'vitest';
import { RuleEngine, RuleDefinition } from './ruleEngine';

describe('RuleEngine', () => {
  it('should support loading rules', () => {
    const rules: RuleDefinition[] = [
      {
        id: 'rule-1',
        name: 'Test Rule',
        priority: 10,
        enabled: true,
        conditions: [
          { field: 'testField', operator: 'equals', value: 'yes' }
        ],
        conditionOperator: 'AND',
        actions: [
          { action: 'show', targetField: 'targetField' }
        ]
      }
    ];

    const engine = new RuleEngine();
    engine.loadRules(rules);

    const answers = { testField: 'yes' };
    const actions = engine.evaluateAll(answers, '');

    expect(actions.has('targetField')).toBe(true);
    const targetActions = actions.get('targetField');
    expect(targetActions).toBeDefined();
    expect(targetActions?.[0].action).toBe('show');
  });

  it('should evaluate rules conditional operator OR', () => {
    const rules: RuleDefinition[] = [
      {
        id: 'rule-2',
        name: 'OR Test Rule',
        priority: 10,
        enabled: true,
        conditions: [
          { field: 'fieldA', operator: 'equals', value: 'yes' },
          { field: 'fieldB', operator: 'equals', value: 'yes' }
        ],
        conditionOperator: 'OR',
        actions: [
          { action: 'hide', targetField: 'targetField' }
        ]
      }
    ];

    const engine = new RuleEngine(rules);

    // Only one condition met
    const answers1 = { fieldA: 'yes', fieldB: 'no' };
    const actions1 = engine.evaluateAll(answers1, '');
    expect(actions1.has('targetField')).toBe(true);

    // No condition met
    const answers2 = { fieldA: 'no', fieldB: 'no' };
    const actions2 = engine.evaluateAll(answers2, '');
    expect(actions2.has('targetField')).toBe(false);
  });

  it('should support checking actions for a specific field', () => {
    const rules: RuleDefinition[] = [
      {
        id: 'rule-3',
        name: 'Specific Field Test',
        priority: 10,
        enabled: true,
        conditions: [
          { field: 'field', operator: 'equals', value: 'yes' }
        ],
        conditionOperator: 'AND',
        actions: [
          { action: 'require', targetField: 'target' }
        ]
      }
    ];

    const engine = new RuleEngine(rules);
    const answers = { field: 'yes' };
    const actions = engine.getActionsForField('target', answers);

    expect(actions).toHaveLength(1);
    expect(actions[0].action).toBe('require');
  });
});