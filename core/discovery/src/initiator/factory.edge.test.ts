/**
 * Edge case tests for factory functions to ensure proper validation
 *
 * Type Suppression Usage:
 * - `@ts-ignore - Testing invalid input`: Used before passing intentionally invalid
 *   parameters to factory functions to test runtime validation and error handling.
 *   These suppressions allow us to test that the functions properly validate inputs
 *   at runtime and throw appropriate errors for malformed configuration objects.
 */

import { describe, it, expect } from 'vitest';
import { createInitiatorDiscoverySetup, createDiscoveryInitiator } from './factory.js';
import { createTestDAppInfo } from '../testing/testUtils.js';

describe('Factory Edge Cases', () => {
  describe('validateDiscoveryInitiatorConfig via createDiscoveryInitiator', () => {
    it('should throw error when requirements is missing (coverage: lines 195-196)', () => {
      expect(() => {
        createDiscoveryInitiator({
          // @ts-ignore - Testing invalid input
          requirements: undefined,
          initiatorInfo: createTestDAppInfo(),
        });
      }).toThrow('Requirements are required');
    });

    it('should throw error when chains is not an array', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            // @ts-ignore - Testing invalid input
            chains: 'not-an-array',
            features: [],
            interfaces: [],
          },
          initiatorInfo: createTestDAppInfo(),
        });
      }).toThrow('Required chains must be an array');
    });

    it('should throw error when features is not an array (coverage: lines 203-204)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            // @ts-ignore - Testing invalid input
            features: 'not-an-array',
            interfaces: [],
          },
          initiatorInfo: createTestDAppInfo(),
        });
      }).toThrow('Required features must be an array');
    });

    it('should throw error when interfaces is not an array (coverage: lines 207-208)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            // @ts-ignore - Testing invalid input
            interfaces: 'not-an-array',
          },
          initiatorInfo: createTestDAppInfo(),
        });
      }).toThrow('Required interfaces must be an array');
    });

    it('should throw error when initiatorInfo is missing (coverage: lines 212-213)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
          // @ts-ignore - Testing invalid input
          initiatorInfo: undefined,
        });
      }).toThrow('Initiator info is required');
    });

    it('should throw error when initiator name is missing (coverage: lines 216-217)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
          initiatorInfo: {
            // @ts-ignore - Testing invalid input
            name: undefined,
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,test',
          },
        });
      }).toThrow('Initiator name is required and must be a string');
    });

    it('should throw error when initiator name is not a string (coverage: lines 216-217)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
          initiatorInfo: {
            // @ts-ignore - Testing invalid input
            name: 123,
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,test',
          },
        });
      }).toThrow('Initiator name is required and must be a string');
    });

    it('should throw error when initiator URL is missing (coverage: lines 220-221)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
          initiatorInfo: {
            name: 'Test App',
            // @ts-ignore - Testing invalid input
            url: undefined,
            icon: 'data:image/svg+xml;base64,test',
          },
        });
      }).toThrow('Initiator URL is required and must be a string');
    });

    it('should throw error when initiator URL is not a string (coverage: lines 220-221)', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
          initiatorInfo: {
            name: 'Test App',
            // @ts-ignore - Testing invalid input
            url: 123,
            icon: 'data:image/svg+xml;base64,test',
          },
        });
      }).toThrow('Initiator URL is required and must be a string');
    });

    it('should throw error when URL is invalid', () => {
      expect(() => {
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: [],
            interfaces: [],
          },
          initiatorInfo: {
            name: 'Test App',
            url: 'not-a-valid-url',
            icon: 'data:image/svg+xml;base64,test',
          },
        });
      }).toThrow('Initiator URL must be a valid URL');
    });
  });

  describe('createInitiatorDiscoverySetup', () => {
    it('should create setup with valid minimal configuration', () => {
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1'],
      });

      expect(setup).toBeDefined();
      expect(setup.listener).toBeDefined();
      expect(setup.config).toBeDefined();
      expect(setup.requirements).toBeDefined();
      expect(setup.securityPolicy).toBeDefined();

      // Check listener methods
      expect(setup.listener.startDiscovery).toBeTypeOf('function');
      expect(setup.listener.stopDiscovery).toBeTypeOf('function');
      expect(setup.listener.getQualifiedResponders).toBeTypeOf('function');
      expect(setup.listener.getQualifiedResponder).toBeTypeOf('function');
      expect(setup.listener.isDiscoveryInProgress).toBeTypeOf('function');
    });

    it('should pass through optional configuration', () => {
      const mockEventTarget = new EventTarget();
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1', 'eip155:137'],
        timeout: 5000,
        requireHttps: true,
        initiatorInfo: createTestDAppInfo(),
        preferences: {
          features: ['notifications'],
        },
        eventTarget: mockEventTarget,
        securityPolicy: {
          requireHttps: true,
        },
      });

      expect(setup).toBeDefined();
      expect(setup.listener).toBeDefined();
    });

    it('should validate with detailed config using createDiscoveryInitiator', () => {
      const listener = createDiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: [],
          interfaces: [],
        },
        initiatorInfo: createTestDAppInfo(),
      });

      expect(listener).toBeDefined();
      expect(listener.startDiscovery).toBeTypeOf('function');
      expect(listener.stopDiscovery).toBeTypeOf('function');
    });
  });
});
