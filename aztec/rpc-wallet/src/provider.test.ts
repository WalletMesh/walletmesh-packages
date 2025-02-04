import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AztecProvider } from './provider.js';
import { AztecWalletError, AztecWalletErrorType } from './errors.js';
import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { ContractInstanceWithAddress, AztecAddress, ContractArtifact } from '@aztec/aztec.js';
import { WalletRouterProvider } from '@walletmesh/router';
import type { OperationBuilder } from '@walletmesh/router';
import type { Mock } from 'vitest';

const createMockTransport = () => ({
  send: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  close: vi.fn(),
});

describe('AztecProvider', () => {
  let provider: AztecProvider;
  let mockTransport: ReturnType<typeof createMockTransport>;
  let mockChainBuilder: {
    chainId: string;
    provider: WalletRouterProvider;
    calls: unknown[];
    call: Mock;
    execute: Mock;
  };

  beforeEach(() => {
    mockTransport = createMockTransport();
    provider = new AztecProvider(mockTransport);

    // Setup chain builder mock after provider creation
    mockChainBuilder = {
      chainId: 'aztec:testnet',
      provider: provider,
      calls: [],
      call: vi.fn(),
      execute: vi.fn(),
    };

    // Setup mock chain builder
    mockChainBuilder.call.mockImplementation(() => mockChainBuilder);
    mockChainBuilder.execute.mockImplementation(() => Promise.resolve());

    // Setup additional mocks
    vi.spyOn(provider as WalletRouterProvider, 'sessionId', 'get').mockReturnValue('test-session-id');
    vi.spyOn(provider, 'chain').mockImplementation((chainId) => {
      mockChainBuilder.chainId = chainId;
      mockChainBuilder.call.mockImplementation((method, params) => {
        mockChainBuilder.calls.push({ method, params });
        return mockChainBuilder;
      });
      mockChainBuilder.execute.mockImplementation(async () => {
        const result = await Promise.resolve(null);
        if (result === null) {
          throw new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid response');
        }
        return result;
      });
      return mockChainBuilder as unknown as OperationBuilder;
    });
  });

  describe('constructor', () => {
    test('registers event handlers', () => {
      // Create a spy on the on method before creating provider
      const onSpy = vi.spyOn(WalletRouterProvider.prototype, 'on');
      const provider = new AztecProvider(mockTransport);

      expect(onSpy).toHaveBeenCalledWith('wm_walletStateChanged', expect.any(Function));
      expect(onSpy).toHaveBeenCalledWith('wm_sessionTerminated', expect.any(Function));

      onSpy.mockRestore();
    });

    test('initializes with empty chain sets', () => {
      expect(provider.getSupportedChains()).toEqual([]);
    });
  });

  describe('handleWalletStateChanged', () => {
    test('adds chain when accounts become available', () => {
      const chainId = 'aztec:testnet';
      provider['requestedChains'].add(chainId);

      provider['handleWalletStateChanged']({
        chainId,
        changes: { accounts: ['0x123'] },
      });

      expect(provider.getSupportedChains()).toContain(chainId);
    });

    test('removes chain when accounts become unavailable', () => {
      const chainId = 'aztec:testnet';
      provider['requestedChains'].add(chainId);
      provider['connectedChains'].add(chainId);

      provider['handleWalletStateChanged']({
        chainId,
        changes: { accounts: [] },
      });

      expect(provider.getSupportedChains()).not.toContain(chainId);
    });

    test('ignores events for non-requested chains', () => {
      const chainId = 'aztec:testnet';
      // Chain not added to requestedChains

      provider['handleWalletStateChanged']({
        chainId,
        changes: { accounts: ['0x123'] },
      });

      expect(provider.getSupportedChains()).not.toContain(chainId);
    });
  });

  describe('handleSessionTerminated', () => {
    test('clears chains when session matches', () => {
      const chainId = 'aztec:testnet';
      provider['requestedChains'].add(chainId);
      provider['connectedChains'].add(chainId);

      provider['handleSessionTerminated']({
        sessionId: 'test-session-id',
        reason: 'test termination',
      });

      expect(provider.getSupportedChains()).toEqual([]);
      expect(provider['requestedChains'].size).toBe(0);
    });

    test('ignores termination for different sessions', () => {
      const chainId = 'aztec:testnet';
      provider['requestedChains'].add(chainId);
      provider['connectedChains'].add(chainId);

      provider['handleSessionTerminated']({
        sessionId: 'different-session',
        reason: 'test termination',
      });

      expect(provider.getSupportedChains()).toContain(chainId);
      expect(provider['requestedChains'].has(chainId)).toBe(true);
    });
  });

  describe('getAccount', () => {
    test('returns account address on success', async () => {
      const expectedAddress = '0x123';
      mockChainBuilder.execute.mockResolvedValueOnce(expectedAddress);

      const result = await provider.getAccount('aztec:testnet');
      expect(result).toBe(expectedAddress);
    });

    test('throws on invalid response', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(null);

      await expect(provider.getAccount('aztec:testnet')).rejects.toThrowError(
        new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid account address returned'),
      );
    });
  });

  describe('sendTransaction', () => {
    const mockTxParams = {
      functionCalls: [
        {
          contractAddress: '0x456',
          functionName: 'transfer',
          args: ['0x789', 100],
        },
      ],
    };

    test('returns transaction hash on success', async () => {
      const expectedHash = '0xabc';
      mockChainBuilder.execute.mockResolvedValueOnce(expectedHash);

      const result = await provider.sendTransaction('aztec:testnet', mockTxParams);
      expect(result).toBe(expectedHash);
    });

    test('throws on invalid response', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(null);

      await expect(provider.sendTransaction('aztec:testnet', mockTxParams)).rejects.toThrowError(
        new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid transaction hash returned'),
      );
    });
  });

  describe('simulateTransaction', () => {
    const mockSimParams = {
      contractAddress: '0x456',
      functionName: 'transfer',
      args: ['0x789', 100],
    };

    test('returns simulation result on success', async () => {
      const expectedResult = { success: true, gas: 1000 };
      mockChainBuilder.execute.mockResolvedValueOnce(expectedResult);

      const result = await provider.simulateTransaction('aztec:testnet', mockSimParams);
      expect(result).toEqual(expectedResult);
    });

    test('throws on invalid response', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(null);

      await expect(provider.simulateTransaction('aztec:testnet', mockSimParams)).rejects.toThrowError(
        new AztecWalletError(AztecWalletErrorType.invalidResponse, 'Invalid simulation result returned'),
      );
    });
  });

  describe('registration methods', () => {
    test('registerContract executes without error', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(undefined);

      await expect(
        provider.registerContract('aztec:testnet', {
          instance: {
            address: '0x123' as unknown as AztecAddress,
            version: 1,
            salt: '0x0' as unknown as AztecAddress,
            deployer: '0x0' as unknown as AztecAddress,
            contractClassId: '0x0' as unknown as AztecAddress,
            contractClassVersion: 1,
            publicKey: '0x0' as unknown as AztecAddress,
          } as unknown as ContractInstanceWithAddress,
          artifact: {
            name: 'TestContract',
            bytecode: '0x',
            functionSelectors: {},
            functions: {},
            outputs: {},
            storageLayout: {},
            events: {},
          } as unknown as ContractArtifact,
        }),
      ).resolves.not.toThrow();
    });

    test('registerContractClass executes without error', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(undefined);

      await expect(
        provider.registerContractClass('aztec:testnet', {
          artifact: {
            name: 'TestContract',
            bytecode: '0x',
            functionSelectors: {},
            functions: {},
            outputs: {},
            storageLayout: {},
            events: {},
          } as unknown as ContractArtifact,
        }),
      ).resolves.not.toThrow();
    });

    test('registerSender executes without error', async () => {
      mockChainBuilder.execute.mockResolvedValueOnce(undefined);

      await expect(
        provider.registerSender('aztec:testnet', {
          sender: '0x123' as unknown as AztecAddress,
        }),
      ).resolves.not.toThrow();
    });
  });
});
