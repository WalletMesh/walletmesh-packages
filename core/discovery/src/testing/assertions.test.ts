import { describe, it, expect } from 'vitest';
import { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';
import {
  expectValidDiscoveryRequestEvent,
  expectValidDiscoveryResponseEvent,
  expectValidResponderInfo,
  expectValidInitiatorInfo,
  expectValidQualifiedResponder,
} from './assertions.js';
import type {
  DiscoveryRequestEvent,
  DiscoveryResponseEvent,
  ResponderInfo,
  InitiatorInfo,
  QualifiedResponder,
  ChainType,
} from '../core/types.js';

describe('Testing Assertions', () => {
  describe('expectValidDiscoveryRequestEvent', () => {
    const validRequest: DiscoveryRequestEvent = {
      type: 'discovery:wallet:request',
      version: DISCOVERY_PROTOCOL_VERSION,
      sessionId: 'test-session-123',
      origin: 'https://example.com',
      initiatorInfo: {
        name: 'Test DApp',
        url: 'https://example.com',
        icon: 'data:image/png;base64,test',
      },
      required: {
        chains: ['eip155:1'],
        features: ['account-management'],
        interfaces: ['eip-1193'],
      },
    };

    it('should accept valid discovery request', () => {
      expect(() => expectValidDiscoveryRequestEvent(validRequest)).not.toThrow();
    });

    it('should throw if request is not an object', () => {
      expect(() => expectValidDiscoveryRequestEvent(null)).toThrow('Request must be an object');
      expect(() => expectValidDiscoveryRequestEvent(undefined)).toThrow('Request must be an object');
      expect(() => expectValidDiscoveryRequestEvent('string')).toThrow('Request must be an object');
      expect(() => expectValidDiscoveryRequestEvent(123)).toThrow('Request must be an object');
    });

    it('should throw if type is invalid', () => {
      const invalidRequest = { ...validRequest, type: 'invalid-type' };
      expect(() => expectValidDiscoveryRequestEvent(invalidRequest)).toThrow(
        "Expected type 'discovery:wallet:request', got 'invalid-type'",
      );
    });

    it('should throw if version is invalid', () => {
      const invalidRequest = { ...validRequest, version: '999.0.0' };
      expect(() => expectValidDiscoveryRequestEvent(invalidRequest)).toThrow(
        `Expected version '${DISCOVERY_PROTOCOL_VERSION}', got '999.0.0'`,
      );
    });

    it('should throw if sessionId is invalid', () => {
      const noSessionId = { ...validRequest, sessionId: undefined };
      expect(() => expectValidDiscoveryRequestEvent(noSessionId)).toThrow(
        'Request must have a valid sessionId',
      );

      const invalidSessionId = { ...validRequest, sessionId: 123 };
      expect(() => expectValidDiscoveryRequestEvent(invalidSessionId)).toThrow(
        'Request must have a valid sessionId',
      );
    });

    it('should throw if origin is invalid', () => {
      const noOrigin = { ...validRequest, origin: undefined };
      expect(() => expectValidDiscoveryRequestEvent(noOrigin)).toThrow('Request must have a valid origin');

      const invalidOrigin = { ...validRequest, origin: 123 };
      expect(() => expectValidDiscoveryRequestEvent(invalidOrigin)).toThrow(
        'Request must have a valid origin',
      );
    });

    it('should validate initiatorInfo', () => {
      const invalidDappInfo = { ...validRequest, initiatorInfo: { name: 'Test' } };
      expect(() => expectValidDiscoveryRequestEvent(invalidDappInfo)).toThrow(
        'InitiatorInfo must have a valid url',
      );
    });

    it('should validate required capabilities', () => {
      const noChains = {
        ...validRequest,
        required: { ...validRequest.required, chains: undefined },
      };
      expect(() => expectValidDiscoveryRequestEvent(noChains)).toThrow(
        'Capability requirements must have chains as an array',
      );
    });

    it('should accept optional preferences', () => {
      const withOptional = {
        ...validRequest,
        optional: {
          chains: ['eip155:137'],
          features: ['hardware-wallet'],
        },
      };
      expect(() => expectValidDiscoveryRequestEvent(withOptional)).not.toThrow();
    });

    it('should validate optional preferences if present', () => {
      const invalidOptional = {
        ...validRequest,
        optional: {
          chains: 'not-an-array',
        },
      };
      expect(() => expectValidDiscoveryRequestEvent(invalidOptional)).toThrow(
        'Capability preferences chains must be an array if provided',
      );
    });
  });

  describe('expectValidDiscoveryResponseEvent', () => {
    const validResponse: DiscoveryResponseEvent = {
      type: 'discovery:wallet:response',
      version: DISCOVERY_PROTOCOL_VERSION,
      sessionId: 'test-session-123',
      responderId: 'test-wallet-id',
      rdns: 'com.test.wallet',
      name: 'Test Wallet',
      icon: 'data:image/png;base64,test',
      responderVersion: '1.0.0',
      matched: {
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      },
    };

    it('should accept valid discovery response', () => {
      expect(() => expectValidDiscoveryResponseEvent(validResponse)).not.toThrow();
    });

    it('should throw if response is not an object', () => {
      expect(() => expectValidDiscoveryResponseEvent(null)).toThrow('Response must be an object');
      expect(() => expectValidDiscoveryResponseEvent(undefined)).toThrow('Response must be an object');
      expect(() => expectValidDiscoveryResponseEvent('string')).toThrow('Response must be an object');
    });

    it('should throw if type is invalid', () => {
      const invalidResponse = { ...validResponse, type: 'invalid-type' };
      expect(() => expectValidDiscoveryResponseEvent(invalidResponse)).toThrow(
        "Expected type 'discovery:wallet:response', got 'invalid-type'",
      );
    });

    it('should throw if walletId is invalid', () => {
      const noWalletId = { ...validResponse, responderId: undefined };
      expect(() => expectValidDiscoveryResponseEvent(noWalletId)).toThrow(
        'Response must have a valid responderId',
      );

      const invalidWalletId = { ...validResponse, responderId: 123 };
      expect(() => expectValidDiscoveryResponseEvent(invalidWalletId)).toThrow(
        'Response must have a valid responderId',
      );
    });

    it('should throw if rdns is invalid', () => {
      const noRdns = { ...validResponse, rdns: undefined };
      expect(() => expectValidDiscoveryResponseEvent(noRdns)).toThrow('Response must have a valid rdns');
    });

    it('should throw if name is invalid', () => {
      const noName = { ...validResponse, name: undefined };
      expect(() => expectValidDiscoveryResponseEvent(noName)).toThrow('Response must have a valid name');
    });

    it('should throw if icon is invalid', () => {
      const noIcon = { ...validResponse, icon: undefined };
      expect(() => expectValidDiscoveryResponseEvent(noIcon)).toThrow('Response must have a valid icon');

      const invalidIcon = { ...validResponse, icon: 'https://example.com/icon.png' };
      expect(() => expectValidDiscoveryResponseEvent(invalidIcon)).toThrow(
        'Response icon must be a data URI',
      );
    });

    it('should validate matched capabilities', () => {
      const invalidMatched = { ...validResponse, matched: null };
      expect(() => expectValidDiscoveryResponseEvent(invalidMatched)).toThrow(
        'Capability intersection must be an object',
      );
    });
  });

  describe('expectValidResponderInfo', () => {
    const validResponderInfo: ResponderInfo = {
      uuid: 'test-wallet-uuid',
      rdns: 'com.test.wallet',
      name: 'Test Wallet',
      icon: 'data:image/png;base64,test',
      type: 'extension',
      version: '1.0.0',
      protocolVersion: DISCOVERY_PROTOCOL_VERSION,
      chains: [
        {
          chainId: 'eip155:1',
          chainType: 'evm',
          standards: ['eip-1193'],
          network: {
            name: 'Ethereum Mainnet',
            chainId: '1',
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
            testnet: false,
          },
          rpcMethods: [],
          transactionTypes: [],
          signatureSchemes: [],
          features: [],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
        },
      ],
    };

    it('should accept valid wallet info', () => {
      expect(() => expectValidResponderInfo(validResponderInfo)).not.toThrow();
    });

    it('should throw if walletInfo is not an object', () => {
      expect(() => expectValidResponderInfo(null)).toThrow('ResponderInfo must be an object');
      expect(() => expectValidResponderInfo('string')).toThrow('ResponderInfo must be an object');
    });

    it('should throw if uuid is invalid', () => {
      const noUuid = { ...validResponderInfo, uuid: undefined };
      expect(() => expectValidResponderInfo(noUuid)).toThrow('ResponderInfo must have a valid uuid');
    });

    it('should throw if rdns is invalid', () => {
      const noRdns = { ...validResponderInfo, rdns: undefined };
      expect(() => expectValidResponderInfo(noRdns)).toThrow('ResponderInfo must have a valid rdns');
    });

    it('should throw if icon is not a data URI', () => {
      const invalidIcon = { ...validResponderInfo, icon: 'https://example.com/icon.png' };
      expect(() => expectValidResponderInfo(invalidIcon)).toThrow('ResponderInfo icon must be a data URI');
    });

    it('should throw if type is invalid', () => {
      const invalidType = { ...validResponderInfo, type: 'invalid-type' };
      expect(() => expectValidResponderInfo(invalidType)).toThrow('ResponderInfo must have a valid type');
    });

    it('should accept all valid wallet types', () => {
      const types = ['web', 'extension', 'hardware', 'mobile'];
      for (const type of types) {
        const responder = { ...validResponderInfo, type };
        expect(() => expectValidResponderInfo(responder)).not.toThrow();
      }
    });

    it('should throw if chains is not an array or empty', () => {
      const noChains = { ...validResponderInfo, chains: undefined };
      expect(() => expectValidResponderInfo(noChains)).toThrow('ResponderInfo must have at least one chain');

      const emptyChains = { ...validResponderInfo, chains: [] };
      expect(() => expectValidResponderInfo(emptyChains)).toThrow(
        'ResponderInfo must have at least one chain',
      );
    });

    it('should throw if features is not an array', () => {
      const noFeatures = { ...validResponderInfo, features: undefined };
      expect(() => expectValidResponderInfo(noFeatures)).toThrow(
        'ResponderInfo must have features as an array',
      );
    });

    it('should validate each chain', () => {
      const invalidChain = {
        ...validResponderInfo,
        chains: [
          {
            chainId: 'eip155:1',
            chainType: 'invalid-type',
            standards: ['eip-1193'],
          },
        ],
      };
      expect(() => expectValidResponderInfo(invalidChain)).toThrow(
        'Chain capability must have a valid chainType',
      );
    });

    it('should validate each feature', () => {
      const invalidFeature = {
        ...validResponderInfo,
        features: [{ id: 'test-feature' }],
      };
      expect(() => expectValidResponderInfo(invalidFeature)).toThrow('Wallet feature must have a valid name');
    });
  });

  describe('expectValidInitiatorInfo', () => {
    const validInitiatorInfo: InitiatorInfo = {
      name: 'Test DApp',
      url: 'https://example.com',
      icon: 'data:image/png;base64,test',
    };

    it('should accept valid dApp info', () => {
      expect(() => expectValidInitiatorInfo(validInitiatorInfo)).not.toThrow();
    });

    it('should throw if initiatorInfo is not an object', () => {
      expect(() => expectValidInitiatorInfo(null)).toThrow('InitiatorInfo must be an object');
      // Arrays are objects in JavaScript, so it would fail on name check
      expect(() => expectValidInitiatorInfo([])).toThrow('InitiatorInfo must have a valid name');
    });

    it('should throw if name is invalid', () => {
      const noName = { ...validInitiatorInfo, name: undefined };
      expect(() => expectValidInitiatorInfo(noName)).toThrow('InitiatorInfo must have a valid name');

      const invalidName = { ...validInitiatorInfo, name: 123 };
      expect(() => expectValidInitiatorInfo(invalidName)).toThrow('InitiatorInfo must have a valid name');
    });

    it('should throw if url is invalid', () => {
      const noUrl = { ...validInitiatorInfo, url: undefined };
      expect(() => expectValidInitiatorInfo(noUrl)).toThrow('InitiatorInfo must have a valid url');

      const invalidUrl = { ...validInitiatorInfo, url: 'not-a-url' };
      expect(() => expectValidInitiatorInfo(invalidUrl)).toThrow('InitiatorInfo url must be a valid URL');
    });

    it('should accept dApp info without icon', () => {
      const noIcon = { name: 'Test DApp', url: 'https://example.com' };
      expect(() => expectValidInitiatorInfo(noIcon)).not.toThrow();
    });

    it('should throw if icon is not a data URI', () => {
      const invalidIcon = { ...validInitiatorInfo, icon: 'https://example.com/icon.png' };
      expect(() => expectValidInitiatorInfo(invalidIcon)).toThrow(
        'InitiatorInfo icon must be a data URI if provided',
      );
    });
  });

  describe('expectValidQualifiedWallet', () => {
    const validQualifiedWallet: QualifiedResponder = {
      responderId: 'test-wallet-id',
      rdns: 'com.test.wallet',
      name: 'Test Wallet',
      icon: 'data:image/png;base64,test',
      matched: {
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      },
    };

    it('should accept valid qualified wallet', () => {
      expect(() => expectValidQualifiedResponder(validQualifiedWallet)).not.toThrow();
    });

    it('should throw if wallet is not an object', () => {
      expect(() => expectValidQualifiedResponder(null)).toThrow('QualifiedWallet must be an object');
      expect(() => expectValidQualifiedResponder(true)).toThrow('QualifiedWallet must be an object');
    });

    it('should throw if walletId is invalid', () => {
      const noWalletId = { ...validQualifiedWallet, responderId: undefined };
      expect(() => expectValidQualifiedResponder(noWalletId)).toThrow(
        'QualifiedWallet must have a valid walletId',
      );
    });

    it('should throw if rdns is invalid', () => {
      const noRdns = { ...validQualifiedWallet, rdns: undefined };
      expect(() => expectValidQualifiedResponder(noRdns)).toThrow('QualifiedWallet must have a valid rdns');
    });

    it('should throw if name is invalid', () => {
      const noName = { ...validQualifiedWallet, name: undefined };
      expect(() => expectValidQualifiedResponder(noName)).toThrow('QualifiedWallet must have a valid name');
    });

    it('should throw if icon is invalid', () => {
      const noIcon = { ...validQualifiedWallet, icon: undefined };
      expect(() => expectValidQualifiedResponder(noIcon)).toThrow('QualifiedWallet must have a valid icon');
    });

    it('should validate matched capabilities', () => {
      const invalidMatched = { ...validQualifiedWallet, matched: null };
      expect(() => expectValidQualifiedResponder(invalidMatched)).toThrow(
        'Capability intersection must be an object',
      );
    });

    it('should accept qualified wallet without score', () => {
      const noScore = { ...validQualifiedWallet, score: undefined };
      expect(() => expectValidQualifiedResponder(noScore)).not.toThrow();
    });

    it('should throw if score is not a number', () => {
      const invalidScore = { ...validQualifiedWallet, score: '0.85' };
      expect(() => expectValidQualifiedResponder(invalidScore)).toThrow(
        'QualifiedWallet score must be a number if provided',
      );
    });
  });

  describe('Edge Cases and Error Messages', () => {
    it('should provide clear error messages for nested validation failures', () => {
      const requestWithInvalidDapp: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: DISCOVERY_PROTOCOL_VERSION,
        sessionId: 'test-session',
        origin: 'https://example.com',
        initiatorInfo: {
          name: 'Test',
          url: 'invalid-url',
        },
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
      };

      expect(() => expectValidDiscoveryRequestEvent(requestWithInvalidDapp)).toThrow(
        'InitiatorInfo url must be a valid URL',
      );
    });

    it('should handle complex nested validation', () => {
      const walletWithInvalidChain: ResponderInfo = {
        uuid: 'test-wallet',
        rdns: 'com.test.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,test',
        type: 'extension',
        version: '1.0.0',
        protocolVersion: DISCOVERY_PROTOCOL_VERSION,
        chains: [
          {
            chainId: 'eip155:1',
            chainType: 'evm',
            standards: null as unknown as string[], // Invalid standards
            network: {
              name: 'Ethereum Mainnet',
              chainId: '1',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              testnet: false,
            },
            rpcMethods: [],
            transactionTypes: [],
            signatureSchemes: [],
            features: [],
          },
        ],
        features: [],
      };

      expect(() => expectValidResponderInfo(walletWithInvalidChain)).toThrow(
        'Chain capability must have standards as an array',
      );
    });

    it('should validate network testnet property correctly', () => {
      const walletWithNetwork: ResponderInfo = {
        uuid: 'test-wallet',
        rdns: 'com.test.wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,test',
        type: 'extension',
        version: '1.0.0',
        protocolVersion: DISCOVERY_PROTOCOL_VERSION,
        chains: [
          {
            chainId: 'eip155:1',
            chainType: 'evm',
            standards: ['eip-1193'],
            network: {
              name: 'Ethereum Mainnet',
              chainId: '1',
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              testnet: 'not-boolean' as unknown as boolean,
            },
            rpcMethods: [],
            transactionTypes: [],
            signatureSchemes: [],
            features: [],
          },
        ],
        features: [],
      };

      expect(() => expectValidResponderInfo(walletWithNetwork)).toThrow(
        'Chain capability network must have testnet as a boolean',
      );
    });

    it('should handle all chain types', () => {
      const chainTypes = ['evm', 'account', 'utxo'];
      for (const chainType of chainTypes) {
        const responder: ResponderInfo = {
          uuid: 'test-wallet',
          rdns: 'com.test.wallet',
          name: 'Test Wallet',
          icon: 'data:image/png;base64,test',
          type: 'extension',
          version: '1.0.0',
          protocolVersion: DISCOVERY_PROTOCOL_VERSION,
          chains: [
            {
              chainId: `${chainType}:test:1`,
              chainType: chainType as unknown as ChainType,
              standards: ['standard-1'],
              network: {
                name: 'Test Network',
                chainId: '1',
                nativeCurrency: {
                  name: 'Test Token',
                  symbol: 'TEST',
                  decimals: 18,
                },
                testnet: false,
              },
              rpcMethods: [],
              transactionTypes: [],
              signatureSchemes: [],
              features: [],
            },
          ],
          features: [],
        };
        expect(() => expectValidResponderInfo(responder)).not.toThrow();
      }
    });
  });
});
