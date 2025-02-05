import type { AztecWalletMethodMap } from '../types.js';
import type { JSONRPCSerializedData, JSONRPCSerializer } from '@walletmesh/jsonrpc';
import type { EventMetadataDefinition } from '@aztec/circuit-types';
import {
  GetPublicLogsResponseSchema,
  GetContractClassLogsResponseSchema,
  TxHash,
  LogId,
} from '@aztec/circuit-types';
import { AztecAddress, type LogFilter, Point } from '@aztec/aztec.js';
import { EventSelector } from '@aztec/foundation/abi';

/**
 * Serializer for the aztec_getPublicLogs RPC method.
 * Handles serialization of public log queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetPublicLogsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getPublicLogs']['params'],
      AztecWalletMethodMap['aztec_getPublicLogs']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getPublicLogs']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { filter } = value;
      // Convert all fields that need string conversion
      const serializedFilter = {
        ...filter,
        txHash: filter.txHash?.toString(),
        contractAddress: filter.contractAddress?.toString(),
        afterLog: filter.afterLog?.toString(),
        fromBlock: filter.fromBlock,
        toBlock: filter.toBlock,
      };
      return Promise.resolve({
        method,
        serialized: JSON.stringify({ filter: serializedFilter }),
      });
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getPublicLogs']['params']> => {
      const { filter } = JSON.parse(data.serialized);
      const deserializedFilter: Partial<{
        txHash: TxHash;
        contractAddress: AztecAddress;
        afterLog: LogId;
        fromBlock: number;
        toBlock: number;
      }> = {};

      if (filter.txHash) deserializedFilter.txHash = TxHash.fromString(filter.txHash);
      if (filter.contractAddress)
        deserializedFilter.contractAddress = AztecAddress.fromString(filter.contractAddress);
      if (filter.afterLog) deserializedFilter.afterLog = LogId.fromString(filter.afterLog);
      if (filter.fromBlock !== undefined) deserializedFilter.fromBlock = filter.fromBlock;
      if (filter.toBlock !== undefined) deserializedFilter.toBlock = filter.toBlock;

      return Promise.resolve({ filter: deserializedFilter });
    },
  };

  result = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getPublicLogs']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getPublicLogs']['result']> => {
      return Promise.resolve(GetPublicLogsResponseSchema.parse(JSON.parse(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_getContractClassLogs RPC method.
 * Handles serialization of contract class log queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetContractClassLogsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getContractClassLogs']['params'],
      AztecWalletMethodMap['aztec_getContractClassLogs']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClassLogs']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { filter } = value;
      // Convert fields to strings for schema validation
      const serializedFilter = {
        txHash: filter.txHash?.toString() ?? undefined,
        contractAddress: filter.contractAddress?.toString() ?? undefined,
        afterLog: filter.afterLog?.toString() ?? undefined,
        fromBlock: filter.fromBlock,
        toBlock: filter.toBlock,
      };
      return Promise.resolve({
        method,
        serialized: JSON.stringify({ filter: serializedFilter }),
      });
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getContractClassLogs']['params']> => {
      const { filter } = JSON.parse(data.serialized);
      const deserializedFilter: LogFilter = {};

      if (filter.txHash) deserializedFilter.txHash = TxHash.fromString(filter.txHash);
      if (filter.contractAddress)
        deserializedFilter.contractAddress = AztecAddress.fromString(filter.contractAddress);
      if (filter.afterLog) deserializedFilter.afterLog = LogId.fromString(filter.afterLog);
      if (filter.fromBlock !== undefined) deserializedFilter.fromBlock = filter.fromBlock;
      if (filter.toBlock !== undefined) deserializedFilter.toBlock = filter.toBlock;

      return Promise.resolve({ filter: deserializedFilter });
    },
  };

  result = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getContractClassLogs']['result'],
    ): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(GetContractClassLogsResponseSchema.parse(value)),
      });
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getContractClassLogs']['result']> => {
      return Promise.resolve(GetContractClassLogsResponseSchema.parse(JSON.parse(data.serialized)));
    },
  };
}

/**
 * Serializer for the aztec_getPrivateEvents RPC method.
 * Handles serialization of private event queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetPrivateEventsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getPrivateEvents']['params'],
      AztecWalletMethodMap['aztec_getPrivateEvents']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getPrivateEvents']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { event, from, limit, vpks } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify({
          event: {
            eventSelector: event.eventSelector.toString(),
            abiType: {
              kind: event.abiType.kind,
            },
            fieldNames: event.fieldNames,
          },
          from,
          limit,
          vpks: vpks?.map((p) => p.toString()),
        }),
      });
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getPrivateEvents']['params']> => {
      const { event: serializedEvent, from, limit, vpks } = JSON.parse(data.serialized);
      const event: EventMetadataDefinition = {
        eventSelector: EventSelector.fromString(serializedEvent.eventSelector),
        abiType: {
          kind: serializedEvent.abiType.kind,
        },
        fieldNames: serializedEvent.fieldNames,
      };
      return Promise.resolve({
        event,
        from,
        limit,
        vpks: vpks?.map((p: string) => Point.fromString(p)),
      });
    },
  };

  result = {
    serialize: async (method: string, value: unknown[]): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<unknown[]> => {
      return Promise.resolve(JSON.parse(data.serialized));
    },
  };
}

/**
 * Serializer for the aztec_getPublicEvents RPC method.
 * Handles serialization of public event queries and results between JSON-RPC format and native Aztec types.
 */
export class AztecGetPublicEventsSerializer
  implements
    JSONRPCSerializer<
      AztecWalletMethodMap['aztec_getPublicEvents']['params'],
      AztecWalletMethodMap['aztec_getPublicEvents']['result']
    >
{
  params = {
    serialize: async (
      method: string,
      value: AztecWalletMethodMap['aztec_getPublicEvents']['params'],
    ): Promise<JSONRPCSerializedData> => {
      const { event, from, limit } = value;
      return Promise.resolve({
        method,
        serialized: JSON.stringify({
          event: {
            eventSelector: event.eventSelector.toString(),
            abiType: {
              kind: event.abiType.kind,
            },
            fieldNames: event.fieldNames,
          },
          from,
          limit,
        }),
      });
    },
    deserialize: async (
      _method: string,
      data: JSONRPCSerializedData,
    ): Promise<AztecWalletMethodMap['aztec_getPublicEvents']['params']> => {
      const { event: serializedEvent, from, limit } = JSON.parse(data.serialized);
      const event: EventMetadataDefinition = {
        eventSelector: EventSelector.fromString(serializedEvent.eventSelector),
        abiType: {
          kind: serializedEvent.abiType.kind,
        },
        fieldNames: serializedEvent.fieldNames,
      };
      return Promise.resolve({
        event,
        from,
        limit,
      });
    },
  };

  result = {
    serialize: async (method: string, value: unknown[]): Promise<JSONRPCSerializedData> => {
      return Promise.resolve({
        method,
        serialized: JSON.stringify(value),
      });
    },
    deserialize: async (_method: string, data: JSONRPCSerializedData): Promise<unknown[]> => {
      return Promise.resolve(JSON.parse(data.serialized));
    },
  };
}

/**
 * Pre-instantiated serializer instances for each Aztec log/event-related RPC method.
 */
export const aztecGetPublicLogsSerializer = new AztecGetPublicLogsSerializer();
export const aztecGetContractClassLogsSerializer = new AztecGetContractClassLogsSerializer();
export const aztecGetPrivateEventsSerializer = new AztecGetPrivateEventsSerializer();
export const aztecGetPublicEventsSerializer = new AztecGetPublicEventsSerializer();
