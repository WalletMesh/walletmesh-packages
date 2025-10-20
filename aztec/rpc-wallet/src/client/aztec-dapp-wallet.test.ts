import type { ContractArtifact, ContractInstanceWithAddress, Tx, TxExecutionRequest } from '@aztec/aztec.js';
import { AztecAddress, CompleteAddress, Fr, TxHash } from '@aztec/aztec.js';
import type { FeeOptions, TxExecutionOptions } from '@aztec/entrypoints/interfaces';
import type { ExecutionPayload } from '@aztec/entrypoints/payload';
import type { WalletRouterProvider } from '@walletmesh/router';
import { beforeAll, beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { AztecDappWallet, createAztecWallet } from './aztec-dapp-wallet.js';

// Mock provider
const createMockProvider = () => {
  const call = vi.fn() as Mock;
  const on = vi.fn();
  const off = vi.fn();
  return {
    call,
    on,
    off,
  } as unknown as WalletRouterProvider & { call: Mock };
};

// Mock Aztec objects - we'll create these asynchronously in tests or beforeEach hooks
let mockAddress: AztecAddress;
let mockCompleteAddress: CompleteAddress;
let mockTxHash: TxHash;
const testChainId = 'aztec:test';

// Helper to create mock objects
async function createMockObjects() {
  // Create a CompleteAddress first, then extract its address
  mockCompleteAddress = await CompleteAddress.random();
  mockAddress = mockCompleteAddress.address;
  mockTxHash = TxHash.random();
}

describe('AztecDappWallet', () => {
  let provider: ReturnType<typeof createMockProvider>;
  let wallet: AztecDappWallet;

  beforeAll(async () => {
    await createMockObjects();
  });

  beforeEach(() => {
    provider = createMockProvider();
    wallet = new AztecDappWallet(provider, testChainId);
  });

  describe('Cached properties', () => {
    it('should throw when accessing address before initialization', () => {
      expect(() => wallet.getAddress()).toThrow(
        'Wallet not initialized. Call createAztecWallet() to properly initialize the wallet.',
      );
    });

    it('should throw when accessing completeAddress before initialization', () => {
      expect(() => wallet.getCompleteAddress()).toThrow(
        'Wallet not initialized. Call createAztecWallet() to properly initialize the wallet.',
      );
    });

    it('should throw when accessing chainId before initialization', () => {
      expect(() => wallet.getChainId()).toThrow(
        'Chain ID not initialized. Call createAztecWallet() to properly initialize the wallet.',
      );
    });

    it('should throw when accessing version before initialization', () => {
      expect(() => wallet.getVersion()).toThrow(
        'Wallet version not initialized. Call createAztecWallet() to properly initialize the wallet.',
      );
    });

    it('should return cached values after initialization', async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            throw new Error(`Unexpected method: ${method}`);
        }
      });

      await wallet.initialize();

      expect(wallet.getAddress()).toEqual(mockAddress);
      expect(wallet.getCompleteAddress()).toEqual(mockCompleteAddress);
      expect(wallet.getChainId()).toEqual(mockChainIdFr);
      expect(wallet.getVersion()).toEqual(mockVersionFr);
    });
  });

  describe('initialize', () => {
    it('should fetch all cached values', async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            throw new Error(`Unexpected method: ${method}`);
        }
      });

      await wallet.initialize();

      expect(provider.call).toHaveBeenCalledWith(testChainId, { method: 'aztec_getCompleteAddress' }, 10000);
      expect(provider.call).toHaveBeenCalledWith(testChainId, { method: 'aztec_getChainId' }, 10000);
      expect(provider.call).toHaveBeenCalledWith(testChainId, { method: 'aztec_getVersion' }, 10000);
    });

    it('should handle initialization errors', async () => {
      provider.call.mockRejectedValue(new Error('Provider error'));

      await expect(wallet.initialize()).rejects.toThrow('❌ Wallet Connection Failed');
    }, 10000);
  });

  describe('Account methods', () => {
    beforeEach(async () => {
      // Initialize wallet with default chain ID for testing
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should call aztec_getAddress', async () => {
      provider.call.mockResolvedValue(mockAddress);

      const result = await wallet.getAddressAsync();

      expect(provider.call).toHaveBeenCalledWith(testChainId, { method: 'aztec_getAddress' });
      expect(result).toEqual(mockAddress);
    });

    it('should call aztec_getCompleteAddress', async () => {
      provider.call.mockResolvedValue(mockCompleteAddress);

      const result = await wallet.getCompleteAddressAsync();

      expect(provider.call).toHaveBeenCalledWith(testChainId, { method: 'aztec_getCompleteAddress' }, 10000);
      expect(result).toEqual(mockCompleteAddress);
    });

    it('should call aztec_createAuthWit with Fr', async () => {
      const messageHash = Fr.random();
      const authWitness = { messageHash };
      provider.call.mockResolvedValue(authWitness);

      const result = await wallet.createAuthWit(messageHash);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_createAuthWit',
        params: { intent: messageHash },
      });
      expect(result).toEqual(authWitness);
    });

    it('should call aztec_createAuthWit with Buffer', async () => {
      const buffer = Buffer.from('test');
      const authWitness = { messageHash: Fr.random() };
      provider.call.mockResolvedValue(authWitness);

      const result = await wallet.createAuthWit(buffer);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_createAuthWit',
        params: { intent: buffer },
      });
      expect(result).toEqual(authWitness);
    });
  });

  describe('Transaction methods', () => {
    beforeEach(async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should create transaction execution request locally', async () => {
      // The createTxExecutionRequest method now uses the local DefaultAccountEntrypoint
      // instead of making an RPC call. Since we can't easily mock the entrypoint,
      // we'll just verify it doesn't make an RPC call for this method.
      const executionPayload = {
        calls: [],
        authWitnesses: [],
        capsules: [],
        extraHashedArgs: [],
      } as ExecutionPayload;
      const feeOptions = {} as FeeOptions;
      const txOptions = {} as TxExecutionOptions;

      // This will throw because we haven't mocked all the internal dependencies
      // but that's okay - we just want to verify no RPC call is made
      await expect(
        wallet.createTxExecutionRequest(executionPayload, feeOptions, txOptions),
      ).rejects.toThrow();

      // Verify no RPC call was made for createTxExecutionRequest
      expect(provider.call).not.toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'aztec_createTxExecutionRequest' }),
      );
    });

    it('should call aztec_sendTx', async () => {
      const tx = { request: {} } as unknown as Tx;
      provider.call.mockResolvedValue(mockTxHash);

      const result = await wallet.sendTx(tx);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_sendTx',
        params: { tx },
      });
      expect(result).toEqual(mockTxHash);
    });

    it('should call aztec_getTxReceipt', async () => {
      const receipt = { txHash: mockTxHash };
      provider.call.mockResolvedValue(receipt);

      const result = await wallet.getTxReceipt(mockTxHash);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getTxReceipt',
        params: { txHash: mockTxHash },
      });
      expect(result).toEqual(receipt);
    });

    it('should call aztec_getCurrentBaseFees', async () => {
      const fees = { gasPrice: 100n };
      provider.call.mockResolvedValue(fees);

      const result = await wallet.getCurrentBaseFees();

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getCurrentBaseFees',
      });
      expect(result).toEqual(fees);
    });
  });

  describe('Block methods', () => {
    beforeEach(async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should call aztec_getBlock', async () => {
      const block = { blockNumber: 1 };
      provider.call.mockResolvedValue(block);

      const result = await wallet.getBlock(1);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getBlock',
        params: { number: 1 },
      });
      expect(result).toEqual(block);
    });

    it('should call aztec_getBlockNumber', async () => {
      provider.call.mockResolvedValue(100);

      const result = await wallet.getBlockNumber();

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getBlockNumber',
      });
      expect(result).toBe(100);
    });
  });

  describe('Contract methods', () => {
    beforeEach(async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should call aztec_registerContract', async () => {
      const contract = { instance: { address: mockAddress } } as { instance: ContractInstanceWithAddress };
      provider.call.mockResolvedValue(undefined);

      await wallet.registerContract(contract);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_registerContract',
        params: { instance: contract.instance },
      });
    });

    it('should call aztec_registerContractClass', async () => {
      const artifact = { name: 'TestContract' } as ContractArtifact;
      provider.call.mockResolvedValue(undefined);

      await wallet.registerContractClass(artifact);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_registerContractClass',
        params: { artifact },
      });
    });

    it('should call aztec_getContracts', async () => {
      const contracts: unknown[] = [];
      provider.call.mockResolvedValue(contracts);

      const result = await wallet.getContracts();

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getContracts',
      });
      expect(result).toEqual(contracts);
    });
  });

  describe('Node info methods', () => {
    beforeEach(async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should call aztec_getNodeInfo', async () => {
      const nodeInfo = { version: '1.0.0' };
      provider.call.mockResolvedValue(nodeInfo);

      const result = await wallet.getNodeInfo();

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getNodeInfo',
      });
      expect(result).toEqual(nodeInfo);
    });

    it('should return cached chainId', () => {
      // chainId should already be cached from initialization
      const result = wallet.getChainId();
      expect(result.toBigInt()).toBe(31337n);
    });

    it('should call aztec_getChainId async', async () => {
      const mockChainIdFr = new Fr(31337n);
      provider.call.mockResolvedValue(mockChainIdFr);

      const result = await wallet.getChainIdAsync();

      expect(provider.call).toHaveBeenCalledWith(
        testChainId,
        {
          method: 'aztec_getChainId',
        },
        10000,
      );
      expect(result).toEqual(mockChainIdFr);
    });

    it('should return cached version', () => {
      // version should already be cached from initialization
      const result = wallet.getVersion();
      expect(result.toBigInt()).toBe(1n);
    });

    it('should call aztec_getVersion async', async () => {
      const mockVersionFr = new Fr(1n);
      provider.call.mockResolvedValue(mockVersionFr);

      const result = await wallet.getVersionAsync();

      expect(provider.call).toHaveBeenCalledWith(
        testChainId,
        {
          method: 'aztec_getVersion',
        },
        10000,
      );
      expect(result).toEqual(mockVersionFr);
    });
  });

  describe('Sender methods', () => {
    beforeEach(async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should call aztec_registerSender', async () => {
      const senderAddress = await AztecAddress.random();
      // registerSender returns the passed address after registration
      provider.call.mockResolvedValue(undefined);

      const result = await wallet.registerSender(senderAddress);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_registerSender',
        params: { sender: senderAddress },
      });
      expect(result).toEqual(senderAddress);
    });

    it('should call aztec_getSenders', async () => {
      const senders = [mockAddress];
      provider.call.mockResolvedValue(senders);

      const result = await wallet.getSenders();

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getSenders',
      });
      expect(result).toEqual(senders);
    });

    it('should call aztec_removeSender', async () => {
      provider.call.mockResolvedValue(undefined);

      await wallet.removeSender(mockAddress);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_removeSender',
        params: { sender: mockAddress },
      });
    });
  });

  describe('Additional methods', () => {
    beforeEach(async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (_chainId: string, { method }: { method: string }) => {
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            return null;
        }
      });
      await wallet.initialize();
      provider.call.mockClear();
    });

    it('should call aztec_simulateTx', async () => {
      const txRequest = { request: {} } as unknown as TxExecutionRequest;
      const simulatedTx = { tx: txRequest, privateReturnValues: [] };
      provider.call.mockResolvedValue(simulatedTx);

      const result = await wallet.simulateTx(txRequest, true, false, false);

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_simulateTx',
        params: {
          txRequest,
          simulatePublic: true,
          skipTxValidation: false,
          skipFeeEnforcement: false,
        },
      });
      expect(result).toEqual(simulatedTx);
    });

    it('should call aztec_getPXEInfo', async () => {
      const pxeInfo = { version: '1.0.0' };
      provider.call.mockResolvedValue(pxeInfo);

      const result = await wallet.getPXEInfo();

      expect(provider.call).toHaveBeenCalledWith(testChainId, {
        method: 'aztec_getPXEInfo',
      });
      expect(result).toEqual(pxeInfo);
    });
  });

  describe('createAztecWallet', () => {
    it('should create and initialize a wallet with default chainId', async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);

      provider.call.mockImplementation(async (chainId: string, { method }: { method: string }) => {
        expect(chainId).toBe('aztec:mainnet'); // default chainId
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            throw new Error(`Unexpected method: ${method}`);
        }
      });

      const wallet = await createAztecWallet(provider);

      expect(wallet).toBeInstanceOf(AztecDappWallet);
      expect(wallet.getAddress()).toEqual(mockAddress);
      expect(wallet.getCompleteAddress()).toEqual(mockCompleteAddress);
      expect(wallet.getChainId()).toEqual(mockChainIdFr);
      expect(wallet.getVersion()).toEqual(mockVersionFr);
    });

    it('should create and initialize a wallet with custom chainId', async () => {
      const mockChainIdFr = new Fr(31337n);
      const mockVersionFr = new Fr(1n);
      const customChainId = 'aztec:custom';

      provider.call.mockImplementation(async (chainId: string, { method }: { method: string }) => {
        expect(chainId).toBe(customChainId);
        switch (method) {
          case 'aztec_getCompleteAddress':
            return mockCompleteAddress;
          case 'aztec_getChainId':
            return mockChainIdFr;
          case 'aztec_getVersion':
            return mockVersionFr;
          default:
            throw new Error(`Unexpected method: ${method}`);
        }
      });

      const wallet = await createAztecWallet(provider, customChainId);

      expect(wallet).toBeInstanceOf(AztecDappWallet);
      expect(wallet.getAddress()).toEqual(mockAddress);
      expect(wallet.getCompleteAddress()).toEqual(mockCompleteAddress);
      expect(wallet.getChainId()).toEqual(mockChainIdFr);
      expect(wallet.getVersion()).toEqual(mockVersionFr);
    });
  });
});
