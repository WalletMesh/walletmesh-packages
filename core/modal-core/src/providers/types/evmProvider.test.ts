/**
 * Tests for EVM Provider Types
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import {
  type AddEthereumChainParameter,
  EIP1193ErrorCode,
  type EIP1193ProviderError,
  type EVMConnectOptions,
  type EVMProviderState,
  type EVMTransactionRequest,
  type EVMTypedData,
  type SwitchEthereumChainParameter,
  type WatchAssetParams,
  isEIP1193Error,
  isEVMProvider,
} from './evmProvider.js';

// Install domain-specific matchers
installCustomMatchers();

describe('EVM Provider Types', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('isEVMProvider', () => {
    it('should return true for valid EVM provider', () => {
      const mockProvider = {
        request: () => Promise.resolve({}),
        on: () => {},
        once: () => {},
        removeListener: () => {},
        off: () => {},
        emit: () => true,
        requestAccounts: () => Promise.resolve([]),
        getAccounts: () => Promise.resolve([]),
        getChainId: () => Promise.resolve('0x1'),
        getNetworkVersion: () => Promise.resolve('1'),
        sendTransaction: () => Promise.resolve('0x123'),
        signMessage: () => Promise.resolve('0xsignature'),
        signTypedData: () => Promise.resolve('0xsignature'),
        getBalance: () => Promise.resolve('0x0'),
        getTransactionCount: () => Promise.resolve('0x1'),
        estimateGas: () => Promise.resolve('0x5208'),
        getGasPrice: () => Promise.resolve('0x9184e72a000'),
        getBlockByNumber: () => Promise.resolve({}),
        call: () => Promise.resolve('0x'),
        switchChain: () => Promise.resolve(null),
        addChain: () => Promise.resolve(null),
        watchAsset: () => Promise.resolve(true),
        getState: () => Promise.resolve({} as EVMProviderState),
        connect: () => Promise.resolve({ accounts: [], chainId: '0x1' }),
        disconnect: () => Promise.resolve(),
        isChainSupported: () => Promise.resolve(true),
        getSupportedChains: () => Promise.resolve([]),
        isWalletMesh: true as const,
        providerType: 'evm' as const,
      };

      expect(isEVMProvider(mockProvider)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isEVMProvider(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isEVMProvider(undefined)).toBe(false);
    });

    it('should return false for objects without request method', () => {
      const invalidProvider = {
        on: () => {},
      };
      expect(isEVMProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects without on method', () => {
      const invalidProvider = {
        request: () => Promise.resolve({}),
      };
      expect(isEVMProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects with invalid request method', () => {
      const invalidProvider = {
        request: 'not a function',
        on: () => {},
      };
      expect(isEVMProvider(invalidProvider)).toBe(false);
    });

    it('should return false for objects with invalid on method', () => {
      const invalidProvider = {
        request: () => Promise.resolve({}),
        on: 'not a function',
      };
      expect(isEVMProvider(invalidProvider)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isEVMProvider('string')).toBe(false);
      expect(isEVMProvider(123)).toBe(false);
      expect(isEVMProvider(true)).toBe(false);
    });
  });

  describe('isEIP1193Error', () => {
    it('should return true for valid EIP-1193 error', () => {
      const error: EIP1193ProviderError = Object.assign(new Error('Test error'), {
        code: EIP1193ErrorCode.UserRejectedRequest,
        data: { additional: 'info' },
      });

      expect(isEIP1193Error(error)).toBe(true);
    });

    it('should return false for regular Error without code', () => {
      const error = new Error('Regular error');
      expect(isEIP1193Error(error)).toBe(false);
    });

    it('should return false for Error with non-numeric code', () => {
      const error = Object.assign(new Error('Error with string code'), {
        code: 'STRING_CODE',
      });
      expect(isEIP1193Error(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isEIP1193Error({ code: 4001, message: 'Not an error' })).toBe(false);
      expect(isEIP1193Error(null)).toBe(false);
      expect(isEIP1193Error(undefined)).toBe(false);
      expect(isEIP1193Error('string')).toBe(false);
      expect(isEIP1193Error(123)).toBe(false);
    });

    it('should return true for error with zero code', () => {
      const error = Object.assign(new Error('Error with zero code'), {
        code: 0,
      });
      expect(isEIP1193Error(error)).toBe(true);
    });

    it('should return true for error with negative code', () => {
      const error = Object.assign(new Error('Error with negative code'), {
        code: -32600,
      });
      expect(isEIP1193Error(error)).toBe(true);
    });
  });

  describe('EIP1193ErrorCode enum', () => {
    it('should have correct user rejection code', () => {
      expect(EIP1193ErrorCode.UserRejectedRequest).toBe(4001);
    });

    it('should have correct unauthorized code', () => {
      expect(EIP1193ErrorCode.Unauthorized).toBe(4100);
    });

    it('should have correct unsupported method code', () => {
      expect(EIP1193ErrorCode.UnsupportedMethod).toBe(4200);
    });

    it('should have correct disconnected code', () => {
      expect(EIP1193ErrorCode.Disconnected).toBe(4900);
    });

    it('should have correct chain disconnected code', () => {
      expect(EIP1193ErrorCode.ChainDisconnected).toBe(4901);
    });

    it('should have correct JSON-RPC error codes', () => {
      expect(EIP1193ErrorCode.ParseError).toBe(-32700);
      expect(EIP1193ErrorCode.InvalidRequest).toBe(-32600);
      expect(EIP1193ErrorCode.MethodNotFound).toBe(-32601);
      expect(EIP1193ErrorCode.InvalidParams).toBe(-32602);
      expect(EIP1193ErrorCode.InternalError).toBe(-32603);
    });

    it('should have correct provider-specific error codes', () => {
      expect(EIP1193ErrorCode.InvalidInput).toBe(-32000);
      expect(EIP1193ErrorCode.ResourceNotFound).toBe(-32001);
      expect(EIP1193ErrorCode.ResourceUnavailable).toBe(-32002);
      expect(EIP1193ErrorCode.TransactionRejected).toBe(-32003);
      expect(EIP1193ErrorCode.MethodNotSupported).toBe(-32004);
      expect(EIP1193ErrorCode.LimitExceeded).toBe(-32005);
      expect(EIP1193ErrorCode.JsonRpcVersionNotSupported).toBe(-32006);
    });
  });

  describe('Type definitions', () => {
    it('should properly type EVMTransactionRequest', () => {
      const transaction: EVMTransactionRequest = {
        from: '0x123',
        to: '0x456',
        value: '0x1000',
        data: '0x',
        gas: '0x5208',
        gasPrice: '0x9184e72a000',
        nonce: '0x1',
        chainId: '0x1',
      };

      expect(transaction.from).toBe('0x123');
      expect(transaction.to).toBe('0x456');
      expect(transaction.value).toBe('0x1000');
    });

    it('should properly type EIP-1559 transaction', () => {
      const transaction: EVMTransactionRequest = {
        from: '0x123',
        to: '0x456',
        value: '0x1000',
        data: '0x',
        gas: '0x5208',
        maxFeePerGas: '0x12a05f200',
        maxPriorityFeePerGas: '0x9502f900',
        type: '0x2',
        accessList: [
          {
            address: '0x789',
            storageKeys: ['0x01', '0x02'],
          },
        ],
      };

      expect(transaction.type).toBe('0x2');
      expect(transaction.accessList).toHaveLength(1);
      expect(transaction.accessList?.[0]?.address).toBe('0x789');
    });

    it('should properly type AddEthereumChainParameter', () => {
      const chainParams: AddEthereumChainParameter = {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
        iconUrls: ['https://polygon.technology/favicon.ico'],
      };

      expect(chainParams.chainId).toBe('0x89');
      expect(chainParams.chainName).toBe('Polygon Mainnet');
      expect(chainParams.nativeCurrency.symbol).toBe('MATIC');
      expect(chainParams.rpcUrls).toContain('https://polygon-rpc.com');
    });

    it('should properly type WatchAssetParams', () => {
      const assetParams: WatchAssetParams = {
        type: 'ERC20',
        options: {
          address: '0x6b175474e89094c44da98b954eedeac495271d0f',
          symbol: 'DAI',
          decimals: 18,
          image: 'https://tokens.1inch.io/0x6b175474e89094c44da98b954eedeac495271d0f.png',
        },
      };

      expect(assetParams.type).toBe('ERC20');
      expect(assetParams.options.symbol).toBe('DAI');
      expect(assetParams.options.decimals).toBe(18);
    });

    it('should properly type EVMTypedData', () => {
      const typedData: EVMTypedData = {
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      };

      expect(typedData.domain.name).toBe('Ether Mail');
      expect(typedData.primaryType).toBe('Mail');
      expect(typedData.types.Person).toHaveLength(2);
    });

    it('should properly type SwitchEthereumChainParameter', () => {
      const switchParams: SwitchEthereumChainParameter = {
        chainId: '0x89',
      };

      expect(switchParams.chainId).toBe('0x89');
    });

    it('should properly type EVMConnectOptions', () => {
      const connectOptions: EVMConnectOptions = {
        requiredAccounts: ['0x123', '0x456'],
        silent: true,
        timeout: 30000,
      };

      expect(connectOptions.requiredAccounts).toHaveLength(2);
      expect(connectOptions.silent).toBe(true);
      expect(connectOptions.timeout).toBe(30000);
    });

    it('should properly type EVMProviderState', () => {
      const providerState: EVMProviderState = {
        accounts: ['0x123', '0x456'],
        chainId: '0x1',
        isConnected: true,
        isUnlocked: true,
        networkVersion: '1',
      };

      expect(providerState.accounts).toHaveLength(2);
      expect(providerState.chainId).toBe('0x1');
      expect(providerState.isConnected).toBe(true);
      expect(providerState.isUnlocked).toBe(true);
      expect(providerState.networkVersion).toBe('1');
    });
  });
});
