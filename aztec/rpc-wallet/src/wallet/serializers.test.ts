import type { ContractArtifact } from '@aztec/aztec.js';
import { AuthWitness, AztecAddress, Fr } from '@aztec/aztec.js';
import { ExecutionPayload } from '@aztec/entrypoints/payload';
import { FunctionCall, FunctionSelector, FunctionType } from '@aztec/stdlib/abi';
import { Capsule, HashedValues } from '@aztec/stdlib/tx';
import { describe, expect, it } from 'vitest';
import { AztecWalletSerializer } from './serializers.js';

describe('ExecutionPayload Serialization', () => {
  it('should serialize and deserialize ExecutionPayload correctly', async () => {
    // Create test data for FunctionCall
    const functionCall = new FunctionCall(
      'transfer',
      AztecAddress.fromString('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'),
      FunctionSelector.fromField(new Fr(0x12345678)), // Use a valid 4-byte value
      FunctionType.PRIVATE,
      false,
      [Fr.random(), Fr.random()],
      [],
    );

    // Create test data for ExecutionPayload
    const executionPayload = new ExecutionPayload(
      [functionCall],
      [AuthWitness.random()],
      [
        new Capsule(
          AztecAddress.fromString('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'),
          Fr.random(),
          [Fr.random()],
        ),
      ],
      [HashedValues.random()],
    );

    // Test params serialization - simulate the actual parameter structure
    const params = { executionPayload };
    const serializedParams = await AztecWalletSerializer.params.serialize('aztec_wmExecuteTx', params);

    // Test params deserialization
    const deserializedParams = await AztecWalletSerializer.params.deserialize(
      'aztec_wmExecuteTx',
      serializedParams,
    );

    expect(deserializedParams).toBeDefined();
    expect(Array.isArray(deserializedParams)).toBe(true);
    const paramsArray = deserializedParams as unknown[];
    expect(paramsArray).toHaveLength(1);
    const result = paramsArray[0] as ExecutionPayload;

    // Verify the structure is preserved
    expect(result).toBeDefined();
    expect(result.calls).toHaveLength(1);
    expect(result.authWitnesses).toHaveLength(1);
    expect(result.capsules).toHaveLength(1);
    expect(result.extraHashedArgs).toHaveLength(1);

    // Verify the function call data
    const deserializedCall = result.calls[0];
    expect(deserializedCall).toBeDefined();
    if (deserializedCall) {
      expect(deserializedCall.name).toBe(functionCall.name);
      expect(deserializedCall.type).toBe(functionCall.type);
      expect(deserializedCall.isStatic).toBe(functionCall.isStatic);
      expect(deserializedCall.args).toHaveLength(2);
    }
  });

  it('should handle ExecutionPayload with empty extraHashedArgs', async () => {
    const executionPayload = new ExecutionPayload(
      [],
      [],
      [],
      // Note: extraHashedArgs is optional and defaults to []
    );

    // Test params serialization - simulate the actual parameter structure
    const params = { executionPayload };
    const serializedParams = await AztecWalletSerializer.params.serialize('aztec_wmExecuteTx', params);

    const deserializedParams = await AztecWalletSerializer.params.deserialize(
      'aztec_wmExecuteTx',
      serializedParams,
    );

    expect(deserializedParams).toBeDefined();
    expect(Array.isArray(deserializedParams)).toBe(true);
    const paramsArray = deserializedParams as unknown[];
    const result = paramsArray[0] as ExecutionPayload;
    expect(result.extraHashedArgs).toEqual([]);
  });
});

describe('DeployContract Serialization', () => {
  it('should serialize and deserialize aztec_wmDeployContract params correctly', async () => {
    // Create a minimal valid ContractArtifact
    const artifact: ContractArtifact = {
      name: 'TestContract',
      functions: [
        {
          name: 'constructor',
          functionType: FunctionType.PRIVATE,
          isInternal: false,
          isStatic: false,
          isInitializer: true,
          parameters: [
            {
              name: 'owner',
              type: { kind: 'field' },
              visibility: 'private',
            },
          ],
          returnTypes: [],
          errorTypes: {},
          bytecode: Buffer.from('test'),
          debugSymbols: '',
        },
      ],
      nonDispatchPublicFunctions: [],
      outputs: {
        structs: {},
        globals: {},
      },
      storageLayout: {},
      notes: {},
      fileMap: {},
    };

    const args = [AztecAddress.random().toString(), '12345'];
    const constructorName = 'constructor';

    // Test params serialization
    const params = { artifact, args, constructorName };
    const serializedParams = await AztecWalletSerializer.params.serialize('aztec_wmDeployContract', params);

    // Test params deserialization
    const deserializedParams = await AztecWalletSerializer.params.deserialize(
      'aztec_wmDeployContract',
      serializedParams,
    );

    expect(deserializedParams).toBeDefined();
    expect(Array.isArray(deserializedParams)).toBe(true);
    const paramsArray = deserializedParams as unknown[];
    expect(paramsArray).toHaveLength(1);

    const result = paramsArray[0] as {
      artifact: ContractArtifact;
      args: unknown[];
      constructorName?: string;
    };

    // Verify the artifact structure
    expect(result.artifact).toBeDefined();
    expect(result.artifact.name).toBe('TestContract');
    expect(result.artifact.functions).toHaveLength(1);
    expect(result.artifact.functions[0]?.name).toBe('constructor');
    expect(result.artifact.functions[0]?.isInitializer).toBe(true);

    // Verify args
    expect(result.args).toEqual(args);

    // Verify constructorName
    expect(result.constructorName).toBe(constructorName);
  });

  it('should handle aztec_wmDeployContract without constructorName', async () => {
    const artifact: ContractArtifact = {
      name: 'TestContract',
      functions: [],
      nonDispatchPublicFunctions: [],
      outputs: {
        structs: {},
        globals: {},
      },
      storageLayout: {},
      notes: {},
      fileMap: {},
    };

    const args: unknown[] = [];

    // Test without constructorName
    const params = { artifact, args };
    const serializedParams = await AztecWalletSerializer.params.serialize('aztec_wmDeployContract', params);

    const deserializedParams = await AztecWalletSerializer.params.deserialize(
      'aztec_wmDeployContract',
      serializedParams,
    );

    const paramsArray = deserializedParams as unknown[];
    const result = paramsArray[0] as {
      artifact: ContractArtifact;
      args: unknown[];
      constructorName?: string;
    };

    expect(result.constructorName).toBeUndefined();
    expect(result.args).toEqual([]);
  });

  it('should throw error for invalid ContractArtifact in aztec_wmDeployContract', async () => {
    const invalidArtifact = {
      // Missing required fields like 'name'
      functions: [],
    };

    const args: unknown[] = [];
    const params = { artifact: invalidArtifact, args };
    const serializedParams = await AztecWalletSerializer.params.serialize('aztec_wmDeployContract', params);

    // Should throw when deserializing with invalid artifact
    await expect(
      AztecWalletSerializer.params.deserialize('aztec_wmDeployContract', serializedParams),
    ).rejects.toThrow();
  });

  it('should validate args array in aztec_wmDeployContract', async () => {
    const artifact: ContractArtifact = {
      name: 'TestContract',
      functions: [],
      nonDispatchPublicFunctions: [],
      outputs: {
        structs: {},
        globals: {},
      },
      storageLayout: {},
      notes: {},
      fileMap: {},
    };

    // Test with various types in args array
    const args = ['string value', 123, true, { nested: 'object' }, ['array', 'of', 'values'], null];

    const params = { artifact, args };
    const serializedParams = await AztecWalletSerializer.params.serialize('aztec_wmDeployContract', params);

    const deserializedParams = await AztecWalletSerializer.params.deserialize(
      'aztec_wmDeployContract',
      serializedParams,
    );

    const paramsArray = deserializedParams as unknown[];
    const result = paramsArray[0] as { artifact: ContractArtifact; args: unknown[] };

    // z.array(z.any()) should accept any values
    expect(result.args).toEqual(args);
  });
});
