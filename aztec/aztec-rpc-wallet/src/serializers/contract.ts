import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import { SerializableContractInstance, ContractClassWithIdSchema } from '@aztec/circuits.js';
import { ContractArtifactSchema } from '@aztec/foundation/abi';
import { AztecAddress, Fr } from '@aztec/aztec.js';
import type { ContractInstanceWithAddress } from '@aztec/aztec.js';
import { jsonStringify, jsonParseWithSchema } from '@aztec/foundation/json-rpc';

/**
 * Serializer for the aztec_getContractInstance RPC method.
 * Handles serialization of contract instance queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetContractInstanceSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractInstance']['params'],
      AztecWalletMethodMap['aztec_getContractInstance']['result']
    >
{
  params = {
    /**
     * Serializes contract instance query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the contract address to look up
     * @returns Serialized address data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractInstance']['params'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: jsonStringify(value.address),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractInstance']['params'] => {
      return {
        address: jsonParseWithSchema(data.serialized, AztecAddress.schema),
      };
    },
  };

  result = {
    /**
     * Serializes the contract instance query result.
     * @param method - The RPC method name
     * @param value - The contract instance data including address and state
     * @returns Serialized contract instance data
     */
    serialize: (method: string, value: ContractInstanceWithAddress): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify({
        serializableContractInstance: new SerializableContractInstance(value).toBuffer(),
        address: jsonStringify(value.address),
      }),
    }),
    deserialize: (_method: string, data: JSONRPCSerializedData): ContractInstanceWithAddress => {
      const parsed = JSON.parse(data.serialized);
      return SerializableContractInstance.fromBuffer(
        Buffer.from(parsed.serializableContractInstance),
      ).withAddress(jsonParseWithSchema(parsed.address, AztecAddress.schema));
    },
  };
}

/**
 * Serializer for the aztec_getContractClass RPC method.
 * Handles serialization of contract class queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetContractClassSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractClass']['params'],
      AztecWalletMethodMap['aztec_getContractClass']['result']
    >
{
  params = {
    /**
     * Serializes contract class query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the class ID to look up
     * @returns Serialized class ID data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClass']['params'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify({
        id: value.id.toString(),
      }),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractClass']['params'] => {
      const { id } = JSON.parse(data.serialized);
      return { id: Fr.fromString(id) };
    },
  };

  result = {
    /**
     * Serializes the contract class query result.
     * @param method - The RPC method name
     * @param value - The contract class definition with its ID
     * @returns Serialized contract class data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClass']['result'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify(value),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractClass']['result'] => {
      const parsed = JSON.parse(data.serialized);
      return ContractClassWithIdSchema.parse(parsed);
    },
  };
}

/**
 * Serializer for the aztec_getContractArtifact RPC method.
 * Handles serialization of contract artifact queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetContractArtifactSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractArtifact']['params'],
      AztecWalletMethodMap['aztec_getContractArtifact']['result']
    >
{
  params = {
    /**
     * Serializes contract artifact query parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the artifact ID to look up
     * @returns Serialized artifact ID data
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractArtifact']['params'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify({
        id: value.id.toString(),
      }),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractArtifact']['params'] => {
      const { id } = JSON.parse(data.serialized);
      return { id: Fr.fromString(id) };
    },
  };

  result = {
    /**
     * Serializes the contract artifact query result.
     * @param method - The RPC method name
     * @param value - The contract artifact data
     * @returns Serialized contract artifact
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractArtifact']['result'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify(ContractArtifactSchema.parse(value)),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getContractArtifact']['result'] =>
      ContractArtifactSchema.parse(JSON.parse(data.serialized)),
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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_registerContract']['params'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify({
        serializableContractInstance: new SerializableContractInstance(value.instance).toBuffer(),
        address: value.instance.address.toString(),
        artifact: value.artifact ? ContractArtifactSchema.parse(value.artifact) : undefined,
      }),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_registerContract']['params'] => {
      const { serializableContractInstance, address, artifact } = JSON.parse(data.serialized);
      return {
        instance: SerializableContractInstance.fromBuffer(
          Buffer.from(serializableContractInstance),
        ).withAddress(AztecAddress.fromString(address)),
        artifact: artifact ? ContractArtifactSchema.parse(artifact) : undefined,
      };
    },
  };

  result = {
    /**
     * Serializes the contract registration result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of registration
     * @returns Serialized result
     */
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_registerContract']['result'],
    ): JSONRPCSerializedData => ({
      method,
      serialized: JSON.stringify(value),
    }),
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_registerContract']['result'] => JSON.parse(data.serialized),
  };
}

/**
 * Pre-instantiated serializer instances for Aztec contract-related RPC methods.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecGetContractInstanceSerializer = new AztecGetContractInstanceSerializer();
export const aztecGetContractClassSerializer = new AztecGetContractClassSerializer();
export const aztecGetContractArtifactSerializer = new AztecGetContractArtifactSerializer();
export const aztecRegisterContractSerializer = new AztecRegisterContractSerializer();
