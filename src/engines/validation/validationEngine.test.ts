// ============================================
// VALIDATION ENGINE TESTS
// ============================================

import { describe, it, expect } from 'vitest';
import { validationEngine } from './validationEngine';
import type { Field } from '../../schemas/masterSchema';

const createMockField = (overrides: Partial<Field> = {}): Field => ({
  id: 'test-field',
  label: 'Test Field',
  type: 'text',
  ...overrides
});

describe('ValidationEngine', () => {
  describe('validateField', () => {
    it('should pass valid required field', () => {
      const field = createMockField({
        id: 'name',
        type: 'text',
        validation: [{ type: 'required', message: 'Name is required' }]
      });

      const result = validationEngine.validateField(field, 'John Doe');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail empty required field', () => {
      const field = createMockField({
        id: 'name',
        type: 'text',
        validation: [{ type: 'required', message: 'Name is required' }]
      });

      const result = validationEngine.validateField(field, '');

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Name is required');
    });

    it('should validate min length', () => {
      const field = createMockField({
        id: 'password',
        type: 'text',
        validation: [
          { type: 'required' },
          { type: 'minLength', value: 8, message: 'Password must be at least 8 characters' }
        ]
      });

      const shortResult = validationEngine.validateField(field, '1234567');
      expect(shortResult.isValid).toBe(false);

      const validResult = validationEngine.validateField(field, '12345678');
      expect(validResult.isValid).toBe(true);
    });

    it('should validate max length', () => {
      const field = createMockField({
        id: 'username',
        type: 'text',
        validation: [
          { type: 'maxLength', value: 20, message: 'Username cannot exceed 20 characters' }
        ]
      });

      const longName = 'a'.repeat(25);
      const result = validationEngine.validateField(field, longName);
      expect(result.isValid).toBe(false);

      const shortName = 'a'.repeat(15);
      const validResult = validationEngine.validateField(field, shortName);
      expect(validResult.isValid).toBe(true);
    });

    it('should validate pattern (regex)', () => {
      const field = createMockField({
        id: 'email',
        type: 'text',
        validation: [
          { type: 'pattern', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', message: 'Invalid email format' }
        ]
      });

      const invalidResult = validationEngine.validateField(field, 'not-an-email');
      expect(invalidResult.isValid).toBe(false);

      const validResult = validationEngine.validateField(field, 'test@example.com');
      expect(validResult.isValid).toBe(true);
    });

    it('should validate number min/max', () => {
      const field = createMockField({
        id: 'age',
        type: 'number',
        validation: [
          { type: 'min', value: 18, message: 'Must be at least 18 years old' },
          { type: 'max', value: 100, message: 'Cannot exceed 100 years' }
        ]
      });

      const tooYoung = validationEngine.validateField(field, 15);
      expect(tooYoung.isValid).toBe(false);

      const tooOld = validationEngine.validateField(field, 150);
      expect(tooOld.isValid).toBe(false);

      const valid = validationEngine.validateField(field, 25);
      expect(valid.isValid).toBe(true);
    });
  });

  describe('validateSection', () => {
    it('should validate all fields in a section', () => {
      const fields = [
        createMockField({ id: 'field1', validation: [{ type: 'required' }] }),
        createMockField({ id: 'field2', type: 'number', validation: [{ type: 'required' }, { type: 'min', value: 0 }] }),
        createMockField({ id: 'field3', validation: [{ type: 'required' }] })
      ];

      const answers = {
        field1: 'value1',
        field2: -5,
        field3: 'value3'
      };

      const result = validationEngine.validateSection(fields, answers);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].fieldId).toBe('field2');
    });

    it('should pass when all fields valid', () => {
      const fields = [
        createMockField({ id: 'field1', validation: [{ type: 'required' }] }),
        createMockField({ id: 'field2', validation: [{ type: 'required' }] })
      ];

      const answers = { field1: 'value1', field2: 'value2' };
      const result = validationEngine.validateSection(fields, answers);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('cross-field validation', () => {
    it('should support cross field validation', () => {
      const field = createMockField({ id: 'confirm_password' });
      const crossRule = {
        targetField: 'password',
        operator: 'equals' as const,
        value: 'secret123',
        message: 'Passwords do not match'
      };

      const invalidAnswers = {
        password: 'different'
      };

      const error = validationEngine.validateCrossField(field, crossRule, invalidAnswers);
      expect(error).not.toBeNull();
      expect(error?.message).toBe('Passwords do not match');

      const validAnswers = {
        password: 'secret123'
      };

      const noError = validationEngine.validateCrossField(field, crossRule, validAnswers);
      expect(noError).toBeNull();
    });
  });
});