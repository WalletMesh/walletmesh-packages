import type { AztecWalletHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { FunctionArgNames } from './functionArgNamesMiddleware.js';
import type { TransactionSummary } from './transactionSummaryMiddleware.js';
import { createWalletNodePermissionMiddleware } from './walletNodePermissionMiddleware.js';

describe('walletNodePermissionMiddleware', () => {
  // Mock functions
  let mockOnApprovalRequest: ReturnType<typeof vi.fn>;
  let mockAutoApproveRef: { current: boolean };
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnApprovalRequest = vi.fn();
    mockAutoApproveRef = { current: false };
    mockNext = vi.fn().mockResolvedValue({ result: 'success' });
  });

  describe('Security checks', () => {
    it('should deny sensitive methods without requiresUserApproval flag', async () => {
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {};
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      await expect(middleware(context, request, mockNext)).rejects.toThrow(
        'Security: Method aztec_wmBatchExecute requires router approval flag',
      );

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockOnApprovalRequest).not.toHaveBeenCalled();
    });

    it('should extract requiresUserApproval flag from params when not in context', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {};
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{ requiresUserApproval: true }, {}],
        id: 1,
      };

      const result = await middleware(context, request, mockNext);

      expect(result).toEqual({ result: 'success' });
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockOnApprovalRequest).toHaveBeenCalledOnce();
      expect(context.requiresUserApproval).toBe(true);
    });

    it('should deny aztec_wmExecuteTx without approval flag', async () => {
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {};
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmExecuteTx',
        params: [{} as unknown, {}],
        id: 1,
      };

      await expect(middleware(context, request, mockNext)).rejects.toThrow(
        'Security: Method aztec_wmExecuteTx requires router approval flag',
      );
    });

    it('should deny aztec_wmDeployContract without approval flag', async () => {
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {};
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmDeployContract'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmDeployContract',
        params: [{} as unknown],
        id: 1,
      };

      await expect(middleware(context, request, mockNext)).rejects.toThrow(
        'Security: Method aztec_wmDeployContract requires router approval flag',
      );
    });

    it('should allow non-sensitive methods without approval flag', async () => {
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {};
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAddress'> = {
        jsonrpc: '2.0',
        method: 'aztec_getAddress',
        params: [],
        id: 1,
      };

      const result = await middleware(context, request, mockNext);

      expect(result).toEqual({ result: 'success' });
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockOnApprovalRequest).not.toHaveBeenCalled();
    });
  });

  describe('Auto-approve mode', () => {
    it('should skip approval prompt when auto-approve is enabled', async () => {
      mockAutoApproveRef.current = true;
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {
        requiresUserApproval: true,
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      const result = await middleware(context, request, mockNext);

      expect(result).toEqual({ result: 'success' });
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockOnApprovalRequest).not.toHaveBeenCalled();
    });
  });

  describe('User approval flow', () => {
    it('should show approval prompt when requiresUserApproval is true', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & {
        requiresUserApproval?: boolean;
        origin?: string;
      } = {
        requiresUserApproval: true,
        origin: 'http://localhost:5173',
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      const result = await middleware(context, request, mockNext);

      expect(result).toEqual({ result: 'success' });
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockOnApprovalRequest).toHaveBeenCalledWith({
        origin: 'http://localhost:5173',
        chainId: 'aztec:31337',
        method: 'aztec_wmBatchExecute',
        params: undefined,
        functionArgNames: undefined,
      });
    });

    it('should use "wallet-node" as default origin if not provided', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {
        requiresUserApproval: true,
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      await middleware(context, request, mockNext);

      expect(mockOnApprovalRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          origin: 'wallet-node',
        }),
      );
    });

    it('should throw error when user denies approval', async () => {
      mockOnApprovalRequest.mockResolvedValue(false);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {
        requiresUserApproval: true,
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      await expect(middleware(context, request, mockNext)).rejects.toThrow('User denied transaction');

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockOnApprovalRequest).toHaveBeenCalledOnce();
    });
  });

  describe('Transaction summary and function arguments', () => {
    it('should pass transaction summary to approval request', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const transactionSummary: TransactionSummary = {
        functionCalls: [
          {
            contractAddress: '0x1234',
            functionName: 'transfer',
            args: ['0xabcd', 100],
          },
        ],
      };

      const context: AztecWalletHandlerContext & {
        requiresUserApproval?: boolean;
        transactionSummary?: TransactionSummary;
      } = {
        requiresUserApproval: true,
        transactionSummary,
      };

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmExecuteTx',
        params: [{} as unknown, {}],
        id: 1,
      };

      await middleware(context, request, mockNext);

      expect(mockOnApprovalRequest).toHaveBeenCalledWith({
        origin: 'wallet-node',
        chainId: 'aztec:31337',
        method: 'aztec_wmExecuteTx',
        params: { functionCalls: transactionSummary.functionCalls },
        functionArgNames: undefined,
      });
    });

    it('should pass function argument names to approval request', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const functionArgNames: FunctionArgNames = {
        '0x1234': {
          transfer: [
            { name: 'to', abiType: { kind: 'field' }, typeString: 'address' },
            {
              name: 'amount',
              abiType: { kind: 'integer', sign: 'unsigned', width: 128 },
              typeString: 'uint128',
            },
          ],
        },
      };

      const context: AztecWalletHandlerContext & {
        requiresUserApproval?: boolean;
        functionCallArgNames?: FunctionArgNames;
      } = {
        requiresUserApproval: true,
        functionCallArgNames: functionArgNames,
      };

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmExecuteTx',
        params: [{} as unknown, {}],
        id: 1,
      };

      await middleware(context, request, mockNext);

      expect(mockOnApprovalRequest).toHaveBeenCalledWith({
        origin: 'wallet-node',
        chainId: 'aztec:31337',
        method: 'aztec_wmExecuteTx',
        params: undefined,
        functionArgNames,
      });
    });

    it('should pass both transaction summary and function arg names when available', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const transactionSummary: TransactionSummary = {
        functionCalls: [
          {
            contractAddress: '0x1234',
            functionName: 'transfer',
            args: ['0xabcd', 100],
          },
        ],
      };

      const functionArgNames: FunctionArgNames = {
        '0x1234': {
          transfer: [
            { name: 'to', abiType: { kind: 'field' }, typeString: 'address' },
            {
              name: 'amount',
              abiType: { kind: 'integer', sign: 'unsigned', width: 128 },
              typeString: 'uint128',
            },
          ],
        },
      };

      const context: AztecWalletHandlerContext & {
        requiresUserApproval?: boolean;
        transactionSummary?: TransactionSummary;
        functionCallArgNames?: FunctionArgNames;
      } = {
        requiresUserApproval: true,
        transactionSummary,
        functionCallArgNames: functionArgNames,
      };

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      await middleware(context, request, mockNext);

      expect(mockOnApprovalRequest).toHaveBeenCalledWith({
        origin: 'wallet-node',
        chainId: 'aztec:31337',
        method: 'aztec_wmBatchExecute',
        params: { functionCalls: transactionSummary.functionCalls },
        functionArgNames,
      });
    });
  });

  describe('Pass-through behavior', () => {
    it('should pass through requests without requiresUserApproval flag', async () => {
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {
        requiresUserApproval: false,
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAddress'> = {
        jsonrpc: '2.0',
        method: 'aztec_getAddress',
        params: [],
        id: 1,
      };

      const result = await middleware(context, request, mockNext);

      expect(result).toEqual({ result: 'success' });
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockOnApprovalRequest).not.toHaveBeenCalled();
    });

    it('should pass through after successful approval', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {
        requiresUserApproval: true,
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      const result = await middleware(context, request, mockNext);

      expect(result).toEqual({ result: 'success' });
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty transaction summary', async () => {
      mockOnApprovalRequest.mockResolvedValue(true);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const transactionSummary: TransactionSummary = {
        functionCalls: [],
      };

      const context: AztecWalletHandlerContext & {
        requiresUserApproval?: boolean;
        transactionSummary?: TransactionSummary;
      } = {
        requiresUserApproval: true,
        transactionSummary,
      };

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      await middleware(context, request, mockNext);

      expect(mockOnApprovalRequest).toHaveBeenCalledWith({
        origin: 'wallet-node',
        chainId: 'aztec:31337',
        method: 'aztec_wmBatchExecute',
        params: { functionCalls: [] }, // Empty transaction summary still passes empty array
        functionArgNames: undefined,
      });
    });

    it('should handle approval request that throws error', async () => {
      const approvalError = new Error('Approval UI failed');
      mockOnApprovalRequest.mockRejectedValue(approvalError);
      const middleware = createWalletNodePermissionMiddleware(mockOnApprovalRequest, mockAutoApproveRef);

      const context: AztecWalletHandlerContext & { requiresUserApproval?: boolean } = {
        requiresUserApproval: true,
      };
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmBatchExecute'> = {
        jsonrpc: '2.0',
        method: 'aztec_wmBatchExecute',
        params: [{}, {}],
        id: 1,
      };

      await expect(middleware(context, request, mockNext)).rejects.toThrow('Approval UI failed');

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
