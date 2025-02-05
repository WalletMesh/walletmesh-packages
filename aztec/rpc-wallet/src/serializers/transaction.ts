import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import {
  FunctionCall,
  PrivateExecutionResult,
  TxEffect,
  TxSimulationResult,
  inBlockSchemaFor,
  TxHash,
  TxProvingResult,
} from '@aztec/circuit-types';
import { GasSettings } from '@aztec/circuits.js';
import {
  AuthWitness,
  AztecAddress,
  Fr,
  FunctionSelector,
  HashedValues,
  NoFeePaymentMethod,
  TxExecutionRequest,
  TxReceipt,
  Tx,
} from '@aztec/aztec.js';
import { AbiTypeSchema, type FunctionType } from '@aztec/foundation/abi';

import { jsonParseWithSchema, jsonStringify } from '@aztec/foundation/json-rpc';
import type { ExecutionRequestInit, FeeOptions } from '@aztec/aztec.js/entrypoint';

interface SerializedFunctionCall {
  name: string;
  to: string;
  selector: string;
  type: string;
  isStatic: boolean;
  args: string[];
  returnTypes: string[];
}

/**
 * Serializer for the aztec_createTxExecutionRequest RPC method.
 * Handles serialization of transaction execution requests between JSON-RPC format and native Aztec types.
 */
export class AztecCreateTxExecutionRequestSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
      AztecWalletMethodMap['aztec_createTxExecutionRequest']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { exec } = value;

      const calls = exec.calls.map((call: FunctionCall) => {
        return {
          name: call.name,
          to: jsonStringify(call.to),
          selector: jsonStringify(call.selector),
          type: call.type,
          isStatic: call.isStatic,
          args: call.args.map((arg) => jsonStringify(arg)),
          returnTypes: call.returnTypes.map((r) => jsonStringify(r)),
        };
      });
      const authWitnesses = exec.authWitnesses ? exec.authWitnesses.map((w) => jsonStringify(w)) : undefined;
      const hashedArguments = exec.hashedArguments
        ? exec.hashedArguments.map((h) => jsonStringify(h))
        : undefined;
      const fee = { gasSettings: jsonStringify(exec.fee.gasSettings) };
      const nonce = exec.nonce ? jsonStringify(exec.nonce) : undefined;

      return {
        method,
        serialized: JSON.stringify({
          calls,
          fee,
          authWitnesses,
          hashedArguments,
          nonce,
          cancellable: exec.cancellable,
        }),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_createTxExecutionRequest']['params']> => {
      const parsed = JSON.parse(data.serialized);

      const calls: FunctionCall[] = await Promise.all(
        parsed.calls.map(async (call: SerializedFunctionCall) => {
          return new FunctionCall(
            call.name,
            await jsonParseWithSchema(call.to, AztecAddress.schema),
            await jsonParseWithSchema(call.selector, FunctionSelector.schema),
            call.type as FunctionType,
            call.isStatic,
            await Promise.all(call.args.map(async (arg: string) => jsonParseWithSchema(arg, Fr.schema))),
            await Promise.all(
              call.returnTypes.map(async (t: string) => jsonParseWithSchema(t, AbiTypeSchema)),
            ),
          );
        }),
      );
      const authWitnesses = parsed.authWitnesses
        ? parsed.authWitnesses.map(async (w: string) => await jsonParseWithSchema(w, AuthWitness.schema))
        : undefined;
      const hashedArguments = parsed.hashedArguments
        ? parsed.hashedArguments.map(async (h: string) => await jsonParseWithSchema(h, HashedValues.schema))
        : undefined;
      const cancellable = parsed.cancellable;
      const nonce = parsed.nonce ? await jsonParseWithSchema(parsed.nonce, Fr.schema) : undefined;

      const fee: FeeOptions = {
        paymentMethod: new NoFeePaymentMethod(), // Default, caller should override
        gasSettings: await jsonParseWithSchema(parsed.fee.gasSettings, GasSettings.schema),
      };

      const exec: ExecutionRequestInit = { calls, fee };
      if (authWitnesses) exec.authWitnesses = authWitnesses;
      if (hashedArguments) exec.hashedArguments = hashedArguments;
      if (nonce) exec.nonce = nonce;
      if (cancellable) exec.cancellable = cancellable;

      return { exec };
    },
  };

  result = {
    serialize: async (method: string, value: TxExecutionRequest): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<TxExecutionRequest> => {
      return await jsonParseWithSchema(data.serialized, TxExecutionRequest.schema);
    },
  };
}

/**
 * Serializer for the aztec_proveTx RPC method.
 * Handles serialization of transaction proving requests and results between JSON-RPC format and native Aztec types.
 */
export class AztecProveTxSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_proveTx']['params'],
      AztecWalletMethodMap['aztec_proveTx']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_proveTx']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { txRequest, privateExecutionResult } = value;
      return {
        method,
        serialized: JSON.stringify({
          txRequest: jsonStringify(txRequest),
          privateExecutionResult: jsonStringify(privateExecutionResult),
        }),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_proveTx']['params']> => {
      const { txRequest, privateExecutionResult } = JSON.parse(data.serialized);
      return {
        txRequest: await jsonParseWithSchema(txRequest, TxExecutionRequest.schema),
        privateExecutionResult: await jsonParseWithSchema(
          privateExecutionResult,
          PrivateExecutionResult.schema,
        ),
      };
    },
  };

  result = {
    serialize: async (method: string, value: TxProvingResult): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<TxProvingResult> => {
      return await jsonParseWithSchema(data.serialized, TxProvingResult.schema);
    },
  };
}

/**
 * Serializer for the aztec_sendTx RPC method.
 * Handles serialization of transaction sending requests and transaction hash results between JSON-RPC format and native Aztec types.
 */
export class AztecSendTxSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_sendTx']['params'],
      AztecWalletMethodMap['aztec_sendTx']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_sendTx']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { tx } = value;
      return {
        method,
        serialized: jsonStringify(tx),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_sendTx']['params']> => {
      return { tx: await jsonParseWithSchema(data.serialized, Tx.schema) };
    },
  };

  result = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_sendTx']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_sendTx']['result']> => {
      return await jsonParseWithSchema(data.serialized, TxHash.schema);
    },
  };
}

/**
 * Serializer for the aztec_getTxEffect RPC method.
 * Handles serialization of transaction effect queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetTxEffectSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getTxEffect']['params'],
      AztecWalletMethodMap['aztec_getTxEffect']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxEffect']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { txHash } = value;
      return {
        method,
        serialized: jsonStringify(txHash),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getTxEffect']['params']> => {
      const txHash = await jsonParseWithSchema(data.serialized, TxHash.schema);
      return { txHash };
    },
  };

  result = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxEffect']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getTxEffect']['result']> => {
      return await jsonParseWithSchema(data.serialized, inBlockSchemaFor(TxEffect.schema));
    },
  };
}

/**
 * Serializer for the aztec_getTxReceipt RPC method.
 * Handles serialization of transaction receipt queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetTxReceiptSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getTxReceipt']['params'],
      AztecWalletMethodMap['aztec_getTxReceipt']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxReceipt']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { txHash } = value;
      return {
        method,
        serialized: jsonStringify(txHash),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getTxReceipt']['params']> => {
      const txHash = await jsonParseWithSchema(data.serialized, TxHash.schema);
      return { txHash };
    },
  };

  result = {
    serialize: async (method: string, value: TxReceipt): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<TxReceipt> => {
      return await jsonParseWithSchema(data.serialized, TxReceipt.schema);
    },
  };
}

/**
 * Serializer for the aztec_simulateTx RPC method.
 * Handles serialization of transaction simulation requests and results between JSON-RPC format and native Aztec types.
 */
export class AztecSimulateTxSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_simulateTx']['params'],
      AztecWalletMethodMap['aztec_simulateTx']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_simulateTx']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } = value;
      return {
        method,
        serialized: JSON.stringify({
          txRequest: jsonStringify(txRequest),
          simulatePublic,
          msgSender: JSON.stringify(msgSender),
          skipTxValidation,
          enforceFeePayment,
          profile,
        }),
      };
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_simulateTx']['params']> => {
      const { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } =
        JSON.parse(data.serialized);
      return {
        txRequest: await jsonParseWithSchema(txRequest, TxExecutionRequest.schema),
        simulatePublic,
        msgSender: await jsonParseWithSchema(msgSender, AztecAddress.schema),
        skipTxValidation,
        enforceFeePayment,
        profile,
      };
    },
  };

  result = {
    serialize: async (method: string, value: TxSimulationResult): Promise<JSONRPCSerializedData> => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<TxSimulationResult> => {
      return await jsonParseWithSchema(data.serialized, TxSimulationResult.schema);
    },
  };
}

/**
 * Pre-instantiated serializer instances for each Aztec transaction-related RPC method.
 * These instances can be used directly by the RPC handler implementation.
 */
export const aztecCreateTxExecutionRequestSerializer = new AztecCreateTxExecutionRequestSerializer();
export const aztecProveTxSerializer = new AztecProveTxSerializer();
export const aztecSendTxSerializer = new AztecSendTxSerializer();
export const aztecGetTxEffectSerializer = new AztecGetTxEffectSerializer();
export const aztecGetTxReceiptSerializer = new AztecGetTxReceiptSerializer();
export const aztecSimulateTxSerializer = new AztecSimulateTxSerializer();
