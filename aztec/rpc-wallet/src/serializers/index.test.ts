import { describe, expect, it, beforeEach } from 'vitest';
import { AztecWalletSerializer } from './index.js';
import { AztecAddress, Tx } from '@aztec/aztec.js';
import type { JSONRPCSerializer } from '@walletmesh/jsonrpc';
import type { AztecWalletMethodMap } from '../types.js';

describe('AztecWalletSerializer', () => {
  // Test known method (using aztec_setScopes as an example)
  const knownMethod = 'aztec_setScopes';

  // Test unknown method
  const unknownMethod = 'unknown_method';

  // Type assertion since we verify result exists in beforeEach
  const resultSerializer = (AztecWalletSerializer as Required<JSONRPCSerializer<unknown, unknown>>).result;

  describe('params', () => {
    it('should serialize params for known methods', async () => {
      const params = { scopes: [await AztecAddress.random()] };
      const result = await AztecWalletSerializer.params.serialize(knownMethod, params);
      expect(result).toBeDefined();
      expect(result.method).toBe(knownMethod);
      expect(typeof result.serialized).toBe('string');
    });

    it('should wrap unknown method params in JSONRPCSerializedData format', async () => {
      const params = { someParam: 'value' };
      const result = await AztecWalletSerializer.params.serialize(unknownMethod, params);
      expect(result).toBeDefined();
      expect(result.method).toBe(unknownMethod);
      expect(typeof result.serialized).toBe('string');
    });

    it('should pass through serialized data for unknown methods', async () => {
      const serializedData = { serialized: 'base64data', method: unknownMethod };
      const result = await AztecWalletSerializer.params.deserialize(unknownMethod, serializedData);
      expect(result).toEqual(serializedData);
    });

    it('should throw error when params serializer fails', async () => {
      const params = { scopes: undefined }; // Invalid - scopes must be an array
      await expect(AztecWalletSerializer.params.serialize(knownMethod, params)).rejects.toThrow(
        /Failed to serialize params/,
      );
    });

    it('should throw error when params deserializer fails', async () => {
      const serializedData = { serialized: 'invalid-data', method: knownMethod };
      await expect(AztecWalletSerializer.params.deserialize(knownMethod, serializedData)).rejects.toThrow(
        /Failed to deserialize params/,
      );
    });
  });

  describe('result', () => {
    beforeEach(() => {
      // Ensure result serializer exists
      expect(resultSerializer).toBeDefined();
    });

    it('should serialize result for known methods', async () => {
      const value = true;
      const result = await resultSerializer.serialize(knownMethod, value);
      expect(result).toBeDefined();
      expect(result.method).toBe(knownMethod);
      expect(typeof result.serialized).toBe('string');
    });

    it('should wrap unknown method result in JSONRPCSerializedData format', async () => {
      const testResult = { someResult: 'value' };
      const result = await resultSerializer.serialize(unknownMethod, testResult);
      expect(result).toBeDefined();
      expect(result.method).toBe(unknownMethod);
      expect(typeof result.serialized).toBe('string');
    });

    it('should pass through serialized data for unknown methods', async () => {
      const serializedData = { serialized: 'base64data', method: unknownMethod };
      const result = await resultSerializer.deserialize(unknownMethod, serializedData);
      expect(result).toEqual(serializedData);
    });

    it('should throw error when result serializer fails', async () => {
      interface CircularRef {
        ref: CircularRef | null;
      }
      const circular: CircularRef = { ref: null };
      circular.ref = circular; // Create circular reference which can't be JSON stringified
      await expect(resultSerializer.serialize(knownMethod, circular)).rejects.toThrow(
        /Failed to serialize result/,
      );
    });

    it('should throw error when result deserializer fails', async () => {
      const serializedData = { serialized: 'invalid-data', method: knownMethod };
      await expect(resultSerializer.deserialize(knownMethod, serializedData)).rejects.toThrow(
        /Failed to deserialize result/,
      );
    });
  });

  describe('integration', () => {
    it('should handle contract methods', async () => {
      const method = 'aztec_getContractMetadata';
      const params = { address: await AztecAddress.random() };

      const serializedParams = await AztecWalletSerializer.params.serialize(method, params);
      expect(serializedParams).toBeDefined();
      expect(serializedParams.method).toBe(method);
      expect(typeof serializedParams.serialized).toBe('string');

      const deserializedParams = (await AztecWalletSerializer.params.deserialize(
        method,
        serializedParams,
      )) as AztecWalletMethodMap['aztec_getContractMetadata']['params'];
      expect(deserializedParams.address.toString()).toBe(params.address.toString());
    });

    it('should handle transaction methods', async () => {
      const method = 'aztec_sendTx';
      const tx = await Tx.random();
      const params = { tx };

      const serializedParams = await AztecWalletSerializer.params.serialize(method, params);
      expect(serializedParams).toBeDefined();
      expect(serializedParams.method).toBe(method);
      expect(typeof serializedParams.serialized).toBe('string');

      const deserializedParams = (await AztecWalletSerializer.params.deserialize(
        method,
        serializedParams,
      )) as AztecWalletMethodMap['aztec_sendTx']['params'];
      expect(deserializedParams.tx.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
    });
  });
});
