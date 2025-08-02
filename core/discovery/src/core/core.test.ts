/**
 * Consolidated test suite for core module
 * Combines constants, types, and index module tests
 */

import { describe, it, expect } from 'vitest';
import { getErrorCategory, DISCOVERY_PROTOCOL_VERSION, ERROR_CODES, DISCOVERY_EVENTS } from './constants.js';
import {
  createTestResponderInfo,
  createTestDiscoveryRequest,
  createTestDiscoveryResponse,
  createTestDAppInfo,
  expectValidDiscoveryRequestEvent,
  expectValidDiscoveryResponseEvent,
  expectValidResponderInfo,
  expectValidInitiatorInfo,
} from '../testing/index.js';

describe('Core Module', () => {
  // ===============================================
  // Constants Module Tests
  // ===============================================
  describe('Constants Module', () => {
    describe('Protocol Constants', () => {
      it('should have correct protocol version', () => {
        expect(DISCOVERY_PROTOCOL_VERSION).toBe('0.1.0');
      });

      it('should have defined error codes', () => {
        expect(ERROR_CODES).toBeDefined();
        expect(typeof ERROR_CODES).toBe('object');
      });

      it('should export discovery events with expected values', () => {
        expect(DISCOVERY_EVENTS.REQUEST).toBe('discovery:wallet:request');
        expect(DISCOVERY_EVENTS.RESPONSE).toBe('discovery:wallet:response');
      });
    });

    describe('getErrorCategory', () => {
      it('should return "protocol" for codes 1000-1999', () => {
        expect(getErrorCategory(1000)).toBe('protocol');
        expect(getErrorCategory(1500)).toBe('protocol');
        expect(getErrorCategory(1999)).toBe('protocol');
      });

      it('should return "security" for codes 2000-2999', () => {
        expect(getErrorCategory(2000)).toBe('security');
        expect(getErrorCategory(2500)).toBe('security');
        expect(getErrorCategory(2999)).toBe('security');
      });

      it('should return "capability" for codes 3000-3999', () => {
        expect(getErrorCategory(3000)).toBe('capability');
        expect(getErrorCategory(3500)).toBe('capability');
        expect(getErrorCategory(3999)).toBe('capability');
      });

      it('should return "connection" for codes 4000-4999', () => {
        expect(getErrorCategory(4000)).toBe('connection');
        expect(getErrorCategory(4500)).toBe('connection');
        expect(getErrorCategory(4999)).toBe('connection');
      });

      it('should return "internal" for codes 5000-5999', () => {
        expect(getErrorCategory(5000)).toBe('internal');
        expect(getErrorCategory(5500)).toBe('internal');
        expect(getErrorCategory(5999)).toBe('internal');
      });

      it('should return "unknown" for codes outside defined ranges', () => {
        // Below protocol range
        expect(getErrorCategory(999)).toBe('unknown');
        expect(getErrorCategory(500)).toBe('unknown');
        expect(getErrorCategory(0)).toBe('unknown');
        expect(getErrorCategory(-1)).toBe('unknown');

        // Above internal range
        expect(getErrorCategory(6000)).toBe('unknown');
        expect(getErrorCategory(7000)).toBe('unknown');
        expect(getErrorCategory(10000)).toBe('unknown');

        // Edge cases
        expect(getErrorCategory(999.9)).toBe('unknown');
        expect(getErrorCategory(6000.1)).toBe('unknown');
      });

      it('should handle edge values correctly', () => {
        // Boundary testing - just before ranges
        expect(getErrorCategory(999)).toBe('unknown');
        expect(getErrorCategory(1999)).toBe('protocol');
        expect(getErrorCategory(2999)).toBe('security');
        expect(getErrorCategory(3999)).toBe('capability');
        expect(getErrorCategory(4999)).toBe('connection');
        expect(getErrorCategory(5999)).toBe('internal');

        // Just after ranges
        expect(getErrorCategory(2000)).toBe('security');
        expect(getErrorCategory(3000)).toBe('capability');
        expect(getErrorCategory(4000)).toBe('connection');
        expect(getErrorCategory(5000)).toBe('internal');
        expect(getErrorCategory(6000)).toBe('unknown');
      });

      it('should handle floating point numbers', () => {
        expect(getErrorCategory(1500.5)).toBe('protocol');
        expect(getErrorCategory(2500.7)).toBe('security');
        expect(getErrorCategory(3500.3)).toBe('capability');
        expect(getErrorCategory(4500.1)).toBe('connection');
        expect(getErrorCategory(5500.9)).toBe('internal');
      });

      it('should handle very large numbers', () => {
        expect(getErrorCategory(Number.MAX_SAFE_INTEGER)).toBe('unknown');
        expect(getErrorCategory(999999)).toBe('unknown');
      });

      it('should handle special numeric values', () => {
        expect(getErrorCategory(Number.POSITIVE_INFINITY)).toBe('unknown');
        expect(getErrorCategory(Number.NEGATIVE_INFINITY)).toBe('unknown');
        expect(getErrorCategory(Number.NaN)).toBe('unknown');
      });
    });
  });

  // ===============================================
  // Types Module Tests
  // ===============================================
  describe('Types Module', () => {
    describe('DiscoveryRequestEvent', () => {
      it('should create valid discovery request', () => {
        const request = createTestDiscoveryRequest();

        expect(request.type).toBe('discovery:wallet:request');
        expect(request.version).toBe(DISCOVERY_PROTOCOL_VERSION);
        expect(request.sessionId).toBeTruthy();
        expect(request.origin).toBeTruthy();
        expect(request.initiatorInfo).toBeTruthy();
        expect(request.required).toBeTruthy();

        expectValidDiscoveryRequestEvent(request);
      });

      it('should support optional preferences', () => {
        const request = createTestDiscoveryRequest({
          optional: {
            chains: ['eip155:5'],
            features: ['hardware-wallet'],
          },
        });

        expect(request.optional).toBeTruthy();
        expect(request.optional?.chains).toEqual(['eip155:5']);
        expect(request.optional?.features).toEqual(['hardware-wallet']);

        expectValidDiscoveryRequestEvent(request);
      });

      it('should validate required fields', () => {
        const invalidRequest = {
          type: 'invalid-type',
          version: 'wrong-version',
        };

        expect(() => {
          expectValidDiscoveryRequestEvent(invalidRequest);
        }).toThrow();
      });
    });

    describe('DiscoveryResponseEvent', () => {
      it('should create valid discovery response', () => {
        const response = createTestDiscoveryResponse();

        expect(response.type).toBe('discovery:wallet:response');
        expect(response.version).toBe(DISCOVERY_PROTOCOL_VERSION);
        expect(response.sessionId).toBeTruthy();
        expect(response.responderId).toBeTruthy();
        expect(response.rdns).toBeTruthy();
        expect(response.name).toBeTruthy();
        expect(response.icon).toMatch(/^data:/);
        expect(response.matched).toBeTruthy();

        expectValidDiscoveryResponseEvent(response);
      });

      it('should include capability intersection', () => {
        const response = createTestDiscoveryResponse({
          matched: {
            required: {
              chains: ['eip155:1'],
              features: ['account-management'],
              interfaces: ['eip-1193'],
            },
            optional: {
              chains: ['eip155:5'],
              features: ['hardware-wallet'],
            },
          },
        });

        expect(response.matched.required.chains).toEqual(['eip155:1']);
        expect(response.matched.required.features).toEqual(['account-management']);
        expect(response.matched.required.interfaces).toEqual(['eip-1193']);
        expect(response.matched.optional?.chains).toEqual(['eip155:5']);
        expect(response.matched.optional?.features).toEqual(['hardware-wallet']);

        expectValidDiscoveryResponseEvent(response);
      });
    });

    describe('ResponderInfo', () => {
      it('should create valid Ethereum wallet info', () => {
        const responderInfo = createTestResponderInfo.ethereum();

        expect(responderInfo.uuid).toBeTruthy();
        expect(responderInfo.rdns).toBeTruthy();
        expect(responderInfo.name).toBeTruthy();
        expect(responderInfo.icon).toMatch(/^data:/);
        expect(responderInfo.type).toBe('extension');
        expect(Array.isArray(responderInfo.chains)).toBe(true);
        expect(Array.isArray(responderInfo.features)).toBe(true);
        expect(responderInfo.chains.length).toBeGreaterThan(0);

        expectValidResponderInfo(responderInfo);
      });

      it('should create valid Solana wallet info', () => {
        const responderInfo = createTestResponderInfo.solana();

        expect(responderInfo.type).toBe('web');
        expect(responderInfo.chains.some((chain) => chain.chainId.includes('solana'))).toBe(true);
        expect(responderInfo.chains.some((chain) => chain.standards.includes('solana-wallet-standard'))).toBe(
          true,
        );

        expectValidResponderInfo(responderInfo);
      });

      it('should create valid Aztec wallet info', () => {
        const responderInfo = createTestResponderInfo.aztec();

        expect(responderInfo.type).toBe('hardware');
        expect(responderInfo.chains.some((chain) => chain.chainId.includes('aztec'))).toBe(true);
        expect(responderInfo.chains.some((chain) => chain.standards.includes('aztec-wallet-api-v1'))).toBe(
          true,
        );
        expect(responderInfo.features.some((feature) => feature.id === 'private-transactions')).toBe(true);

        expectValidResponderInfo(responderInfo);
      });

      it('should create valid multi-chain wallet info', () => {
        const responderInfo = createTestResponderInfo.multiChain();

        expect(responderInfo.type).toBe('mobile');
        expect(responderInfo.chains.length).toBeGreaterThan(1);
        expect(responderInfo.chains.some((chain) => chain.chainType === 'evm')).toBe(true);
        expect(responderInfo.chains.some((chain) => chain.chainType === 'account')).toBe(true);
        expect(responderInfo.features.some((feature) => feature.id === 'cross-chain-swaps')).toBe(true);

        expectValidResponderInfo(responderInfo);
      });

      it('should validate chain capabilities', () => {
        const responderInfo = createTestResponderInfo.ethereum();

        for (const chain of responderInfo.chains) {
          expect(chain.chainId).toBeTruthy();
          expect(['evm', 'account', 'utxo']).toContain(chain.chainType);
          expect(Array.isArray(chain.standards)).toBe(true);
          expect(chain.network).toBeTruthy();
          expect(chain.network.testnet).toBeDefined();
        }
      });

      it('should validate wallet features', () => {
        const responderInfo = createTestResponderInfo.ethereum();

        for (const feature of responderInfo.features) {
          expect(feature.id).toBeTruthy();
          expect(feature.name).toBeTruthy();
          // WalletFeature doesn't have an 'enabled' property, it has optional 'version' and 'configuration'
          if (feature.version) {
            expect(typeof feature.version).toBe('string');
          }
        }
      });
    });

    describe('InitiatorInfo', () => {
      it('should create valid dApp info', () => {
        const initiatorInfo = createTestDAppInfo();

        expect(initiatorInfo.name).toBeTruthy();
        expect(initiatorInfo.url).toBeTruthy();
        expect(initiatorInfo.icon).toMatch(/^data:/);
        expect(initiatorInfo.description).toBeTruthy();

        expectValidInitiatorInfo(initiatorInfo);
      });

      it('should validate URL format', () => {
        const initiatorInfo = createTestDAppInfo({
          url: 'https://valid-url.com',
        });

        expect(() => new URL(initiatorInfo.url)).not.toThrow();
        expectValidInitiatorInfo(initiatorInfo);
      });

      it('should reject invalid URLs', () => {
        const invalidDAppInfo = {
          name: 'Test dApp',
          url: 'not-a-valid-url',
          icon: 'data:image/png;base64,test',
          description: 'Test',
        };

        expect(() => {
          expectValidInitiatorInfo(invalidDAppInfo);
        }).toThrow();
      });
    });

    describe('Protocol Version Compatibility', () => {
      it('should use correct protocol version', () => {
        const request = createTestDiscoveryRequest();
        const response = createTestDiscoveryResponse();

        expect(request.version).toBe(DISCOVERY_PROTOCOL_VERSION);
        expect(response.version).toBe(DISCOVERY_PROTOCOL_VERSION);
      });

      it('should reject incompatible protocol versions', () => {
        const requestWithOldVersion = createTestDiscoveryRequest({
          version: '1.0.0' as unknown as '0.1.0',
        });

        expect(() => {
          expectValidDiscoveryRequestEvent(requestWithOldVersion);
        }).toThrow(/version/);
      });
    });

    describe('Data URI Validation', () => {
      it('should accept valid data URIs for icons', () => {
        const validDataURI =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

        const initiatorInfo = createTestDAppInfo({ icon: validDataURI });
        const responderInfo = createTestResponderInfo.ethereum({ icon: validDataURI });

        expectValidInitiatorInfo(initiatorInfo);
        expectValidResponderInfo(responderInfo);
      });

      it('should reject non-data URI icons', () => {
        const httpIcon = 'https://example.com/icon.png';

        const invalidInitiatorInfo = createTestDAppInfo({ icon: httpIcon });
        const invalidResponderInfo = createTestResponderInfo.ethereum({ icon: httpIcon });

        expect(() => expectValidInitiatorInfo(invalidInitiatorInfo)).toThrow(/data URI/);
        expect(() => expectValidResponderInfo(invalidResponderInfo)).toThrow(/data URI/);
      });
    });
  });

  // ===============================================
  // Module Exports Tests
  // ===============================================
  describe('Module Exports', () => {
    it('should export all types from types.ts', async () => {
      const typesModule = await import('./types.js');
      expect(typesModule).toBeDefined();
    });

    it('should export constants with expected values', async () => {
      const constantsModule = await import('./constants.js');

      expect(constantsModule.DISCOVERY_PROTOCOL_VERSION).toBe('0.1.0');
      expect(constantsModule.DISCOVERY_EVENTS.REQUEST).toBe('discovery:wallet:request');
      expect(constantsModule.DISCOVERY_EVENTS.RESPONSE).toBe('discovery:wallet:response');
      expect(constantsModule.getErrorCategory).toBeDefined();
    });

    it('should export ProtocolStateMachine class and types', async () => {
      const stateMachineModule = await import('./ProtocolStateMachine.js');

      expect(stateMachineModule.ProtocolStateMachine).toBeDefined();
      expect(typeof stateMachineModule.ProtocolStateMachine).toBe('function');
    });

    it('should export all expected core exports', async () => {
      const coreIndex = await import('./index.js');

      // Constants should be re-exported
      expect(coreIndex.DISCOVERY_PROTOCOL_VERSION).toBe('0.1.0');
      expect(coreIndex.DISCOVERY_EVENTS.REQUEST).toBe('discovery:wallet:request');
      expect(coreIndex.getErrorCategory).toBeDefined();

      // ProtocolStateMachine should be re-exported
      expect(coreIndex.ProtocolStateMachine).toBeDefined();
      expect(typeof coreIndex.ProtocolStateMachine).toBe('function');
    });

    it('should verify protocol state machine can be instantiated', async () => {
      const { ProtocolStateMachine } = await import('./ProtocolStateMachine.js');

      expect(() => new ProtocolStateMachine()).not.toThrow();
      const stateMachine = new ProtocolStateMachine();
      expect(stateMachine.getState()).toBe('IDLE');
    });
  });
});
