/**
 * Edge case tests for factory functions to ensure proper validation
 *
 * Type Suppression Usage:
 * - `@ts-expect-error - Testing invalid input`: Used before passing intentionally invalid
 *   parameters to factory functions to test runtime validation and error handling.
 *   These suppressions allow us to test that the functions properly validate inputs
 *   at runtime and throw appropriate errors for malformed configuration objects.
 */

import { describe, it, expect } from 'vitest';
import { createInitiatorDiscoverySetup } from './factory.js';
import { DiscoveryInitiator } from '../initiator.js';
import { createTestDAppInfo } from '../testing/testUtils.js';

describe('Factory Edge Cases', () => {
  // Note: Tests for createDiscoveryInitiator have been removed since the function is deprecated
  // and no longer exported. The validation logic it tested is now internal.

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
      expect(setup.listener.isDiscovering).toBeTypeOf('function');
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

    it('should validate with detailed config using DiscoveryInitiator constructor', () => {
      const listener = new DiscoveryInitiator(
        {
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: [],
        },
        createTestDAppInfo(),
      );

      expect(listener).toBeDefined();
      expect(listener.startDiscovery).toBeTypeOf('function');
      expect(listener.stopDiscovery).toBeTypeOf('function');
    });
  });
});
