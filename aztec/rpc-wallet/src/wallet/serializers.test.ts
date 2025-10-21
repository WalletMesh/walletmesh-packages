import type { ContractArtifact } from '@aztec/aztec.js';
import { AuthWitness, AztecAddress, Fr, TxHash } from '@aztec/aztec.js';
import { ExecutionPayload } from '@aztec/entrypoints/payload';
import { emptyFunctionArtifact, FunctionCall, FunctionSelector, FunctionType } from '@aztec/stdlib/abi';
import { randomContractArtifact } from '@aztec/stdlib/testing';
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
    expect(paramsArray).toHaveLength(2); // Now returns [executionPayload, sendOptions]
    const result = paramsArray[0] as ExecutionPayload;
    const sendOptions = paramsArray[1]; // Should be undefined when not provided
    expect(sendOptions).toBeUndefined(); // sendOptions was not provided in this test

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
    const artifact: ContractArtifact = await randomContractArtifact();

    const args = [AztecAddress.random().toString(), '12345'];
    const constructorName = 'constructor';
    const functionArtifact = emptyFunctionArtifact();
    functionArtifact.name = constructorName;
    functionArtifact.functionType = FunctionType.PUBLIC;
    functionArtifact.isInitializer = true;
    artifact.functions.push(functionArtifact);

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
    expect(result.artifact.name).toBe(artifact.name);
    expect(result.artifact.functions).toHaveLength(1);
    expect(result.artifact.functions[0]?.name).toBe('constructor');
    expect(result.artifact.functions[0]?.isInitializer).toBe(true);

    // Verify args
    expect(result.args).toEqual(args);

    // Verify constructorName
    expect(result.constructorName).toBe(constructorName);
  });

  it('should handle aztec_wmDeployContract without constructorName', async () => {
    const artifact: ContractArtifact = await randomContractArtifact();

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
    const artifact: ContractArtifact = await randomContractArtifact();

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

describe('ExecuteTx Result Serialization', () => {
  it('should serialize and deserialize aztec_wmExecuteTx result correctly', async () => {
    // Create test data for the result
    const txHash = TxHash.random();
    const txStatusId = crypto.randomUUID();
    const result = { txHash, txStatusId };

    // Test result serialization
    const serializedResult = await AztecWalletSerializer.result!.serialize('aztec_wmExecuteTx', result);

    // Test result deserialization
    const deserializedResult = (await AztecWalletSerializer.result!.deserialize(
      'aztec_wmExecuteTx',
      serializedResult,
    )) as { txHash: TxHash; txStatusId: string };

    // Verify the structure is preserved
    expect(deserializedResult).toBeDefined();
    expect(deserializedResult.txHash).toBeDefined();
    expect(deserializedResult.txStatusId).toBe(txStatusId);

    // Verify TxHash is properly reconstructed
    expect(deserializedResult.txHash.toString()).toBe(txHash.toString());
  });

  it('should handle different txStatusId formats', async () => {
    const txHash = TxHash.random();

    // Test with various UUID formats
    const testCases = [crypto.randomUUID(), '550e8400-e29b-41d4-a716-446655440000', 'custom-status-id-123'];

    for (const txStatusId of testCases) {
      const result = { txHash, txStatusId };
      const serializedResult = await AztecWalletSerializer.result!.serialize('aztec_wmExecuteTx', result);
      const deserializedResult = (await AztecWalletSerializer.result!.deserialize(
        'aztec_wmExecuteTx',
        serializedResult,
      )) as { txHash: TxHash; txStatusId: string };

      expect(deserializedResult.txStatusId).toBe(txStatusId);
      expect(deserializedResult.txHash.toString()).toBe(txHash.toString());
    }
  });

  it('should match the type definition from AztecWalletMethodMap', async () => {
    // This test ensures the serializer produces a result that matches the type definition
    const txHash = TxHash.random();
    const txStatusId = crypto.randomUUID();
    const result = { txHash, txStatusId };

    const serializedResult = await AztecWalletSerializer.result!.serialize('aztec_wmExecuteTx', result);
    const deserializedResult = (await AztecWalletSerializer.result!.deserialize(
      'aztec_wmExecuteTx',
      serializedResult,
    )) as { txHash: TxHash; txStatusId: string };

    // Type assertion to ensure it matches the expected shape
    const _typeCheck: { txHash: TxHash; txStatusId: string } = deserializedResult;
    expect(_typeCheck).toBeDefined();
  });
});

describe('DeployContract Result Serialization', () => {
  it('should serialize and deserialize aztec_wmDeployContract result correctly', async () => {
    // Create test data for the result
    const txHash = TxHash.random();
    const contractAddress = await AztecAddress.random();
    const txStatusId = crypto.randomUUID();
    const result = { txHash, contractAddress, txStatusId };

    // Test result serialization
    const serializedResult = await AztecWalletSerializer.result!.serialize('aztec_wmDeployContract', result);

    // Test result deserialization
    const deserializedResult = (await AztecWalletSerializer.result!.deserialize(
      'aztec_wmDeployContract',
      serializedResult,
    )) as { txHash: TxHash; contractAddress: AztecAddress; txStatusId: string };

    // Verify the structure is preserved
    expect(deserializedResult).toBeDefined();
    expect(deserializedResult.txHash).toBeDefined();
    expect(deserializedResult.contractAddress).toBeDefined();
    expect(deserializedResult.txStatusId).toBe(txStatusId);

    // Verify TxHash and AztecAddress are properly reconstructed
    expect(deserializedResult.txHash.toString()).toBe(txHash.toString());
    expect(deserializedResult.contractAddress.toString()).toBe(contractAddress.toString());
  });

  it('should handle different txStatusId formats', async () => {
    const txHash = TxHash.random();
    const contractAddress = await AztecAddress.random();

    // Test with various UUID formats
    const testCases = [
      crypto.randomUUID(),
      '550e8400-e29b-41d4-a716-446655440000',
      'custom-deployment-id-456',
    ];

    for (const txStatusId of testCases) {
      const result = { txHash, contractAddress, txStatusId };
      const serializedResult = await AztecWalletSerializer.result!.serialize(
        'aztec_wmDeployContract',
        result,
      );
      const deserializedResult = (await AztecWalletSerializer.result!.deserialize(
        'aztec_wmDeployContract',
        serializedResult,
      )) as { txHash: TxHash; contractAddress: AztecAddress; txStatusId: string };

      expect(deserializedResult.txStatusId).toBe(txStatusId);
      expect(deserializedResult.txHash.toString()).toBe(txHash.toString());
      expect(deserializedResult.contractAddress.toString()).toBe(contractAddress.toString());
    }
  });

  it('should match the type definition from AztecWalletMethodMap', async () => {
    // This test ensures the serializer produces a result that matches the type definition
    const txHash = TxHash.random();
    const contractAddress = await AztecAddress.random();
    const txStatusId = crypto.randomUUID();
    const result = { txHash, contractAddress, txStatusId };

    const serializedResult = await AztecWalletSerializer.result!.serialize('aztec_wmDeployContract', result);
    const deserializedResult = (await AztecWalletSerializer.result!.deserialize(
      'aztec_wmDeployContract',
      serializedResult,
    )) as { txHash: TxHash; contractAddress: AztecAddress; txStatusId: string };

    // Type assertion to ensure it matches the expected shape
    const _typeCheck: { txHash: TxHash; contractAddress: AztecAddress; txStatusId: string } =
      deserializedResult;
    expect(_typeCheck).toBeDefined();
  });
});
