import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import { TxProvingResult } from '@aztec/circuit-types';
import {
  PrivateExecutionResult,
  TxEffect,
  TxSimulationResult,
  inBlockSchemaFor,
  TxHash,
} from '@aztec/circuit-types';
import { TxExecutionRequest, TxReceipt, Tx, AztecAddress } from '@aztec/aztec.js';
import { serializeExecutionRequestInit, deserializeExecutionRequestInit } from './transaction-utils.js';

import { jsonParseWithSchema, jsonStringify } from '@aztec/foundation/json-rpc';

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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'],
    ): JSONRPCSerializedData => {
      const { exec } = value;
      return {
        method,
        serialized: serializeExecutionRequestInit(exec),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_createTxExecutionRequest']['params'] => {
      const exec = deserializeExecutionRequestInit(data.serialized);
      return { exec };
    },
  };

  result = {
    serialize: (method: string, value: TxExecutionRequest): JSONRPCSerializedData => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: (_method: string, data: JSONRPCSerializedData): TxExecutionRequest => {
      return jsonParseWithSchema(data.serialized, TxExecutionRequest.schema);
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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_proveTx']['params'],
    ): JSONRPCSerializedData => {
      const { txRequest, privateExecutionResult } = value;
      return {
        method,
        serialized: JSON.stringify({
          txRequest: jsonStringify(txRequest),
          privateExecutionResult: jsonStringify(privateExecutionResult),
        }),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_proveTx']['params'] => {
      const { txRequest, privateExecutionResult } = JSON.parse(data.serialized);
      return {
        txRequest: jsonParseWithSchema(txRequest, TxExecutionRequest.schema),
        privateExecutionResult: jsonParseWithSchema(privateExecutionResult, PrivateExecutionResult.schema),
      };
    },
  };

  result = {
    serialize: (method: string, value: TxProvingResult): JSONRPCSerializedData => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: (_method: string, data: JSONRPCSerializedData): TxProvingResult => {
      return jsonParseWithSchema(data.serialized, TxProvingResult.schema);
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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_sendTx']['params'],
    ): JSONRPCSerializedData => {
      const { tx } = value;
      return {
        method,
        serialized: jsonStringify(tx),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_sendTx']['params'] => {
      return { tx: jsonParseWithSchema(data.serialized, Tx.schema) };
    },
  };

  result = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_sendTx']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_sendTx']['result'] => {
      return jsonParseWithSchema(data.serialized, TxHash.schema);
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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxEffect']['params'],
    ): JSONRPCSerializedData => {
      const { txHash } = value;
      return {
        method,
        serialized: jsonStringify(txHash),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getTxEffect']['params'] => {
      const txHash = jsonParseWithSchema(data.serialized, TxHash.schema);
      return { txHash };
    },
  };

  result = {
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxEffect']['result'],
    ): JSONRPCSerializedData => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getTxEffect']['result'] => {
      return jsonParseWithSchema(data.serialized, inBlockSchemaFor(TxEffect.schema));
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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_getTxReceipt']['params'],
    ): JSONRPCSerializedData => {
      const { txHash } = value;
      return {
        method,
        serialized: jsonStringify(txHash),
      };
    },
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_getTxReceipt']['params'] => {
      const txHash = jsonParseWithSchema(data.serialized, TxHash.schema);
      return { txHash };
    },
  };

  result = {
    serialize: (method: string, value: TxReceipt): JSONRPCSerializedData => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: (_method: string, data: JSONRPCSerializedData): TxReceipt => {
      return jsonParseWithSchema(data.serialized, TxReceipt.schema);
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
    serialize: (
      method: string,
      value: AztecWalletMethodMap['aztec_simulateTx']['params'],
    ): JSONRPCSerializedData => {
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
    deserialize: (
      _method: string,
      data: JSONRPCSerializedData,
    ): AztecWalletMethodMap['aztec_simulateTx']['params'] => {
      const { txRequest, simulatePublic, msgSender, skipTxValidation, enforceFeePayment, profile } =
        JSON.parse(data.serialized);
      return {
        txRequest: jsonParseWithSchema(txRequest, TxExecutionRequest.schema),
        simulatePublic,
        msgSender: jsonParseWithSchema(msgSender, AztecAddress.schema),
        skipTxValidation,
        enforceFeePayment,
        profile,
      };
    },
  };

  result = {
    serialize: (method: string, value: TxSimulationResult): JSONRPCSerializedData => {
      return {
        method,
        serialized: jsonStringify(value),
      };
    },
    deserialize: (_method: string, data: JSONRPCSerializedData): TxSimulationResult => {
      return jsonParseWithSchema(data.serialized, TxSimulationResult.schema);
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
