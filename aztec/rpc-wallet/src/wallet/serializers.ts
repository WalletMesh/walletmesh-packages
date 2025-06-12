/**
 * @module @walletmesh/aztec-rpc-wallet/wallet/serializers
 *
 * This module provides the primary JSON-RPC serializer (`AztecWalletSerializer`)
 * for handling Aztec-specific data types over JSON-RPC. It leverages Zod schemas
 * from `@aztec/foundation/schemas` and `@aztec/aztec.js` for robust serialization
 * and deserialization of parameters and results for all Aztec wallet methods.
 *
 * It also includes a helper function `registerAztecSerializers` for applying these
 * serializers to a `JSONRPCNode` instance, typically used on the wallet-side
 * implementation (e.g., in `createAztecWalletNode`).
 *
 * The serialization strategy involves:
 * - Using Aztec's `jsonStringify` and `jsonParseWithSchema` for types that have
 *   corresponding Zod schemas.
 * - Custom logic for arrays of specific types (e.g., `AztecAddress[]`).
 * - A fallback serializer for parameters and results not explicitly covered.
 * - Detailed parameter deserialization logic within `AztecWalletSerializer.params.deserialize`
 *   to reconstruct complex Aztec objects from their JSON representations.
 */

import type { AztecWalletMethodMap } from '../types.js';

import type {
  JSONRPCNode,
  JSONRPCSerializer,
  JSONRPCSerializedData,
  JSONRPCParams,
} from '@walletmesh/jsonrpc';
import { JSONRPCError } from '@walletmesh/jsonrpc';

import {
  AztecAddress,
  CompleteAddress,
  TxExecutionRequest,
  Fr,
  Tx,
  TxHash,
  AuthWitness,
} from '@aztec/aztec.js';
import type { NodeInfo } from '@aztec/aztec.js';

import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';

import { AbiTypeSchema, ContractArtifactSchema, FunctionSelector, FunctionType } from '@aztec/stdlib/abi';
import { schemas } from '@aztec/stdlib/schemas';

import type { PXEInfo, ContractMetadata, ContractClassMetadata } from '@aztec/stdlib/interfaces/client';
import {
  ContractClassWithIdSchema,
  ContractInstanceWithAddressSchema,
  NodeInfoSchema,
  ProtocolContractAddressesSchema,
} from '@aztec/stdlib/contract';
import { GasFees } from '@aztec/stdlib/gas';
import { L2Block } from '@aztec/stdlib/block';
import {
  Capsule,
  HashedValues,
  PrivateExecutionResult,
  TxProfileResult,
  TxProvingResult,
  TxReceipt,
  TxSimulationResult,
  UtilitySimulationResult,
} from '@aztec/stdlib/tx';

import { jsonStringify, jsonParseWithSchema } from '@aztec/foundation/json-rpc';
import { createLogger } from '@aztec/foundation/log';
import type { ZodFor } from '@aztec/foundation/schemas';

import { z, type ZodTypeAny } from 'zod';

// These aren't exported by @aztec/stdlib/interfaces/client, we've copied them here
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

const PXEInfoSchema = z.object({
  pxeVersion: z.string(),
  protocolContractAddresses: ProtocolContractAddressesSchema,
}) satisfies ZodFor<PXEInfo>;

const EventMetadataDefinitionSchema = z.object({
  eventSelector: schemas.EventSelector,
  abiType: AbiTypeSchema,
  fieldNames: z.array(z.string()),
});

// Schema for FunctionCall (since it doesn't have one in the Aztec codebase)
const FunctionCallSchema = z.object({
  name: z.string(),
  to: schemas.AztecAddress,
  selector: FunctionSelector.schema,
  type: z.nativeEnum(FunctionType),
  isStatic: z.boolean(),
  args: z.array(schemas.Fr),
  returnTypes: z.array(AbiTypeSchema),
});

// Schema for ExecutionPayload
const ExecutionPayloadSchema = z.object({
  calls: z.array(FunctionCallSchema),
  authWitnesses: z.array(AuthWitness.schema),
  capsules: z.array(Capsule.schema),
  extraHashedArgs: z.array(HashedValues.schema).default([]),
});

// Schema for DeployContractParams
const DeployContractParamsSchema = z.object({
  artifact: ContractArtifactSchema,
  args: z.array(z.any()),
  constructorName: z.string().optional(),
});

const DeployContractResultSchema = z.object({
  txHash: TxHash.schema,
  contractAddress: AztecAddress.schema,
});

const logger = createLogger('aztec-rpc-wallet:serializers');

function createResultSerializer<R>(resultSchema?: ZodTypeAny): Pick<JSONRPCSerializer<unknown, R>, 'result'> {
  return {
    result: {
      serialize: async (method: string, value: R) => ({ method, serialized: jsonStringify(value) }),
      deserialize: async (method: string, data: JSONRPCSerializedData) => {
        if (resultSchema) {
          return await jsonParseWithSchema(data.serialized, resultSchema);
        }
        // If no schema is provided, parse as JSON
        logger.debug(`Deserializing result for method without schema: ${method}`);
        return JSON.parse(data.serialized) as R;
      },
    },
  };
}

const RESULT_SERIALIZERS: Partial<
  Record<keyof AztecWalletMethodMap, Pick<JSONRPCSerializer<unknown, unknown>, 'result'>>
> = {
  aztec_getAddress: createResultSerializer<AztecAddress>(AztecAddress.schema),
  aztec_getCompleteAddress: createResultSerializer<CompleteAddress>(CompleteAddress.schema),
  aztec_getChainId: createResultSerializer<Fr>(Fr.schema),
  aztec_getVersion: createResultSerializer<Fr>(Fr.schema),
  aztec_getBlockNumber: createResultSerializer<number>(),
  aztec_getProvenBlockNumber: createResultSerializer<number>(),
  aztec_getSenders: {
    result: {
      serialize: async (_m, v: AztecAddress[]) => ({
        method: _m,
        serialized: jsonStringify(v.map((a) => a.toString())),
      }),
      deserialize: async (_m, d) =>
        (JSON.parse(d.serialized) as string[]).map((s) => AztecAddress.fromString(s)),
    },
  },
  aztec_getContracts: {
    result: {
      serialize: async (_m, v: AztecAddress[]) => ({
        method: _m,
        serialized: jsonStringify(v.map((a) => a.toString())),
      }),
      deserialize: async (_m, d) =>
        (JSON.parse(d.serialized) as string[]).map((s) => AztecAddress.fromString(s)),
    },
  },
  aztec_registerSender: createResultSerializer<AztecAddress>(AztecAddress.schema),
  aztec_removeSender: createResultSerializer<boolean>(),
  aztec_registerContract: createResultSerializer<boolean>(),
  aztec_registerContractClass: createResultSerializer<boolean>(),
  aztec_createAuthWit: createResultSerializer<AuthWitness>(AuthWitness.schema),
  aztec_profileTx: createResultSerializer<TxProfileResult>(TxProfileResult.schema),
  aztec_simulateUtility: createResultSerializer<UtilitySimulationResult>(UtilitySimulationResult.schema),
  aztec_proveTx: createResultSerializer<TxProvingResult>(TxProvingResult.schema),
  aztec_sendTx: createResultSerializer<TxHash>(TxHash.schema),
  aztec_getTxReceipt: createResultSerializer<TxReceipt>(TxReceipt.schema),
  aztec_simulateTx: createResultSerializer<TxSimulationResult>(TxSimulationResult.schema),
  aztec_getNodeInfo: createResultSerializer<NodeInfo>(NodeInfoSchema),
  aztec_getPXEInfo: createResultSerializer<PXEInfo>(PXEInfoSchema),
  aztec_getCurrentBaseFees: createResultSerializer<GasFees>(GasFees.schema),
  aztec_getBlock: createResultSerializer<L2Block | undefined>(L2Block.schema.optional()),
  aztec_getContractMetadata: createResultSerializer<ContractMetadata>(ContractMetadataSchema),
  aztec_getContractClassMetadata: createResultSerializer<ContractClassMetadata>(ContractClassMetadataSchema),
  aztec_getPrivateEvents: {
    result: {
      serialize: async (m, v) => ({ method: m, serialized: jsonStringify(v) }),
      deserialize: async (_, d) => JSON.parse(d.serialized),
    },
  },
  aztec_getPublicEvents: {
    result: {
      serialize: async (m, v) => ({ method: m, serialized: jsonStringify(v) }),
      deserialize: async (_, d) => JSON.parse(d.serialized),
    },
  },
  aztec_wmExecuteTx: createResultSerializer<TxHash>(TxHash.schema),
  aztec_wmSimulateTx: createResultSerializer<TxSimulationResult>(TxSimulationResult.schema),
  aztec_wmDeployContract: createResultSerializer<{ txHash: TxHash; contractAddress: AztecAddress }>(
    DeployContractResultSchema,
  ),
  wm_getSupportedMethods: {
    result: {
      serialize: async (m, v) => ({ method: m, serialized: jsonStringify(v) }),
      deserialize: async (_, d) => JSON.parse(d.serialized),
    },
  },
};

async function createFallbackSerializer(method: string, value: unknown): Promise<JSONRPCSerializedData> {
  try {
    return { method, serialized: jsonStringify(value) };
  } catch (error) {
    return {
      method,
      serialized: JSON.stringify({
        error: 'Serialization failed',
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}

/**
 * A comprehensive {@link JSONRPCSerializer} for all Aztec wallet methods.
 *
 * This serializer handles both parameters and results:
 *
 * **Parameters (`params`):**
 *  - `serialize`: Currently uses a fallback mechanism (`createFallbackSerializer`) which
 *    stringifies parameters using `jsonStringify`. This assumes the client-side
 *    (e.g., {@link AztecDappWallet} via {@link AztecRouterProvider}) sends parameters
 *    already in a format that can be processed by the `deserialize` logic after
 *    basic JSON parsing.
 *  - `deserialize`: Contains detailed, method-specific logic to parse the JSON string
 *    of incoming parameters and reconstruct them into their correct Aztec types
 *    (e.g., `AztecAddress.fromString`, `TxExecutionRequest.schema.parse`). It uses
 *    Zod schemas and helper functions (`ensureParam`, `getOptionalParam`) for
 *    validation and type conversion.
 *
 * **Results (`result`):**
 *  - `serialize`: For each method, it attempts to use a specific serializer defined in
 *    `RESULT_SERIALIZERS`. These typically use `jsonStringify` with a Zod schema
 *    for the specific result type (e.g., `AztecAddress.schema`, `TxHash.schema`).
 *    If no specific serializer is found, it uses `createFallbackSerializer`.
 *  - `deserialize`: Similar to result serialization, it uses `RESULT_SERIALIZERS`
 *    to find a method-specific deserializer, often employing `jsonParseWithSchema`
 *    with the appropriate Zod schema. If no specific deserializer exists, it may
 *    return the raw data or attempt a simple JSON parse.
 *
 * This serializer is crucial for ensuring that complex Aztec objects maintain their
 * type integrity and structure when transmitted over JSON-RPC.
 *
 * @see {@link AztecWalletMethodMap} for the definitions of methods, params, and results.
 * @see {@link JSONRPCSerializer} for the interface it implements.
 */
export const AztecWalletSerializer: JSONRPCSerializer<JSONRPCParams, unknown> = {
  params: {
    serialize: async (method: string, value: unknown): Promise<JSONRPCSerializedData> => {
      logger.debug(`Serializing params for method: ${method} (current fallback)`, value);
      return createFallbackSerializer(method, value);
    },
    deserialize: async (method: string, data: JSONRPCSerializedData): Promise<JSONRPCParams> => {
      logger.debug(
        `Deserializing params for method: ${method}, data: ${data.serialized.substring(0, 100)}...`,
      );
      const dAppParams = JSON.parse(data.serialized);

      // Helper function to validate types using string literals
      const validateType = (val: unknown, expectedType: string): boolean => {
        switch (expectedType) {
          case 'string':
            return typeof val === 'string';
          case 'number':
            return typeof val === 'number';
          case 'boolean':
            return typeof val === 'boolean';
          case 'object':
            return typeof val === 'object';
          case 'function':
            return typeof val === 'function';
          case 'undefined':
            return typeof val === 'undefined';
          default:
            return true; // If unknown type is specified, don't validate
        }
      };

      const ensureParam = <T = unknown>(obj: Record<string, unknown>, key: string, type?: string): T => {
        if (!(key in obj)) {
          throw new JSONRPCError(
            -32602,
            `Invalid params for ${method}: Missing required parameter '${key}'.`,
          );
        }
        const val = obj[key];
        if (type && !validateType(val, type)) {
          throw new JSONRPCError(
            -32602,
            `Invalid params for ${method}: Parameter '${key}' has wrong type. Expected ${type}, got ${typeof val}.`,
          );
        }
        return val as T;
      };

      const getOptionalParam = <T = unknown>(
        obj: Record<string, unknown>,
        key: string,
        type?: string,
      ): T | undefined => {
        if (key in obj && obj[key] !== undefined) {
          const val = obj[key];
          if (type && !validateType(val, type)) {
            throw new JSONRPCError(
              -32602,
              `Invalid params for ${method}: Parameter '${key}' has wrong type. Expected ${type}, got ${typeof val}.`,
            );
          }
          return val as T;
        }
        return undefined;
      };

      switch (method as keyof AztecWalletMethodMap) {
        case 'aztec_getBlock': {
          const blockNum = ensureParam<number>(dAppParams, 'number', 'number');
          return [blockNum];
        }
        case 'aztec_getBlockNumber':
        case 'aztec_getChainId':
        case 'aztec_getVersion':
        case 'aztec_getNodeInfo':
        case 'aztec_getProvenBlockNumber':
        case 'aztec_getPXEInfo':
        case 'aztec_getCurrentBaseFees':
        case 'aztec_getAddress':
        case 'aztec_getCompleteAddress':
        case 'aztec_getSenders':
        case 'aztec_getContracts':
          return [];
        case 'aztec_createAuthWit': {
          const intentRaw = ensureParam<unknown>(dAppParams, 'intent');
          let intentInput: Fr | Buffer | IntentAction | IntentInnerHash;
          if (
            typeof intentRaw === 'string' &&
            (intentRaw.startsWith('0x') || !Number.isNaN(Number(intentRaw)))
          ) {
            intentInput = Fr.fromString(intentRaw);
          } else if (intentRaw instanceof Buffer) {
            intentInput = intentRaw;
          } else if (typeof intentRaw === 'object' && intentRaw !== null) {
            intentInput = intentRaw as
              | import('@aztec/aztec.js/utils').IntentAction
              | import('@aztec/aztec.js/utils').IntentInnerHash;
          } else {
            throw new JSONRPCError(-32602, `Invalid 'intent' parameter type for ${method}.`);
          }
          return [intentInput];
        }
        case 'aztec_registerSender':
        case 'aztec_removeSender': {
          const senderStr = ensureParam<string>(dAppParams, 'sender', 'string');
          const sender = AztecAddress.fromString(senderStr);
          return [sender];
        }
        case 'aztec_getContractMetadata': {
          const addressStr = ensureParam<string>(dAppParams, 'address', 'string');
          const address = AztecAddress.fromString(addressStr);
          return [address];
        }
        case 'aztec_getContractClassMetadata': {
          const idStr = ensureParam<string>(dAppParams, 'id', 'string');
          const id = Fr.fromString(idStr);
          const includeArtifact = getOptionalParam<boolean>(dAppParams, 'includeArtifact', 'boolean');
          return [id, includeArtifact];
        }
        case 'aztec_registerContract': {
          const instanceRaw = ensureParam<Record<string, unknown>>(dAppParams, 'instance');
          const artifactRaw = getOptionalParam<Record<string, unknown>>(dAppParams, 'artifact');
          const instance = ContractInstanceWithAddressSchema.parse(instanceRaw);
          const artifact = artifactRaw ? ContractArtifactSchema.parse(artifactRaw) : undefined;
          return [instance, artifact];
        }
        case 'aztec_registerContractClass': {
          const artifactRaw = ensureParam<Record<string, unknown>>(dAppParams, 'artifact');
          const artifact = ContractArtifactSchema.parse(artifactRaw);
          return [artifact];
        }
        case 'aztec_proveTx': {
          const txRequestRaw = ensureParam<Record<string, unknown>>(dAppParams, 'txRequest');
          // Ensure txRequestRaw is a valid TxExecutionRequest
          // Use getOptionalParam for privateExecutionResult
          const privateExecutionResultRaw = getOptionalParam<Record<string, unknown>>(
            dAppParams,
            'privateExecutionResult',
          );
          const txRequest = TxExecutionRequest.schema.parse(txRequestRaw);
          // Conditionally parse if privateExecutionResultRaw is present
          const privateExecutionResult = privateExecutionResultRaw
            ? PrivateExecutionResult.schema.parse(privateExecutionResultRaw)
            : undefined;
          return [txRequest, privateExecutionResult];
        }
        case 'aztec_sendTx': {
          const txRaw = ensureParam<Record<string, unknown>>(dAppParams, 'tx');
          const tx = Tx.schema.parse(txRaw);
          return [tx];
        }
        case 'aztec_getTxReceipt': {
          const txHashStr = ensureParam<string>(dAppParams, 'txHash', 'string');
          const txHash = TxHash.fromString(txHashStr);
          return [txHash];
        }
        case 'aztec_simulateTx': {
          const txRequestRaw = ensureParam<Record<string, unknown>>(dAppParams, 'txRequest');
          const txRequest = TxExecutionRequest.schema.parse(txRequestRaw);
          const simulatePublic = getOptionalParam<boolean>(dAppParams, 'simulatePublic', 'boolean');
          const msgSenderStr = getOptionalParam<string>(dAppParams, 'msgSender', 'string');
          const msgSender = msgSenderStr ? AztecAddress.fromString(msgSenderStr) : undefined;
          const skipTxValidation = getOptionalParam<boolean>(dAppParams, 'skipTxValidation', 'boolean');
          const skipFeeEnforcement = getOptionalParam<boolean>(dAppParams, 'skipFeeEnforcement', 'boolean');
          const scopesRaw = getOptionalParam<string[]>(dAppParams, 'scopes');
          const scopes = scopesRaw?.map((s) => AztecAddress.fromString(s));
          return [txRequest, simulatePublic, msgSender, skipTxValidation, skipFeeEnforcement, scopes];
        }
        case 'aztec_profileTx': {
          const txRequestRaw = ensureParam<Record<string, unknown>>(dAppParams, 'txRequest');
          const txRequest = TxExecutionRequest.schema.parse(txRequestRaw);
          const profileMode = getOptionalParam<'gates' | 'execution-steps' | 'full'>(
            dAppParams,
            'profileMode',
            'string',
          );
          const skipProofGeneration = getOptionalParam<boolean>(dAppParams, 'skipProofGeneration', 'boolean');
          const msgSenderStr = getOptionalParam<string>(dAppParams, 'msgSender', 'string');
          const msgSender = msgSenderStr ? AztecAddress.fromString(msgSenderStr) : undefined;
          return [txRequest, profileMode, skipProofGeneration, msgSender];
        }
        case 'aztec_simulateUtility': {
          const functionName = ensureParam<string>(dAppParams, 'functionName', 'string');
          const args = ensureParam<unknown[]>(dAppParams, 'args');
          const toStr = ensureParam<string>(dAppParams, 'to', 'string');
          const to = AztecAddress.fromString(toStr);
          const authWitsRaw = getOptionalParam<Record<string, unknown>[]>(dAppParams, 'authWits');
          const authWits = authWitsRaw?.map((aw) => AuthWitness.schema.parse(aw)); // Use AuthWitness from @aztec/aztec.js
          const fromStr = getOptionalParam<string>(dAppParams, 'from', 'string');
          const from = fromStr ? AztecAddress.fromString(fromStr) : undefined;
          return [functionName, args, to, authWits, from];
        }
        case 'aztec_getPrivateEvents': {
          const contractAddressStr = ensureParam<string>(dAppParams, 'contractAddress', 'string');
          const contractAddress = AztecAddress.fromString(contractAddressStr);
          const eventMetadataRaw = ensureParam<string>(dAppParams, 'eventMetadata');
          const eventMetadata = jsonParseWithSchema(eventMetadataRaw, EventMetadataDefinitionSchema);
          const fromBlock = ensureParam<number>(dAppParams, 'from', 'number');
          const numBlocks = ensureParam<number>(dAppParams, 'numBlocks', 'number');
          const recipientsRaw = ensureParam<string[]>(dAppParams, 'recipients');
          const recipients = recipientsRaw.map((r) => AztecAddress.fromString(r));
          return [contractAddress, eventMetadata, fromBlock, numBlocks, recipients];
        }
        case 'aztec_getPublicEvents': {
          const eventMetadataRaw = ensureParam<string>(dAppParams, 'eventMetadata');
          const eventMetadata = jsonParseWithSchema(eventMetadataRaw, EventMetadataDefinitionSchema);
          const fromBlock = ensureParam<number>(dAppParams, 'from', 'number');
          const limit = ensureParam<number>(dAppParams, 'limit', 'number');
          return [eventMetadata, fromBlock, limit];
        }
        case 'aztec_wmExecuteTx': {
          const executionPayloadRaw = ensureParam<Record<string, unknown>>(dAppParams, 'executionPayload');
          const executionPayload = ExecutionPayloadSchema.parse(executionPayloadRaw);
          return [executionPayload];
        }
        case 'aztec_wmSimulateTx': {
          const executionPayloadRaw = ensureParam<Record<string, unknown>>(dAppParams, 'executionPayload');
          const executionPayload = ExecutionPayloadSchema.parse(executionPayloadRaw);
          return [executionPayload];
        }
        case 'aztec_wmDeployContract': {
          const deployParams = DeployContractParamsSchema.parse(dAppParams);
          return [deployParams];
        }
        case 'wm_getSupportedMethods':
          return [];
        default:
          logger.error(`Unhandled method in params.deserialize: ${method}`);
          throw new JSONRPCError(-32601, `Method not found or not supported by serializer: ${method}`);
      }
    },
  },
  result: {
    serialize: async (method: string, value: unknown): Promise<JSONRPCSerializedData> => {
      const serializer = RESULT_SERIALIZERS[method as keyof AztecWalletMethodMap];
      if (serializer?.result) {
        try {
          const typedValue = value as AztecWalletMethodMap[typeof method]['result'];
          const serialized = await serializer.result.serialize(method, typedValue);

          return serialized;
        } catch (error) {
          logger.error(`Failed to serialize result for ${method}:`, error);
          throw new Error(`Failed to serialize result for ${method}: ${error}`);
        }
      }
      logger.debug(`Using fallback serializer for result of method: ${method}`);
      return createFallbackSerializer(method, value);
    },
    deserialize: async (method: string, data: JSONRPCSerializedData): Promise<unknown> => {
      const serializer = RESULT_SERIALIZERS[method as keyof AztecWalletMethodMap];
      if (serializer?.result) {
        try {
          return await serializer.result.deserialize(method, data);
        } catch (error) {
          logger.error(`Failed to deserialize result for ${method}:`, error);
          throw new Error(`Failed to deserialize result for ${method}: ${error}`);
        }
      }
      logger.debug(`No specific deserializer found for result of method: ${method}, returning raw data`);
      return data;
    },
  },
};

/**
 * Registers the {@link AztecWalletSerializer} for all relevant Aztec JSON-RPC methods
 * on a given {@link JSONRPCNode} instance.
 *
 * This function is typically called on the wallet-side (e.g., within
 * `createAztecWalletNode`) to equip the node with the necessary serialization
 * capabilities for handling Aztec methods.
 *
 * It iterates through a predefined list of Aztec methods and associates each
 * with the `AztecWalletSerializer`.
 *
 * @param node - The {@link JSONRPCNode} instance on which to register the serializers.
 *               This node should be typed with {@link AztecWalletMethodMap}.
 *
 * @see {@link createAztecWalletNode} where this function is used.
 * @see {@link AztecWalletSerializer} which provides the serialization logic.
 */
export function registerAztecSerializers(node: JSONRPCNode<AztecWalletMethodMap>) {
  // This list should ideally cover all methods in AztecWalletMethodMap that require
  // specific Aztec type serialization.
  const aztecMethods: (keyof AztecWalletMethodMap)[] = [
    'aztec_getBlock',
    'aztec_getBlockNumber',
    'aztec_getChainId',
    'aztec_getVersion',
    'aztec_getNodeInfo',
    'aztec_getProvenBlockNumber',
    'aztec_getPXEInfo',
    'aztec_getCurrentBaseFees',
    'aztec_getAddress',
    'aztec_getCompleteAddress',
    'aztec_createAuthWit',
    'aztec_registerSender',
    'aztec_getSenders',
    'aztec_removeSender',
    'aztec_getContracts',
    'aztec_getContractMetadata',
    'aztec_getContractClassMetadata',
    'aztec_registerContract',
    'aztec_registerContractClass',
    'aztec_proveTx',
    'aztec_sendTx',
    'aztec_getTxReceipt',
    'aztec_simulateTx',
    'aztec_profileTx',
    'aztec_simulateUtility',
    'aztec_getPrivateEvents',
    'aztec_getPublicEvents',
    'aztec_wmExecuteTx',
    'aztec_wmDeployContract',
    'wm_getSupportedMethods',
  ];
  for (const method of aztecMethods) {
    node.registerSerializer(method, AztecWalletSerializer);
  }
}
