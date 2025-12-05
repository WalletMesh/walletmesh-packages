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

import { AztecAddress } from '@aztec/aztec.js/addresses';
import { AuthWitness, type CallIntent, type IntentInnerHash } from '@aztec/aztec.js/authorization';
import { Fr } from '@aztec/aztec.js/fields';
import { type ExecutionPayload, TxHash } from '@aztec/aztec.js/tx';
import {
  type Aliased,
  type BatchableMethods,
  type BatchedMethod,
  BatchedMethodSchema,
  type BatchResults,
  ContractClassMetadataSchema,
  ContractMetadataSchema,
  EventMetadataDefinitionSchema,
  ExecutionPayloadSchema,
  FunctionCallSchema,
  type ProfileOptions,
  ProfileOptionsSchema,
  type SendOptions,
  SendOptionsSchema,
  type SimulateOptions,
  SimulateOptionsSchema,
} from '@aztec/aztec.js/wallet';
import { type ChainInfo, ChainInfoSchema } from '@aztec/entrypoints/interfaces';
import { jsonParseWithSchema, jsonStringify } from '@aztec/foundation/json-rpc';
import { createLogger } from '@aztec/foundation/log';
import {
  type ContractArtifact,
  ContractArtifactSchema,
  type EventMetadataDefinition,
  type FunctionCall,
} from '@aztec/stdlib/abi';
import {
  type ContractClassMetadata,
  type ContractInstanceWithAddress,
  ContractInstanceWithAddressSchema,
  type ContractMetadata,
} from '@aztec/stdlib/contract';
import { AbiDecodedSchema } from '@aztec/stdlib/schemas';
import { TxProfileResult, TxReceipt, TxSimulationResult, UtilitySimulationResult } from '@aztec/stdlib/tx';
import type { JSONRPCParams, JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import { type ZodTypeAny, z } from 'zod';
import type { AztecWalletMethodMap } from './types.js';

const logger = createLogger('aztec-rpc-wallet:serializers');

const IntentInnerHashSchema = z.object({
  consumer: AztecAddress.schema,
  innerHash: Fr.schema,
});

const CallIntentSchema = z.object({
  caller: AztecAddress.schema,
  call: FunctionCallSchema,
});

const AliasedAztecAddressSchema = z.object({
  alias: z.string(),
  item: AztecAddress.schema,
});

function createSerializer<P, R>({
  paramSchema,
  resultSchema,
}: {
  paramSchema?: ZodTypeAny;
  resultSchema?: ZodTypeAny;
}): JSONRPCSerializer<JSONRPCParams, R> {
  return {
    params: {
      serialize: async (method: string, value: JSONRPCParams) => ({
        method,
        serialized: jsonStringify(value),
      }),
      deserialize: async (method: string, data: JSONRPCSerializedData) => {
        if (paramSchema) {
          return jsonParseWithSchema(data.serialized, paramSchema);
        }
        // If no schema is provided, parse as JSON
        logger.debug(`Deserializing params for method without schema: ${method}`);
        return JSON.parse(data.serialized) as P;
      },
    },
    result: {
      serialize: async (method: string, value: R) => ({ method, serialized: jsonStringify(value) }),
      deserialize: async (method: string, data: JSONRPCSerializedData) => {
        if (resultSchema) {
          return jsonParseWithSchema<R>(data.serialized, resultSchema);
        }
        // If no schema is provided, parse as JSON
        logger.debug(`Deserializing result for method without schema: ${method}`);
        return JSON.parse(data.serialized) as R;
      },
    },
  };
}

export const SERIALIZERS: Record<keyof AztecWalletMethodMap, JSONRPCSerializer<JSONRPCParams, unknown>> = {
  aztec_getContractClassMetadata: createSerializer<[Fr, boolean | undefined], ContractClassMetadata>({
    paramSchema: z.tuple([Fr.schema, z.boolean().optional()]),
    resultSchema: ContractClassMetadataSchema,
  }),
  aztec_getContractMetadata: createSerializer<[AztecAddress], ContractMetadata>({
    paramSchema: z.tuple([AztecAddress.schema]),
    resultSchema: ContractMetadataSchema,
  }),
  aztec_getPrivateEvents: createSerializer<
    [AztecAddress, EventMetadataDefinition, number, number, AztecAddress[]],
    unknown[]
  >({
    paramSchema: z.tuple([
      AztecAddress.schema,
      EventMetadataDefinitionSchema,
      z.number(),
      z.number(),
      z.array(AztecAddress.schema),
    ]),
    resultSchema: z.array(AbiDecodedSchema),
  }),
  aztec_getChainInfo: createSerializer<[], ChainInfo>({
    resultSchema: ChainInfoSchema,
  }),
  aztec_getTxReceipt: createSerializer<[TxHash], TxReceipt>({
    paramSchema: z.tuple([TxHash.schema]),
    resultSchema: TxReceipt.schema,
  }),
  aztec_registerSender: createSerializer<[AztecAddress], AztecAddress>({
    paramSchema: z.tuple([AztecAddress.schema]),
    resultSchema: AztecAddress.schema,
  }),
  aztec_getAddressBook: createSerializer<[], Aliased<AztecAddress>[]>({
    paramSchema: z.tuple([]),
    resultSchema: z.array(AliasedAztecAddressSchema),
  }),
  aztec_getAccounts: createSerializer<[], Aliased<AztecAddress>[]>({
    paramSchema: z.tuple([]),
    resultSchema: z.array(AliasedAztecAddressSchema),
  }),
  aztec_registerContract: createSerializer<
    [ContractInstanceWithAddress, ContractArtifact | undefined],
    ContractInstanceWithAddress
  >({
    paramSchema: z.tuple([ContractInstanceWithAddressSchema, ContractArtifactSchema.optional()]),
    resultSchema: ContractInstanceWithAddressSchema,
  }),
  aztec_simulateTx: createSerializer<[ExecutionPayload, SimulateOptions], TxSimulationResult>({
    paramSchema: z.tuple([ExecutionPayloadSchema, SimulateOptionsSchema]),
    resultSchema: TxSimulationResult.schema,
  }),
  aztec_simulateUtility: createSerializer<[FunctionCall, AuthWitness[] | undefined], UtilitySimulationResult>(
    {
      paramSchema: z.tuple([FunctionCallSchema, z.array(AuthWitness.schema).optional()]),
      resultSchema: UtilitySimulationResult.schema,
    },
  ),
  aztec_profileTx: createSerializer<[ExecutionPayload, ProfileOptions], TxProfileResult>({
    paramSchema: z.tuple([ExecutionPayloadSchema, ProfileOptionsSchema]),
    resultSchema: TxProfileResult.schema,
  }),
  aztec_sendTx: createSerializer<[ExecutionPayload, SendOptions], TxHash>({
    paramSchema: z.tuple([ExecutionPayloadSchema, SendOptionsSchema]),
    resultSchema: TxHash.schema,
  }),
  aztec_createAuthWit: createSerializer<[Fr | IntentInnerHash | CallIntent], AuthWitness>({
    paramSchema: z.tuple([z.union([Fr.schema, IntentInnerHashSchema, CallIntentSchema])]),
    resultSchema: AuthWitness.schema,
  }),
  /**
   *  From aztec-packages/yarn-project/aztec.js/src/wallet/wallet.ts:
        export type BatchableMethods = Pick<
          Wallet,
          'registerContract' | 'sendTx' | 'registerSender' | 'simulateUtility' | 'simulateTx'
        >;

      aztec_batch result is an array of the results of each of those batchable method types
  */
  aztec_batch: createSerializer<
    [BatchedMethod<keyof BatchableMethods>[]],
    BatchResults<BatchedMethod<keyof BatchableMethods>[]>
  >({
    paramSchema: z.array(BatchedMethodSchema),
    resultSchema: z.array(
      z.union([
        z.boolean(), // registerContract
        TxHash.schema, // sendTx
        AztecAddress.schema, // registerSender
        UtilitySimulationResult.schema, // simulateUtility
        TxSimulationResult.schema, // simulateTx
      ]),
    ),
  }),
};
