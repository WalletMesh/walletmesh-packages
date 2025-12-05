/**
 * Tests for value formatting utilities
 *
 * @module formatters.test
 */

import { describe, it, expect } from 'vitest';
import { formatArgumentValue } from './formatters.js';
import type { AbiType } from '@aztec/aztec.js/abi';

describe('formatArgumentValue', () => {
  describe('field type formatting', () => {
    it('should format short field values without truncation', () => {
      const abiType: AbiType = { kind: 'field' };
      const value = '0x123456';

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('0x123456');
      expect(result.raw).toBe('0x123456');
      expect(result.copyable).toBe(true);
    });

    it('should truncate long field values', () => {
      const abiType: AbiType = { kind: 'field' };
      const value = '0x07ad992ffcf83a154156605c4afeba3fdd3edd124a71a6653b66914659407d4d';

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('0x07ad992f...59407d4d');
      expect(result.raw).toBe('0x07ad992ffcf83a154156605c4afeba3fdd3edd124a71a6653b66914659407d4d');
      expect(result.copyable).toBe(true);
    });
  });

  describe('boolean type formatting', () => {
    it('should format true boolean', () => {
      const abiType: AbiType = { kind: 'boolean' };
      const value = true;

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('true');
      expect(result.raw).toBe('true');
      expect(result.copyable).toBe(false);
    });

    it('should format false boolean', () => {
      const abiType: AbiType = { kind: 'boolean' };
      const value = false;

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('false');
      expect(result.raw).toBe('false');
      expect(result.copyable).toBe(false);
    });
  });

  describe('integer type formatting', () => {
    it('should format positive integer with locale formatting', () => {
      const abiType: AbiType = { kind: 'integer', sign: 'unsigned', width: 32 };
      const value = '1000000';

      const result = formatArgumentValue(value, abiType);

      // Note: locale formatting may vary, so we check for the raw value
      expect(result.raw).toBe('1000000');
      expect(result.copyable).toBe(false);
      // Display should have locale formatting (e.g., "1,000,000")
      expect(result.display).toContain('1');
    });

    it('should handle signed integers', () => {
      const abiType: AbiType = { kind: 'integer', sign: 'signed', width: 32 };
      const value = '-12345';

      const result = formatArgumentValue(value, abiType);

      expect(result.raw).toBe('-12345');
      expect(result.copyable).toBe(false);
    });

    it('should handle BigInt values', () => {
      const abiType: AbiType = { kind: 'integer', sign: 'unsigned', width: 64 };
      const value = '18446744073709551615'; // Max uint64

      const result = formatArgumentValue(value, abiType);

      expect(result.raw).toBe('18446744073709551615');
      expect(result.copyable).toBe(false);
    });

    it('should fallback on invalid BigInt conversion', () => {
      const abiType: AbiType = { kind: 'integer', sign: 'unsigned', width: 32 };
      const value = 'not a number';

      const result = formatArgumentValue(value, abiType);

      // Should fallback to default formatting
      expect(result.raw).toBe('not a number');
      expect(result.copyable).toBe(true);
    });
  });

  describe('array type formatting', () => {
    it('should format short arrays inline', () => {
      const abiType: AbiType = {
        kind: 'array',
        length: 3,
        type: { kind: 'field' },
      };
      const value = ['0x01', '0x02', '0x03'];

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('[0x01, 0x02, 0x03]');
      expect(result.raw).toContain('0x01');
      expect(result.copyable).toBe(true);
    });

    it('should show count for long arrays', () => {
      const abiType: AbiType = {
        kind: 'array',
        length: 10,
        type: { kind: 'field' },
      };
      const value = ['0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07', '0x08', '0x09', '0x0a'];

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('[10 elements]');
      expect(result.raw).toContain('0x01');
      expect(result.copyable).toBe(true);
    });

    it('should format nested arrays', () => {
      const abiType: AbiType = {
        kind: 'array',
        length: 2,
        type: {
          kind: 'array',
          length: 2,
          type: { kind: 'field' },
        },
      };
      const value = [
        ['0x01', '0x02'],
        ['0x03', '0x04'],
      ];

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toContain('[');
      expect(result.copyable).toBe(true);
    });

    it('should handle non-array values gracefully', () => {
      const abiType: AbiType = {
        kind: 'array',
        length: 3,
        type: { kind: 'field' },
      };
      const value = 'not an array';

      const result = formatArgumentValue(value, abiType);

      // Should fallback to default formatting
      expect(result.raw).toBe('not an array');
      expect(result.copyable).toBe(true);
    });

    it('should handle mismatched abiType (non-array type for array value)', () => {
      const abiType: AbiType = { kind: 'field' }; // Not an array type
      const value = ['0x01', '0x02'];

      const result = formatArgumentValue(value, abiType);

      // Should fallback to default formatting
      expect(result.copyable).toBe(true);
    });
  });

  describe('struct type formatting', () => {
    it('should format struct with path', () => {
      const abiType: AbiType = {
        kind: 'struct',
        path: 'MyStruct',
        fields: [],
      };
      const value = { field1: '0x01', field2: '0x02' };

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('MyStruct { ... }');
      expect(result.raw).toContain('field1');
      expect(result.copyable).toBe(true);
    });

    it('should format struct without path', () => {
      const abiType: AbiType = {
        kind: 'struct',
        path: '',
        fields: [],
      };
      const value = { field1: '0x01' };

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('struct { ... }');
      expect(result.copyable).toBe(true);
    });

    it('should handle non-struct abiType', () => {
      const abiType: AbiType = { kind: 'field' }; // Not a struct type
      const value = { field1: '0x01' };

      const result = formatArgumentValue(value, abiType);

      // Should go through the default case and format as field
      expect(result.copyable).toBe(true);
    });
  });

  describe('string type formatting', () => {
    it('should format string with quotes', () => {
      const abiType: AbiType = {
        kind: 'string',
        length: 10,
      };
      const value = 'Hello World';

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('"Hello World"');
      expect(result.raw).toBe('Hello World');
      expect(result.copyable).toBe(true);
    });

    it('should format empty string', () => {
      const abiType: AbiType = {
        kind: 'string',
        length: 0,
      };
      const value = '';

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('""');
      expect(result.raw).toBe('');
      expect(result.copyable).toBe(true);
    });
  });

  describe('default type formatting', () => {
    it('should format unknown types with default formatter', () => {
      // Using a type that's not handled by any specific case
      const abiType = { kind: 'unknown' } as unknown as AbiType;
      const value = 'some value';

      const result = formatArgumentValue(value, abiType);

      expect(result.display).toBe('some value');
      expect(result.raw).toBe('some value');
      expect(result.copyable).toBe(true);
    });

    it('should truncate very long default values', () => {
      const abiType = { kind: 'unknown' } as unknown as AbiType;
      const value = 'a'.repeat(100);

      const result = formatArgumentValue(value, abiType);

      expect(result.display.length).toBeLessThan(value.length);
      expect(result.display).toContain('...');
      expect(result.raw).toBe(value);
      expect(result.copyable).toBe(true);
    });
  });
});
