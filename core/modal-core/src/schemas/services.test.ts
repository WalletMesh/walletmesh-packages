/**
 * @fileoverview Tests for service configuration and parameter schemas
 */

import { describe, it, expect, vi } from 'vitest';
import {
  connectArgsSchema,
  connectOptionsSchema,
  disconnectOptionsSchema,
  connectionProgressSchema,
  connectionServiceConfigSchema,
  walletPreferenceSchema,
  walletPreferenceServiceConfigSchema,
  connectionDisplayConfigSchema,
  connectButtonStateSchema,
  chainValidationParamsSchema,
  chainSwitchParamsSchema,
  chainServiceConfigSchema,
  transactionServiceConfigSchema,
} from './services.js';

describe('Service Schemas', () => {
  describe('Connection Service Schemas', () => {
    describe('connectArgsSchema', () => {
      it('should validate minimal connect args', () => {
        expect(() => connectArgsSchema.parse({})).not.toThrow();
      });

      it('should validate connect args with wallet ID', () => {
        const args = { walletId: 'metamask' };
        expect(() => connectArgsSchema.parse(args)).not.toThrow();
      });

      it('should validate connect args with chain ID', () => {
        const args = { chainId: 'eip155:1' };
        expect(() => connectArgsSchema.parse(args)).not.toThrow();
      });

      it('should validate complete connect args', () => {
        const args = { walletId: 'metamask', chainId: 'eip155:1' };
        expect(() => connectArgsSchema.parse(args)).not.toThrow();
      });
    });

    describe('connectOptionsSchema', () => {
      it('should validate basic connect options', () => {
        const options = { walletId: 'metamask', showModal: true };
        expect(() => connectOptionsSchema.parse(options)).not.toThrow();
      });

      it('should validate timeout range', () => {
        expect(() => connectOptionsSchema.parse({ timeout: 300001 })).toThrow();
        expect(() => connectOptionsSchema.parse({ timeout: -1 })).toThrow();
        expect(() => connectOptionsSchema.parse({ timeout: 30000 })).not.toThrow();
      });

      it('should validate retry attempts', () => {
        expect(() => connectOptionsSchema.parse({ retryAttempts: 11 })).toThrow();
        expect(() => connectOptionsSchema.parse({ retryAttempts: -1 })).toThrow();
        expect(() => connectOptionsSchema.parse({ retryAttempts: 3 })).not.toThrow();
      });

      it('should accept progress callback', () => {
        const onProgress = vi.fn();
        const options = { onProgress };
        expect(() => connectOptionsSchema.parse(options)).not.toThrow();
      });

      it('should validate complete options', () => {
        const options = {
          walletId: 'metamask',
          chainId: 'eip155:1',
          showModal: false,
          onProgress: vi.fn(),
          timeout: 60000,
          autoRetry: true,
          retryAttempts: 5,
          metadata: { source: 'header-button' },
        };
        expect(() => connectOptionsSchema.parse(options)).not.toThrow();
      });
    });

    describe('disconnectOptionsSchema', () => {
      it('should validate minimal disconnect options', () => {
        expect(() => disconnectOptionsSchema.parse({})).not.toThrow();
      });

      it('should validate force disconnect', () => {
        const options = { force: true };
        expect(() => disconnectOptionsSchema.parse(options)).not.toThrow();
      });

      it('should validate disconnect with reason', () => {
        const options = { reason: 'User requested disconnection' };
        expect(() => disconnectOptionsSchema.parse(options)).not.toThrow();
      });

      it('should validate complete disconnect options', () => {
        const options = { force: true, reason: 'Session expired' };
        expect(() => disconnectOptionsSchema.parse(options)).not.toThrow();
      });
    });

    describe('connectionProgressSchema', () => {
      it('should validate connection progress', () => {
        const progress = {
          progress: 50,
          step: 'Connecting to wallet',
          details: 'metamask',
        };
        expect(() => connectionProgressSchema.parse(progress)).not.toThrow();
      });

      it('should reject progress out of range', () => {
        expect(() => connectionProgressSchema.parse({ progress: -1, step: 'test' })).toThrow();
        expect(() => connectionProgressSchema.parse({ progress: 101, step: 'test' })).toThrow();
      });

      it('should require step description', () => {
        expect(() => connectionProgressSchema.parse({ progress: 50 })).toThrow();
      });
    });

    describe('connectionServiceConfigSchema', () => {
      it('should provide defaults', () => {
        const result = connectionServiceConfigSchema.parse({});
        expect(result.maxRetryAttempts).toBe(3);
        expect(result.responseTimeThreshold).toBe(2000);
        expect(result.autoReconnect).toBe(true);
        expect(result.reconnectDelay).toBe(5000);
        expect(result.connectionTimeout).toBe(30000);
      });

      it('should validate custom config', () => {
        const config = {
          maxRetryAttempts: 5,
          responseTimeThreshold: 3000,
          autoReconnect: false,
          reconnectDelay: 10000,
          connectionTimeout: 60000,
        };
        expect(() => connectionServiceConfigSchema.parse(config)).not.toThrow();
      });

      it('should reject values out of range', () => {
        expect(() => connectionServiceConfigSchema.parse({ maxRetryAttempts: 11 })).toThrow();
        expect(() => connectionServiceConfigSchema.parse({ responseTimeThreshold: 50 })).toThrow();
        expect(() => connectionServiceConfigSchema.parse({ reconnectDelay: 500 })).toThrow();
      });
    });
  });

  describe('Wallet Preference Service Schemas', () => {
    describe('walletPreferenceSchema', () => {
      it('should validate minimal preference', () => {
        expect(() => walletPreferenceSchema.parse({})).not.toThrow();
      });

      it('should validate complete preference', () => {
        const preference = {
          autoConnect: true,
          lastConnected: Date.now(),
          connectionCount: 5,
          userSettings: { theme: 'dark' },
        };
        expect(() => walletPreferenceSchema.parse(preference)).not.toThrow();
      });

      it('should reject negative connection count', () => {
        const preference = { connectionCount: -1 };
        expect(() => walletPreferenceSchema.parse(preference)).toThrow();
      });
    });

    describe('walletPreferenceServiceConfigSchema', () => {
      it('should provide defaults', () => {
        const result = walletPreferenceServiceConfigSchema.parse({});
        expect(result.enablePersistence).toBe(true);
        expect(result.storageKeyPrefix).toBe('walletmesh');
        expect(result.enableAutoConnect).toBe(true);
      });

      it('should validate storage key prefix', () => {
        expect(() => walletPreferenceServiceConfigSchema.parse({ storageKeyPrefix: 'custom' })).not.toThrow();
        expect(() => walletPreferenceServiceConfigSchema.parse({ storageKeyPrefix: '' })).not.toThrow();
      });
    });

    // History-related schemas have been removed
  });

  describe('UI Service Schemas', () => {
    describe('connectionDisplayConfigSchema', () => {
      it('should provide defaults', () => {
        const result = connectionDisplayConfigSchema.parse({});
        expect(result.showEnsNames).toBe(true);
        expect(result.truncateAddresses).toBe(true);
        expect(result.addressTruncateLength).toBe(6);
        expect(result.showWalletIcon).toBe(true);
        expect(result.showChainIcon).toBe(true);
        expect(result.showBalance).toBe(false);
      });

      it('should validate custom config', () => {
        const config = {
          showEnsNames: false,
          truncateAddresses: true,
          addressTruncateLength: 8,
          showWalletIcon: false,
          showChainIcon: false,
          showBalance: true,
        };
        expect(() => connectionDisplayConfigSchema.parse(config)).not.toThrow();
      });

      it('should reject invalid truncate length', () => {
        expect(() => connectionDisplayConfigSchema.parse({ addressTruncateLength: 3 })).toThrow();
        expect(() => connectionDisplayConfigSchema.parse({ addressTruncateLength: 21 })).toThrow();
      });
    });

    describe('connectButtonStateSchema', () => {
      it('should validate button state', () => {
        const state = {
          text: 'Connect Wallet',
          disabled: false,
          loading: false,
        };
        expect(() => connectButtonStateSchema.parse(state)).not.toThrow();
      });

      it('should validate complete button state', () => {
        const state = {
          text: 'Connecting...',
          disabled: true,
          loading: true,
          variant: 'primary' as const,
          className: 'btn-large',
        };
        expect(() => connectButtonStateSchema.parse(state)).not.toThrow();
      });

      it('should reject invalid variant', () => {
        const state = {
          text: 'Connect',
          disabled: false,
          loading: false,
          variant: 'invalid',
        };
        expect(() => connectButtonStateSchema.parse(state)).toThrow();
      });
    });
  });

  describe('Chain Service Schemas', () => {
    describe('chainValidationParamsSchema', () => {
      it('should validate chain validation params', () => {
        const params = {
          chainId: 'eip155:1',
          provider: {},
        };
        expect(() => chainValidationParamsSchema.parse(params)).not.toThrow();
      });

      it('should validate with options', () => {
        const params = {
          chainId: 'eip155:1',
          provider: {},
          options: {
            skipNetworkCheck: true,
            allowTestnets: false,
          },
        };
        expect(() => chainValidationParamsSchema.parse(params)).not.toThrow();
      });
    });

    describe('chainSwitchParamsSchema', () => {
      it('should validate basic switch params', () => {
        const params = {
          chainId: 'eip155:137',
          provider: {},
        };
        expect(() => chainSwitchParamsSchema.parse(params)).not.toThrow();
      });

      it('should validate with chain config', () => {
        const params = {
          chainId: 'eip155:137',
          provider: {},
          addIfNotExists: true,
          chainConfig: {
            chainName: 'Polygon',
            rpcUrls: ['https://polygon-rpc.com'],
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            blockExplorerUrls: ['https://polygonscan.com'],
          },
        };
        expect(() => chainSwitchParamsSchema.parse(params)).not.toThrow();
      });

      it('should reject invalid RPC URLs', () => {
        const params = {
          chainId: 'eip155:137',
          provider: {},
          chainConfig: {
            chainName: 'Polygon',
            rpcUrls: ['not-a-url'],
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
          },
        };
        expect(() => chainSwitchParamsSchema.parse(params)).toThrow();
      });
    });

    describe('chainServiceConfigSchema', () => {
      it('should provide defaults', () => {
        const result = chainServiceConfigSchema.parse({});
        expect(result.autoAddChain).toBe(false);
        expect(result.chainValidation).toBe('strict');
        expect(result.maxChainSwitchRetries).toBe(3);
        expect(result.chainSwitchRetryDelay).toBe(1000);
      });

      it('should validate custom config', () => {
        const config = {
          defaultChainId: 'eip155:1',
          autoAddChain: true,
          chainValidation: 'loose' as const,
          maxChainSwitchRetries: 5,
          chainSwitchRetryDelay: 2000,
        };
        expect(() => chainServiceConfigSchema.parse(config)).not.toThrow();
      });

      it('should reject invalid values', () => {
        expect(() => chainServiceConfigSchema.parse({ maxChainSwitchRetries: 6 })).toThrow();
        expect(() => chainServiceConfigSchema.parse({ chainSwitchRetryDelay: 300 })).toThrow();
        expect(() => chainServiceConfigSchema.parse({ chainValidation: 'invalid' })).toThrow();
      });
    });
  });

  describe('Transaction Service Schemas', () => {
    describe('transactionServiceConfigSchema', () => {
      it('should provide defaults', () => {
        const result = transactionServiceConfigSchema.parse({});
        expect(result.defaultTimeout).toBe(120000);
        expect(result.pollingInterval).toBe(3000);
        expect(result.maxRetries).toBe(3);
        expect(result.confirmationBlocks).toBe(1);
        expect(result.autoTrackTransactions).toBe(true);
        expect(result.maxTrackedTransactions).toBe(100);
        expect(result.historyRetention).toBe(86400000);
      });

      it('should validate custom config', () => {
        const config = {
          defaultTimeout: 180000,
          pollingInterval: 5000,
          maxRetries: 5,
          confirmationBlocks: 6,
          autoTrackTransactions: false,
          maxTrackedTransactions: 500,
          historyRetention: 172800000, // 48 hours
        };
        expect(() => transactionServiceConfigSchema.parse(config)).not.toThrow();
      });

      it('should reject values out of range', () => {
        expect(() => transactionServiceConfigSchema.parse({ defaultTimeout: 500 })).toThrow();
        expect(() => transactionServiceConfigSchema.parse({ pollingInterval: 50 })).toThrow();
        expect(() => transactionServiceConfigSchema.parse({ confirmationBlocks: 0 })).toThrow();
        expect(() => transactionServiceConfigSchema.parse({ maxTrackedTransactions: 5 })).toThrow();
        expect(() => transactionServiceConfigSchema.parse({ historyRetention: 1800000 })).toThrow(); // 30 minutes
      });
    });
  });
});
