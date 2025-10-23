import { describe, expect, it } from 'vitest';
import {
  extractBatchExecuteParams,
  extractDeployContractParams,
  extractExecuteTxParams,
  extractRouterLevelParams,
  extractSimulateTxParams,
  isAztecWalletMeshMethod,
  type BatchExecuteParams,
  type DeployContractParams,
  type ExecuteTxParams,
  type ExecutionPayload,
  type SimulateTxParams,
} from './routerLevelExtractors.js';

describe('routerLevelExtractors', () => {
  describe('extractBatchExecuteParams', () => {
    it('should extract valid batch execute params with executionPayloads', () => {
      const mockPayload: ExecutionPayload = {
        calls: [
          {
            name: 'mint',
            to: '0x123',
            args: [1, 2, 3],
            selector: '0xabc',
          },
        ],
        authWitnesses: [],
        capsules: [],
      };

      const methodParams = [
        {
          executionPayloads: [mockPayload],
        },
      ];

      const result = extractBatchExecuteParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayloads).toHaveLength(1);
      expect(result?.executionPayloads?.[0]).toEqual(mockPayload);
    });

    it('should extract params with sendOptions', () => {
      const methodParams = [
        {
          executionPayloads: [],
          sendOptions: { fee: 100 },
        },
      ];

      const result = extractBatchExecuteParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayloads).toEqual([]);
      expect(result?.sendOptions).toEqual({ fee: 100 });
    });

    it('should return undefined for non-array params', () => {
      const result = extractBatchExecuteParams('not-an-array');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array params', () => {
      const result = extractBatchExecuteParams([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-object first element', () => {
      const result = extractBatchExecuteParams(['string']);
      expect(result).toBeUndefined();
    });

    it('should return undefined for null first element', () => {
      const result = extractBatchExecuteParams([null]);
      expect(result).toBeUndefined();
    });

    it('should return undefined if executionPayloads is not an array', () => {
      const methodParams = [
        {
          executionPayloads: 'not-an-array',
        },
      ];

      const result = extractBatchExecuteParams(methodParams);
      expect(result).toBeUndefined();
    });

    it('should handle missing executionPayloads', () => {
      const methodParams = [
        {
          sendOptions: { fee: 100 },
        },
      ];

      const result = extractBatchExecuteParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayloads).toBeUndefined();
      expect(result?.sendOptions).toEqual({ fee: 100 });
    });
  });

  describe('extractExecuteTxParams', () => {
    it('should extract valid execute tx params with executionPayload', () => {
      const mockPayload: ExecutionPayload = {
        calls: [
          {
            name: 'transfer',
            to: '0x456',
            args: [100],
          },
        ],
      };

      const methodParams = [
        {
          executionPayload: mockPayload,
        },
      ];

      const result = extractExecuteTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toEqual(mockPayload);
    });

    it('should extract params with sendOptions', () => {
      const mockPayload: ExecutionPayload = { calls: [] };
      const methodParams = [
        {
          executionPayload: mockPayload,
          sendOptions: { gasLimit: 1000 },
        },
      ];

      const result = extractExecuteTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toEqual(mockPayload);
      expect(result?.sendOptions).toEqual({ gasLimit: 1000 });
    });

    it('should return undefined for non-array params', () => {
      const result = extractExecuteTxParams({ executionPayload: {} });
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array params', () => {
      const result = extractExecuteTxParams([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-object first element', () => {
      const result = extractExecuteTxParams([123]);
      expect(result).toBeUndefined();
    });

    it('should return undefined if executionPayload is not an object', () => {
      const methodParams = [
        {
          executionPayload: 'invalid',
        },
      ];

      const result = extractExecuteTxParams(methodParams);
      expect(result).toBeUndefined();
    });

    it('should return undefined if executionPayload is null', () => {
      const methodParams = [
        {
          executionPayload: null,
        },
      ];

      const result = extractExecuteTxParams(methodParams);
      expect(result).toBeUndefined();
    });

    it('should handle missing executionPayload', () => {
      const methodParams = [
        {
          sendOptions: { fee: 50 },
        },
      ];

      const result = extractExecuteTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toBeUndefined();
      expect(result?.sendOptions).toEqual({ fee: 50 });
    });
  });

  describe('extractSimulateTxParams', () => {
    it('should extract valid simulate tx params with executionPayload', () => {
      const mockPayload: ExecutionPayload = {
        calls: [
          {
            name: 'simulate',
            to: '0x789',
            args: [],
          },
        ],
      };

      const methodParams = [
        {
          executionPayload: mockPayload,
        },
      ];

      const result = extractSimulateTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toEqual(mockPayload);
    });

    it('should return undefined for non-array params', () => {
      const result = extractSimulateTxParams('not-an-array');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array params', () => {
      const result = extractSimulateTxParams([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-object first element', () => {
      const result = extractSimulateTxParams([true]);
      expect(result).toBeUndefined();
    });

    it('should return undefined if executionPayload is not an object', () => {
      const methodParams = [
        {
          executionPayload: 42,
        },
      ];

      const result = extractSimulateTxParams(methodParams);
      expect(result).toBeUndefined();
    });

    it('should handle missing executionPayload', () => {
      const methodParams = [{}];

      const result = extractSimulateTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toBeUndefined();
    });
  });

  describe('extractDeployContractParams', () => {
    it('should extract valid deploy contract params', () => {
      const mockArtifact = {
        name: 'TestContract',
        functions: [],
      };

      const methodParams = [
        {
          artifact: mockArtifact,
          args: [1, 'test', true],
          constructorName: 'initialize',
        },
      ];

      const result = extractDeployContractParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.artifact).toEqual(mockArtifact);
      expect(result?.args).toEqual([1, 'test', true]);
      expect(result?.constructorName).toBe('initialize');
    });

    it('should handle missing optional fields', () => {
      const mockArtifact = { name: 'Contract' };
      const methodParams = [
        {
          artifact: mockArtifact,
          args: [],
        },
      ];

      const result = extractDeployContractParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.artifact).toEqual(mockArtifact);
      expect(result?.args).toEqual([]);
      expect(result?.constructorName).toBeUndefined();
    });

    it('should return undefined for non-array params', () => {
      const result = extractDeployContractParams(null);
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty array params', () => {
      const result = extractDeployContractParams([]);
      expect(result).toBeUndefined();
    });

    it('should return undefined for non-object first element', () => {
      const result = extractDeployContractParams([[]]);
      expect(result).toBeUndefined();
    });

    it('should return undefined if args is not an array', () => {
      const methodParams = [
        {
          artifact: {},
          args: 'not-an-array',
        },
      ];

      const result = extractDeployContractParams(methodParams);
      expect(result).toBeUndefined();
    });

    it('should handle all fields undefined', () => {
      const methodParams = [{}];

      const result = extractDeployContractParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.artifact).toBeUndefined();
      expect(result?.args).toBeUndefined();
      expect(result?.constructorName).toBeUndefined();
    });
  });

  describe('extractRouterLevelParams', () => {
    it('should dispatch to extractBatchExecuteParams for aztec_wmBatchExecute', () => {
      const methodParams = [
        {
          executionPayloads: [],
        },
      ];

      const result = extractRouterLevelParams('aztec_wmBatchExecute', methodParams);

      expect(result).toBeDefined();
      expect((result as BatchExecuteParams).executionPayloads).toBeDefined();
    });

    it('should dispatch to extractExecuteTxParams for aztec_wmExecuteTx', () => {
      const methodParams = [
        {
          executionPayload: { calls: [] },
        },
      ];

      const result = extractRouterLevelParams('aztec_wmExecuteTx', methodParams);

      expect(result).toBeDefined();
      expect((result as ExecuteTxParams).executionPayload).toBeDefined();
    });

    it('should dispatch to extractSimulateTxParams for aztec_wmSimulateTx', () => {
      const methodParams = [
        {
          executionPayload: { calls: [] },
        },
      ];

      const result = extractRouterLevelParams('aztec_wmSimulateTx', methodParams);

      expect(result).toBeDefined();
      expect((result as SimulateTxParams).executionPayload).toBeDefined();
    });

    it('should dispatch to extractDeployContractParams for aztec_wmDeployContract', () => {
      const methodParams = [
        {
          artifact: {},
          args: [],
        },
      ];

      const result = extractRouterLevelParams('aztec_wmDeployContract', methodParams);

      expect(result).toBeDefined();
      expect((result as DeployContractParams).artifact).toBeDefined();
    });

    it('should return undefined for invalid method params', () => {
      const result = extractRouterLevelParams('aztec_wmBatchExecute', 'invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('isAztecWalletMeshMethod', () => {
    it('should return true for aztec_wmBatchExecute', () => {
      expect(isAztecWalletMeshMethod('aztec_wmBatchExecute')).toBe(true);
    });

    it('should return true for aztec_wmExecuteTx', () => {
      expect(isAztecWalletMeshMethod('aztec_wmExecuteTx')).toBe(true);
    });

    it('should return true for aztec_wmSimulateTx', () => {
      expect(isAztecWalletMeshMethod('aztec_wmSimulateTx')).toBe(true);
    });

    it('should return true for aztec_wmDeployContract', () => {
      expect(isAztecWalletMeshMethod('aztec_wmDeployContract')).toBe(true);
    });

    it('should return false for non-WalletMesh methods', () => {
      expect(isAztecWalletMeshMethod('aztec_sendTx')).toBe(false);
      expect(isAztecWalletMeshMethod('aztec_proveTx')).toBe(false);
      expect(isAztecWalletMeshMethod('wm_connect')).toBe(false);
      expect(isAztecWalletMeshMethod('unknown_method')).toBe(false);
      expect(isAztecWalletMeshMethod('')).toBe(false);
    });
  });

  describe('Integration: Complex Scenarios', () => {
    it('should handle batch execute with multiple execution payloads', () => {
      const payload1: ExecutionPayload = {
        calls: [
          {
            name: 'mint',
            to: '0x123',
            args: [100],
          },
        ],
      };

      const payload2: ExecutionPayload = {
        calls: [
          {
            name: 'transfer',
            to: '0x456',
            args: [50],
          },
        ],
      };

      const methodParams = [
        {
          executionPayloads: [payload1, payload2],
          sendOptions: { fee: 200 },
        },
      ];

      const result = extractBatchExecuteParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayloads).toHaveLength(2);
      expect(result?.executionPayloads?.[0]).toEqual(payload1);
      expect(result?.executionPayloads?.[1]).toEqual(payload2);
      expect(result?.sendOptions).toEqual({ fee: 200 });
    });

    it('should handle execution payload with all fields', () => {
      const fullPayload: ExecutionPayload = {
        calls: [
          {
            name: 'complexFunction',
            to: { toString: () => '0xabc123' },
            args: [1, 'test', true, [1, 2, 3]],
            selector: '0x12345678',
            type: 'public',
            isStatic: false,
            returnTypes: [{ kind: 'field' }],
          },
        ],
        authWitnesses: [{ witness: 'data' }],
        capsules: [{ capsule: 'info' }],
        extraHashedArgs: [{ hash: 'value' }],
      };

      const methodParams = [
        {
          executionPayload: fullPayload,
        },
      ];

      const result = extractExecuteTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toEqual(fullPayload);
      expect(result?.executionPayload?.calls).toHaveLength(1);
      expect(result?.executionPayload?.authWitnesses).toHaveLength(1);
      expect(result?.executionPayload?.capsules).toHaveLength(1);
      expect(result?.executionPayload?.extraHashedArgs).toHaveLength(1);
    });

    it('should handle deploy contract with complex artifact', () => {
      const complexArtifact = {
        name: 'ComplexContract',
        version: '1.0.0',
        functions: [
          {
            name: 'initialize',
            parameters: [
              { name: 'owner', type: 'address' },
              { name: 'value', type: 'uint256' },
            ],
          },
        ],
        events: [],
      };

      const methodParams = [
        {
          artifact: complexArtifact,
          args: ['0xowner123', 1000],
          constructorName: 'initialize',
        },
      ];

      const result = extractDeployContractParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.artifact).toEqual(complexArtifact);
      expect(result?.args).toEqual(['0xowner123', 1000]);
      expect(result?.constructorName).toBe('initialize');
    });

    it('should gracefully handle malformed nested structures', () => {
      const methodParams = [
        {
          executionPayload: {
            calls: 'not-an-array', // Invalid: calls should be an array
          },
        },
      ];

      // Should still extract because we don't validate the internal structure of executionPayload
      const result = extractExecuteTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toEqual({ calls: 'not-an-array' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined params', () => {
      expect(extractBatchExecuteParams(undefined)).toBeUndefined();
      expect(extractExecuteTxParams(undefined)).toBeUndefined();
      expect(extractSimulateTxParams(undefined)).toBeUndefined();
      expect(extractDeployContractParams(undefined)).toBeUndefined();
    });

    it('should handle null params', () => {
      expect(extractBatchExecuteParams(null)).toBeUndefined();
      expect(extractExecuteTxParams(null)).toBeUndefined();
      expect(extractSimulateTxParams(null)).toBeUndefined();
      expect(extractDeployContractParams(null)).toBeUndefined();
    });

    it('should handle array with undefined first element', () => {
      expect(extractBatchExecuteParams([undefined])).toBeUndefined();
      expect(extractExecuteTxParams([undefined])).toBeUndefined();
      expect(extractSimulateTxParams([undefined])).toBeUndefined();
      expect(extractDeployContractParams([undefined])).toBeUndefined();
    });

    it('should handle array with multiple elements (only first is used)', () => {
      const methodParams = [
        {
          executionPayload: { calls: [] },
        },
        {
          // This second element should be ignored
          extra: 'data',
        },
      ];

      const result = extractExecuteTxParams(methodParams);

      expect(result).toBeDefined();
      expect(result?.executionPayload).toEqual({ calls: [] });
      expect((result as unknown as { extra: string }).extra).toBeUndefined();
    });

    it('should handle empty object params', () => {
      const methodParams = [{}];

      expect(extractBatchExecuteParams(methodParams)).toBeDefined();
      expect(extractExecuteTxParams(methodParams)).toBeDefined();
      expect(extractSimulateTxParams(methodParams)).toBeDefined();
      expect(extractDeployContractParams(methodParams)).toBeDefined();
    });
  });
});
