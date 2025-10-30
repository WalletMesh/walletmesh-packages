import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  buildTransactionSummaryForBatch,
  buildTransactionSummaryForSingle,
  createTransactionSummaryMiddleware,
  type TransactionSummary,
} from './transactionSummaryMiddleware.js';
import type { FunctionArgNames } from './functionArgNamesMiddleware.js';
import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

describe('transactionSummaryMiddleware', () => {
  // Mock AztecAddress
  const mockAddress = (addr: string) => ({
    toString: () => addr,
  });

  describe('buildTransactionSummaryForBatch', () => {
    it('should build summary for batch with single execution payload', () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'transfer',
              to: mockAddress('0x123'),
              args: [100, '0x456'],
            },
          ],
        },
      ];

      const result = buildTransactionSummaryForBatch(executionPayloads);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0x123',
            functionName: 'transfer',
            args: [100, '0x456'],
          },
        ],
      });
    });

    it('should build summary for batch with multiple execution payloads', () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'mint',
              to: mockAddress('0x111'),
              args: [50],
            },
          ],
        },
        {
          calls: [
            {
              name: 'transfer',
              to: mockAddress('0x222'),
              args: [25, '0x333'],
            },
          ],
        },
      ];

      const result = buildTransactionSummaryForBatch(executionPayloads);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0x111',
            functionName: 'mint',
            args: [50],
          },
          {
            contractAddress: '0x222',
            functionName: 'transfer',
            args: [25, '0x333'],
          },
        ],
      });
    });

    it('should handle multiple calls in single execution payload', () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'approve',
              to: mockAddress('0xAAA'),
              args: ['0xBBB', 100],
            },
            {
              name: 'transfer',
              to: mockAddress('0xCCC'),
              args: [50],
            },
          ],
        },
      ];

      const result = buildTransactionSummaryForBatch(executionPayloads);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0xAAA',
            functionName: 'approve',
            args: ['0xBBB', 100],
          },
          {
            contractAddress: '0xCCC',
            functionName: 'transfer',
            args: [50],
          },
        ],
      });
    });

    it('should return undefined for undefined executionPayloads', () => {
      const result = buildTransactionSummaryForBatch(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array', () => {
      const result = buildTransactionSummaryForBatch([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-array input', () => {
      const result = buildTransactionSummaryForBatch(
        {} as unknown as Parameters<typeof buildTransactionSummaryForBatch>[0],
      );
      expect(result).toBeUndefined();
    });

    it('should handle execution payload without calls', () => {
      const executionPayloads = [{}];
      const result = buildTransactionSummaryForBatch(executionPayloads);
      expect(result).toBeUndefined();
    });

    it('should handle execution payload with empty calls array', () => {
      const executionPayloads = [{ calls: [] }];
      const result = buildTransactionSummaryForBatch(executionPayloads);
      expect(result).toBeUndefined();
    });

    it('should handle missing to or name fields gracefully', () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'validFunction',
              to: mockAddress('0x123'),
              args: [1, 2, 3],
            },
            {
              // Missing name
              to: mockAddress('0x456'),
              args: [],
            },
            {
              name: 'anotherFunction',
              // Missing to
              args: [7, 8, 9],
            },
          ],
        },
      ] as unknown as Array<{
        calls: Array<{ name: string; to: { toString: () => string }; args: unknown[] }>;
      }>;

      const result = buildTransactionSummaryForBatch(executionPayloads);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0x123',
            functionName: 'validFunction',
            args: [1, 2, 3],
          },
          {
            contractAddress: '0x456',
            functionName: 'unknown',
            args: [],
          },
          {
            contractAddress: 'unknown',
            functionName: 'anotherFunction',
            args: [7, 8, 9],
          },
        ],
      });
    });

    it('should handle call.to as string (which has toString method)', () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'test',
              to: '0xDirect' as unknown as { toString: () => string },
              args: [],
            },
          ],
        },
      ];

      const result = buildTransactionSummaryForBatch(executionPayloads);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0xDirect',
            functionName: 'test',
            args: [],
          },
        ],
      });
    });

    it('should handle non-array args', () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'test',
              to: mockAddress('0x123'),
              args: 'not-an-array' as unknown as unknown[],
            },
          ],
        },
      ];

      const result = buildTransactionSummaryForBatch(executionPayloads);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0x123',
            functionName: 'test',
            args: [],
          },
        ],
      });
    });
  });

  describe('buildTransactionSummaryForSingle', () => {
    it('should build summary for single execution payload', () => {
      const executionPayload = {
        calls: [
          {
            name: 'mint',
            to: mockAddress('0xABC'),
            args: [1000],
          },
        ],
      };

      const result = buildTransactionSummaryForSingle(executionPayload);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0xABC',
            functionName: 'mint',
            args: [1000],
          },
        ],
      });
    });

    it('should handle multiple calls', () => {
      const executionPayload = {
        calls: [
          {
            name: 'approve',
            to: mockAddress('0x111'),
            args: ['0x222', 500],
          },
          {
            name: 'transferFrom',
            to: mockAddress('0x333'),
            args: ['0x444', '0x555', 250],
          },
        ],
      };

      const result = buildTransactionSummaryForSingle(executionPayload);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0x111',
            functionName: 'approve',
            args: ['0x222', 500],
          },
          {
            contractAddress: '0x333',
            functionName: 'transferFrom',
            args: ['0x444', '0x555', 250],
          },
        ],
      });
    });

    it('should return undefined for undefined executionPayload', () => {
      const result = buildTransactionSummaryForSingle(undefined);
      expect(result).toBeUndefined();
    });

    it('should return undefined for executionPayload without calls', () => {
      const result = buildTransactionSummaryForSingle({});
      expect(result).toBeUndefined();
    });

    it('should return undefined for executionPayload with empty calls', () => {
      const result = buildTransactionSummaryForSingle({ calls: [] });
      expect(result).toBeUndefined();
    });

    it('should handle missing to or name fields gracefully', () => {
      const executionPayload = {
        calls: [
          {
            name: 'function1',
            to: mockAddress('0xAAA'),
            args: [1],
          },
          {
            // Missing name
            to: mockAddress('0xBBB'),
            args: [2],
          },
          {
            name: 'function3',
            // Missing to
            args: [3],
          },
        ],
      } as unknown as { calls: Array<{ name: string; to: { toString: () => string }; args: unknown[] }> };

      const result = buildTransactionSummaryForSingle(executionPayload);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0xAAA',
            functionName: 'function1',
            args: [1],
          },
          {
            contractAddress: '0xBBB',
            functionName: 'unknown',
            args: [2],
          },
          {
            contractAddress: 'unknown',
            functionName: 'function3',
            args: [3],
          },
        ],
      });
    });

    it('should handle non-array args', () => {
      const executionPayload = {
        calls: [
          {
            name: 'test',
            to: mockAddress('0x999'),
            args: null as unknown as unknown[],
          },
        ],
      };

      const result = buildTransactionSummaryForSingle(executionPayload);

      expect(result).toEqual({
        functionCalls: [
          {
            contractAddress: '0x999',
            functionName: 'test',
            args: [],
          },
        ],
      });
    });
  });

  describe('createTransactionSummaryMiddleware', () => {
    let middleware: ReturnType<typeof createTransactionSummaryMiddleware>;
    let mockNext: ReturnType<typeof vi.fn>;
    let mockContext: AztecHandlerContext & {
      functionCallArgNames?: FunctionArgNames;
      transactionSummary?: TransactionSummary;
    };

    beforeEach(() => {
      middleware = createTransactionSummaryMiddleware();
      mockNext = vi.fn().mockResolvedValue({ result: 'success' });
      mockContext = {} as AztecHandlerContext & {
        functionCallArgNames?: FunctionArgNames;
        transactionSummary?: TransactionSummary;
      };
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should extract and store summary for aztec_wmExecuteTx', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 1,
        method: 'aztec_wmExecuteTx',
        params: [
          {
            calls: [
              {
                name: 'transfer',
                to: mockAddress('0x123'),
                args: [100],
              },
            ],
          },
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.transactionSummary).toEqual({
        functionCalls: [
          {
            contractAddress: '0x123',
            functionName: 'transfer',
            args: [100],
          },
        ],
      });
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should extract and store summary for aztec_wmSimulateTx', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmSimulateTx'> = {
        jsonrpc: '2.0',
        id: 2,
        method: 'aztec_wmSimulateTx',
        params: [
          {
            calls: [
              {
                name: 'simulate',
                to: mockAddress('0xABC'),
                args: [42],
              },
            ],
          },
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.transactionSummary).toEqual({
        functionCalls: [
          {
            contractAddress: '0xABC',
            functionName: 'simulate',
            args: [42],
          },
        ],
      });
    });

    it('should extract and store summary for aztec_wmBatchExecute', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        id: 3,
        method: 'aztec_wmBatchExecute',
        params: [
          [
            {
              calls: [
                {
                  name: 'mint',
                  to: mockAddress('0x111'),
                  args: [50],
                },
              ],
            },
            {
              calls: [
                {
                  name: 'transfer',
                  to: mockAddress('0x222'),
                  args: [25],
                },
              ],
            },
          ],
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.transactionSummary).toEqual({
        functionCalls: [
          {
            contractAddress: '0x111',
            functionName: 'mint',
            args: [50],
          },
          {
            contractAddress: '0x222',
            functionName: 'transfer',
            args: [25],
          },
        ],
      });
    });

    it('should not modify context for methods without execution payloads', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAccounts'> = {
        jsonrpc: '2.0',
        id: 4,
        method: 'aztec_getAccounts',
        params: [],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.transactionSummary).toBeUndefined();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should handle invalid params gracefully', async () => {
      const request = {
        jsonrpc: '2.0',
        id: 5,
        method: 'aztec_wmExecuteTx',
        params: [],
      } as unknown as JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'>;

      await middleware(mockContext, request, mockNext);

      expect(mockContext.transactionSummary).toBeUndefined();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should preserve functionCallArgNames from context', async () => {
      const mockFunctionArgNames = {
        '0x123': {
          transfer: [{ name: 'amount', abiType: { kind: 'field' }, typeString: 'Field' }],
        },
      } as FunctionArgNames;
      mockContext.functionCallArgNames = mockFunctionArgNames;

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 6,
        method: 'aztec_wmExecuteTx',
        params: [
          {
            calls: [
              {
                name: 'transfer',
                to: mockAddress('0x123'),
                args: [100],
              },
            ],
          },
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.transactionSummary).toBeDefined();
      // Function arg names should be preserved
      expect(mockContext.functionCallArgNames).toEqual(mockFunctionArgNames);
    });

    it('should propagate errors from next()', async () => {
      const error = new Error('Test error');
      mockNext.mockRejectedValue(error);

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 7,
        method: 'aztec_wmExecuteTx',
        params: [
          {
            calls: [
              {
                name: 'test',
                to: mockAddress('0x999'),
                args: [],
              },
            ],
          },
        ],
      };

      await expect(middleware(mockContext, request, mockNext)).rejects.toThrow('Test error');
    });

    it('should handle aztec_wmDeployContract method', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmDeployContract'> = {
        jsonrpc: '2.0',
        id: 8,
        method: 'aztec_wmDeployContract',
        params: [
          {
            artifact: { name: 'TestContract' },
            args: [1, 2, 3],
          } as unknown as {
            artifact: { name: string; functions?: unknown[] };
            args: unknown[];
            constructorName?: string;
          },
        ],
      };

      await middleware(mockContext, request, mockNext);

      // Deploy contract doesn't create execution payload summaries
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should return the result from next()', async () => {
      const expectedResult = { result: 'test-result' };
      mockNext.mockResolvedValue(expectedResult);

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 9,
        method: 'aztec_wmExecuteTx',
        params: [
          {
            calls: [
              {
                name: 'test',
                to: mockAddress('0x123'),
                args: [],
              },
            ],
          },
        ],
      };

      const result = await middleware(mockContext, request, mockNext);

      expect(result).toEqual(expectedResult);
    });
  });
});
