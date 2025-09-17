/**
 * Consolidated test suite for initiator module
 * Updated to use DiscoveryInitiator constructor instead of deprecated factory functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createInitiatorDiscoverySetup, createCapabilityRequirements } from './factory.js';
import { DiscoveryInitiator } from '../initiator.js';
import type { InitiatorInfo } from '../types/core.js';
import type { CapabilityRequirements, CapabilityPreferences } from '../types/capabilities.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';

describe('Initiator Module', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // DiscoveryInitiator Constructor Tests
  // ===============================================
  describe('DiscoveryInitiator constructor', () => {
    it('should create listener with minimal config', () => {
      const requirements: CapabilityRequirements = {
        technologies: [
          {
            type: 'evm',
            interfaces: ['eip-1193'],
          },
        ],
        features: ['account-management'],
      };

      const initiatorInfo: InitiatorInfo = {
        name: 'Test DApp',
        url: 'https://test.example.com',
        icon: 'data:image/svg+xml;base64,test',
      };

      const listener = new DiscoveryInitiator(requirements, initiatorInfo);

      expect(listener).toBeDefined();
      expect(listener.startDiscovery).toBeTypeOf('function');
      expect(listener.stopDiscovery).toBeTypeOf('function');
      expect(listener.isDiscovering()).toBe(false);
      listener.stopDiscovery();
    });

    it('should create listener with full config', () => {
      const requirements: CapabilityRequirements = {
        technologies: [
          {
            type: 'evm',
            interfaces: ['eip-1193'],
            features: ['wallet-connect'],
          },
          {
            type: 'solana',
            interfaces: ['solana-wallet-standard'],
          },
        ],
        features: ['account-management', 'transaction-signing'],
      };

      const preferences: CapabilityPreferences = {
        features: ['hardware-wallet', 'batch-transactions'],
      };

      const initiatorInfo: InitiatorInfo = {
        name: 'Full Config DApp',
        url: 'https://full.example.com',
        icon: 'data:image/svg+xml;base64,test',
      };

      const listener = new DiscoveryInitiator(requirements, initiatorInfo, { timeout: 10000 }, preferences);

      expect(listener).toBeDefined();
      expect(listener.isDiscovering()).toBe(false);
      listener.stopDiscovery();
    });

    it('should create listener with security policy', () => {
      const requirements: CapabilityRequirements = {
        technologies: [
          {
            type: 'evm',
            interfaces: [],
          },
        ],
        features: [],
      };

      const initiatorInfo: InitiatorInfo = {
        name: 'Secure DApp',
        url: 'https://secure.example.com',
        icon: 'data:image/svg+xml;base64,test',
      };

      const listener = new DiscoveryInitiator(requirements, initiatorInfo, { security: 'strict' });

      expect(listener).toBeDefined();
      expect(listener.isDiscovering()).toBe(false);
      listener.stopDiscovery();
    });

    it('should accept custom event target', () => {
      const customEventTarget = new EventTarget();
      const requirements: CapabilityRequirements = {
        technologies: [
          {
            type: 'evm',
            interfaces: ['eip-1193'],
          },
        ],
        features: [],
      };

      const initiatorInfo: InitiatorInfo = {
        name: 'Custom Event DApp',
        url: 'https://custom.example.com',
        icon: 'data:image/svg+xml;base64,test',
      };

      const listener = new DiscoveryInitiator(requirements, initiatorInfo, {
        eventTarget: customEventTarget,
      });

      expect(listener).toBeDefined();
      expect(listener.isDiscovering()).toBe(false);
      listener.stopDiscovery();
    });
  });

  // ===============================================
  // Factory Helper Tests
  // ===============================================
  describe('createInitiatorDiscoverySetup', () => {
    it('should create complete discovery setup', () => {
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1', 'eip155:137'],
        timeout: 5000,
      });

      expect(setup).toBeDefined();
      expect(setup.listener).toBeDefined();
      expect(setup.config).toBeDefined();
      expect(setup.requirements).toBeDefined();
      expect(setup.securityPolicy).toBeDefined();

      // Verify listener is properly created
      expect(setup.listener.startDiscovery).toBeTypeOf('function');
      expect(setup.listener.stopDiscovery).toBeTypeOf('function');
      expect(setup.listener.getQualifiedResponders).toBeTypeOf('function');
      expect(setup.listener.isDiscovering).toBeTypeOf('function');
    });

    it('should handle minimal configuration', () => {
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1'],
      });

      expect(setup).toBeDefined();
      expect(setup.listener).toBeDefined();
      expect(setup.config.timeout).toBe(3000); // Default timeout
    });

    it('should pass through custom configuration', () => {
      const customEventTarget = new EventTarget();
      const customInitiatorInfo: InitiatorInfo = {
        name: 'Custom DApp',
        url: 'https://custom.example.com',
        icon: 'data:image/svg+xml;base64,test',
      };

      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1'],
        timeout: 10000,
        requireHttps: true,
        initiatorInfo: customInitiatorInfo,
        preferences: {
          features: ['notifications'],
        },
        eventTarget: customEventTarget,
        securityPolicy: {
          requireHttps: true,
        },
      });

      expect(setup).toBeDefined();
      expect(setup.config.timeout).toBe(10000);
      expect(setup.securityPolicy.requireHttps).toBe(true);
    });
  });

  // ===============================================
  // Capability Requirements Helper Tests
  // ===============================================
  describe('createCapabilityRequirements', () => {
    it('should create Ethereum requirements', () => {
      const requirements = createCapabilityRequirements.ethereum();

      expect(requirements).toBeDefined();
      expect(requirements.technologies).toHaveLength(1);
      expect(requirements.technologies?.[0]?.type).toBe('evm');
      expect(requirements.technologies?.[0]?.interfaces).toContain('eip-1193');
      expect(requirements.features).toContain('account-management');
    });

    it('should create Solana requirements', () => {
      const requirements = createCapabilityRequirements.solana();

      expect(requirements).toBeDefined();
      expect(requirements.technologies).toHaveLength(1);
      expect(requirements.technologies?.[0]?.type).toBe('solana');
      expect(requirements.technologies?.[0]?.interfaces).toContain('solana-wallet-standard');
      expect(requirements.features).toContain('account-management');
    });

    it('should create multi-chain requirements', () => {
      const requirements = createCapabilityRequirements.multiChain({
        features: ['account-management', 'transaction-signing'],
      });

      expect(requirements).toBeDefined();
      expect(requirements.technologies).toHaveLength(2);
      expect(requirements.technologies?.[0]?.type).toBe('evm');
      expect(requirements.technologies?.[1]?.type).toBe('solana');
    });
  });

  // ===============================================
  // Module Export Tests
  // ===============================================
  describe('Module Exports', () => {
    it('should export factory functions', async () => {
      const factoryModule = await import('./factory.js');

      // createDiscoveryInitiator is deprecated and might not be exported
      expect(factoryModule.createInitiatorDiscoverySetup).toBeDefined();
      expect(factoryModule.createCapabilityRequirements).toBeDefined();

      expect(typeof factoryModule.createInitiatorDiscoverySetup).toBe('function');
      expect(typeof factoryModule.createCapabilityRequirements).toBe('object');
    });

    it('should export all expected initiator exports', async () => {
      const initiatorIndex = await import('./index.js');

      // Classes
      expect(initiatorIndex.DiscoveryInitiator).toBeDefined();
      expect(initiatorIndex.InitiatorStateMachine).toBeDefined();
      expect(initiatorIndex.createInitiatorStateMachine).toBeDefined();

      // Factory functions (createDiscoveryInitiator is deprecated and no longer exported)
      expect(initiatorIndex.createInitiatorDiscoverySetup).toBeDefined();
      expect(initiatorIndex.createCapabilityRequirements).toBeDefined();

      // Type exports (exported as types only)
      expect(typeof initiatorIndex.DiscoveryInitiator).toBe('function');
      expect(typeof initiatorIndex.createInitiatorDiscoverySetup).toBe('function');
    });

    it('should export from main index', async () => {
      const mainIndex = await import('../index.js');

      // Initiator exports
      expect(mainIndex.DiscoveryInitiator).toBeDefined();
      expect(mainIndex.InitiatorStateMachine).toBeDefined();

      // Type exports should be available
      expect(typeof mainIndex.DiscoveryInitiator).toBe('function');
    });
  });

  // ===============================================
  // Integration Tests
  // ===============================================
  describe('Integration', () => {
    it('should work with all components together', async () => {
      // Create setup
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1'],
        timeout: 5000,
      });

      // Use listener
      expect(setup.listener.isDiscovering()).toBe(false);

      // Can also create directly
      const requirements = createCapabilityRequirements.ethereum();
      const listener = new DiscoveryInitiator(requirements, {
        name: 'Test DApp',
        url: 'https://test.example.com',
        icon: 'data:image/svg+xml;base64,test',
      });

      expect(listener.isDiscovering()).toBe(false);
      listener.stopDiscovery();
    });

    it('should handle complex multi-chain configuration', () => {
      const requirements = createCapabilityRequirements.multiChain({
        features: ['account-management', 'transaction-signing'],
        interfaces: ['eip-1193', 'solana-wallet-standard'],
      });
      const listener = new DiscoveryInitiator(
        requirements,
        {
          name: 'Multi-Chain DApp',
          url: 'https://multichain.example.com',
          icon: 'data:image/svg+xml;base64,test',
        },
        {
          timeout: 10000,
          security: 'strict',
        },
      );

      expect(listener).toBeDefined();
      expect(listener.isDiscovering()).toBe(false);
      listener.stopDiscovery();
    });
  });
});
