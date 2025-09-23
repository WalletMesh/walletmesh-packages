/**
 * @fileoverview Tests for connect options schemas
 */

import { describe, it, expect, vi } from 'vitest';
import {
  walletSelectionSchema,
  timeoutConfigSchema,
  retryConfigSchema,
  connectionProgressSchema,
  baseConnectOptionsSchema,
  advancedConnectOptionsSchema,
  reconnectOptionsSchema,
  disconnectOptionsSchema,
  multiWalletConnectSchema,
  connectionStateQuerySchema,
  connectionHealthCheckSchema,
} from './connectOptions.js';

describe('Connection Options Schemas', () => {
  describe('walletSelectionSchema', () => {
    it('should validate empty selection', () => {
      expect(() => walletSelectionSchema.parse({})).not.toThrow();
    });

    it('should validate complete selection criteria', () => {
      const selection = {
        walletId: 'metamask',
        features: ['eip1193', 'eip6963'],
        supportedChains: ['eip155:1', 'eip155:137', 'eip155:42161'],
        installedOnly: true,
      };
      expect(() => walletSelectionSchema.parse(selection)).not.toThrow();
    });

    it('should validate partial selection', () => {
      const selection = {
        features: ['eip1193'],
        installedOnly: true,
      };
      expect(() => walletSelectionSchema.parse(selection)).not.toThrow();
    });
  });

  describe('timeoutConfigSchema', () => {
    it('should provide defaults', () => {
      const result = timeoutConfigSchema.parse({});
      expect(result.connection).toBe(60000);
      expect(result.discovery).toBe(10000);
      expect(result.operation).toBe(30000);
    });

    it('should validate custom timeouts', () => {
      const config = {
        connection: 120000,
        discovery: 5000,
        operation: 45000,
      };
      expect(() => timeoutConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject invalid timeouts', () => {
      expect(() => timeoutConfigSchema.parse({ connection: 1000 })).toThrow(); // Too short
      expect(() => timeoutConfigSchema.parse({ connection: 400000 })).toThrow(); // Too long
      expect(() => timeoutConfigSchema.parse({ discovery: 500 })).toThrow();
      expect(() => timeoutConfigSchema.parse({ operation: 100000 })).toThrow();
    });
  });

  describe('retryConfigSchema', () => {
    it('should provide defaults', () => {
      const result = retryConfigSchema.parse({});
      expect(result.maxAttempts).toBe(3);
      expect(result.initialDelay).toBe(1000);
      expect(result.backoffMultiplier).toBe(2);
      expect(result.maxDelay).toBe(30000);
    });

    it('should validate custom retry config', () => {
      const config = {
        maxAttempts: 5,
        initialDelay: 500,
        backoffMultiplier: 1.5,
        maxDelay: 20000,
      };
      expect(() => retryConfigSchema.parse(config)).not.toThrow();
    });

    it('should reject invalid retry config', () => {
      expect(() => retryConfigSchema.parse({ maxAttempts: -1 })).toThrow();
      expect(() => retryConfigSchema.parse({ maxAttempts: 20 })).toThrow();
      expect(() => retryConfigSchema.parse({ backoffMultiplier: 0.5 })).toThrow();
      expect(() => retryConfigSchema.parse({ backoffMultiplier: 10 })).toThrow();
    });
  });

  describe('connectionProgressSchema', () => {
    it('should validate progress updates', () => {
      const progressSteps = [
        { step: 'discovery', progress: 10, message: 'Discovering wallets...' },
        { step: 'selecting', progress: 20, message: 'Selecting wallet...' },
        { step: 'connecting', progress: 40, message: 'Connecting to wallet...' },
        { step: 'authenticating', progress: 60, message: 'Authenticating...' },
        { step: 'establishing', progress: 80, message: 'Establishing connection...' },
        { step: 'finalizing', progress: 90, message: 'Finalizing...' },
        { step: 'complete', progress: 100, message: 'Connected!' },
        { step: 'failed', progress: 0, message: 'Connection failed' },
      ];

      for (const progress of progressSteps) {
        expect(() => connectionProgressSchema.parse(progress)).not.toThrow();
      }
    });

    it('should validate progress with data', () => {
      const progress = {
        step: 'connecting',
        progress: 50,
        message: 'Connecting to MetaMask',
        data: {
          walletId: 'metamask',
          attempt: 2,
          elapsedTime: 5000,
        },
      };
      expect(() => connectionProgressSchema.parse(progress)).not.toThrow();
    });

    it('should reject invalid progress', () => {
      expect(() =>
        connectionProgressSchema.parse({
          step: 'invalid',
          progress: 50,
          message: 'test',
        }),
      ).toThrow();

      expect(() =>
        connectionProgressSchema.parse({
          step: 'connecting',
          progress: 150, // Out of range
          message: 'test',
        }),
      ).toThrow();
    });
  });

  describe('baseConnectOptionsSchema', () => {
    it('should provide defaults', () => {
      const result = baseConnectOptionsSchema.parse({});
      expect(result.showModal).toBe(true);
      expect(result.silent).toBe(false);
      expect(result.autoSelect).toBe(true);
    });

    it('should validate complete options', () => {
      const options = {
        chainId: 'eip155:1',
        chainType: 'evm',
        walletSelection: {
          walletId: 'metamask',
          installedOnly: true,
        },
        showModal: false,
        silent: true,
        autoSelect: false,
        timeout: {
          connection: 90000,
          discovery: 15000,
          operation: 40000,
        },
        retry: {
          maxAttempts: 5,
          initialDelay: 2000,
        },
        permissions: ['eth_accounts', 'eth_sign'],
        metadata: {
          requestId: 'req-123',
          source: 'dapp-ui',
          appData: {
            feature: 'swap',
            version: '1.0',
          },
        },
      };
      expect(() => baseConnectOptionsSchema.parse(options)).not.toThrow();
    });
  });

  describe('advancedConnectOptionsSchema', () => {
    it('should validate with callbacks', () => {
      const options = {
        chainId: 'eip155:1',
        onProgress: vi.fn(),
        onWalletSelect: vi.fn(),
        onConnect: vi.fn(),
        onError: vi.fn(),
        onCancel: vi.fn(),
      };
      expect(() => advancedConnectOptionsSchema.parse(options)).not.toThrow();
    });

    it('should validate callback signatures', () => {
      const onProgress = (progress: unknown) => {
        expect(progress).toHaveProperty('step');
        expect(progress).toHaveProperty('progress');
        expect(progress).toHaveProperty('message');
      };

      const onConnect = (result: unknown) => {
        expect(result).toHaveProperty('walletId');
        expect(result).toHaveProperty('address');
        expect(result).toHaveProperty('chainId');
      };

      const options = {
        onProgress,
        onConnect,
      };
      expect(() => advancedConnectOptionsSchema.parse(options)).not.toThrow();
    });
  });
});

describe('Reconnect and Disconnect Schemas', () => {
  describe('reconnectOptionsSchema', () => {
    it('should validate minimal reconnect options', () => {
      const options = {
        sessionId: 'session-123',
      };
      const result = reconnectOptionsSchema.parse(options);
      expect(result.force).toBe(false);
      expect(result.validateSession).toBe(true);
      expect(result.timeout).toBe(30000);
      expect(result.showUI).toBe(false);
      expect(result.fallbackToConnect).toBe(true);
    });

    it('should validate complete reconnect options', () => {
      const options = {
        sessionId: 'session-123',
        force: true,
        validateSession: false,
        timeout: 45000,
        showUI: true,
        fallbackToConnect: false,
      };
      expect(() => reconnectOptionsSchema.parse(options)).not.toThrow();
    });

    it('should reject empty session ID', () => {
      expect(() => reconnectOptionsSchema.parse({ sessionId: '' })).toThrow();
    });
  });

  describe('disconnectOptionsSchema', () => {
    it('should provide defaults', () => {
      const result = disconnectOptionsSchema.parse({});
      expect(result.clearSession).toBe(true);
      expect(result.notifyWallet).toBe(true);
    });

    it('should validate complete disconnect options', () => {
      const options = {
        sessionId: 'session-123',
        clearSession: false,
        notifyWallet: true,
        reason: 'user_requested',
        context: 'User clicked disconnect button',
      };
      expect(() => disconnectOptionsSchema.parse(options)).not.toThrow();
    });

    it('should validate disconnect reasons', () => {
      const reasons = [
        'user_requested',
        'app_requested',
        'wallet_disconnected',
        'network_error',
        'session_expired',
        'other',
      ];

      for (const reason of reasons) {
        expect(() => disconnectOptionsSchema.parse({ reason })).not.toThrow();
      }
    });
  });
});

describe('Multi-Wallet Connection Schemas', () => {
  describe('multiWalletConnectSchema', () => {
    it('should validate minimal multi-wallet request', () => {
      const request = {
        wallets: [{ walletId: 'metamask' }, { walletId: 'walletconnect' }],
      };
      const result = multiWalletConnectSchema.parse(request);
      expect(result.strategy).toBe('parallel');
      expect(result.continueOnError).toBe(true);
      expect(result.timeout).toBe(120000);
    });

    it('should validate complete multi-wallet request', () => {
      const request = {
        wallets: [
          { walletId: 'metamask', chainId: 'eip155:1', required: true },
          { walletId: 'walletconnect', chainId: 'eip155:137', required: false },
          { walletId: 'coinbase', required: false },
        ],
        strategy: 'sequential',
        continueOnError: false,
        timeout: 180000,
      };
      expect(() => multiWalletConnectSchema.parse(request)).not.toThrow();
    });

    it('should validate connection strategies', () => {
      const strategies = ['parallel', 'sequential', 'race'];
      for (const strategy of strategies) {
        const request = {
          wallets: [{ walletId: 'test' }],
          strategy,
        };
        expect(() => multiWalletConnectSchema.parse(request)).not.toThrow();
      }
    });

    it('should enforce wallet limits', () => {
      expect(() => multiWalletConnectSchema.parse({ wallets: [] })).toThrow();

      const tooManyWallets = Array(11).fill({ walletId: 'test' });
      expect(() => multiWalletConnectSchema.parse({ wallets: tooManyWallets })).toThrow();
    });
  });
});

describe('Connection State Schemas', () => {
  describe('connectionStateQuerySchema', () => {
    it('should provide defaults', () => {
      const result = connectionStateQuerySchema.parse({});
      expect(result.includeWalletInfo).toBe(false);
      expect(result.includeChainInfo).toBe(false);
      expect(result.includeBalances).toBe(false);
      expect(result.includeHistory).toBe(false);
    });

    it('should validate complete query', () => {
      const query = {
        includeWalletInfo: true,
        includeChainInfo: true,
        includeBalances: true,
        includeHistory: true,
        walletIds: ['metamask', 'walletconnect'],
        chainIds: ['eip155:1', 'eip155:137'],
        status: 'connected',
      };
      expect(() => connectionStateQuerySchema.parse(query)).not.toThrow();
    });

    it('should validate status filters', () => {
      const statuses = ['connected', 'connecting', 'disconnected', 'error'];
      for (const status of statuses) {
        expect(() => connectionStateQuerySchema.parse({ status })).not.toThrow();
      }
    });
  });

  describe('connectionHealthCheckSchema', () => {
    it('should provide defaults', () => {
      const result = connectionHealthCheckSchema.parse({});
      expect(result.checkProvider).toBe(true);
      expect(result.checkAccounts).toBe(true);
      expect(result.checkSigning).toBe(false);
      expect(result.timeout).toBe(10000);
      expect(result.detailed).toBe(false);
    });

    it('should validate custom health check options', () => {
      const options = {
        checkProvider: true,
        checkAccounts: false,
        checkSigning: true,
        timeout: 20000,
        detailed: true,
      };
      expect(() => connectionHealthCheckSchema.parse(options)).not.toThrow();
    });

    it('should validate timeout range', () => {
      expect(() => connectionHealthCheckSchema.parse({ timeout: 500 })).toThrow();
      expect(() => connectionHealthCheckSchema.parse({ timeout: 40000 })).toThrow();
      expect(() => connectionHealthCheckSchema.parse({ timeout: 15000 })).not.toThrow();
    });
  });
});
