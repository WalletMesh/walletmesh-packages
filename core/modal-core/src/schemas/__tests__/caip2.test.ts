/**
 * @fileoverview Tests for CAIP-2 schema validation
 */

import { describe, it, expect } from 'vitest';
import {
  // Schemas
  caip2Schema,
  caip2FormatSchema,
  caip2ParseSchema,
  caip2DetailedSchema,
  evmCAIP2Schema,
  solanaCAIP2Schema,
  aztecCAIP2Schema,
  caip2NormalizationSchema,
  extractNamespaceSchema,
  extractReferenceSchema,
  caip2ArraySchema,
  optionalCAIP2Schema,
  // Helper functions
  isCAIP2,
  parseCAIP2,
  normalizeCAIP2,
  extractNamespace,
  extractReference,
  // Types
  type CAIP2String,
  type CAIP2Parts,
} from '../caip2.js';

describe('CAIP-2 Schemas', () => {
  describe('Basic Format Validation', () => {
    describe('caip2FormatSchema', () => {
      it('should validate basic CAIP-2 format', () => {
        expect(caip2FormatSchema.safeParse('eip155:1').success).toBe(true);
        expect(caip2FormatSchema.safeParse('solana:abc123').success).toBe(true);
        expect(caip2FormatSchema.safeParse('aztec:31337').success).toBe(true);
        expect(caip2FormatSchema.safeParse('cosmos:cosmoshub-4').success).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(caip2FormatSchema.safeParse('1').success).toBe(false);
        expect(caip2FormatSchema.safeParse('eip155-1').success).toBe(false);
        expect(caip2FormatSchema.safeParse('eip155:').success).toBe(false);
        expect(caip2FormatSchema.safeParse(':1').success).toBe(false);
        expect(caip2FormatSchema.safeParse('').success).toBe(false);
      });

      it('should reject namespaces that are too short or too long', () => {
        expect(caip2FormatSchema.safeParse('ab:1').success).toBe(false); // Too short
        expect(caip2FormatSchema.safeParse('verylongnamespace:1').success).toBe(false); // Too long
      });

      it('should reject invalid namespace characters', () => {
        expect(caip2FormatSchema.safeParse('EIP155:1').success).toBe(false); // Uppercase
        expect(caip2FormatSchema.safeParse('eip-155:1').success).toBe(false); // Hyphen
        expect(caip2FormatSchema.safeParse('eip_155:1').success).toBe(false); // Underscore
      });

      it('should reject references that are too long', () => {
        const longReference = 'a'.repeat(65); // 65 characters (exceeds 64 limit)
        expect(caip2FormatSchema.safeParse(`eip155:${longReference}`).success).toBe(false);
      });
    });

    describe('caip2ParseSchema', () => {
      it('should parse valid CAIP-2 strings', () => {
        const result = caip2ParseSchema.parse('eip155:1');
        expect(result).toEqual({
          namespace: 'eip155',
          reference: '1',
          chainId: 'eip155:1',
        });
      });

      it('should handle complex references', () => {
        const result = caip2ParseSchema.parse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
        expect(result).toEqual({
          namespace: 'solana',
          reference: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        });
      });
    });
  });

  describe('Namespace-Specific Validation', () => {
    describe('evmCAIP2Schema', () => {
      it('should validate EVM chain IDs', () => {
        expect(evmCAIP2Schema.safeParse('eip155:1').success).toBe(true);
        expect(evmCAIP2Schema.safeParse('eip155:137').success).toBe(true);
        expect(evmCAIP2Schema.safeParse('eip155:42161').success).toBe(true);
      });

      it('should reject non-numeric references', () => {
        expect(evmCAIP2Schema.safeParse('eip155:mainnet').success).toBe(false);
        expect(evmCAIP2Schema.safeParse('eip155:abc').success).toBe(false);
        expect(evmCAIP2Schema.safeParse('eip155:1a').success).toBe(false);
      });

      it('should reject non-EVM namespaces', () => {
        expect(evmCAIP2Schema.safeParse('solana:1').success).toBe(false);
        expect(evmCAIP2Schema.safeParse('aztec:1').success).toBe(false);
      });

      it('should reject invalid chain IDs', () => {
        expect(evmCAIP2Schema.safeParse('eip155:0').success).toBe(false); // Zero
        expect(evmCAIP2Schema.safeParse('eip155:-1').success).toBe(false); // Negative
      });
    });

    describe('solanaCAIP2Schema', () => {
      it('should validate Solana chain IDs with genesis hashes', () => {
        expect(solanaCAIP2Schema.safeParse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp').success).toBe(true);
        expect(solanaCAIP2Schema.safeParse('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z').success).toBe(true);
        expect(solanaCAIP2Schema.safeParse('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1').success).toBe(true);
      });

      it('should validate well-known Solana networks', () => {
        expect(solanaCAIP2Schema.safeParse('solana:mainnet-beta').success).toBe(true);
        expect(solanaCAIP2Schema.safeParse('solana:devnet').success).toBe(true);
        expect(solanaCAIP2Schema.safeParse('solana:testnet').success).toBe(true);
        expect(solanaCAIP2Schema.safeParse('solana:localnet').success).toBe(true);
      });

      it('should reject invalid Solana references', () => {
        expect(solanaCAIP2Schema.safeParse('solana:invalid').success).toBe(false);
        expect(solanaCAIP2Schema.safeParse('solana:123').success).toBe(false);
        expect(solanaCAIP2Schema.safeParse('solana:mainnet').success).toBe(false); // Missing -beta
      });

      it('should reject non-Solana namespaces', () => {
        expect(solanaCAIP2Schema.safeParse('eip155:mainnet-beta').success).toBe(false);
      });
    });

    describe('aztecCAIP2Schema', () => {
      it('should validate Aztec chain IDs', () => {
        expect(aztecCAIP2Schema.safeParse('aztec:mainnet').success).toBe(true);
        expect(aztecCAIP2Schema.safeParse('aztec:testnet').success).toBe(true);
        expect(aztecCAIP2Schema.safeParse('aztec:31337').success).toBe(true);
        expect(aztecCAIP2Schema.safeParse('aztec:12345').success).toBe(true);
      });

      it('should reject invalid Aztec references', () => {
        expect(aztecCAIP2Schema.safeParse('aztec:invalid').success).toBe(false);
        expect(aztecCAIP2Schema.safeParse('aztec:sandbox').success).toBe(false); // Use numeric
      });

      it('should reject non-Aztec namespaces', () => {
        expect(aztecCAIP2Schema.safeParse('eip155:mainnet').success).toBe(false);
      });
    });
  });

  describe('Comprehensive CAIP-2 Schema', () => {
    describe('caip2Schema', () => {
      it('should validate all supported namespace formats', () => {
        // EVM
        expect(caip2Schema.safeParse('eip155:1').success).toBe(true);
        expect(caip2Schema.safeParse('eip155:137').success).toBe(true);

        // Solana
        expect(caip2Schema.safeParse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp').success).toBe(true);
        expect(caip2Schema.safeParse('solana:mainnet-beta').success).toBe(true);

        // Aztec
        expect(caip2Schema.safeParse('aztec:mainnet').success).toBe(true);
        expect(caip2Schema.safeParse('aztec:31337').success).toBe(true);
      });

      it('should validate unknown namespaces with basic format', () => {
        expect(caip2Schema.safeParse('cosmos:cosmoshub-4').success).toBe(true);
        expect(
          caip2Schema.safeParse('polkadot:91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3')
            .success,
        ).toBe(true);
      });

      it('should reject invalid formats', () => {
        expect(caip2Schema.safeParse('1').success).toBe(false);
        expect(caip2Schema.safeParse('eip155:invalid').success).toBe(false);
        expect(caip2Schema.safeParse('solana:invalid').success).toBe(false);
        expect(caip2Schema.safeParse('aztec:invalid').success).toBe(false);
      });
    });
  });

  describe('caip2NormalizationSchema', () => {
    it('should normalize and validate CAIP-2 strings', () => {
      expect(caip2NormalizationSchema.parse('eip155:1')).toBe('eip155:1');
      expect(caip2NormalizationSchema.parse(' eip155:1 ')).toBe('eip155:1'); // Trim
    });

    it('should reject invalid formats', () => {
      expect(() => caip2NormalizationSchema.parse('1')).toThrow();
      expect(() => caip2NormalizationSchema.parse('mainnet-beta')).toThrow();
      expect(() => caip2NormalizationSchema.parse('invalid')).toThrow();
    });
  });
});

describe('Utility Schemas', () => {
  describe('extractNamespaceSchema', () => {
    it('should extract namespace from CAIP-2 strings', () => {
      expect(extractNamespaceSchema.parse('eip155:1')).toBe('eip155');
      expect(extractNamespaceSchema.parse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe('solana');
      expect(extractNamespaceSchema.parse('aztec:31337')).toBe('aztec');
    });
  });

  describe('extractReferenceSchema', () => {
    it('should extract reference from CAIP-2 strings', () => {
      expect(extractReferenceSchema.parse('eip155:1')).toBe('1');
      expect(extractReferenceSchema.parse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(
        '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      );
      expect(extractReferenceSchema.parse('aztec:31337')).toBe('31337');
    });
  });

  describe('caip2ArraySchema', () => {
    it('should validate arrays of CAIP-2 strings', () => {
      const validArray = ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'];
      expect(caip2ArraySchema.safeParse(validArray).success).toBe(true);

      const invalidArray = ['eip155:1', '137', 'invalid'];
      expect(caip2ArraySchema.safeParse(invalidArray).success).toBe(false);
    });
  });

  describe('optionalCAIP2Schema', () => {
    it('should validate optional CAIP-2 strings', () => {
      expect(optionalCAIP2Schema.parse('eip155:1')).toBe('eip155:1');
      expect(optionalCAIP2Schema.parse(null)).toBe(null);
      expect(optionalCAIP2Schema.parse(undefined)).toBe(null);
    });
  });
});

describe('Helper Functions', () => {
  describe('isCAIP2', () => {
    it('should validate CAIP-2 strings', () => {
      expect(isCAIP2('eip155:1')).toBe(true);
      expect(isCAIP2('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toBe(true);
      expect(isCAIP2('aztec:31337')).toBe(true);

      expect(isCAIP2('1')).toBe(false);
      expect(isCAIP2('invalid')).toBe(false);
      expect(isCAIP2('')).toBe(false);
      expect(isCAIP2(null)).toBe(false);
      expect(isCAIP2(undefined)).toBe(false);
    });
  });

  describe('parseCAIP2', () => {
    it('should parse valid CAIP-2 strings', () => {
      expect(parseCAIP2('eip155:1')).toEqual({ namespace: 'eip155', reference: '1' });
      expect(parseCAIP2('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toEqual({
        namespace: 'solana',
        reference: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      });
    });

    it('should return null for invalid strings', () => {
      expect(parseCAIP2('1')).toBe(null);
      expect(parseCAIP2('invalid')).toBe(null);
      expect(parseCAIP2('')).toBe(null);
    });
  });

  describe('normalizeCAIP2', () => {
    it('should normalize valid CAIP-2 strings', () => {
      expect(normalizeCAIP2('eip155:1')).toBe('eip155:1');
      expect(normalizeCAIP2(' eip155:1 ')).toBe('eip155:1'); // Trim whitespace
    });

    it('should throw for invalid inputs', () => {
      expect(() => normalizeCAIP2('1')).toThrow(); // Not CAIP-2 format
      expect(() => normalizeCAIP2('mainnet-beta')).toThrow(); // Legacy format
      expect(() => normalizeCAIP2('invalid')).toThrow();
      expect(() => normalizeCAIP2('')).toThrow();
    });
  });

  describe('extractNamespace', () => {
    it('should extract namespace from CAIP-2 strings', () => {
      expect(extractNamespace('eip155:1' as CAIP2String)).toBe('eip155');
      expect(extractNamespace('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as CAIP2String)).toBe('solana');
    });
  });

  describe('extractReference', () => {
    it('should extract reference from CAIP-2 strings', () => {
      expect(extractReference('eip155:1' as CAIP2String)).toBe('1');
      expect(extractReference('aztec:31337' as CAIP2String)).toBe('31337');
    });
  });
});

describe('Error Messages', () => {
  it('should provide clear error messages for validation failures', () => {
    const result1 = caip2FormatSchema.safeParse('1');
    expect(result1.success).toBe(false);
    if (!result1.success) {
      expect(result1.error.errors[0].message).toContain('Invalid CAIP-2 format');
    }

    const result2 = evmCAIP2Schema.safeParse('eip155:invalid');
    expect(result2.success).toBe(false);
    if (!result2.success) {
      expect(result2.error.errors[0].message).toContain('Invalid EVM CAIP-2 format');
    }
  });
});

describe('Type Safety', () => {
  it('should provide proper TypeScript types', () => {
    const caip2String: CAIP2String = 'eip155:1';
    const parts: CAIP2Parts = { namespace: 'eip155', reference: '1' };

    // These should compile without TypeScript errors
    expect(typeof caip2String).toBe('string');
    expect(parts.namespace).toBe('eip155');
    expect(parts.reference).toBe('1');
  });
});

describe('Performance', () => {
  it('should validate CAIP-2 strings efficiently', () => {
    const start = performance.now();

    // Validate 1000 CAIP-2 strings
    for (let i = 0; i < 1000; i++) {
      caip2Schema.safeParse('eip155:1');
    }

    const end = performance.now();
    const duration = end - start;

    // Should complete in reasonable time (less than 100ms for 1000 validations)
    expect(duration).toBeLessThan(100);
  });
});
