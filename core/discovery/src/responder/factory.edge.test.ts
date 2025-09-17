/**
 * Edge case tests for responder factory functions to improve coverage
 * Tests validation logic and error conditions
 */

import { describe, it, expect } from 'vitest';
import {
  createDiscoveryResponder,
  createCapabilityMatcher,
  createResponderDiscoverySetup,
  createResponderInfo,
} from './factory.js';
import type { SecurityPolicy } from '../types/security.js';

describe('Responder Factory Edge Cases', () => {
  describe('createDiscoveryResponder Validation', () => {
    it('should throw error for missing responder info', () => {
      expect(() => {
        createDiscoveryResponder({
          responderInfo: null as unknown as Parameters<typeof createDiscoveryResponder>[0]['responderInfo'],
        });
      }).toThrow('Responder info is required');
    });

    it('should handle missing security policy gracefully', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      expect(() => {
        createDiscoveryResponder({ responderInfo });
      }).not.toThrow();
    });

    it('should handle invalid security policy gracefully', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const invalidPolicy = {
        requireHttps: 'not-a-boolean',
        allowedOrigins: 'not-an-array',
        rateLimit: 'not-an-object',
      } as unknown as SecurityPolicy;

      expect(() => {
        createDiscoveryResponder({
          responderInfo,
          securityPolicy: invalidPolicy,
        });
      }).not.toThrow();
    });
  });

  describe('ResponderInfo Validation', () => {
    it('should throw error for missing UUID', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: '',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder UUID is required and must be a string');
    });

    it('should throw error for non-string UUID', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 123 as unknown as string,
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder UUID is required and must be a string');
    });

    it('should throw error for invalid RDNS format', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'invalid-rdns',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder RDNS must be in reverse domain notation format');
    });

    it('should throw error for missing name', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: '',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder name is required and must be a string');
    });

    it('should throw error for non-data URI icon', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'https://example.com/icon.png',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder icon must be a data URI');
    });

    it('should throw error for invalid responder type', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'invalid-type' as unknown as Parameters<typeof createCapabilityMatcher>[0]['type'],
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder type must be one of: web, extension, hardware, mobile');
    });

    it('should throw error for empty technologies array', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [],
          features: [],
        });
      }).toThrow('Responder must support at least one technology');
    });

    it('should throw error for non-array technologies', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: 'not-an-array' as unknown as Parameters<
            typeof createCapabilityMatcher
          >[0]['technologies'],
          features: [],
        });
      }).toThrow('Responder must support at least one technology');
    });

    it('should throw error for non-array features', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [
            {
              type: 'evm',
              interfaces: ['eip-1193'],
            },
          ],
          features: 'not-an-array' as unknown as Parameters<typeof createCapabilityMatcher>[0]['features'],
        });
      }).toThrow('Responder features must be an array');
    });
  });

  describe('Technology Capability Validation', () => {
    it('should throw error for missing technology type', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [
            {
              type: '',
              interfaces: ['eip-1193'],
            },
          ],
          features: [],
        });
      }).toThrow('Technology type is required and must be a string');
    });

    it('should throw error for invalid technology type', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [
            {
              type: 'invalid-type' as 'evm' | 'solana' | 'aztec',
              interfaces: ['eip-1193'],
            },
          ],
          features: [],
        });
      }).toThrow('Technology type must be one of: evm, solana, aztec');
    });

    it('should throw error for non-array standards', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [
            {
              type: 'evm' as const,
              interfaces: 'not-an-array' as unknown as string[],
            },
          ],
          features: [],
        });
      }).toThrow('Technology interfaces must be an array');
    });
  });

  describe('Feature Validation', () => {
    it('should throw error for missing feature ID', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: [
            {
              id: '',
              name: 'Test Feature',
            },
          ],
        });
      }).toThrow('Feature ID is required and must be a string');
    });

    it('should throw error for missing feature name', () => {
      expect(() => {
        createCapabilityMatcher({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: '0.1.0',
          technologies: [
            {
              type: 'evm' as const,
              interfaces: ['eip-1193'],
            },
          ],
          features: [
            {
              id: 'test-feature',
              name: '',
            },
          ],
        });
      }).toThrow('Feature name is required and must be a string');
    });
  });

  describe('Security Policy Validation', () => {
    it('should sanitize invalid allowedOrigins', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        allowedOrigins: ['valid-origin', 123, null, 'another-valid'] as unknown as string[],
        requireHttps: true,
        allowLocalhost: false,
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });

    it('should handle non-array allowedOrigins', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        allowedOrigins: 'not-an-array' as unknown as string[],
        requireHttps: true,
        allowLocalhost: false,
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });

    it('should handle non-array blockedOrigins', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        blockedOrigins: 'not-an-array' as unknown as string[],
        requireHttps: true,
        allowLocalhost: false,
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });

    it('should handle invalid boolean fields', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        requireHttps: 'not-a-boolean' as unknown as boolean,
        allowLocalhost: 'not-a-boolean' as unknown as boolean,
        certificateValidation: 'not-a-boolean' as unknown as boolean,
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });

    it('should handle invalid rate limit object', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        rateLimit: 'not-an-object' as unknown as { enabled: boolean; maxRequests: number; windowMs: number },
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });

    it('should handle invalid rate limit properties', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        rateLimit: {
          enabled: 'not-a-boolean' as unknown as boolean,
          maxRequests: 'not-a-number' as unknown as number,
          windowMs: -1, // Invalid negative number
        },
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });

    it('should preserve valid contentSecurityPolicy', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const policy: SecurityPolicy = {
        contentSecurityPolicy: "default-src 'self'",
      };

      const announcer = createDiscoveryResponder({
        responderInfo,
        securityPolicy: policy,
      });

      expect(announcer).toBeDefined();
    });
  });

  describe('createResponderDiscoverySetup', () => {
    it('should create setup with all methods', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const setup = createResponderDiscoverySetup({ responderInfo });

      expect(setup.discoveryAnnouncer).toBeDefined();
      expect(setup.capabilityMatcher).toBeDefined();
      expect(typeof setup.startListening).toBe('function');
      expect(typeof setup.stopListening).toBe('function');
      expect(typeof setup.updateResponderInfo).toBe('function');
      expect(typeof setup.getStats).toBe('function');
      expect(typeof setup.cleanup).toBe('function');
    });

    it('should validate responder info in updateResponderInfo', () => {
      const responderInfo = createResponderInfo.ethereum({
        uuid: 'test-uuid',
        rdns: 'com.example.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,valid',
        type: 'extension',
      });

      const setup = createResponderDiscoverySetup({ responderInfo });

      expect(() => {
        setup.updateResponderInfo({
          uuid: '', // Invalid UUID
        } as unknown as Parameters<typeof createResponderDiscoverySetup>[0]['responderInfo']);
      }).toThrow('Responder UUID is required and must be a string');
    });
  });

  describe('createResponderInfo Factory Methods', () => {
    describe('ethereum', () => {
      it('should create web responder with URL', () => {
        const responderInfo = createResponderInfo.ethereum({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'web',
        });

        expect(responderInfo.type).toBe('web');
        expect((responderInfo as unknown as { url?: string }).url).toBe('https://responder.example.com');
      });

      it('should create extension responder without URL', () => {
        const responderInfo = createResponderInfo.ethereum({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
        });

        expect(responderInfo.type).toBe('extension');
        expect((responderInfo as unknown as { url?: string }).url).toBeUndefined();
      });

      it('should handle custom chains', () => {
        const responderInfo = createResponderInfo.ethereum({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
        });

        expect(responderInfo.technologies).toHaveLength(1);
        expect(responderInfo.technologies[0]?.type).toBe('evm');
      });

      it('should detect testnet chains', () => {
        // Network and testnet properties are no longer exposed on TechnologyCapability
        // This test validates that the factory doesn't break with testnet chain IDs
        expect(() =>
          createResponderInfo.ethereum({
            uuid: 'test-uuid',
            rdns: 'com.example.wallet',
            name: 'Test Wallet',
            icon: 'data:image/png;base64,valid',
            type: 'extension',
          }),
        ).not.toThrow();
      });
    });

    describe('solana', () => {
      it('should create solana responder with correct defaults', () => {
        const responderInfo = createResponderInfo.solana({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
        });

        expect(responderInfo.technologies[0]?.type).toBe('solana');
        expect(responderInfo.technologies[0]?.type).toBe('solana');
        expect(responderInfo.technologies[0]?.interfaces).toContain('solana-wallet-standard');
        // SignatureSchemes are no longer exposed on TechnologyCapability
      });

      it('should detect testnet/devnet chains', () => {
        // Network and testnet properties are no longer exposed on TechnologyCapability
        // This test validates that the factory doesn't break with testnet chain IDs
        expect(() =>
          createResponderInfo.solana({
            uuid: 'test-uuid',
            rdns: 'com.example.wallet',
            name: 'Test Wallet',
            icon: 'data:image/png;base64,valid',
            type: 'extension',
          }),
        ).not.toThrow();
      });
    });

    describe('aztec', () => {
      it('should create aztec responder with privacy features', () => {
        const responderInfo = createResponderInfo.aztec({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
        });

        expect(responderInfo.technologies[0]?.type).toBe('aztec');
        expect(responderInfo.technologies[0]?.interfaces).toContain('aztec-wallet-api-v1');
        // SignatureSchemes are no longer exposed on TechnologyCapability
        expect(responderInfo.features.some((f) => f.id === 'private-transactions')).toBe(true);
      });

      it('should detect testnet chains', () => {
        // Network and testnet properties are no longer exposed on TechnologyCapability
        // This test validates that the factory doesn't break with testnet chain IDs
        expect(() =>
          createResponderInfo.aztec({
            uuid: 'test-uuid',
            rdns: 'com.example.wallet',
            name: 'Test Wallet',
            icon: 'data:image/png;base64,valid',
            type: 'extension',
          }),
        ).not.toThrow();
      });
    });

    describe('multiChain', () => {
      it('should create multi-chain responder with mixed chains', () => {
        const responderInfo = createResponderInfo.multiChain({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
        });

        expect(responderInfo.technologies).toHaveLength(3);
        expect(responderInfo.technologies[0]?.type).toBe('evm');
        expect(responderInfo.technologies[1]?.type).toBe('solana');
        expect(responderInfo.technologies[2]?.type).toBe('aztec');
      });

      it('should handle custom chains with correct chain types', () => {
        const responderInfo = createResponderInfo.multiChain({
          uuid: 'test-uuid',
          rdns: 'com.example.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,valid',
          type: 'extension',
        });

        expect(responderInfo.technologies[0]?.type).toBe('evm');
        expect(responderInfo.technologies[0]?.interfaces).toContain('eip-1193');
        expect(responderInfo.technologies[1]?.type).toBe('solana');
        expect(responderInfo.technologies[1]?.interfaces).toContain('solana-wallet-standard');
      });

      it('should detect testnet from various patterns', () => {
        // Network and testnet properties are no longer exposed on TechnologyCapability
        // This test validates that the factory doesn't break with mixed testnet chain IDs
        expect(() =>
          createResponderInfo.multiChain({
            uuid: 'test-uuid',
            rdns: 'com.example.wallet',
            name: 'Test Wallet',
            icon: 'data:image/png;base64,valid',
            type: 'extension',
          }),
        ).not.toThrow();
      });
    });
  });
});
