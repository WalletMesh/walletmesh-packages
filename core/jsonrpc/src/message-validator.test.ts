import { describe, expect, it } from 'vitest';
import { MessageValidator } from './message-validator.js';

describe('MessageValidator', () => {
  const validator = new MessageValidator();

  describe('isValidMessage', () => {
    it('should validate basic message structure', () => {
      expect(validator.isValidMessage({ jsonrpc: '2.0', method: 'test', id: '1' })).toBe(true);
      expect(validator.isValidMessage({ jsonrpc: '1.0', method: 'test', id: '1' })).toBe(false);
      expect(validator.isValidMessage(null)).toBe(false);
      expect(validator.isValidMessage(undefined)).toBe(false);
      expect(validator.isValidMessage({})).toBe(false);
    });

    it('should validate method calls with different ID types', () => {
      expect(validator.isValidMessage({ jsonrpc: '2.0', method: 'test', id: '123' })).toBe(true);
      expect(validator.isValidMessage({ jsonrpc: '2.0', method: 'test', id: 123 })).toBe(true);
      expect(validator.isValidMessage({ jsonrpc: '2.0', method: 'test' })).toBe(true); // Notification
    });

    it('should validate event messages', () => {
      expect(validator.isValidMessage({ jsonrpc: '2.0', event: 'test', params: {} })).toBe(true);
      expect(validator.isValidMessage({ jsonrpc: '2.0', event: 123 })).toBe(false);
    });

    it('should validate response messages', () => {
      expect(validator.isValidMessage({ jsonrpc: '2.0', result: 'test', id: '1' })).toBe(true);
      expect(validator.isValidMessage({ jsonrpc: '2.0', error: {}, id: '1' })).toBe(true);
    });
  });

  describe('isValidRequest', () => {
    it('should validate request structure', () => {
      expect(validator.isValidRequest({ method: 'test', params: { a: 1 }, id: '1' })).toBe(true);
      expect(validator.isValidRequest({ method: 'test' })).toBe(true);
      expect(validator.isValidRequest(null)).toBe(false);
      expect(validator.isValidRequest({})).toBe(false);
      expect(validator.isValidRequest({ method: 123 })).toBe(false);
    });

    it('should validate different params formats', () => {
      expect(validator.isValidRequest({ method: 'test', params: { a: 1 } })).toBe(true);
      expect(validator.isValidRequest({ method: 'test', params: [1, 2, 3] })).toBe(true);
      expect(validator.isValidRequest({ method: 'test', params: null })).toBe(false);
      expect(validator.isValidRequest({ method: 'test', params: 123 })).toBe(false);
    });
  });

  describe('isValidParams', () => {
    it('should validate parameter formats', () => {
      expect(validator.isValidParams({ a: 1, b: 2 })).toBe(true);
      expect(validator.isValidParams([1, 2, 3])).toBe(true);
      expect(validator.isValidParams(null)).toBe(false);
      expect(validator.isValidParams(123)).toBe(false);
      expect(validator.isValidParams('string')).toBe(false);
    });

    it('should validate nested objects', () => {
      expect(
        validator.isValidParams({
          nested: { a: 1, b: 'string' },
          arr: [1, 2, 3],
        }),
      ).toBe(true);
      expect(
        validator.isValidParams({
          nested: { a: Symbol(), b: 'string' },
        }),
      ).toBe(false);
    });

    it('should validate nested objects with name property', () => {
      expect(
        validator.isValidParams({
          nested: { name: 'valid' },
        }),
      ).toBe(true);
      expect(
        validator.isValidParams({
          nested: { name: 123 }, // Invalid: name must be string
        }),
      ).toBe(false);
      expect(
        validator.isValidParams({
          deeply: { nested: { name: 123 } }, // Invalid: nested name must be string
        }),
      ).toBe(false);
    });

    it('should validate name property type', () => {
      expect(validator.isValidParams({ name: 'test' })).toBe(true);
      expect(validator.isValidParams({ name: 123 })).toBe(false);
      expect(validator.isValidParams({ name: { value: 'test' } })).toBe(false);
    });

    it('should validate arrays with complex elements', () => {
      expect(validator.isValidParams([{ a: 1 }, { b: 'string' }, [1, 2, 3]])).toBe(true);
      expect(validator.isValidParams([{ a: 1 }, Symbol(), [1, 2, 3]])).toBe(false);
    });
  });

  describe('isValidObject', () => {
    it('should validate object format', () => {
      expect(validator.isValidObject({ a: 1 })).toBe(true);
      expect(validator.isValidObject({})).toBe(true);
      expect(validator.isValidObject([])).toBe(false);
      expect(validator.isValidObject(null)).toBe(false);
      expect(validator.isValidObject(123)).toBe(false);
      expect(validator.isValidObject('string')).toBe(false);
    });
  });

  describe('isValidArray', () => {
    it('should validate array format', () => {
      expect(validator.isValidArray([])).toBe(true);
      expect(validator.isValidArray([1, 2, 3])).toBe(true);
      expect(validator.isValidArray({})).toBe(false);
      expect(validator.isValidArray(null)).toBe(false);
      expect(validator.isValidArray(123)).toBe(false);
      expect(validator.isValidArray('string')).toBe(false);
    });
  });
});
