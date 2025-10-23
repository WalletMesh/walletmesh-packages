import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { PXE, AbiType } from '@aztec/aztec.js';
import {
  extractFunctionArgNamesForBatch,
  extractFunctionArgNamesForSingle,
  createFunctionArgNamesMiddleware,
  type FunctionArgNames,
} from './functionArgNamesMiddleware.js';
import type { EnhancedParameterInfo } from '@walletmesh/aztec-helpers';
import type { AztecHandlerContext, AztecWalletMethodMap } from '@walletmesh/aztec-rpc-wallet';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

// Mock the aztec-helpers module
vi.mock('@walletmesh/aztec-helpers', () => ({
  getEnhancedParameterInfo: vi.fn(),
}));

describe('functionArgNamesMiddleware', () => {
  let mockPxe: PXE;
  let mockGetEnhancedParameterInfo: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockPxe = {} as PXE;
    // Get the mocked function
    const { getEnhancedParameterInfo } = await import('@walletmesh/aztec-helpers');
    mockGetEnhancedParameterInfo = vi.mocked(getEnhancedParameterInfo);
    mockGetEnhancedParameterInfo.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAddress = (addr: string) => ({
    toString: () => addr,
  });

  const mockParamInfo = (name: string, typeString: string): EnhancedParameterInfo => ({
    name,
    abiType: { kind: 'field' } as AbiType,
    typeString,
  });

  describe('extractFunctionArgNamesForBatch', () => {
    it('should extract function arg names for single execution payload', async () => {
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

      const expectedParamInfo = [mockParamInfo('amount', 'Field'), mockParamInfo('to', 'AztecAddress')];
      mockGetEnhancedParameterInfo.mockResolvedValue(expectedParamInfo);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledWith(mockPxe, '0x123', 'transfer');
      expect(result).toEqual({
        '0x123': {
          transfer: expectedParamInfo,
        },
      });
    });

    it('should extract function arg names for multiple execution payloads', async () => {
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
              name: 'burn',
              to: mockAddress('0x222'),
              args: [25],
            },
          ],
        },
      ];

      const mintParamInfo = [mockParamInfo('amount', 'Field')];
      const burnParamInfo = [mockParamInfo('amount', 'Field')];

      mockGetEnhancedParameterInfo.mockResolvedValueOnce(mintParamInfo).mockResolvedValueOnce(burnParamInfo);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledWith(mockPxe, '0x111', 'mint');
      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledWith(mockPxe, '0x222', 'burn');
      expect(result).toEqual({
        '0x111': {
          mint: mintParamInfo,
        },
        '0x222': {
          burn: burnParamInfo,
        },
      });
    });

    it('should handle multiple calls in single execution payload', async () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'approve',
              to: mockAddress('0xAAA'),
              args: ['0xBBB', 100],
            },
            {
              name: 'transferFrom',
              to: mockAddress('0xAAA'),
              args: ['0xCCC', '0xDDD', 50],
            },
          ],
        },
      ];

      const approveParams = [mockParamInfo('spender', 'AztecAddress'), mockParamInfo('amount', 'Field')];
      const transferFromParams = [
        mockParamInfo('from', 'AztecAddress'),
        mockParamInfo('to', 'AztecAddress'),
        mockParamInfo('amount', 'Field'),
      ];

      mockGetEnhancedParameterInfo
        .mockResolvedValueOnce(approveParams)
        .mockResolvedValueOnce(transferFromParams);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      expect(result).toEqual({
        '0xAAA': {
          approve: approveParams,
          transferFrom: transferFromParams,
        },
      });
    });

    it('should handle calls to different contracts', async () => {
      const executionPayloads = [
        {
          calls: [
            {
              name: 'functionA',
              to: mockAddress('0x111'),
              args: [1],
            },
            {
              name: 'functionB',
              to: mockAddress('0x222'),
              args: [2],
            },
          ],
        },
      ];

      const paramsA = [mockParamInfo('paramA', 'Field')];
      const paramsB = [mockParamInfo('paramB', 'Field')];

      mockGetEnhancedParameterInfo.mockResolvedValueOnce(paramsA).mockResolvedValueOnce(paramsB);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      expect(result).toEqual({
        '0x111': {
          functionA: paramsA,
        },
        '0x222': {
          functionB: paramsB,
        },
      });
    });

    it('should skip execution payloads without calls', async () => {
      const executionPayloads = [
        {},
        {
          calls: [
            {
              name: 'test',
              to: mockAddress('0x123'),
              args: [],
            },
          ],
        },
      ];

      const params = [mockParamInfo('param', 'Field')];
      mockGetEnhancedParameterInfo.mockResolvedValue(params);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledOnce();
      expect(result).toEqual({
        '0x123': {
          test: params,
        },
      });
    });

    it('should skip calls without to or name', async () => {
      const executionPayloads = [
        {
          calls: [
            {
              // Missing name
              to: mockAddress('0x123'),
              args: [],
            } as any,
            {
              name: 'validFunction',
              // Missing to
              args: [],
            } as any,
            {
              name: 'test',
              to: mockAddress('0x456'),
              args: [],
            },
          ],
        },
      ];

      const params = [mockParamInfo('param', 'Field')];
      mockGetEnhancedParameterInfo.mockResolvedValue(params);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      // Should only be called for the valid call
      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledOnce();
      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledWith(mockPxe, '0x456', 'test');
      expect(result).toEqual({
        '0x456': {
          test: params,
        },
      });
    });

    it('should continue on error for individual calls', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const executionPayloads = [
        {
          calls: [
            {
              name: 'failingFunction',
              to: mockAddress('0x111'),
              args: [],
            },
            {
              name: 'successFunction',
              to: mockAddress('0x222'),
              args: [],
            },
          ],
        },
      ];

      const params = [mockParamInfo('param', 'Field')];
      mockGetEnhancedParameterInfo
        .mockRejectedValueOnce(new Error('Contract not found'))
        .mockResolvedValueOnce(params);

      const result = await extractFunctionArgNamesForBatch(mockPxe, executionPayloads);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to get parameter info for failingFunction:',
        expect.any(Error),
      );
      expect(result).toEqual({
        '0x222': {
          successFunction: params,
        },
      });

      consoleWarnSpy.mockRestore();
    });

    it('should return empty object for empty execution payloads array', async () => {
      const result = await extractFunctionArgNamesForBatch(mockPxe, []);
      expect(result).toEqual({});
      expect(mockGetEnhancedParameterInfo).not.toHaveBeenCalled();
    });
  });

  describe('extractFunctionArgNamesForSingle', () => {
    it('should extract function arg names for single execution payload', async () => {
      const executionPayload = {
        calls: [
          {
            name: 'transfer',
            to: mockAddress('0xABC'),
            args: [100, '0xDEF'],
          },
        ],
      };

      const expectedParamInfo = [mockParamInfo('amount', 'Field'), mockParamInfo('to', 'AztecAddress')];
      mockGetEnhancedParameterInfo.mockResolvedValue(expectedParamInfo);

      const result = await extractFunctionArgNamesForSingle(mockPxe, executionPayload);

      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledWith(mockPxe, '0xABC', 'transfer');
      expect(result).toEqual({
        '0xABC': {
          transfer: expectedParamInfo,
        },
      });
    });

    it('should handle multiple calls', async () => {
      const executionPayload = {
        calls: [
          {
            name: 'approve',
            to: mockAddress('0x111'),
            args: ['0x222', 500],
          },
          {
            name: 'transfer',
            to: mockAddress('0x111'),
            args: [250],
          },
        ],
      };

      const approveParams = [mockParamInfo('spender', 'AztecAddress'), mockParamInfo('amount', 'Field')];
      const transferParams = [mockParamInfo('amount', 'Field')];

      mockGetEnhancedParameterInfo.mockResolvedValueOnce(approveParams).mockResolvedValueOnce(transferParams);

      const result = await extractFunctionArgNamesForSingle(mockPxe, executionPayload);

      expect(result).toEqual({
        '0x111': {
          approve: approveParams,
          transfer: transferParams,
        },
      });
    });

    it('should return empty object for execution payload without calls', async () => {
      const result = await extractFunctionArgNamesForSingle(mockPxe, {});
      expect(result).toEqual({});
      expect(mockGetEnhancedParameterInfo).not.toHaveBeenCalled();
    });

    it('should return empty object for undefined execution payload', async () => {
      const result = await extractFunctionArgNamesForSingle(mockPxe, undefined as any);
      expect(result).toEqual({});
      expect(mockGetEnhancedParameterInfo).not.toHaveBeenCalled();
    });

    it('should skip calls without to or name', async () => {
      const executionPayload = {
        calls: [
          {
            name: 'validFunction',
            to: mockAddress('0x123'),
            args: [],
          },
          {
            // Missing name
            to: mockAddress('0x456'),
            args: [],
          } as any,
        ],
      };

      const params = [mockParamInfo('param', 'Field')];
      mockGetEnhancedParameterInfo.mockResolvedValue(params);

      const result = await extractFunctionArgNamesForSingle(mockPxe, executionPayload);

      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledOnce();
      expect(result).toEqual({
        '0x123': {
          validFunction: params,
        },
      });
    });

    it('should continue on error for individual calls', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const executionPayload = {
        calls: [
          {
            name: 'failingFunction',
            to: mockAddress('0x111'),
            args: [],
          },
          {
            name: 'successFunction',
            to: mockAddress('0x222'),
            args: [],
          },
        ],
      };

      const params = [mockParamInfo('param', 'Field')];
      mockGetEnhancedParameterInfo
        .mockRejectedValueOnce(new Error('ABI not found'))
        .mockResolvedValueOnce(params);

      const result = await extractFunctionArgNamesForSingle(mockPxe, executionPayload);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to get parameter info for failingFunction:',
        expect.any(Error),
      );
      expect(result).toEqual({
        '0x222': {
          successFunction: params,
        },
      });

      consoleWarnSpy.mockRestore();
    });
  });

  describe('createFunctionArgNamesMiddleware', () => {
    let middleware: ReturnType<typeof createFunctionArgNamesMiddleware>;
    let mockNext: ReturnType<typeof vi.fn>;
    let mockContext: AztecHandlerContext & { functionCallArgNames?: FunctionArgNames };

    beforeEach(() => {
      middleware = createFunctionArgNamesMiddleware(mockPxe);
      mockNext = vi.fn().mockResolvedValue({ result: 'success' });
      mockContext = {} as any;
      mockGetEnhancedParameterInfo.mockClear();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should extract function arg names for aztec_wmExecuteTx', async () => {
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

      const params = [mockParamInfo('amount', 'Field')];
      mockGetEnhancedParameterInfo.mockResolvedValue(params);

      await middleware(mockContext, request, mockNext);

      expect(mockGetEnhancedParameterInfo).toHaveBeenCalledWith(mockPxe, '0x123', 'transfer');
      expect(mockContext.functionCallArgNames).toEqual({
        '0x123': {
          transfer: params,
        },
      });
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should extract function arg names for aztec_wmSimulateTx', async () => {
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

      const params = [mockParamInfo('value', 'Field')];
      mockGetEnhancedParameterInfo.mockResolvedValue(params);

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({
        '0xABC': {
          simulate: params,
        },
      });
    });

    it('should extract function arg names for aztec_wmBatchExecute', async () => {
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
                  name: 'burn',
                  to: mockAddress('0x222'),
                  args: [25],
                },
              ],
            },
          ],
        ],
      };

      const mintParams = [mockParamInfo('amount', 'Field')];
      const burnParams = [mockParamInfo('amount', 'Field')];

      mockGetEnhancedParameterInfo.mockResolvedValueOnce(mintParams).mockResolvedValueOnce(burnParams);

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({
        '0x111': {
          mint: mintParams,
        },
        '0x222': {
          burn: burnParams,
        },
      });
    });

    it('should handle aztec_wmDeployContract with artifact', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmDeployContract'> = {
        jsonrpc: '2.0',
        id: 4,
        method: 'aztec_wmDeployContract',
        params: [
          {
            artifact: {
              name: 'TokenContract',
              functions: [
                {
                  name: 'constructor',
                  isInitializer: true,
                  parameters: [
                    {
                      name: 'initialSupply',
                      type: { kind: 'field' },
                    },
                  ],
                },
              ],
            },
            args: [1000],
          } as any,
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({
        __deployment__: {
          TokenContract: [
            {
              name: 'initialSupply',
              abiType: { kind: 'field' },
              typeString: 'field',
            },
          ],
        },
      });
    });

    it('should handle aztec_wmDeployContract without constructor parameters', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmDeployContract'> = {
        jsonrpc: '2.0',
        id: 5,
        method: 'aztec_wmDeployContract',
        params: [
          {
            artifact: {
              name: 'SimpleContract',
              functions: [
                {
                  name: 'constructor',
                  isInitializer: true,
                },
              ],
            },
            args: [],
          } as any,
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({
        __deployment__: {
          SimpleContract: [
            {
              name: 'constructor',
              abiType: { kind: 'field' },
              typeString: 'constructor',
            },
          ],
        },
      });
    });

    it('should handle aztec_wmDeployContract without artifact functions', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmDeployContract'> = {
        jsonrpc: '2.0',
        id: 6,
        method: 'aztec_wmDeployContract',
        params: [
          {
            artifact: {
              name: 'MinimalContract',
            },
            args: [],
          } as any,
        ],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({
        __deployment__: {
          MinimalContract: [
            {
              name: 'constructor',
              abiType: { kind: 'field' },
              typeString: 'constructor',
            },
          ],
        },
      });
    });

    it('should not modify context for non-transaction methods', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAccounts'> = {
        jsonrpc: '2.0',
        id: 7,
        method: 'aztec_getAccounts',
        params: [],
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toBeUndefined();
      expect(mockGetEnhancedParameterInfo).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should handle errors gracefully and continue', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 8,
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

      mockGetEnhancedParameterInfo.mockRejectedValue(new Error('PXE connection failed'));

      await middleware(mockContext, request, mockNext);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to get parameter info for transfer:',
        expect.any(Error),
      );
      expect(mockContext.functionCallArgNames).toEqual({});
      expect(mockNext).toHaveBeenCalledOnce();

      consoleWarnSpy.mockRestore();
    });

    it('should return the result from next()', async () => {
      const expectedResult = { result: 'test-result' };
      mockNext.mockResolvedValue(expectedResult);

      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_getAccounts'> = {
        jsonrpc: '2.0',
        id: 9,
        method: 'aztec_getAccounts',
        params: [],
      };

      const result = await middleware(mockContext, request, mockNext);

      expect(result).toEqual(expectedResult);
    });

    it('should handle missing params gracefully', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 10,
        method: 'aztec_wmExecuteTx',
        params: undefined as any,
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({});
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should handle empty params array', async () => {
      const request: JSONRPCRequest<AztecWalletMethodMap, 'aztec_wmExecuteTx'> = {
        jsonrpc: '2.0',
        id: 11,
        method: 'aztec_wmExecuteTx',
        params: [] as any,
      };

      await middleware(mockContext, request, mockNext);

      expect(mockContext.functionCallArgNames).toEqual({});
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });
});
