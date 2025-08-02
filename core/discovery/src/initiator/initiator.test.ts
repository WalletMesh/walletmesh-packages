/**
 * Consolidated test suite for initiator module
 * Combines factory tests, factory coverage tests, and index module tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createDiscoveryInitiator,
  createInitiatorDiscoverySetup,
  createCapabilityRequirements,
} from './factory.js';
import type { CapabilityRequirements, CapabilityPreferences, InitiatorInfo } from '../core/types.js';
import { createSecurityPolicy } from '../security/createSecurityPolicy.js';
import { setupFakeTimers, cleanupFakeTimers } from '../testing/timingHelpers.js';

describe('Initiator Module', () => {
  let eventTarget: EventTarget;

  beforeEach(() => {
    setupFakeTimers();
    eventTarget = new EventTarget();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  // ===============================================
  // Factory Functions Tests
  // ===============================================
  describe('createDiscoveryInitiator', () => {
    it('should create listener with minimal config', () => {
      const listener = createDiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,...',
        },
      });

      expect(listener).toBeDefined();
      expect(listener.isDiscoveryInProgress()).toBe(false);

      listener.stopDiscovery();
    });

    it('should create listener with full config', () => {
      const listener = createDiscoveryInitiator({
        requirements: {
          chains: ['eip155:1', 'eip155:137'],
          features: ['account-management', 'transaction-signing'],
          interfaces: ['eip-1193', 'eip-6963'],
        },
        preferences: {
          chains: ['eip155:42161'],
          features: ['hardware-wallet'],
        },
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,...',
          description: 'Test dApp description',
        },
        eventTarget,
        timeout: 5000,
        securityPolicy: {
          requireHttps: true,
          allowLocalhost: false,
        },
      });

      expect(listener).toBeDefined();
      expect(listener.isDiscoveryInProgress()).toBe(false);

      listener.stopDiscovery();
    });

    it('should create listener with security policy', () => {
      const listener = createDiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,...',
        },
        securityPolicy: {
          allowedOrigins: ['https://trusted.com'],
          requireHttps: true,
          rateLimit: {
            enabled: true,
            maxRequests: 10,
            windowMs: 60000,
          },
        },
      });

      expect(listener).toBeDefined();
      listener.stopDiscovery();
    });

    it('should create listener with preferences', () => {
      const preferences: CapabilityPreferences = {
        chains: ['eip155:137'],
        features: ['hardware-wallet'],
      };

      const listener = createDiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        preferences,
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,...',
        },
      });

      expect(listener).toBeDefined();
      listener.stopDiscovery();
    });
  });

  describe('createInitiatorDiscoverySetup', () => {
    it('should create complete discovery setup', () => {
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1', 'eip155:137'],
        timeout: 3000,
        requireHttps: true,
      });

      expect(setup).toBeDefined();
      expect(setup.listener).toBeDefined();
      expect(setup.config).toBeDefined();
      expect(setup.requirements).toBeDefined();
      expect(setup.securityPolicy).toBeDefined();

      // Test the components
      expect(setup.requirements.chains).toEqual(['eip155:1', 'eip155:137']);
      expect(setup.config.timeout).toBe(3000);
      expect(setup.securityPolicy.requireHttps).toBe(true);

      setup.listener.stopDiscovery();
    });

    it('should create setup with default values', () => {
      const setup = createInitiatorDiscoverySetup({
        chains: ['eip155:1'],
      });

      expect(setup.listener).toBeDefined();
      expect(setup.requirements.chains).toEqual(['eip155:1']);
      expect(setup.config.timeout).toBe(3000); // Default timeout

      setup.listener.stopDiscovery();
    });
  });

  // ===============================================
  // Factory Coverage Tests
  // ===============================================
  describe('Factory Validation', () => {
    const validRequirements: CapabilityRequirements = {
      chains: ['eip155:1'],
      features: ['account-management'],
      interfaces: ['eip-1193'],
    };

    const validInitiatorInfo: InitiatorInfo = {
      name: 'Test dApp',
      url: 'https://dapp.example.com',
      icon: 'data:image/svg+xml;base64,abc123',
    };

    it('should throw error for invalid initiator icon (not data URI)', () => {
      const invalidConfig = {
        requirements: validRequirements,
        initiatorInfo: {
          ...validInitiatorInfo,
          icon: 'https://example.com/icon.png',
        },
      };

      expect(() => createDiscoveryInitiator(invalidConfig)).toThrow('Initiator icon must be a data URI');
    });

    it('should accept valid data URI icon', () => {
      const validConfig = {
        requirements: validRequirements,
        initiatorInfo: {
          ...validInitiatorInfo,
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        },
      };

      expect(() => createDiscoveryInitiator(validConfig)).not.toThrow();
    });

    it('should accept undefined icon', () => {
      const configWithoutIcon = {
        requirements: validRequirements,
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://dapp.example.com',
        },
      };

      expect(() => createDiscoveryInitiator(configWithoutIcon)).not.toThrow();
    });

    it('should validate URL format in initiator info', () => {
      const invalidUrlConfig = {
        requirements: validRequirements,
        initiatorInfo: {
          ...validInitiatorInfo,
          url: 'not-a-valid-url',
        },
      };

      expect(() => createDiscoveryInitiator(invalidUrlConfig)).toThrow();
    });

    it('should validate requirements are not empty', () => {
      const emptyRequirementsConfig = {
        requirements: {
          chains: [],
          features: [],
          interfaces: [],
        },
        initiatorInfo: validInitiatorInfo,
      };

      // Should not throw - empty requirements are allowed
      expect(() => createDiscoveryInitiator(emptyRequirementsConfig)).not.toThrow();
    });
  });

  // ===============================================
  // Capability Requirements Factory Tests
  // ===============================================
  describe('createCapabilityRequirements', () => {
    it('should create Ethereum requirements', () => {
      const requirements = createCapabilityRequirements.ethereum({
        chains: ['eip155:1'],
        features: ['account-management'],
        interfaces: ['eip-1193'],
      });

      expect(requirements.chains).toEqual(['eip155:1']);
      expect(requirements.features).toEqual(['account-management']);
      expect(requirements.interfaces).toEqual(['eip-1193']);
    });

    it('should create Polygon requirements', () => {
      const requirements = createCapabilityRequirements.polygon({
        chains: ['eip155:137'],
        features: ['account-management'],
        interfaces: ['eip-1193'],
      });

      expect(requirements.chains).toEqual(['eip155:137']);
      expect(requirements.features).toEqual(['account-management']);
      expect(requirements.interfaces).toEqual(['eip-1193']);
    });

    it('should create Solana requirements', () => {
      const requirements = createCapabilityRequirements.solana({
        chains: ['solana:mainnet'],
        features: ['account-management'],
        interfaces: ['solana-wallet-standard'],
      });

      expect(requirements.chains).toEqual(['solana:mainnet']);
      expect(requirements.features).toEqual(['account-management']);
      expect(requirements.interfaces).toEqual(['solana-wallet-standard']);
    });

    it('should create multi-chain requirements', () => {
      const requirements = createCapabilityRequirements.multiChain({
        chains: ['eip155:1', 'eip155:137', 'solana:mainnet'],
        features: ['account-management', 'cross-chain-swaps'],
        interfaces: ['eip-1193', 'solana-wallet-standard'],
      });

      expect(requirements.chains).toEqual(['eip155:1', 'eip155:137', 'solana:mainnet']);
      expect(requirements.features).toContain('cross-chain-swaps');
      expect(requirements.interfaces).toEqual(['eip-1193', 'solana-wallet-standard']);
    });
  });

  // ===============================================
  // Security Policy Factory Tests
  // ===============================================
  describe('createSecurityPolicy', () => {
    it('should create strict security policy', () => {
      const policy = createSecurityPolicy.strict();

      expect(policy.requireHttps).toBe(true);
      expect(policy.allowLocalhost).toBe(false);
      expect(policy.rateLimit?.enabled).toBe(true);
    });

    it('should create strict policy with custom origins', () => {
      const policy = createSecurityPolicy.strict({
        allowedOrigins: ['https://example.com'],
      });

      expect(policy.requireHttps).toBe(true);
      expect(policy.allowedOrigins).toEqual(['https://example.com']);
    });

    it('should create development security policy', () => {
      const policy = createSecurityPolicy.development();

      expect(policy.requireHttps).toBe(false);
      expect(policy.allowLocalhost).toBe(true);
      expect(policy.rateLimit?.enabled).toBe(true);
      expect(policy.rateLimit?.maxRequests).toBe(50);
    });

    it('should create development policy with custom config', () => {
      const policy = createSecurityPolicy.development({
        allowedOrigins: ['http://localhost:3000'],
      });

      expect(policy.allowLocalhost).toBe(true);
      expect(policy.allowedOrigins).toEqual(['http://localhost:3000']);
    });

    it('should create production security policy', () => {
      const policy = createSecurityPolicy.production({
        allowedOrigins: ['https://production.com'],
      });

      expect(policy.requireHttps).toBe(true);
      expect(policy.allowLocalhost).toBe(false);
      expect(policy.allowedOrigins).toEqual(['https://production.com']);
      expect(policy.rateLimit?.enabled).toBe(true);
    });
  });

  // ===============================================
  // Module Exports Tests
  // ===============================================
  describe('Module Exports', () => {
    it('should export DiscoveryInitiator class', async () => {
      const { DiscoveryInitiator } = await import('./DiscoveryInitiator.js');

      expect(DiscoveryInitiator).toBeDefined();
      expect(typeof DiscoveryInitiator).toBe('function');
    });

    it('should export factory functions', async () => {
      const factoryModule = await import('./factory.js');

      expect(factoryModule.createDiscoveryInitiator).toBeDefined();
      expect(factoryModule.createInitiatorDiscoverySetup).toBeDefined();
      expect(factoryModule.createCapabilityRequirements).toBeDefined();

      expect(typeof factoryModule.createDiscoveryInitiator).toBe('function');
      expect(typeof factoryModule.createInitiatorDiscoverySetup).toBe('function');
      expect(typeof factoryModule.createCapabilityRequirements).toBe('object');
    });

    it('should export security utility functions', async () => {
      const securityModule = await import('../security/index.js');

      expect(securityModule.validateOrigin).toBeDefined();
      expect(typeof securityModule.validateOrigin).toBe('function');
    });

    it('should export all expected initiator exports', async () => {
      const initiatorIndex = await import('./index.js');

      // Classes
      expect(initiatorIndex.DiscoveryInitiator).toBeDefined();
      // Factory functions
      expect(initiatorIndex.createDiscoveryInitiator).toBeDefined();
      expect(initiatorIndex.createInitiatorDiscoverySetup).toBeDefined();
      expect(initiatorIndex.createCapabilityRequirements).toBeDefined();
      expect(initiatorIndex.createSecurityPolicy).toBeDefined();

      // Security utilities
      expect(initiatorIndex.validateOrigin).toBeDefined();
    });

    it('should allow factory functions to be called with proper parameters', async () => {
      const { createCapabilityRequirements } = await import('./factory.js');

      // Test createCapabilityRequirements.ethereum()
      expect(() =>
        createCapabilityRequirements.ethereum({
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        }),
      ).not.toThrow();

      const requirements = createCapabilityRequirements.ethereum({
        chains: ['eip155:1'],
        features: ['account-management'],
        interfaces: ['eip-1193'],
      });

      expect(requirements.chains).toEqual(['eip155:1']);
      expect(requirements.features).toEqual(['account-management']);
      expect(requirements.interfaces).toEqual(['eip-1193']);

      // Test createSecurityPolicy.strict()
      expect(() =>
        createSecurityPolicy.strict({
          allowedOrigins: ['https://example.com'],
        }),
      ).not.toThrow();

      const policy = createSecurityPolicy.strict();

      expect(policy.requireHttps).toBe(true);
      expect(policy.allowLocalhost).toBe(false);
    });

    it('should verify all exports are accessible', async () => {
      const initiatorModule = await import('./index.js');

      // Verify each export exists and has correct type
      const expectedExports = [
        'DiscoveryInitiator',
        'createDiscoveryInitiator',
        'createInitiatorDiscoverySetup',
        'createCapabilityRequirements',
        'createSecurityPolicy', // now from security module
        'validateOrigin',
      ];

      for (const exportName of expectedExports) {
        expect(initiatorModule[exportName as keyof typeof initiatorModule]).toBeDefined();
      }
    });

    it('should allow instantiation of exported classes', async () => {
      const { DiscoveryInitiator } = await import('./DiscoveryInitiator.js');

      const validConfig = {
        requirements: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,test',
        },
      };

      expect(() => new DiscoveryInitiator(validConfig)).not.toThrow();
      const listener = new DiscoveryInitiator(validConfig);
      expect(listener.getState()).toBe('IDLE');
      listener.stopDiscovery();
    });
  });

  // ===============================================
  // Integration Tests
  // ===============================================
  describe('Integration Tests', () => {
    it('should work with different event targets', () => {
      const customEventTarget = new EventTarget();

      const listener = createDiscoveryInitiator({
        requirements: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,...',
        },
        eventTarget: customEventTarget,
      });

      expect(listener).toBeDefined();
      expect(listener.isDiscoveryInProgress()).toBe(false);
      listener.stopDiscovery();
    });

    it('should handle complex configurations', () => {
      const complexConfig = {
        requirements: {
          chains: ['eip155:1', 'eip155:137', 'solana:mainnet'],
          features: ['account-management', 'transaction-signing', 'message-signing'],
          interfaces: ['eip-1193', 'eip-6963', 'solana-wallet-standard'],
        },
        preferences: {
          chains: ['eip155:42161', 'evm:optimism:10'],
          features: ['hardware-wallet', 'multi-chain'],
        },
        initiatorInfo: {
          name: 'Complex Test dApp',
          url: 'https://complex-example.com',
          icon: 'data:image/svg+xml;base64,complex...',
          description: 'A complex test dApp with many requirements',
        },
        timeout: 10000,
        securityPolicy: {
          allowedOrigins: ['https://trusted1.com', 'https://trusted2.com'],
          requireHttps: true,
          allowLocalhost: false,
          rateLimit: {
            enabled: true,
            maxRequests: 20,
            windowMs: 120000,
          },
        },
        eventTarget,
      };

      expect(() => createDiscoveryInitiator(complexConfig)).not.toThrow();
      const listener = createDiscoveryInitiator(complexConfig);
      expect(listener.isDiscoveryInProgress()).toBe(false);
      listener.stopDiscovery();
    });
  });

  // ===============================================
  // Config Validation Tests
  // ===============================================
  describe('Config Validation', () => {
    it('should throw error for invalid icon format', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'https://example.com/icon.png', // Not a data URI
          },
        }),
      ).toThrow('Initiator icon must be a data URI');
    });

    it('should throw error for invalid timeout', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,...',
          },
          timeout: 0, // Invalid: must be positive
        }),
      ).toThrow('Timeout must be a positive number');
    });

    it('should throw error for negative timeout', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,...',
          },
          timeout: -1000,
        }),
      ).toThrow('Timeout must be a positive number');
    });

    it('should throw error for non-number timeout', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,...',
          },
          timeout: 'invalid' as unknown as number,
        }),
      ).toThrow('Timeout must be a positive number');
    });

    it('should throw error for invalid preference chains', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,...',
          },
          preferences: {
            chains: 'invalid' as unknown as string[],
          },
        }),
      ).toThrow('Preference chains must be an array');
    });

    it('should throw error for invalid preference features', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,...',
          },
          preferences: {
            features: 'invalid' as unknown as string[],
          },
        }),
      ).toThrow('Preference features must be an array');
    });

    it('should accept valid icon format', () => {
      expect(() =>
        createDiscoveryInitiator({
          requirements: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          initiatorInfo: {
            name: 'Test dApp',
            url: 'https://example.com',
            icon: 'data:image/svg+xml;base64,validbase64data',
          },
        }),
      ).not.toThrow();
    });

    it('should accept valid preferences configuration', () => {
      const config = {
        requirements: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        initiatorInfo: {
          name: 'Test dApp',
          url: 'https://example.com',
          icon: 'data:image/svg+xml;base64,...',
        },
        preferences: {
          chains: ['eip155:137'],
          features: ['hardware-wallet'],
        },
      };

      expect(() => createDiscoveryInitiator(config)).not.toThrow();
      const listener = createDiscoveryInitiator(config);
      expect(listener).toBeDefined();
      listener.stopDiscovery();
    });
  });

  // ===============================================
  // createCapabilityRequirements Tests
  // ===============================================
  describe('createCapabilityRequirements', () => {
    describe('aztec', () => {
      it('should create Aztec requirements with defaults', () => {
        const requirements = createCapabilityRequirements.aztec();

        expect(requirements).toEqual({
          chains: ['aztec:mainnet'],
          features: ['private-transactions', 'transaction-signing'],
          interfaces: ['aztec-wallet-api-v1'],
        });
      });

      it('should create Aztec requirements with custom options', () => {
        const requirements = createCapabilityRequirements.aztec({
          chains: ['aztec:testnet'],
          features: ['custom-feature'],
          interfaces: ['custom-interface'],
        });

        expect(requirements).toEqual({
          chains: ['aztec:testnet'],
          features: ['custom-feature'],
          interfaces: ['custom-interface'],
        });
      });

      it('should handle partial Aztec options', () => {
        const requirements = createCapabilityRequirements.aztec({
          chains: ['aztec:devnet'],
        });

        expect(requirements).toEqual({
          chains: ['aztec:devnet'],
          features: ['private-transactions', 'transaction-signing'],
          interfaces: ['aztec-wallet-api-v1'],
        });
      });
    });
  });
});
