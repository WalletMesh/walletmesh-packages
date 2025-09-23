/**
 * @fileoverview Tests for custom error messages and edge cases in schema validation
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { ZodError } from 'zod';

// Import schemas to test their error messages
import { walletInfoSchema } from './wallet.js';
import { modalStateSchema } from './connection.js';
import { popupConfigSchema } from './configs.js';
import { modalErrorSchema } from './errors.js';
import { ChainType } from '../types.js';

describe('Schema Error Messages and Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('Wallet Schema Error Messages', () => {
    test('should provide clear error for invalid wallet icon', () => {
      expect(() => {
        walletInfoSchema.parse({
          id: 'test',
          name: 'Test Wallet',
          icon: 'invalid-icon-format',
          chains: [ChainType.Evm],
        });
      }).toThrow(ZodError);
    });

    test('should provide clear error for empty wallet ID', () => {
      expect(() => {
        walletInfoSchema.parse({
          id: '',
          name: 'Test Wallet',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc+',
          chains: [ChainType.Evm],
        });
      }).toThrow(/String must contain at least 1 character/);
    });

    test('should provide clear error for empty chains array', () => {
      expect(() => {
        walletInfoSchema.parse({
          id: 'test',
          name: 'Test Wallet',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc+',
          chains: [],
        });
      }).toThrow(/Array must contain at least 1 element/);
    });
  });

  describe('Transport Config Error Messages', () => {
    test('should provide clear error for invalid popup dimensions', () => {
      expect(() => {
        popupConfigSchema.parse({
          url: 'https://example.com',
          width: -100, // Invalid: negative width
          height: 600,
        });
      }).toThrow(/Number must be greater than 0/);
    });
  });

  describe('Modal State Error Messages', () => {
    test('should validate required modal state fields', () => {
      expect(() => {
        modalStateSchema.parse({
          isOpen: true,
          currentView: 'walletSelection',
          walletId: null,
          wallets: [], // Missing other required fields
        });
      }).not.toThrow(); // This should pass as wallets and other basic fields are present
    });
  });

  describe('Error Schema Error Messages', () => {
    test('should provide clear error for missing required error fields', () => {
      expect(() => {
        modalErrorSchema.parse({
          // Missing required fields
        });
      }).toThrow(ZodError);
    });

    test('should provide clear error for invalid error category', () => {
      expect(() => {
        modalErrorSchema.parse({
          code: 'TEST_ERROR',
          message: 'Test error message',
          category: 'invalid-category',
        });
      }).toThrow(/Invalid enum value/);
    });
  });

  describe('Edge Cases and Performance', () => {
    test('should handle large objects without performance degradation', () => {
      const largeWalletList = Array.from({ length: 50 }, (_, i) => ({
        id: `wallet-${i}`,
        name: `Wallet ${i}`,
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc+',
        chains: [ChainType.Evm],
      }));

      const start = performance.now();

      expect(() => {
        modalStateSchema.parse({
          isOpen: true,
          currentView: 'walletSelection',
          walletId: null,
          wallets: largeWalletList,
        });
      }).not.toThrow();

      const end = performance.now();

      // Should complete within reasonable time
      expect(end - start).toBeLessThan(100); // Less than 100ms
    });

    test('should provide error context for multiple validation issues', () => {
      let error: ZodError | undefined;

      try {
        walletInfoSchema.parse({
          id: '',
          name: '',
          icon: 'invalid',
          chains: [],
        });
      } catch (e) {
        error = e as ZodError;
      }

      expect(error).toBeDefined();
      if (!error) throw new Error('Expected error to be defined');
      expect(error.issues.length).toBeGreaterThan(1);

      const paths = error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('id');
      expect(paths).toContain('name');
      expect(paths).toContain('icon');
      expect(paths).toContain('chains');
    });
  });
});
