/**
 * Tests for provider query utilities
 *
 * @packageDocumentation
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChainType } from '../types.js';
import {
  type ProviderQueryOptions,
  type ProviderQueryResult,
  createProviderQueryKey,
  executeProviderMethod,
  isMethodSupported,
} from './providerQuery.js';

describe('providerQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('executeProviderMethod', () => {
    describe('EVM provider', () => {
      it('should execute EVM methods with request interface', async () => {
        const mockProvider = {
          request: vi.fn().mockResolvedValue('0x1'),
        };

        const options: ProviderQueryOptions = {
          method: 'eth_chainId',
          params: [],
          chainType: 'evm' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'eth_chainId',
          params: [],
        });
        expect(result).toEqual({
          data: '0x1',
          method: 'eth_chainId',
          chain: undefined,
        });
      });

      it('should execute EVM methods with legacy send interface', async () => {
        const mockProvider = {
          send: vi.fn().mockResolvedValue(['0x123']),
        };

        const options: ProviderQueryOptions = {
          method: 'eth_accounts',
          params: [],
          chainType: 'evm' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.send).toHaveBeenCalledWith('eth_accounts', []);
        expect(result.data).toEqual(['0x123']);
      });

      it('should execute EVM methods with ethereum.request interface', async () => {
        const mockProvider = {
          ethereum: {
            request: vi.fn().mockResolvedValue('0x1'),
          },
        };

        const options: ProviderQueryOptions = {
          method: 'eth_chainId',
          params: [],
          chainType: 'evm' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.ethereum.request).toHaveBeenCalledWith({
          method: 'eth_chainId',
          params: [],
        });
        expect(result.data).toBe('0x1');
      });

      it('should throw error if EVM provider does not support method execution', async () => {
        const mockProvider = {};

        const options: ProviderQueryOptions = {
          method: 'eth_chainId',
          params: [],
          chainType: 'evm' as ChainType,
        };

        await expect(executeProviderMethod(mockProvider, options)).rejects.toThrow(
          'EVM provider does not support method execution: eth_chainId',
        );
      });
    });

    describe('Solana provider', () => {
      it('should execute Solana connection methods', async () => {
        const mockProvider = {
          connection: {
            getBalance: vi.fn().mockResolvedValue(1000000),
            getBlockHeight: vi.fn().mockResolvedValue(100),
          },
        };

        const options: ProviderQueryOptions = {
          method: 'getBalance',
          params: ['publicKey'],
          chainType: 'solana' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.connection.getBalance).toHaveBeenCalledWith('publicKey');
        expect(result.data).toBe(1000000);
      });

      it('should execute direct method calls on Solana provider', async () => {
        const mockProvider = {
          connect: vi.fn().mockResolvedValue({}),
        };

        const options: ProviderQueryOptions = {
          method: 'connect',
          params: [],
          chainType: 'solana' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.connect).toHaveBeenCalledWith();
        expect(result.data).toEqual({});
      });

      it('should execute Solana wallet methods', async () => {
        const mockProvider = {
          solana: {
            connect: vi.fn().mockResolvedValue({ publicKey: 'key' }),
          },
        };

        const options: ProviderQueryOptions = {
          method: 'connect',
          params: [],
          chainType: 'solana' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.solana.connect).toHaveBeenCalledWith();
        expect(result.data).toEqual({ publicKey: 'key' });
      });

      it('should throw error if Solana provider does not support method', async () => {
        const mockProvider = {};

        const options: ProviderQueryOptions = {
          method: 'getBalance',
          params: [],
          chainType: 'solana' as ChainType,
        };

        await expect(executeProviderMethod(mockProvider, options)).rejects.toThrow(
          'Solana provider does not support method: getBalance',
        );
      });
    });

    describe('Aztec provider', () => {
      it('should execute direct method calls on Aztec provider', async () => {
        const mockProvider = {
          getAccounts: vi.fn().mockResolvedValue(['account1']),
        };

        const options: ProviderQueryOptions = {
          method: 'getAccounts',
          params: [],
          chainType: 'aztec' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.getAccounts).toHaveBeenCalledWith();
        expect(result.data).toEqual(['account1']);
      });

      it('should execute methods on nested wallet object', async () => {
        const mockProvider = {
          wallet: {
            addAuthWitness: vi.fn().mockResolvedValue('witness'),
          },
        };

        const options: ProviderQueryOptions = {
          method: 'addAuthWitness',
          params: ['data'],
          chainType: 'aztec' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.wallet.addAuthWitness).toHaveBeenCalledWith('data');
        expect(result.data).toBe('witness');
      });

      it('should execute methods on nested aztec object', async () => {
        const mockProvider = {
          aztec: {
            createAccount: vi.fn().mockResolvedValue('newAccount'),
          },
        };

        const options: ProviderQueryOptions = {
          method: 'createAccount',
          params: [],
          chainType: 'aztec' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.aztec.createAccount).toHaveBeenCalledWith();
        expect(result.data).toBe('newAccount');
      });

      it('should throw error if Aztec provider does not support method', async () => {
        const mockProvider = {};

        const options: ProviderQueryOptions = {
          method: 'getAccounts',
          params: [],
          chainType: 'aztec' as ChainType,
        };

        await expect(executeProviderMethod(mockProvider, options)).rejects.toThrow(
          'Aztec provider does not support method: getAccounts',
        );
      });
    });

    describe('Generic provider fallback', () => {
      it('should execute direct method calls on generic provider', async () => {
        const mockProvider = {
          customMethod: vi.fn().mockResolvedValue('result'),
        };

        const options: ProviderQueryOptions = {
          method: 'customMethod',
          params: ['param'],
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.customMethod).toHaveBeenCalledWith('param');
        expect(result.data).toBe('result');
      });

      it('should use request method as fallback', async () => {
        const mockProvider = {
          request: vi.fn().mockResolvedValue('result'),
        };

        const options: ProviderQueryOptions = {
          method: 'customMethod',
          params: ['param'],
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'customMethod',
          params: ['param'],
        });
        expect(result.data).toBe('result');
      });

      it('should use send method as fallback', async () => {
        const mockProvider = {
          send: vi.fn().mockResolvedValue('result'),
        };

        const options: ProviderQueryOptions = {
          method: 'customMethod',
          params: ['param'],
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.send).toHaveBeenCalledWith('customMethod', ['param']);
        expect(result.data).toBe('result');
      });

      it('should throw error if generic provider does not support method', async () => {
        const mockProvider = {};

        const options: ProviderQueryOptions = {
          method: 'customMethod',
          params: [],
        };

        await expect(executeProviderMethod(mockProvider, options)).rejects.toThrow(
          'Provider does not support method: customMethod',
        );
      });
    });

    describe('Chain type detection', () => {
      it('should auto-detect EVM chain type', async () => {
        const mockProvider = {
          request: vi.fn().mockResolvedValue('0x1'),
          isMetaMask: true,
        };

        const options: ProviderQueryOptions = {
          method: 'eth_chainId',
          params: [],
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'eth_chainId',
          params: [],
        });
        expect(result.data).toBe('0x1');
      });

      it('should auto-detect Solana chain type', async () => {
        const mockProvider = {
          connection: {
            getBalance: vi.fn().mockResolvedValue(1000000),
          },
        };

        const options: ProviderQueryOptions = {
          method: 'getBalance',
          params: ['publicKey'],
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.connection.getBalance).toHaveBeenCalledWith('publicKey');
        expect(result.data).toBe(1000000);
      });

      it('should auto-detect Aztec chain type', async () => {
        const mockProvider = {
          getAccounts: vi.fn().mockResolvedValue(['account1']),
        };

        const options: ProviderQueryOptions = {
          method: 'getAccounts',
          params: [],
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.getAccounts).toHaveBeenCalledWith();
        expect(result.data).toEqual(['account1']);
      });
    });

    describe('Error handling', () => {
      it('should throw error if provider is null', async () => {
        const options: ProviderQueryOptions = {
          method: 'test',
          params: [],
        };

        await expect(executeProviderMethod(null, options)).rejects.toThrow(
          'Provider is required for executing methods',
        );
      });

      it('should throw error if method is empty', async () => {
        const mockProvider = {};
        const options: ProviderQueryOptions = {
          method: '',
          params: [],
        };

        await expect(executeProviderMethod(mockProvider, options)).rejects.toThrow('Method name is required');
      });

      it('should propagate provider method errors', async () => {
        const mockProvider = {
          request: vi.fn().mockRejectedValue(new Error('Method failed')),
        };

        const options: ProviderQueryOptions = {
          method: 'eth_accounts',
          params: [],
          chainType: 'evm' as ChainType,
        };

        await expect(executeProviderMethod(mockProvider, options)).rejects.toThrow('Method failed');
      });
    });

    describe('Options parameter handling', () => {
      it('should handle chain information in options', async () => {
        const mockProvider = {
          request: vi.fn().mockResolvedValue('0x1'),
        };

        const chain = { chainId: '1', chainType: 'evm' as ChainType, name: 'Ethereum' };
        const options: ProviderQueryOptions = {
          method: 'eth_chainId',
          params: [],
          chain,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(result.chain).toEqual(chain);
        expect(result.method).toBe('eth_chainId');
        expect(result.data).toBe('0x1');
      });

      it('should handle parameters correctly', async () => {
        const mockProvider = {
          request: vi.fn().mockResolvedValue('0xbalance'),
        };

        const options: ProviderQueryOptions = {
          method: 'eth_getBalance',
          params: ['0x123', 'latest'],
          chainType: 'evm' as ChainType,
        };

        const result = await executeProviderMethod(mockProvider, options);

        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'eth_getBalance',
          params: ['0x123', 'latest'],
        });
        expect(result.data).toBe('0xbalance');
      });

      it('should handle empty parameters', async () => {
        const mockProvider = {
          request: vi.fn().mockResolvedValue('result'),
        };

        const options: ProviderQueryOptions = {
          method: 'test_method',
        };

        await executeProviderMethod(mockProvider, options);

        expect(mockProvider.request).toHaveBeenCalledWith({
          method: 'test_method',
          params: [],
        });
      });
    });
  });

  describe('createProviderQueryKey', () => {
    it('should create query key with chain ID and method', () => {
      const key = createProviderQueryKey('1', 'eth_getBalance', '0x123', 'latest');
      expect(key).toEqual(['providerQuery', '1', 'eth_getBalance', '0x123', 'latest']);
    });

    it('should create query key without chain ID', () => {
      const key = createProviderQueryKey(undefined, 'getBalance', 'publicKey');
      expect(key).toEqual(['providerQuery', 'getBalance', 'publicKey']);
    });

    it('should handle empty parameters', () => {
      const key = createProviderQueryKey('137', 'eth_chainId');
      expect(key).toEqual(['providerQuery', '137', 'eth_chainId']);
    });

    it('should serialize complex parameters', () => {
      const complexParam = { to: '0x123', value: '1000' };
      const key = createProviderQueryKey('1', 'eth_sendTransaction', complexParam);
      expect(key).toEqual(['providerQuery', '1', 'eth_sendTransaction', JSON.stringify(complexParam)]);
    });

    it('should handle null and undefined parameters', () => {
      const key = createProviderQueryKey('1', 'test_method', null, undefined, 'value');
      expect(key).toEqual(['providerQuery', '1', 'test_method', 'null', 'undefined', 'value']);
    });

    it('should handle various parameter types', () => {
      const key = createProviderQueryKey('1', 'test_method', 'string', 123, true, false, { obj: 'value' }, [
        'array',
      ]);
      expect(key).toEqual([
        'providerQuery',
        '1',
        'test_method',
        'string',
        123,
        true,
        false,
        JSON.stringify({ obj: 'value' }),
        JSON.stringify(['array']),
      ]);
    });
  });

  describe('isMethodSupported', () => {
    it('should return false for null/undefined providers', () => {
      expect(isMethodSupported(null, 'test')).toBe(false);
      expect(isMethodSupported(undefined, 'test')).toBe(false);
    });

    it('should return false for non-object providers', () => {
      expect(isMethodSupported('string', 'test')).toBe(false);
      expect(isMethodSupported(123, 'test')).toBe(false);
    });

    it('should detect direct method support', () => {
      const provider = {
        testMethod: vi.fn(),
      };

      expect(isMethodSupported(provider, 'testMethod')).toBe(true);
      expect(isMethodSupported(provider, 'nonExistentMethod')).toBe(false);
    });

    describe('EVM provider support', () => {
      it('should detect EVM provider with request method', () => {
        const provider = {
          request: vi.fn(),
        };

        expect(isMethodSupported(provider, 'eth_accounts', 'evm' as ChainType)).toBe(true);
      });

      it('should detect EVM provider with send method', () => {
        const provider = {
          send: vi.fn(),
        };

        expect(isMethodSupported(provider, 'eth_chainId', 'evm' as ChainType)).toBe(true);
      });

      it('should detect EVM provider with ethereum.request', () => {
        const provider = {
          ethereum: {
            request: vi.fn(),
          },
        };

        expect(isMethodSupported(provider, 'eth_accounts', 'evm' as ChainType)).toBe(true);
      });

      it('should return false for EVM provider without request interfaces', () => {
        const provider = {};

        expect(isMethodSupported(provider, 'eth_accounts', 'evm' as ChainType)).toBe(false);
      });
    });

    describe('Solana provider support', () => {
      it('should detect Solana connection methods', () => {
        const provider = {
          connection: {
            getBalance: vi.fn(),
          },
        };

        expect(isMethodSupported(provider, 'getBalance', 'solana' as ChainType)).toBe(true);
        expect(isMethodSupported(provider, 'nonExistentMethod', 'solana' as ChainType)).toBe(false);
      });

      it('should detect Solana wallet methods', () => {
        const provider = {
          solana: {
            connect: vi.fn(),
          },
        };

        expect(isMethodSupported(provider, 'connect', 'solana' as ChainType)).toBe(true);
      });
    });

    describe('Aztec provider support', () => {
      it('should detect Aztec wallet methods', () => {
        const provider = {
          wallet: {
            getAccounts: vi.fn(),
          },
        };

        expect(isMethodSupported(provider, 'getAccounts', 'aztec' as ChainType)).toBe(true);
      });

      it('should detect nested aztec methods', () => {
        const provider = {
          aztec: {
            createAccount: vi.fn(),
          },
        };

        expect(isMethodSupported(provider, 'createAccount', 'aztec' as ChainType)).toBe(true);
      });
    });

    describe('Auto-detection', () => {
      it('should auto-detect EVM provider', () => {
        const provider = {
          request: vi.fn(),
          isMetaMask: true,
        };

        expect(isMethodSupported(provider, 'eth_accounts')).toBe(true);
      });

      it('should auto-detect Solana provider', () => {
        const provider = {
          connection: {
            getBalance: vi.fn(),
          },
        };

        expect(isMethodSupported(provider, 'getBalance')).toBe(true);
      });

      it('should auto-detect Aztec provider', () => {
        const provider = {
          getAccounts: vi.fn(),
        };

        expect(isMethodSupported(provider, 'getAccounts')).toBe(true);
      });

      it('should return false for unrecognizable providers', () => {
        const provider = {};

        expect(isMethodSupported(provider, 'unknownMethod')).toBe(false);
      });
    });
  });
});
