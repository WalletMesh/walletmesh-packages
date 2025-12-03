/**
 * Tests for discovery protocol response validation schemas
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  transportConfigSchema,
  capabilityRequirementsSchema,
  discoveryAccountSchema,
  qualifiedResponderSchema,
  validateQualifiedResponder,
  safeValidateQualifiedResponder,
  validateDiscoveryAccounts,
} from '../discovery.js';

describe('Discovery Schemas', () => {
  describe('transportConfigSchema', () => {
    it('should validate valid extension transport config', () => {
      const config = {
        type: 'extension',
        extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
        adapterConfig: { timeout: 30000 },
      };

      const result = transportConfigSchema.parse(config);
      expect(result).toEqual(config);
    });

    it('should validate valid popup transport config', () => {
      const config = {
        type: 'popup',
        popupUrl: 'https://wallet.example.com/popup',
      };

      const result = transportConfigSchema.parse(config);
      expect(result).toEqual(config);
    });

    it('should validate valid websocket transport config', () => {
      const config = {
        type: 'websocket',
        websocketUrl: 'wss://wallet.example.com/ws',
      };

      const result = transportConfigSchema.parse(config);
      expect(result).toEqual(config);
    });

    it('should validate injected transport config', () => {
      const config = {
        type: 'injected',
      };

      const result = transportConfigSchema.parse(config);
      expect(result).toEqual(config);
    });

    it('should reject invalid transport type', () => {
      const config = {
        type: 'invalid',
      };

      expect(() => transportConfigSchema.parse(config)).toThrow();
    });

    it('should reject invalid URLs', () => {
      const config = {
        type: 'popup',
        popupUrl: 'not-a-valid-url',
      };

      expect(() => transportConfigSchema.parse(config)).toThrow();
    });
  });

  describe('capabilityRequirementsSchema', () => {
    it('should validate capability requirements', () => {
      const requirements = {
        chains: ['evm:1', 'evm:137'],
        features: ['sign-transaction', 'sign-message'],
        interfaces: ['eip-1193'],
      };

      const result = capabilityRequirementsSchema.parse(requirements);
      expect(result).toEqual(requirements);
    });

    it('should provide defaults for empty requirements', () => {
      const result = capabilityRequirementsSchema.parse({});
      expect(result).toEqual({
        chains: [],
        features: [],
        interfaces: [],
      });
    });
  });

  describe('discoveryAccountSchema', () => {
    it('should validate valid account', () => {
      const account = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1',
        publicKey: '0xpublickey',
        name: 'Main Account',
      };

      const result = discoveryAccountSchema.parse(account);
      expect(result).toEqual(account);
    });

    it('should validate minimal account', () => {
      const account = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: '1',
      };

      const result = discoveryAccountSchema.parse(account);
      expect(result).toEqual(account);
    });

    it('should reject empty address', () => {
      const account = {
        address: '',
        chainId: '1',
      };

      expect(() => discoveryAccountSchema.parse(account)).toThrow();
    });

    it('should reject empty chainId', () => {
      const account = {
        address: '0x1234567890123456789012345678901234567890',
        chainId: '',
      };

      expect(() => discoveryAccountSchema.parse(account)).toThrow();
    });
  });

  describe('qualifiedResponderSchema', () => {
    const validResponder = {
      responderId: '550e8400-e29b-41d4-a716-446655440000',
      rdns: 'com.example.wallet',
      name: 'Example Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
      matched: {
        required: {
          chains: ['evm:1'],
          features: ['sign-transaction'],
          interfaces: ['eip-1193'],
        },
      },
    };

    it('should validate valid qualified responder', () => {
      const result = qualifiedResponderSchema.parse(validResponder);
      expect(result).toEqual(validResponder);
    });

    it('should validate responder with transport config', () => {
      const responder = {
        ...validResponder,
        transportConfig: {
          type: 'extension',
          extensionId: 'abcdef123456',
        },
      };

      const result = qualifiedResponderSchema.parse(responder);
      expect(result).toEqual(responder);
    });

    it('should validate and transform metadata', () => {
      const responder = {
        ...validResponder,
        metadata: {
          description: 'A great wallet',
          version: '1.2.3',
          customField: 'custom value',
          tooLongDescription: 'x'.repeat(600), // Should be ignored
        },
      };

      const result = qualifiedResponderSchema.parse(responder);
      expect(result.metadata).toEqual({
        description: 'A great wallet',
        version: '1.2.3',
        customField: 'custom value',
      });
    });

    it('should reject invalid UUID', () => {
      const responder = {
        ...validResponder,
        responderId: 'not-a-uuid',
      };

      expect(() => qualifiedResponderSchema.parse(responder)).toThrow();
    });

    it('should reject invalid RDNS', () => {
      const responder = {
        ...validResponder,
        rdns: 'Invalid RDNS!!!',
      };

      expect(() => qualifiedResponderSchema.parse(responder)).toThrow();
    });

    it('should reject names that are too long', () => {
      const responder = {
        ...validResponder,
        name: 'x'.repeat(101),
      };

      expect(() => qualifiedResponderSchema.parse(responder)).toThrow();
    });

    it('should validate SVG icons', () => {
      const responder = {
        ...validResponder,
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
      };

      const result = qualifiedResponderSchema.parse(responder);
      expect(result.icon).toBe(responder.icon);
    });

    it('should validate PNG icons', () => {
      const responder = {
        ...validResponder,
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      };

      const result = qualifiedResponderSchema.parse(responder);
      expect(result.icon).toBe(responder.icon);
    });

    it('should validate JPEG icons', () => {
      const responder = {
        ...validResponder,
        icon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB',
      };

      const result = qualifiedResponderSchema.parse(responder);
      expect(result.icon).toBe(responder.icon);
    });

    it('should reject non-data URI icons', () => {
      const responder = {
        ...validResponder,
        icon: 'https://example.com/icon.png',
      };

      expect(() => qualifiedResponderSchema.parse(responder)).toThrow();
    });

    it('should reject unsafe image formats', () => {
      const responder = {
        ...validResponder,
        icon: 'data:image/tiff;base64,xyz',
      };

      expect(() => qualifiedResponderSchema.parse(responder)).toThrow();
    });
  });

  describe('Validation helper functions', () => {
    const validResponder = {
      responderId: '550e8400-e29b-41d4-a716-446655440000',
      rdns: 'com.example.wallet',
      name: 'Example Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIi',
      matched: {
        required: {
          chains: ['evm:1'],
          features: [],
          interfaces: [],
        },
      },
    };

    describe('validateQualifiedResponder', () => {
      it('should validate and return valid responder', () => {
        const result = validateQualifiedResponder(validResponder);
        expect(result).toEqual(validResponder);
      });

      it('should throw ZodError for invalid responder', () => {
        const invalidResponder = {
          ...validResponder,
          responderId: 'not-a-uuid',
        };

        expect(() => validateQualifiedResponder(invalidResponder)).toThrow(z.ZodError);
      });
    });

    describe('safeValidateQualifiedResponder', () => {
      it('should return valid responder', () => {
        const result = safeValidateQualifiedResponder(validResponder);
        expect(result).toEqual(validResponder);
      });

      it('should return null for invalid responder', () => {
        const invalidResponder = {
          ...validResponder,
          responderId: 'not-a-uuid',
        };

        const result = safeValidateQualifiedResponder(invalidResponder);
        expect(result).toBeNull();
      });
    });

    describe('validateDiscoveryAccounts', () => {
      it('should validate account array', () => {
        const accounts = [
          {
            address: '0x1234567890123456789012345678901234567890',
            chainId: '1',
          },
          {
            address: '0x0987654321098765432109876543210987654321',
            chainId: '137',
          },
        ];

        const result = validateDiscoveryAccounts(accounts);
        expect(result).toEqual(accounts);
      });

      it('should reject invalid accounts', () => {
        const accounts = [
          {
            address: '',
            chainId: '1',
          },
        ];

        expect(() => validateDiscoveryAccounts(accounts)).toThrow();
      });
    });
  });
});
