import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';

/**
 * Re-export all serializer types and implementations.
 * This provides a single entry point for importing any serializer functionality.
 */
export * from './account.js';
export * from './contract.js';
export * from './transaction.js';
export * from './note.js';
export * from './log.js';

// Import all serializer instances
import {
  aztecSetScopesSerializer,
  aztecRegisterAccountSerializer,
  aztecAddAuthWitnessSerializer,
  aztecGetAuthWitnessSerializer,
} from './account.js';
import {
  aztecGetContractMetadataSerializer,
  aztecGetContractClassMetadataSerializer,
  aztecRegisterContractSerializer,
} from './contract.js';
import {
  aztecCreateTxExecutionRequestSerializer,
  aztecProveTxSerializer,
  aztecSendTxSerializer,
  aztecGetTxReceiptSerializer,
  aztecGetTxEffectSerializer,
  aztecSimulateTxSerializer,
} from './transaction.js';
import { aztecGetNotesSerializer, aztecAddNoteSerializer, aztecAddNullifiedNoteSerializer } from './note.js';
import {
  aztecGetPublicLogsSerializer,
  aztecGetContractClassLogsSerializer,
  aztecGetPrivateEventsSerializer,
  aztecGetPublicEventsSerializer,
} from './log.js';

/**
 * Type alias for Aztec RPC method names.
 * Represents all available methods in the Aztec wallet RPC interface.
 */
type AztecMethodName = keyof AztecWalletMethodMap;

/**
 * Registry of all available method serializers.
 * Maps each RPC method name to its corresponding serializer implementation.
 * This mapping is used by the main AztecWalletSerializer to route method calls
 * to the appropriate specialized serializer.
 */
const methodSerializers: Record<AztecMethodName, JSONRPCSerializer<unknown, unknown>> = {
  // Account methods
  aztec_setScopes: aztecSetScopesSerializer,
  aztec_registerAccount: aztecRegisterAccountSerializer,
  aztec_addAuthWitness: aztecAddAuthWitnessSerializer,
  aztec_getAuthWitness: aztecGetAuthWitnessSerializer,

  // Contract methods
  aztec_getContractMetadata: aztecGetContractMetadataSerializer,
  aztec_getContractClassMetadata: aztecGetContractClassMetadataSerializer,
  aztec_registerContract: aztecRegisterContractSerializer,

  // Transaction methods
  aztec_createTxExecutionRequest: aztecCreateTxExecutionRequestSerializer,
  aztec_proveTx: aztecProveTxSerializer,
  aztec_sendTx: aztecSendTxSerializer,
  aztec_getTxReceipt: aztecGetTxReceiptSerializer,
  aztec_getTxEffect: aztecGetTxEffectSerializer,
  aztec_simulateTx: aztecSimulateTxSerializer,

  // Note methods
  aztec_getNotes: aztecGetNotesSerializer,
  aztec_addNote: aztecAddNoteSerializer,
  aztec_addNullifiedNote: aztecAddNullifiedNoteSerializer,

  // Log methods
  aztec_getPublicLogs: aztecGetPublicLogsSerializer,
  aztec_getContractClassLogs: aztecGetContractClassLogsSerializer,
  aztec_getPrivateEvents: aztecGetPrivateEventsSerializer,
  aztec_getPublicEvents: aztecGetPublicEventsSerializer,
};

/**
 * Helper function to wrap unknown values in a standard JSON-RPC format.
 * Used as a fallback when no specific serializer is available for a method.
 *
 * @param method - The RPC method name
 * @param value - The value to wrap
 * @returns Standardized JSON-RPC data structure
 */
async function wrapUnknownValue(method: string, value: unknown): Promise<JSONRPCSerializedData> {
  return Promise.resolve({
    method,
    serialized: JSON.stringify(value),
  });
}

/**
 * Main serializer for the Aztec wallet RPC interface.
 * Provides a unified interface for serializing all supported RPC methods.
 *
 * This serializer:
 * 1. Routes each method call to its specialized serializer from methodSerializers
 * 2. Provides fallback handling for unknown methods
 * 3. Wraps all serialization operations in proper error handling
 */
export const AztecWalletSerializer: JSONRPCSerializer<unknown, unknown> = {
  params: {
    /**
     * Serializes RPC method parameters using the appropriate method serializer.
     * @param method - The RPC method name
     * @param value - The parameters to serialize
     * @returns Serialized parameter data
     * @throws If serialization fails or encounters an error
     */
    serialize: async (method: string, value: unknown): Promise<JSONRPCSerializedData> => {
      const serializer = methodSerializers[method as AztecMethodName];
      if (!serializer?.params) {
        return wrapUnknownValue(method, value);
      }

      try {
        return await serializer.params.serialize(method, value);
      } catch (error) {
        throw new Error(`Failed to serialize params for method ${method}: ${error}`);
      }
    },
    /**
     * Deserializes RPC method parameters using the appropriate method serializer.
     * @param method - The RPC method name
     * @param data - The serialized parameter data
     * @returns Deserialized parameters
     * @throws If deserialization fails or encounters an error
     */
    deserialize: async (method: string, data: JSONRPCSerializedData): Promise<unknown> => {
      const serializer = methodSerializers[method as AztecMethodName];
      if (!serializer?.params) {
        return data;
      }

      try {
        return await serializer.params.deserialize(method, data);
      } catch (error) {
        throw new Error(`Failed to deserialize params for method ${method}: ${error}`);
      }
    },
  },
  result: {
    /**
     * Serializes RPC method results using the appropriate method serializer.
     * @param method - The RPC method name
     * @param value - The result to serialize
     * @returns Serialized result data
     * @throws If serialization fails or encounters an error
     */
    serialize: async (method: string, value: unknown): Promise<JSONRPCSerializedData> => {
      const serializer = methodSerializers[method as AztecMethodName];
      if (!serializer?.result) {
        return wrapUnknownValue(method, value);
      }

      try {
        return await serializer.result.serialize(method, value);
      } catch (error) {
        throw new Error(`Failed to serialize result for method ${method}: ${error}`);
      }
    },
    /**
     * Deserializes RPC method results using the appropriate method serializer.
     * @param method - The RPC method name
     * @param data - The serialized result data
     * @returns Deserialized result
     * @throws If deserialization fails or encounters an error
     */
    deserialize: async (method: string, data: JSONRPCSerializedData): Promise<unknown> => {
      const serializer = methodSerializers[method as AztecMethodName];
      if (!serializer?.result) {
        return data;
      }

      try {
        return await serializer.result.deserialize(method, data);
      } catch (error) {
        throw new Error(`Failed to deserialize result for method ${method}: ${error}`);
      }
    },
  },
};
