import { describe, it, expect, beforeEach } from 'vitest';
import { CapabilityMatcher } from './CapabilityMatcher.js';
import type { DiscoveryRequestEvent, ResponderInfo } from '../core/types.js';

describe('CapabilityMatcher', () => {
  let matcher: CapabilityMatcher;
  let responderInfo: ResponderInfo;

  beforeEach(() => {
    responderInfo = {
      type: 'extension',
      rdns: 'com.example.wallet',
      name: 'Example Wallet',
      icon: 'data:image/svg+xml;base64,abc123',
      uuid: 'test-uuid',
      version: '1.0.0',
      protocolVersion: '0.1.0',
      chains: [
        {
          chainId: 'eip155:1',
          chainType: 'evm',
          network: {
            name: 'Ethereum Mainnet',
            chainId: 'eip155:1',
            nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
            testnet: false,
          },
          standards: ['eip-1193', 'eip-1474'],
          rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
          transactionTypes: [],
          signatureSchemes: ['secp256k1'],
          features: [],
        },
        {
          chainId: 'eip155:137',
          chainType: 'evm',
          network: {
            name: 'Polygon',
            chainId: 'eip155:137',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            testnet: false,
          },
          standards: ['eip-1193'],
          rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
          transactionTypes: [],
          signatureSchemes: ['secp256k1'],
          features: [],
        },
        {
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          chainType: 'account',
          network: {
            name: 'Solana Mainnet',
            chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
            testnet: false,
          },
          standards: ['solana-wallet-standard'],
          rpcMethods: ['getAccounts', 'signTransaction'],
          transactionTypes: [],
          signatureSchemes: ['ed25519'],
          features: [],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
          version: '1.0.0',
        },
        {
          id: 'hardware-wallet',
          name: 'Hardware Wallet',
          version: '2.0.0',
        },
        {
          id: 'batch-transactions',
          name: 'Batch Transactions',
          version: '1.0.0',
          configuration: {
            interfaces: ['batch-api-v1', 'multi-send'],
          },
        },
      ],
    };

    matcher = new CapabilityMatcher(responderInfo);
  });

  describe('constructor', () => {
    it('should create instance with responder info', () => {
      expect(matcher).toBeDefined();
      expect(matcher.getCapabilityDetails().responderType).toBe('extension');
    });
  });

  describe('matchCapabilities', () => {
    describe('valid matching scenarios', () => {
      it('should match when all required capabilities are supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection).toEqual({
          required: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
        });
        expect(result.missing).toEqual({
          chains: [],
          features: [],
          interfaces: [],
        });
      });

      it('should match multiple chains when all are supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1', 'eip155:137'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.chains).toEqual(['eip155:1', 'eip155:137']);
      });

      it('should include optional capabilities in intersection when supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          optional: {
            chains: ['eip155:137', 'eip155:42161'],
            features: ['hardware-wallet', 'gasless-transactions'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.optional).toEqual({
          chains: ['eip155:137'], // Only polygon is supported
          features: ['hardware-wallet'], // Only hardware-wallet is supported
        });
      });

      it('should detect Solana wallet interfaces correctly', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            features: ['account-management'],
            interfaces: ['solana-wallet-standard', 'solana-wallet-adapter'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.interfaces).toContain('solana-wallet-standard');
        expect(result.intersection?.required.interfaces).toContain('solana-wallet-adapter');
      });

      it('should detect interfaces from feature configuration', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            features: ['batch-transactions'],
            interfaces: ['batch-api-v1', 'multi-send'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.interfaces).toContain('batch-api-v1');
        expect(result.intersection?.required.interfaces).toContain('multi-send');
      });
    });

    describe('failed matching scenarios', () => {
      it('should fail when required chain is not supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:42161'], // Not supported
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.intersection).toBeNull();
        expect(result.missing.chains).toEqual(['eip155:42161']);
      });

      it('should fail when required feature is not supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            features: ['gasless-transactions'], // Not supported
            interfaces: ['eip-1193'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.missing.features).toEqual(['gasless-transactions']);
      });

      it('should fail when required interface is not supported', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['unknown-interface'], // Not supported
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.missing.interfaces).toEqual(['unknown-interface']);
      });

      it('should fail when multiple required capabilities are missing', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:42161', 'evm:optimism:10'],
            features: ['gasless-transactions', 'social-recovery'],
            interfaces: ['unknown-1', 'unknown-2'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.missing.chains).toEqual(['eip155:42161', 'evm:optimism:10']);
        expect(result.missing.features).toEqual(['gasless-transactions', 'social-recovery']);
        expect(result.missing.interfaces).toEqual(['unknown-1', 'unknown-2']);
      });

      it('should fail when any one required chain is missing', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1', 'eip155:42161'], // arbitrum not supported
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.missing.chains).toEqual(['eip155:42161']);
      });
    });

    describe('edge cases and invalid input', () => {
      it('should handle empty required capabilities', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: [],
            features: [],
            interfaces: [],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required).toEqual({
          chains: [],
          features: [],
          interfaces: [],
        });
      });

      it('should handle missing required field', () => {
        const request = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          // required field is missing
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        } as unknown as DiscoveryRequestEvent;

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.intersection).toBeNull();
      });

      it('should handle missing required sub-fields', () => {
        const request = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            // features and interfaces are missing
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        } as unknown as DiscoveryRequestEvent;

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(false);
        expect(result.intersection).toBeNull();
      });

      it('should handle optional capabilities being null/undefined', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'],
            features: ['account-management'],
            interfaces: ['eip-1193'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.optional).toBeUndefined();
      });

      it('should only return requested capabilities in intersection', () => {
        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['eip155:1'], // Only requesting ethereum
            features: ['account-management'], // Only requesting one feature
            interfaces: ['eip-1193'], // Only requesting one interface
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = matcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        // Should NOT include polygon or other supported chains/features
        expect(result.intersection?.required.chains).toHaveLength(1);
        expect(result.intersection?.required.features).toHaveLength(1);
        expect(result.intersection?.required.interfaces).toHaveLength(1);
      });
    });

    describe('chain type specific interfaces', () => {
      it('should detect Aztec wallet interfaces', () => {
        const aztecResponder: ResponderInfo = {
          ...responderInfo,
          chains: [
            {
              chainId: 'aztec:mainnet',
              chainType: 'account',
              network: {
                name: 'Aztec Mainnet',
                chainId: 'aztec:mainnet',
                nativeCurrency: { name: 'AZTEC', symbol: 'AZTEC', decimals: 18 },
                testnet: false,
              },
              standards: [],
              rpcMethods: [],
              transactionTypes: [],
              signatureSchemes: [],
              features: [],
            },
          ],
        };
        const aztecMatcher = new CapabilityMatcher(aztecResponder);

        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['aztec:mainnet'],
            features: ['account-management'],
            interfaces: ['aztec-wallet-api-v1'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = aztecMatcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.interfaces).toContain('aztec-wallet-api-v1');
      });

      it('should handle Bitcoin chains correctly', () => {
        const bitcoinResponder: ResponderInfo = {
          ...responderInfo,
          chains: [
            {
              chainId: 'bitcoin:mainnet',
              chainType: 'utxo', // Bitcoin uses utxo type
              network: {
                name: 'Bitcoin',
                chainId: 'bitcoin:mainnet',
                nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
                testnet: false,
              },
              standards: ['bip44', 'bip49'],
              rpcMethods: [],
              transactionTypes: [],
              signatureSchemes: ['secp256k1'],
              features: [],
            },
          ],
        };
        const bitcoinMatcher = new CapabilityMatcher(bitcoinResponder);

        const request: DiscoveryRequestEvent = {
          type: 'discovery:wallet:request',
          version: '0.1.0',
          sessionId: 'test-session',
          required: {
            chains: ['bitcoin:mainnet'],
            features: ['account-management'],
            interfaces: ['bip44'],
          },
          origin: 'https://example.com',
          initiatorInfo: { name: 'Test App', icon: '', url: '' },
        };

        const result = bitcoinMatcher.matchCapabilities(request);

        expect(result.canFulfill).toBe(true);
        expect(result.intersection?.required.interfaces).toContain('bip44');
      });
    });
  });

  describe('updateResponderInfo', () => {
    it('should update responder info and affect matching', () => {
      const request: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          chains: ['eip155:42161'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test App', icon: '', url: '' },
      };

      // Initially should fail
      let result = matcher.matchCapabilities(request);
      expect(result.canFulfill).toBe(false);

      // Update to support arbitrum
      const updatedInfo: ResponderInfo = {
        ...responderInfo,
        chains: [
          ...responderInfo.chains,
          {
            chainId: 'eip155:42161',
            chainType: 'evm',
            network: {
              name: 'Arbitrum One',
              chainId: 'eip155:42161',
              nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              testnet: false,
            },
            standards: ['eip-1193'],
            rpcMethods: ['eth_accounts', 'eth_sendTransaction'],
            transactionTypes: [],
            signatureSchemes: ['secp256k1'],
            features: [],
          },
        ],
      };

      matcher.updateResponderInfo(updatedInfo);

      // Now should succeed
      result = matcher.matchCapabilities(request);
      expect(result.canFulfill).toBe(true);
    });
  });

  describe('getCapabilityDetails', () => {
    it('should return complete capability details', () => {
      const details = matcher.getCapabilityDetails();

      expect(details).toEqual({
        supportedChains: ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
        supportedFeatures: ['account-management', 'hardware-wallet', 'batch-transactions'],
        supportedInterfaces: expect.arrayContaining([
          'eip-1193',
          'eip-1474',
          'solana-wallet-standard',
          'solana-wallet-adapter',
          'batch-api-v1',
          'multi-send',
        ]),
        responderType: 'extension',
        chainCount: 3,
        featureCount: 3,
      });
    });

    it('should reflect updates after updateResponderInfo', () => {
      const newInfo: ResponderInfo = {
        ...responderInfo,
        type: 'hardware',
        chains: [],
        features: [],
      };

      matcher.updateResponderInfo(newInfo);
      const details = matcher.getCapabilityDetails();

      expect(details.responderType).toBe('hardware');
      expect(details.chainCount).toBe(0);
      expect(details.featureCount).toBe(0);
      expect(details.supportedChains).toEqual([]);
      expect(details.supportedFeatures).toEqual([]);
    });
  });

  describe('complex multi-chain scenarios', () => {
    it('should handle mixed chain types in single request', () => {
      const request: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          chains: ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
          features: ['account-management'],
          interfaces: ['eip-1193', 'solana-wallet-standard'],
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test App', icon: '', url: '' },
      };

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      expect(result.intersection?.required.chains).toContain('eip155:1');
      expect(result.intersection?.required.chains).toContain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
    });

    it('should handle partial chain support correctly', () => {
      const request: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        optional: {
          chains: [
            'eip155:137',
            'eip155:42161',
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
            'bitcoin:mainnet',
          ],
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test App', icon: '', url: '' },
      };

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      // Should only include chains that are actually supported
      expect(result.intersection?.optional?.chains).toEqual([
        'eip155:137',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      ]);
      expect(result.intersection?.optional?.chains).not.toContain('eip155:42161');
      expect(result.intersection?.optional?.chains).not.toContain('bitcoin:mainnet');
    });
  });

  describe('privacy preservation', () => {
    it('should not reveal unsupported capabilities in intersection', () => {
      const request: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test App', icon: '', url: '' },
      };

      const result = matcher.matchCapabilities(request);

      // Should not reveal polygon support or other features
      expect(result.intersection?.required.chains).not.toContain('eip155:137');
      expect(result.intersection?.required.features).not.toContain('hardware-wallet');
    });

    it('should preserve privacy by only returning requested optional capabilities', () => {
      const request: DiscoveryRequestEvent = {
        type: 'discovery:wallet:request',
        version: '0.1.0',
        sessionId: 'test-session',
        required: {
          chains: ['eip155:1'],
          features: ['account-management'],
          interfaces: ['eip-1193'],
        },
        optional: {
          features: ['hardware-wallet'], // Only asking about hardware-wallet
        },
        origin: 'https://example.com',
        initiatorInfo: { name: 'Test App', icon: '', url: '' },
      };

      const result = matcher.matchCapabilities(request);

      expect(result.canFulfill).toBe(true);
      expect(result.intersection?.optional?.features).toEqual(['hardware-wallet']);
      // Should not reveal batch-transactions support
      expect(result.intersection?.optional?.features).not.toContain('batch-transactions');
    });
  });
});
