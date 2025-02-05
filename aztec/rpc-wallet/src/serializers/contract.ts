import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import { ContractClassWithIdSchema, ContractInstanceWithAddressSchema } from '@aztec/circuits.js';
import { ContractArtifactSchema } from '@aztec/foundation/abi';
import { AztecAddress, Fr } from '@aztec/aztec.js';
import { jsonStringify, jsonParseWithSchema } from '@aztec/foundation/json-rpc';
import type { ZodFor } from '@aztec/foundation/schemas';
import type { ContractMetadata, ContractClassMetadata } from '@aztec/circuit-types';
import { z } from 'zod';

// Zod schemas for contract metadata serialization.
// These are copied from @aztec/circuit-types because they are not exported.
const ContractMetadataSchema = z.object({
  contractInstance: z.union([ContractInstanceWithAddressSchema, z.undefined()]),
  isContractInitialized: z.boolean(),
  isContractPubliclyDeployed: z.boolean(),
}) satisfies ZodFor<ContractMetadata>;

const ContractClassMetadataSchema = z.object({
  contractClass: z.union([ContractClassWithIdSchema, z.undefined()]),
  isContractClassPubliclyRegistered: z.boolean(),
  artifact: z.union([ContractArtifactSchema, z.undefined()]),
}) satisfies ZodFor<ContractClassMetadata>;

/**
 * Serializer for the aztec_getContractClassMetadata RPC method.
 * Handles serialization of contract class metadata queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetContractClassMetadataSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractClassMetadata']['params'],
      AztecWalletMethodMap['aztec_getContractClassMetadata']['result']
    >
{
  params = {
    /**
     * Serializes contract class metadata query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the class ID and artifact inclusion flag
     * @returns Serialized query parameters
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClassMetadata']['params'],
    ): Promise<JSONRPCSerializedData> =>
      Promise.resolve({
        method,
        serialized: JSON.stringify({
          id: value.id.toString(),
          includeArtifact: value.includeArtifact,
        }),
      }),
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getContractClassMetadata']['params']> => {
      const { id, includeArtifact } = JSON.parse(data.serialized);
      return {
        id: Fr.fromString(id),
        includeArtifact,
      };
    },
  };
  result = {
    /**
     * Serializes the contract class metadata query result.
     * @param method - The RPC method name
     * @param value - The contract class metadata including class definition and registration status
     * @returns Serialized contract class metadata
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClassMetadata']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getContractClassMetadata']['result']> => {
      return await jsonParseWithSchema(data.serialized, ContractClassMetadataSchema);
    },
  };
}

export class AztecGetContractMetadataSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractMetadata']['params'],
      AztecWalletMethodMap['aztec_getContractMetadata']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractMetadata']['params'],
    ): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value.address),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getContractMetadata']['params']> => {
      return {
        address: await jsonParseWithSchema(data.serialized, AztecAddress.schema),
      };
    },
  };

  result = {
    serialize: async (
      method: string,
      contractMetadata: AztecWalletMethodMap['aztec_getContractMetadata']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(contractMetadata),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getContractMetadata']['result']> => {
      return await jsonParseWithSchema(data.serialized, ContractMetadataSchema);
    },
  };
}

/**
 * Serializer for the aztec_registerContract RPC method.
 * Handles serialization of contract registration requests between JSON-RPC format and native Aztec types.
 */
export class AztecRegisterContractSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_registerContract']['params'],
      AztecWalletMethodMap['aztec_registerContract']['result']
    >
{
  params = {
    /**
     * Serializes contract registration parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing contract instance and optional artifact
     * @returns Serialized registration data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_registerContract']['params'],
    ): Promise<JSONRPCSerializedData> => ({
      method,
      serialized: JSON.stringify({
        instance: jsonStringify(value.instance),
        artifact: value.artifact ? jsonStringify(value.artifact) : undefined,
      }),
    }),
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_registerContract']['params']> => {
      const { instance, artifact } = JSON.parse(data.serialized);
      return {
        instance: await jsonParseWithSchema(instance, ContractInstanceWithAddressSchema),
        artifact: artifact ? await jsonParseWithSchema(artifact, ContractArtifactSchema) : undefined,
      };
    },
  };
}

/**
 * Pre-instantiated serializer instances for Aztec contract-related RPC methods.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecRegisterContractSerializer = new AztecRegisterContractSerializer();
export const aztecGetContractClassMetadataSerializer = new AztecGetContractClassMetadataSerializer();
export const aztecGetContractMetadataSerializer = new AztecGetContractMetadataSerializer();
