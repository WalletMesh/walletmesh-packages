import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';
import { ChainType } from '../../../types.js';
import { MockTransport, type MockTransportConfig } from './MockTransport.js';

// Install domain-specific matchers
installCustomMatchers();

describe('MockTransport', () => {
  let transport: MockTransport;
  let config: MockTransportConfig;
  let messageHandler: ReturnType<typeof vi.fn>;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    config = {
      chainType: ChainType.Evm,
      accounts: ['0x1234567890123456789012345678901234567890'],
      chainId: '1',
    };

    transport = new MockTransport(config);
    messageHandler = vi.fn();
    transport.onMessage(messageHandler);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Constructor', () => {
    it('should create MockTransport with valid config', () => {
      expect(transport).toBeInstanceOf(MockTransport);
    });

    it('should handle config with all optional properties', () => {
      const fullConfig: MockTransportConfig = {
        chainType: ChainType.Evm,
        accounts: ['0x123', '0x456'],
        chainId: '1',
        rejectionRate: 0.1,
      };

      const fullTransport = new MockTransport(fullConfig);
      expect(fullTransport).toBeInstanceOf(MockTransport);
    });

    it('should handle Solana chain config', () => {
      const solanaConfig: MockTransportConfig = {
        chainType: ChainType.Solana,
        accounts: ['SolanaAddress123'],
        chainId: 'solana-mainnet',
      };

      const solanaTransport = new MockTransport(solanaConfig);
      expect(solanaTransport).toBeInstanceOf(MockTransport);
    });

    it('should handle Aztec chain config', () => {
      const aztecConfig: MockTransportConfig = {
        chainType: ChainType.Aztec,
        accounts: ['aztec-address-123'],
        chainId: 'aztec-mainnet',
      };

      const aztecTransport = new MockTransport(aztecConfig);
      expect(aztecTransport).toBeInstanceOf(MockTransport);
    });
  });

  describe('onMessage', () => {
    it('should set message handler', () => {
      const handler = vi.fn();
      transport.onMessage(handler);

      // Verify handler is set by triggering a method
      transport.send({ method: 'eth_accounts', id: 1 });
      expect(handler).toHaveBeenCalled();
    });

    it('should replace existing message handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      transport.onMessage(handler1);
      transport.onMessage(handler2);

      transport.send({ method: 'eth_accounts', id: 1 });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('EVM Methods', () => {
    beforeEach(() => {
      config.chainType = ChainType.Evm;
      transport = new MockTransport(config);
      transport.onMessage(messageHandler);
    });

    describe('eth_accounts', () => {
      it('should return accounts for EVM chain', async () => {
        await transport.send({ method: 'eth_accounts', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: ['0x1234567890123456789012345678901234567890'],
        });
      });

      it('should return empty array for non-EVM chain', async () => {
        config.chainType = ChainType.Solana;
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'eth_accounts', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: [],
        });
      });
    });

    describe('eth_requestAccounts', () => {
      it('should return accounts for EVM chain', async () => {
        await transport.send({ method: 'eth_requestAccounts', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: ['0x1234567890123456789012345678901234567890'],
        });
      });

      it('should return empty array for non-EVM chain', async () => {
        config.chainType = ChainType.Solana;
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'eth_requestAccounts', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: [],
        });
      });
    });

    describe('eth_chainId', () => {
      it('should return hex chain ID for EVM chain', async () => {
        await transport.send({ method: 'eth_chainId', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: '0x1', // Chain ID 1 as hex
        });
      });

      it('should return default 0x1 for non-EVM chain', async () => {
        config.chainType = ChainType.Solana;
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'eth_chainId', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: '0x1',
        });
      });

      it('should handle different chain IDs', async () => {
        config.chainId = '137'; // Polygon
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'eth_chainId', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: '0x89', // 137 in hex
        });
      });
    });

    describe('eth_getBalance', () => {
      it('should return mock balance', async () => {
        await transport.send({ method: 'eth_getBalance', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: '0x1000000000000000000', // 1 ETH in wei
        });
      });
    });

    describe('eth_sendTransaction', () => {
      it('should return mock transaction hash', async () => {
        await transport.send({ method: 'eth_sendTransaction', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        });
      });
    });

    describe('eth_signMessage', () => {
      it('should return mock signature', async () => {
        await transport.send({ method: 'eth_signMessage', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        });
      });
    });

    describe('wallet_switchEthereumChain', () => {
      it('should switch chain and update config', async () => {
        const params = [{ chainId: '0x89' }]; // Polygon
        await transport.send({ method: 'wallet_switchEthereumChain', params, id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: null,
        });

        // Verify chain ID was updated
        await transport.send({ method: 'eth_chainId', id: 2 });
        expect(messageHandler).toHaveBeenCalledWith({
          id: 2,
          result: '0x89',
        });
      });

      it('should handle missing params', async () => {
        await transport.send({ method: 'wallet_switchEthereumChain', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: null,
        });
      });

      it('should handle empty params array', async () => {
        await transport.send({ method: 'wallet_switchEthereumChain', params: [], id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: null,
        });
      });
    });
  });

  describe('Solana Methods', () => {
    beforeEach(() => {
      config.chainType = ChainType.Solana;
      config.accounts = ['SolanaAddress123'];
      transport = new MockTransport(config);
      transport.onMessage(messageHandler);
    });

    describe('solana_getAccounts', () => {
      it('should return accounts for Solana chain', async () => {
        await transport.send({ method: 'solana_getAccounts', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: ['SolanaAddress123'],
        });
      });

      it('should return empty array for non-Solana chain', async () => {
        config.chainType = ChainType.Evm;
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'solana_getAccounts', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: [],
        });
      });
    });

    describe('solana_connect', () => {
      it('should return public key for Solana chain', async () => {
        await transport.send({ method: 'solana_connect', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: { publicKey: 'SolanaAddress123' },
        });
      });

      it('should return null for non-Solana chain', async () => {
        config.chainType = ChainType.Evm;
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'solana_connect', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: null,
        });
      });

      it('should return mock address when accounts array is empty', async () => {
        config.accounts = [];
        transport = new MockTransport(config);
        transport.onMessage(messageHandler);

        await transport.send({ method: 'solana_connect', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: { publicKey: 'mock-solana-address' },
        });
      });
    });

    describe('solana_signTransaction', () => {
      it('should return mock signed transaction', async () => {
        await transport.send({ method: 'solana_signTransaction', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: 'mock-signed-transaction-data',
        });
      });
    });

    describe('solana_signMessage', () => {
      it('should return mock signature', async () => {
        await transport.send({ method: 'solana_signMessage', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: { signature: expect.any(Uint8Array) },
        });

        const call = messageHandler.mock.calls[0][0];
        expect(call.result.signature).toHaveLength(64);
      });
    });

    describe('solana_disconnect', () => {
      it('should return undefined', async () => {
        await transport.send({ method: 'solana_disconnect', id: 1 });

        expect(messageHandler).toHaveBeenCalledWith({
          id: 1,
          result: undefined,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported methods', async () => {
      await expect(transport.send({ method: 'unsupported_method', id: 1 })).rejects.toThrow(
        'MockTransport: Unsupported method unsupported_method',
      );
    });

    it('should simulate random rejection based on rejection rate', async () => {
      const rejectionConfig = { ...config, rejectionRate: 1.0 }; // 100% rejection
      transport = new MockTransport(rejectionConfig);

      await expect(transport.send({ method: 'eth_accounts', id: 1 })).rejects.toThrow(
        'User cancelled the operation',
      );
    });

    it('should not reject when rejection rate is 0', async () => {
      const noRejectionConfig = { ...config, rejectionRate: 0 };
      transport = new MockTransport(noRejectionConfig);
      transport.onMessage(messageHandler);

      await transport.send({ method: 'eth_accounts', id: 1 });

      expect(messageHandler).toHaveBeenCalled();
    });

    it('should not reject when rejection rate is undefined', async () => {
      // Default config has no rejectionRate
      await transport.send({ method: 'eth_accounts', id: 1 });

      expect(messageHandler).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    it('should not call handler when no handler is set', async () => {
      const transportWithoutHandler = new MockTransport(config);

      await expect(transportWithoutHandler.send({ method: 'eth_accounts', id: 1 })).resolves.not.toThrow();
    });

    it('should not call handler when request has no ID', async () => {
      await transport.send({ method: 'eth_accounts' }); // No ID

      expect(messageHandler).not.toHaveBeenCalled();
    });

    it('should handle string IDs', async () => {
      await transport.send({ method: 'eth_accounts', id: 'string-id' });

      expect(messageHandler).toHaveBeenCalledWith({
        id: 'string-id',
        result: ['0x1234567890123456789012345678901234567890'],
      });
    });

    it('should handle numeric IDs', async () => {
      await transport.send({ method: 'eth_accounts', id: 42 });

      expect(messageHandler).toHaveBeenCalledWith({
        id: 42,
        result: ['0x1234567890123456789012345678901234567890'],
      });
    });
  });

  describe('updateConfig', () => {
    it('should update configuration partially', () => {
      const originalChainType = config.chainType;

      transport.updateConfig({ chainId: '137' });

      // ChainType should remain the same
      expect((transport as { config: { chainType: unknown } }).config.chainType).toBe(originalChainType);
      // ChainId should be updated
      expect((transport as { config: { chainId: string } }).config.chainId).toBe('137');
    });

    it('should update multiple properties', () => {
      transport.updateConfig({
        chainType: ChainType.Solana,
        accounts: ['NewSolanaAddress'],
        chainId: 'solana-testnet',
        rejectionRate: 0.5,
      });

      const config = (
        transport as {
          config: { chainType: unknown; accounts: string[]; chainId: string; rejectionRate: number };
        }
      ).config;
      expect(config.chainType).toBe(ChainType.Solana);
      expect(config.accounts).toEqual(['NewSolanaAddress']);
      expect(config.chainId).toBe('solana-testnet');
      expect(config.rejectionRate).toBe(0.5);
    });

    it('should update accounts array', () => {
      const newAccounts = ['0xabc', '0xdef', '0x123'];
      transport.updateConfig({ accounts: newAccounts });

      expect((transport as { config: { accounts: string[] } }).config.accounts).toEqual(newAccounts);
    });
  });

  describe('simulateEvent', () => {
    it('should simulate generic events', () => {
      const eventData = { test: 'data' };
      transport.simulateEvent('customEvent', eventData);

      expect(messageHandler).toHaveBeenCalledWith({
        method: 'customEvent',
        params: eventData,
      });
    });

    it('should not crash when no handler is set', () => {
      const transportWithoutHandler = new MockTransport(config);

      expect(() => {
        transportWithoutHandler.simulateEvent('test', {});
      }).not.toThrow();
    });
  });

  describe('simulateAccountsChanged', () => {
    it('should update accounts and emit event', () => {
      const newAccounts = ['0xnew1', '0xnew2'];
      transport.simulateAccountsChanged(newAccounts);

      expect(messageHandler).toHaveBeenCalledWith({
        method: 'accountsChanged',
        params: newAccounts,
      });

      expect((transport as { config: { accounts: string[] } }).config.accounts).toEqual(newAccounts);
    });

    it('should handle empty accounts array', () => {
      transport.simulateAccountsChanged([]);

      expect(messageHandler).toHaveBeenCalledWith({
        method: 'accountsChanged',
        params: [],
      });

      expect((transport as { config: { accounts: string[] } }).config.accounts).toEqual([]);
    });
  });

  describe('simulateChainChanged', () => {
    it('should update chain ID and emit event', () => {
      const newChainId = '137';
      transport.simulateChainChanged(newChainId);

      expect(messageHandler).toHaveBeenCalledWith({
        method: 'chainChanged',
        params: newChainId,
      });

      expect((transport as { config: { chainId: string } }).config.chainId).toBe(newChainId);
    });

    it('should handle different chain ID formats', () => {
      const hexChainId = '0x89';
      transport.simulateChainChanged(hexChainId);

      expect(messageHandler).toHaveBeenCalledWith({
        method: 'chainChanged',
        params: hexChainId,
      });

      expect((transport as { config: { chainId: string } }).config.chainId).toBe(hexChainId);
    });
  });

  describe('simulateDisconnect', () => {
    it('should emit disconnect event with default data', () => {
      transport.simulateDisconnect();

      expect(messageHandler).toHaveBeenCalledWith({
        method: 'disconnect',
        params: { code: 1000, message: 'User disconnected' },
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle malformed requests gracefully', async () => {
      // Request without method
      await expect(transport.send({ id: 1 } as { id: number })).rejects.toThrow();

      // Request with null method
      await expect(transport.send({ method: null, id: 1 } as { method: null; id: number })).rejects.toThrow();
    });

    it('should handle complex params structures', async () => {
      const complexParams = [
        {
          chainId: '0x89',
          blockExplorerUrls: ['https://polygonscan.com'],
          chainName: 'Polygon',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
        },
      ];

      await transport.send({
        method: 'wallet_switchEthereumChain',
        params: complexParams,
        id: 1,
      });

      expect(messageHandler).toHaveBeenCalledWith({
        id: 1,
        result: null,
      });
    });

    it('should handle concurrent requests', async () => {
      const promises = [
        transport.send({ method: 'eth_accounts', id: 1 }),
        transport.send({ method: 'eth_chainId', id: 2 }),
        transport.send({ method: 'eth_getBalance', id: 3 }),
      ];

      await Promise.all(promises);

      expect(messageHandler).toHaveBeenCalledTimes(3);
      expect(messageHandler).toHaveBeenCalledWith({
        id: 1,
        result: ['0x1234567890123456789012345678901234567890'],
      });
      expect(messageHandler).toHaveBeenCalledWith({
        id: 2,
        result: '0x1',
      });
      expect(messageHandler).toHaveBeenCalledWith({
        id: 3,
        result: '0x1000000000000000000',
      });
    });

    it('should maintain state across multiple operations', async () => {
      // Initially on chain 1
      await transport.send({ method: 'eth_chainId', id: 1 });
      expect(messageHandler).toHaveBeenLastCalledWith({
        id: 1,
        result: '0x1',
      });

      // Switch to Polygon
      await transport.send({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }],
        id: 2,
      });

      // Verify chain switched
      await transport.send({ method: 'eth_chainId', id: 3 });
      expect(messageHandler).toHaveBeenLastCalledWith({
        id: 3,
        result: '0x89',
      });

      // Simulate accounts changed
      transport.simulateAccountsChanged(['0xnewaccount']);

      // Verify new accounts
      await transport.send({ method: 'eth_accounts', id: 4 });
      expect(messageHandler).toHaveBeenLastCalledWith({
        id: 4,
        result: ['0xnewaccount'],
      });
    });

    it('should handle very low rejection rates', async () => {
      const lowRejectionConfig = { ...config, rejectionRate: 0.001 }; // 0.1%
      const lowRejectionTransport = new MockTransport(lowRejectionConfig);
      lowRejectionTransport.onMessage(messageHandler);

      // Run multiple times, should mostly succeed
      let successCount = 0;
      const attempts = 10;

      for (let i = 0; i < attempts; i++) {
        try {
          await lowRejectionTransport.send({ method: 'eth_accounts', id: i });
          successCount++;
        } catch {
          // Rejection is expected occasionally
        }
      }

      // With 0.1% rejection rate, we should have mostly successes
      expect(successCount).toBeGreaterThan(5);
    });
  });
});
