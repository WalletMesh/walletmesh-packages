import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import type { PartialAddress } from '@aztec/aztec.js';
import { CompleteAddress, AuthWitness, AztecAddress, Fr } from '@aztec/aztec.js';

/**
 * Serializer for the aztec_setScopes RPC method.
 * Handles serialization of account scope settings between JSON-RPC format and native Aztec types.
 */
export class AztecSetScopesSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_setScopes']['params'],
      AztecWalletMethodMap['aztec_setScopes']['result']
    >
{
  params = {
    /**
     * Serializes scope setting parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing an array of Aztec addresses representing scopes
     * @returns Serialized scope data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_setScopes']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { scopes } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify({
          scopes: scopes.map((s) => s.toString()),
        }),
      });
    },
    /**
     * Deserializes scope setting parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized scope data
     * @returns Deserialized scope parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_setScopes']['params']> => {
      const { scopes } = JSON.parse(data.serialized);
      return Promise.resolve({
        scopes: scopes.map((s: string) => AztecAddress.fromString(s)),
      });
    },
  };

  result = {
    /**
     * Serializes the scope setting result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of the scope setting operation
     * @returns Serialized result
     */
    serialize: async (method: string, value: boolean): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    /**
     * Deserializes the scope setting result.
     * @param _method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<boolean> => {
      return Promise.resolve(JSON.parse(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_registerAccount RPC method.
 * Handles serialization of account registration data between JSON-RPC format and native Aztec types.
 */
export class AztecRegisterAccountSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_registerAccount']['params'],
      AztecWalletMethodMap['aztec_registerAccount']['result']
    >
{
  params = {
    /**
     * Serializes account registration parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing secret key and partial address
     * @returns Serialized registration data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_registerAccount']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { secretKey, partialAddress } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify({
          secretKey: secretKey.toString(),
          partialAddress: partialAddress.toString(),
        }),
      });
    },
    /**
     * Deserializes account registration parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized registration data
     * @returns Deserialized registration parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_registerAccount']['params']> => {
      const { secretKey, partialAddress } = JSON.parse(data.serialized);
      return Promise.resolve({
        secretKey: Fr.fromString(secretKey),
        partialAddress: Fr.fromString(partialAddress) as PartialAddress,
      });
    },
  };

  result = {
    /**
     * Serializes the account registration result.
     * @param method - The RPC method name
     * @param value - The complete address of the registered account
     * @returns Serialized complete address
     */
    serialize: async (method: string, value: CompleteAddress): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value.toString()),
      });
    },
    /**
     * Deserializes the account registration result.
     * @param _method - The RPC method name
     * @param data - The serialized complete address
     * @returns Deserialized complete address
     */
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<CompleteAddress> => {
      return Promise.resolve(CompleteAddress.fromString(JSON.parse(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_addAuthWitness RPC method.
 * Handles serialization of authentication witness data between JSON-RPC format and native Aztec types.
 */
export class AztecAddAuthWitnessSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_addAuthWitness']['params'],
      AztecWalletMethodMap['aztec_addAuthWitness']['result']
    >
{
  params = {
    /**
     * Serializes auth witness addition parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the auth witness to add
     * @returns Serialized auth witness data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_addAuthWitness']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { authWitness } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify(authWitness.toString()),
      });
    },
    /**
     * Deserializes auth witness addition parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized auth witness data
     * @returns Deserialized auth witness parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_addAuthWitness']['params']> => {
      const authWitness = AuthWitness.fromString(JSON.parse(data.serialized));
      return Promise.resolve({ authWitness });
    },
  };

  result = {
    /**
     * Serializes the auth witness addition result.
     * @param method - The RPC method name
     * @param value - Boolean indicating success of the witness addition
     * @returns Serialized result
     */
    serialize: async (method: string, value: boolean): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    /**
     * Deserializes the auth witness addition result.
     * @param _method - The RPC method name
     * @param data - The serialized result data
     * @returns Boolean indicating success
     */
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<boolean> => {
      return Promise.resolve(JSON.parse(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_getAuthWitness RPC method.
 * Handles serialization of authentication witness retrieval between JSON-RPC format and native Aztec types.
 */
export class AztecGetAuthWitnessSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getAuthWitness']['params'],
      AztecWalletMethodMap['aztec_getAuthWitness']['result']
    >
{
  params = {
    /**
     * Serializes auth witness retrieval parameters for RPC transport.
     * @param method - The RPC method name
     * @param value - The parameters containing the message hash to look up
     * @returns Serialized message hash data
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getAuthWitness']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { messageHash } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify(messageHash.toString()),
      });
    },
    /**
     * Deserializes auth witness retrieval parameters from RPC transport.
     * @param _method - The RPC method name
     * @param data - The serialized message hash data
     * @returns Deserialized message hash parameters
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getAuthWitness']['params']> => {
      const messageHash = Fr.fromString(JSON.parse(data.serialized));
      return Promise.resolve({ messageHash });
    },
  };

  result = {
    /**
     * Serializes the auth witness retrieval result.
     * @param method - The RPC method name
     * @param value - Array of field elements representing auth witnesses
     * @returns Serialized witness array
     */
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getAuthWitness']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value.map((w) => w.toString())),
      });
    },
    /**
     * Deserializes the auth witness retrieval result.
     * @param _method - The RPC method name
     * @param data - The serialized witness array data
     * @returns Array of deserialized field elements
     */
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getAuthWitness']['result']> => {
      return Promise.resolve(JSON.parse(data.serialized).map((w: string) => Fr.fromString(w)));
    },
  };
}

/**
 * Pre-instantiated serializer instances for Aztec account-related RPC methods.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecSetScopesSerializer = new AztecSetScopesSerializer();
export const aztecRegisterAccountSerializer = new AztecRegisterAccountSerializer();
export const aztecAddAuthWitnessSerializer = new AztecAddAuthWitnessSerializer();
export const aztecGetAuthWitnessSerializer = new AztecGetAuthWitnessSerializer();
