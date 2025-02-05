import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import { AztecChainProvider } from './chainProvider.js';
import { AztecWalletError } from './errors.js';
import type { ContractInstanceWithAddress, ContractArtifact, AztecAddress } from '@aztec/aztec.js';
import type { AztecWalletMethodMap } from './types.js';

const createMockTransport = () => ({
  send: vi
    .fn()
    .mockImplementation(async (request: JSONRPCRequest<AztecWalletMethodMap, keyof AztecWalletMethodMap>) => {
      // Default mock implementation that records the call but returns undefined
      return undefined;
    }),
});

describe('AztecChainProvider', () => {
  let provider: AztecChainProvider;
  let mockTransport: ReturnType<typeof createMockTransport>;

  beforeEach(() => {
    mockTransport = createMockTransport();
    provider = new AztecChainProvider(mockTransport);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAccount', () => {
    it('returns account address on success', async () => {
      const expectedAddress = '0x1234567890abcdef';
      const promise = provider.getAccount();

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID from the sent message
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAccount'>;
      expect(sentRequest).toEqual({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'aztec_getAccount',
      });

      // Simulate response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: expectedAddress,
        id: sentRequest.id,
      });

      const result = await promise;
      expect(result).toBe(expectedAddress);
    });

    it('throws on invalid response', async () => {
      const promise = provider.getAccount();

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAccount'>;

      // Simulate error response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: null,
        id: sentRequest.id,
      });

      await expect(promise).rejects.toThrow(AztecWalletError);
    });
  });

  describe('sendTransaction', () => {
    const txParams = {
      functionCalls: [
        {
          contractAddress: '0x1234',
          functionName: 'transfer',
          args: ['0x5678', 100],
        },
      ],
    };

    it('returns transaction hash on success', async () => {
      const expectedHash = '0xabcd';
      const promise = provider.sendTransaction(txParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_sendTransaction'>;
      expect(sentRequest).toEqual({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'aztec_sendTransaction',
        params: txParams,
      });

      // Simulate response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: expectedHash,
        id: sentRequest.id,
      });

      const result = await promise;
      expect(result).toBe(expectedHash);
    });

    it('throws on invalid response', async () => {
      const promise = provider.sendTransaction(txParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_sendTransaction'>;

      // Simulate error response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: null,
        id: sentRequest.id,
      });

      await expect(promise).rejects.toThrow(AztecWalletError);
    });
  });

  describe('simulateTransaction', () => {
    const txParams = {
      contractAddress: '0x1234',
      functionName: 'transfer',
      args: ['0x5678', 100],
    };

    it('returns simulation result on success', async () => {
      const expectedResult = { success: true, data: 'test' };
      const promise = provider.simulateTransaction(txParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_simulateTransaction'>;
      expect(sentRequest).toEqual({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'aztec_simulateTransaction',
        params: txParams,
      });

      // Simulate response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: expectedResult,
        id: sentRequest.id,
      });

      const result = await promise;
      expect(result).toEqual(expectedResult);
    });

    it('throws on invalid response', async () => {
      const promise = provider.simulateTransaction(txParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_simulateTransaction'>;

      // Simulate error response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: null,
        id: sentRequest.id,
      });

      await expect(promise).rejects.toThrow(AztecWalletError);
    });
  });

  describe('registerContract', () => {
    const contractParams = {
      instance: { address: '0x1234' as unknown as AztecAddress } as ContractInstanceWithAddress,
      artifact: { name: 'TestContract' } as ContractArtifact,
    };

    it('succeeds on valid response', async () => {
      const promise = provider.registerContract(contractParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_registerContract'>;
      expect(sentRequest).toEqual({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'aztec_registerContract',
        params: contractParams,
      });

      // Simulate response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: true,
        id: sentRequest.id,
      });

      await expect(promise).resolves.toBeUndefined();
    });

    it('throws on invalid response', async () => {
      const promise = provider.registerContract(contractParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_registerContract'>;

      // Simulate error response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: false,
        id: sentRequest.id,
      });

      await expect(promise).rejects.toThrow(AztecWalletError);
    });
  });

  describe('registerContractClass', () => {
    const classParams = {
      artifact: { name: 'TestContract' } as ContractArtifact,
    };

    it('succeeds on valid response', async () => {
      const promise = provider.registerContractClass(classParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_registerContractClass'>;
      expect(sentRequest).toEqual({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'aztec_registerContractClass',
        params: classParams,
      });

      // Simulate response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: true,
        id: sentRequest.id,
      });

      await expect(promise).resolves.toBeUndefined();
    });

    it('throws on invalid response', async () => {
      const promise = provider.registerContractClass(classParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_registerContractClass'>;

      // Simulate error response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: false,
        id: sentRequest.id,
      });

      await expect(promise).rejects.toThrow(AztecWalletError);
    });
  });

  describe('registerSender', () => {
    const senderParams = {
      sender: '0x1234' as unknown as AztecAddress,
    };

    it('succeeds on valid response', async () => {
      const promise = provider.registerSender(senderParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_registerSender'>;
      expect(sentRequest).toEqual({
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'aztec_registerSender',
        params: senderParams,
      });

      // Simulate response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: '0x1234',
        id: sentRequest.id,
      });

      await expect(promise).resolves.toBeUndefined();
    });

    it('throws on invalid response', async () => {
      const promise = provider.registerSender(senderParams);

      // Wait for the async operation to complete
      await Promise.resolve();

      // Get the request ID
      const calls = mockTransport.send.mock.calls;
      expect(mockTransport.send).toHaveBeenCalledTimes(1);
      const firstCall = mockTransport.send.mock.calls[0];
      if (!firstCall) throw new Error('Expected mock to be called');
      const request = firstCall[0];
      if (!request) throw new Error('Expected request to be defined');
      const sentRequest = request as JSONRPCRequest<AztecWalletMethodMap, 'aztec_registerSender'>;

      // Simulate error response
      await provider.receiveMessage({
        jsonrpc: '2.0',
        result: null,
        id: sentRequest.id,
      });

      await expect(promise).rejects.toThrow(AztecWalletError);
    });
  });
});
