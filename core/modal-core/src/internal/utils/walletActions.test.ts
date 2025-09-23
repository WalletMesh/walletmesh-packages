import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testSetupPatterns } from '../../testing/index.js';
import {
  type SignMessageParams,
  type TransactionParams,
  type TypedDataParams,
  WalletActionManager,
  type WalletProvider,
  createWalletActionManager,
} from './walletActions.js';

describe('walletActions', () => {
  let mockProvider: WalletProvider;
  let manager: WalletActionManager;
  const testAddress = '0x1234567890123456789012345678901234567890';

  // Use centralized test setup pattern
  const testEnv = testSetupPatterns.standard();

  beforeEach(async () => {
    await testEnv.setup();
    mockProvider = {
      request: vi.fn(),
    };
    manager = new WalletActionManager(mockProvider, testAddress);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('WalletActionManager constructor', () => {
    it('should create instance with valid provider', () => {
      const manager = new WalletActionManager(mockProvider);
      expect(manager).toBeInstanceOf(WalletActionManager);
    });

    it('should create instance with provider and address', () => {
      const manager = new WalletActionManager(mockProvider, testAddress);
      expect(manager.getCurrentAddress()).toBe(testAddress);
    });

    it('should throw error for invalid provider', () => {
      expect(() => new WalletActionManager(null)).toThrow('Provider must be an object');
      expect(() => new WalletActionManager('invalid')).toThrow('Provider must be an object');
      expect(() => new WalletActionManager({})).toThrow('Provider must have a request method');
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction with valid params', async () => {
      const txHash = '0xabc123';
      vi.mocked(mockProvider.request).mockResolvedValue(txHash);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        value: '1000000000000000000', // 1 ETH in wei
      };

      const result = await manager.sendTransaction(params);

      expect(result).toBe(txHash);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_sendTransaction',
        params: [
          {
            to: params.to,
            value: '0xde0b6b3a7640000', // Hex representation of 1 ETH
          },
        ],
      });
    });

    it('should format hex values correctly', async () => {
      const txHash = '0xabc123';
      vi.mocked(mockProvider.request).mockResolvedValue(txHash);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        value: '1000', // Decimal value
        gasLimit: '21000',
        gasPrice: '20000000000',
      };

      await manager.sendTransaction(params);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_sendTransaction',
        params: [
          {
            to: params.to,
            value: '0x3e8',
            gas: '0x5208',
            gasPrice: '0x4a817c800',
          },
        ],
      });
    });

    it('should handle EIP-1559 gas params', async () => {
      const txHash = '0xabc123';
      vi.mocked(mockProvider.request).mockResolvedValue(txHash);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        maxFeePerGas: '30000000000',
        maxPriorityFeePerGas: '1000000000',
      };

      await manager.sendTransaction(params);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_sendTransaction',
        params: [
          {
            to: params.to,
            maxFeePerGas: '0x6fc23ac00',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
    });

    it('should include data field when provided', async () => {
      const txHash = '0xabc123';
      vi.mocked(mockProvider.request).mockResolvedValue(txHash);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        data: '0xabcdef',
      };

      await manager.sendTransaction(params);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_sendTransaction',
        params: [
          {
            to: params.to,
            data: params.data,
          },
        ],
      });
    });

    it('should throw error for invalid transaction hash', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue(123); // Invalid type

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
      };

      await expect(manager.sendTransaction(params)).rejects.toThrowError(
        /Transaction failed: Invalid transaction hash returned/,
      );
    });

    it('should enhance provider errors', async () => {
      vi.mocked(mockProvider.request).mockRejectedValue(new Error('User rejected'));

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
      };

      await expect(manager.sendTransaction(params)).rejects.toThrow('Transaction failed: User rejected');
    });
  });

  describe('signMessage', () => {
    it('should sign personal message', async () => {
      const signature = '0xsignature123';
      vi.mocked(mockProvider.request).mockResolvedValue(signature);

      const params: SignMessageParams = {
        message: 'Hello, World!',
      };

      const result = await manager.signMessage(params);

      expect(result).toBe(signature);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'personal_sign',
        params: ['Hello, World!', testAddress],
      });
    });

    it('should sign typed message', async () => {
      const signature = '0xsignature123';
      vi.mocked(mockProvider.request).mockResolvedValue(signature);

      const params: SignMessageParams = {
        message: '0xabc123',
        type: 'typed',
      };

      const result = await manager.signMessage(params);

      expect(result).toBe(signature);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_signTypedData_v4',
        params: ['0xabc123', testAddress],
      });
    });

    it('should throw error if no address available', async () => {
      const managerNoAddress = new WalletActionManager(mockProvider);

      const params: SignMessageParams = {
        message: 'Hello',
      };

      await expect(managerNoAddress.signMessage(params)).rejects.toThrow('No wallet address available');
    });

    it('should throw error for invalid signature', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue(null);

      const params: SignMessageParams = {
        message: 'Hello',
      };

      await expect(manager.signMessage(params)).rejects.toThrowError(
        /Message signing failed: Invalid signature returned/,
      );
    });
  });

  describe('signTypedData', () => {
    it('should sign typed data with EIP-712', async () => {
      const signature = '0xsignature123';
      vi.mocked(mockProvider.request).mockResolvedValue(signature);

      const params: TypedDataParams = {
        domain: {
          name: 'Test App',
          version: '1',
          chainId: 1,
          verifyingContract: '0x1234567890123456789012345678901234567890',
        },
        types: {
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
        },
        primaryType: 'Person',
        message: {
          name: 'Alice',
          wallet: '0x1234567890123456789012345678901234567890',
        },
      };

      const result = await manager.signTypedData(params);

      expect(result).toBe(signature);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_signTypedData_v4',
        params: [
          testAddress,
          JSON.stringify({
            domain: params.domain,
            types: params.types,
            primaryType: params.primaryType,
            message: params.message,
          }),
        ],
      });
    });

    it('should throw error for invalid signature', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue(undefined);

      const params: TypedDataParams = {
        domain: {},
        types: {},
        primaryType: 'Test',
        message: {},
      };

      await expect(manager.signTypedData(params)).rejects.toThrowError(
        /Typed data signing failed: Invalid signature returned/,
      );
    });

    it('should enhance provider errors', async () => {
      vi.mocked(mockProvider.request).mockRejectedValue(new Error('User denied'));

      const params: TypedDataParams = {
        domain: {},
        types: {},
        primaryType: 'Test',
        message: {},
      };

      await expect(manager.signTypedData(params)).rejects.toThrow('Typed data signing failed: User denied');
    });
  });

  describe('estimateGas', () => {
    it('should estimate gas for transaction', async () => {
      const gasEstimate = '0x5208'; // 21000 in hex
      vi.mocked(mockProvider.request).mockResolvedValue(gasEstimate);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        value: '1000000000000000000',
      };

      const result = await manager.estimateGas(params);

      expect(result).toBe(gasEstimate);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_estimateGas',
        params: [
          {
            to: params.to,
            value: '0xde0b6b3a7640000', // Hex representation
          },
        ],
      });
    });

    it('should skip gas fields during estimation', async () => {
      const gasEstimate = '0x5208';
      vi.mocked(mockProvider.request).mockResolvedValue(gasEstimate);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        gasLimit: '50000', // Should be ignored
        gasPrice: '20000000000', // Should be ignored
      };

      await manager.estimateGas(params);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_estimateGas',
        params: [
          {
            to: params.to,
            // No gas fields
          },
        ],
      });
    });

    it('should throw error for invalid gas estimate', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue(123);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
      };

      await expect(manager.estimateGas(params)).rejects.toThrowError(
        /Gas estimation failed: Invalid gas estimate returned/,
      );
    });
  });

  describe('getGasPrice', () => {
    it('should get current gas price', async () => {
      const gasPrice = '0x4a817c800'; // 20 gwei
      vi.mocked(mockProvider.request).mockResolvedValue(gasPrice);

      const result = await manager.getGasPrice();

      expect(result).toBe(gasPrice);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_gasPrice',
        params: [],
      });
    });

    it('should throw error for invalid gas price', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue(null);

      await expect(manager.getGasPrice()).rejects.toThrowError(
        /Gas price retrieval failed: Invalid gas price returned/,
      );
    });
  });

  describe('getBlockNumber', () => {
    it('should get current block number', async () => {
      const blockNumber = '0xf4240'; // 1000000 in hex
      vi.mocked(mockProvider.request).mockResolvedValue(blockNumber);

      const result = await manager.getBlockNumber();

      expect(result).toBe(blockNumber);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_blockNumber',
        params: [],
      });
    });

    it('should throw error for invalid block number', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue({});

      await expect(manager.getBlockNumber()).rejects.toThrowError(
        /Block number retrieval failed: Invalid block number returned/,
      );
    });
  });

  describe('getBalance', () => {
    it('should get balance for current address', async () => {
      const balance = '0xde0b6b3a7640000'; // 1 ETH in wei
      vi.mocked(mockProvider.request).mockResolvedValue(balance);

      const result = await manager.getBalance();

      expect(result).toBe(balance);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_getBalance',
        params: [testAddress, 'latest'],
      });
    });

    it('should get balance for specific address', async () => {
      const balance = '0xde0b6b3a7640000';
      const specificAddress = '0x9876543210987654321098765432109876543210';
      vi.mocked(mockProvider.request).mockResolvedValue(balance);

      const result = await manager.getBalance(specificAddress);

      expect(result).toBe(balance);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_getBalance',
        params: [specificAddress, 'latest'],
      });
    });

    it('should get balance at specific block', async () => {
      const balance = '0xde0b6b3a7640000';
      vi.mocked(mockProvider.request).mockResolvedValue(balance);

      const result = await manager.getBalance(testAddress, '0xf4240');

      expect(result).toBe(balance);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_getBalance',
        params: [testAddress, '0xf4240'],
      });
    });

    it('should throw error if no address available', async () => {
      const managerNoAddress = new WalletActionManager(mockProvider);

      await expect(managerNoAddress.getBalance()).rejects.toThrow(
        'No address provided and no current address available',
      );
    });

    it('should throw error for invalid balance', async () => {
      vi.mocked(mockProvider.request).mockResolvedValue(123);

      await expect(manager.getBalance()).rejects.toThrowError(
        /Balance retrieval failed: Invalid balance returned/,
      );
    });
  });

  describe('address management', () => {
    it('should set and get current address', () => {
      const newAddress = '0x9876543210987654321098765432109876543210';

      manager.setCurrentAddress(newAddress);

      expect(manager.getCurrentAddress()).toBe(newAddress);
    });

    it('should return undefined if no address set', () => {
      const managerNoAddress = new WalletActionManager(mockProvider);

      expect(managerNoAddress.getCurrentAddress()).toBeUndefined();
    });
  });

  describe('supportsMethod', () => {
    it('should return true for common methods', () => {
      expect(manager.supportsMethod('eth_sendTransaction')).toBe(true);
      expect(manager.supportsMethod('personal_sign')).toBe(true);
      expect(manager.supportsMethod('eth_signTypedData_v4')).toBe(true);
      expect(manager.supportsMethod('eth_estimateGas')).toBe(true);
      expect(manager.supportsMethod('eth_gasPrice')).toBe(true);
      expect(manager.supportsMethod('eth_blockNumber')).toBe(true);
      expect(manager.supportsMethod('eth_getBalance')).toBe(true);
      expect(manager.supportsMethod('wallet_switchEthereumChain')).toBe(true);
      expect(manager.supportsMethod('wallet_addEthereumChain')).toBe(true);
    });

    it('should return false for unknown methods', () => {
      expect(manager.supportsMethod('custom_method')).toBe(false);
      expect(manager.supportsMethod('unknown_method')).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should validate provider before operations', async () => {
      // The validation happens in the constructor, so we test that
      // @ts-expect-error Testing with invalid provider
      expect(() => new WalletActionManager({ request: 'not a function' })).toThrow(
        'Provider must have a request method',
      );
    });

    it('should enhance non-Error objects', async () => {
      vi.mocked(mockProvider.request).mockRejectedValue('String error');

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
      };

      await expect(manager.sendTransaction(params)).rejects.toThrow('Transaction failed: String error');
    });

    it('should throw error for invalid hex value', async () => {
      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        value: 'invalid-value',
      };

      await expect(manager.sendTransaction(params)).rejects.toThrow('Invalid numeric value: invalid-value');
    });
  });

  describe('createWalletActionManager', () => {
    it('should create WalletActionManager instance', () => {
      const manager = createWalletActionManager(mockProvider, testAddress);

      expect(manager).toBeInstanceOf(WalletActionManager);
      expect(manager.getCurrentAddress()).toBe(testAddress);
    });

    it('should create instance without address', () => {
      const manager = createWalletActionManager(mockProvider);

      expect(manager).toBeInstanceOf(WalletActionManager);
      expect(manager.getCurrentAddress()).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle provider with additional properties', () => {
      const metamaskProvider = {
        request: vi.fn(),
        isMetaMask: true,
      };

      const manager = new WalletActionManager(metamaskProvider);
      expect(manager).toBeInstanceOf(WalletActionManager);
    });

    it('should handle hex values with 0x prefix', async () => {
      const txHash = '0xabc123';
      vi.mocked(mockProvider.request).mockResolvedValue(txHash);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        value: '0x3e8', // Already hex
        gasLimit: '0x5208',
      };

      await manager.sendTransaction(params);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_sendTransaction',
        params: [
          {
            to: params.to,
            value: '0x3e8',
            gas: '0x5208',
          },
        ],
      });
    });

    it('should handle all gas parameters together', async () => {
      const txHash = '0xabc123';
      vi.mocked(mockProvider.request).mockResolvedValue(txHash);

      const params: TransactionParams = {
        to: '0x9876543210987654321098765432109876543210',
        gasLimit: '21000',
        gasPrice: '20000000000',
        maxFeePerGas: '30000000000',
        maxPriorityFeePerGas: '1000000000',
      };

      await manager.sendTransaction(params);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_sendTransaction',
        params: [
          {
            to: params.to,
            gas: '0x5208',
            gasPrice: '0x4a817c800',
            maxFeePerGas: '0x6fc23ac00',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
    });
  });
});
