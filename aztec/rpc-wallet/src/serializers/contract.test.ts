import { describe, expect, it } from 'vitest';
import { Fr, AztecAddress } from '@aztec/aztec.js';
import { Buffer } from 'node:buffer';
import {
  aztecGetContractInstanceSerializer,
  aztecGetContractClassSerializer,
  aztecGetContractArtifactSerializer,
  aztecRegisterContractSerializer,
} from './contract.js';
import {
  getContractClassFromArtifact,
  ContractClassWithIdSchema,
  ContractInstanceWithAddressSchema,
  SerializableContractInstance,
} from '@aztec/circuits.js';
import {
  ContractArtifact,
  ContractArtifactSchema,
  type FieldLayout,
  type ContractNote,
} from '@aztec/foundation/abi';
import { randomContractArtifact, randomDeployedContract } from '@aztec/circuit-types';
describe('Contract Serializers', () => {
  describe('aztec_getContractInstance', () => {
    it('should serialize and deserialize params', async () => {
      const address = await AztecAddress.random();
      const params = { address };

      const serialized = aztecGetContractInstanceSerializer.params.serialize(
        'aztec_getContractInstance',
        params,
      );
      expect(serialized.method).toBe('aztec_getContractInstance');

      const deserialized = aztecGetContractInstanceSerializer.params.deserialize(
        'aztec_getContractInstance',
        serialized,
      );
      expect(deserialized.address.toString()).toBe(address.toString());
    });

    it('should serialize and deserialize result', async () => {
      // Create a contract instance with all required fields
      const result = (await SerializableContractInstance.random()).withAddress(await AztecAddress.random());

      const serialized = aztecGetContractInstanceSerializer.result.serialize(
        'aztec_getContractInstance',
        result,
      );
      expect(serialized.method).toBe('aztec_getContractInstance');

      const deserialized = aztecGetContractInstanceSerializer.result.deserialize(
        'aztec_getContractInstance',
        serialized,
      );
      expect(deserialized.address.toString()).toBe(result.address.toString());
      expect(deserialized.contractClassId.toString()).toBe(result.contractClassId.toString());
      expect(deserialized.deployer.toString()).toBe(result.deployer.toString());
      expect(deserialized.salt.toString()).toBe(result.salt.toString());
      expect(deserialized.version).toBe(result.version);
    });
  });

  describe('aztec_getContractClass', () => {
    it('should serialize and deserialize params', async () => {
      const id = await Fr.random();
      const params = { id };

      const serialized = aztecGetContractClassSerializer.params.serialize('aztec_getContractClass', params);
      expect(serialized.method).toBe('aztec_getContractClass');

      const deserialized = aztecGetContractClassSerializer.params.deserialize(
        'aztec_getContractClass',
        serialized,
      );
      expect(deserialized.id.toString()).toBe(id.toString());
    });

    it('should serialize and deserialize result', async () => {
      const artifact = await randomContractArtifact();
      const result = getContractClassFromArtifact(artifact);
      const serialized = aztecGetContractClassSerializer.result.serialize('aztec_getContractClass', result);
      expect(serialized.method).toBe('aztec_getContractClass');

      const deserialized = aztecGetContractClassSerializer.result.deserialize(
        'aztec_getContractClass',
        serialized,
      );
      expect(deserialized.artifactHash.toString()).toEqual(result.artifactHash.toString());
      expect(deserialized.id.toString()).toEqual(result.id.toString());
      expect(deserialized.privateFunctions).toEqual(result.privateFunctions);
      expect(deserialized.publicFunctions).toEqual(result.publicFunctions);
      expect(deserialized.packedBytecode).toEqual(result.packedBytecode);
    });
  });

  describe('aztec_getContractArtifact', () => {
    it('should serialize and deserialize params', async () => {
      const id = await Fr.random();
      const serialized = aztecGetContractArtifactSerializer.params.serialize('aztec_getContractArtifact', {
        id,
      });
      expect(serialized.method).toBe('aztec_getContractArtifact');

      const deserialized = aztecGetContractArtifactSerializer.params.deserialize(
        'aztec_getContractArtifact',
        serialized,
      );
      expect(deserialized.id.toString()).toBe(id.toString());
    });

    it('should serialize and deserialize result', async () => {
      const result = await randomContractArtifact();
      const serialized = aztecGetContractArtifactSerializer.result.serialize(
        'aztec_getContractArtifact',
        result,
      );
      expect(serialized.method).toBe('aztec_getContractArtifact');

      const deserialized = aztecGetContractArtifactSerializer.result.deserialize(
        'aztec_getContractArtifact',
        serialized,
      );
      expect(ContractArtifactSchema.parse(deserialized)).toEqual(result);
    });
  });

  describe('aztec_registerContract', () => {
    it('should serialize and deserialize params', async () => {
      const { instance, artifact } = await randomDeployedContract();
      const serialized = aztecRegisterContractSerializer.params.serialize('aztec_registerContract', {
        instance,
        artifact,
      });
      expect(serialized.method).toBe('aztec_registerContract');

      const deserialized = aztecRegisterContractSerializer.params.deserialize(
        'aztec_registerContract',
        serialized,
      );
      expect(deserialized.instance.address.toString()).toBe(instance.address.toString());
      expect(deserialized.instance.contractClassId.toString()).toBe(instance.contractClassId.toString());
      expect(deserialized.instance.deployer.toString()).toBe(instance.deployer.toString());
      expect(deserialized.artifact).toEqual(artifact);
    });

    it('should serialize and deserialize result', () => {
      const result = true;

      const serialized = aztecRegisterContractSerializer.result.serialize('aztec_registerContract', result);
      expect(serialized.method).toBe('aztec_registerContract');

      const deserialized = aztecRegisterContractSerializer.result.deserialize(
        'aztec_registerContract',
        serialized,
      );
      expect(deserialized).toBe(result);
    });
  });
});
