import { describe, expect, it } from 'vitest';
import { Point, AztecAddress } from '@aztec/aztec.js';
import { EventSelector } from '@aztec/foundation/abi';
import type { AbiType } from '@aztec/foundation/abi';
import {
  ExtendedPublicLog,
  type GetPublicLogsResponse,
  type GetContractClassLogsResponse,
  type LogFilter,
  LogId,
  TxHash,
} from '@aztec/circuit-types';
import {
  aztecGetPublicLogsSerializer,
  aztecGetPrivateEventsSerializer,
  aztecGetPublicEventsSerializer,
  aztecGetContractClassLogsSerializer,
} from './log.js';

describe('Log Serializers', () => {
  const createRandomLog = async () => {
    const log = await ExtendedPublicLog.random();
    return log;
  };
  describe('aztec_getPublicLogs', () => {
    const METHOD = 'aztec_getPublicLogs';

    it('should serialize and deserialize params', async () => {
      const filter: LogFilter = {
        txHash: await TxHash.random(),
        fromBlock: 0,
        toBlock: 100,
        afterLog: await LogId.random(),
        contractAddress: await AztecAddress.random(),
      };

      const params = { filter };

      const serialized = aztecGetPublicLogsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPublicLogsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.contractAddress?.toString()).toBe(filter.contractAddress?.toString());
      expect(deserialized.filter.txHash?.toString()).toBe(filter.txHash?.toString());
      expect(deserialized.filter.fromBlock).toBe(filter.fromBlock);
      expect(deserialized.filter.toBlock).toBe(filter.toBlock);
      expect(deserialized.filter.afterLog?.toString()).toBe(filter.afterLog?.toString());
    });

    it('should serialize and deserialize result', async () => {
      const log = await ExtendedPublicLog.random();
      const result: GetPublicLogsResponse = {
        logs: [log],
        maxLogsHit: false,
      };

      const serialized = aztecGetPublicLogsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPublicLogsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.logs[0].toString()).toBe(result.logs[0].toString());
      expect(deserialized.logs.length).toBe(result.logs.length);
      expect(deserialized.maxLogsHit).toBe(result.maxLogsHit);
    });
  });

  describe('aztec_getPrivateEvents', () => {
    const METHOD = 'aztec_getPrivateEvents';

    it('should serialize and deserialize params', async () => {
      const event = {
        eventSelector: EventSelector.fromString('0x12345678'),
        abiType: {
          kind: 'field',
        } as AbiType,
        fieldNames: ['field1', 'field2'],
      };
      const params = {
        event,
        from: 0,
        limit: 10,
        vpks: [await Point.random(), await Point.random()],
      };

      const serialized = aztecGetPrivateEventsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPrivateEventsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.event.eventSelector.toString()).toBe(event.eventSelector.toString());
      expect(deserialized.event.abiType).toEqual(event.abiType);
      expect(deserialized.event.fieldNames).toEqual(event.fieldNames);
      expect(deserialized.from).toBe(params.from);
      expect(deserialized.limit).toBe(params.limit);
      expect(deserialized.vpks?.map((p) => p.toString())).toEqual(params.vpks.map((p) => p.toString()));
    });
  });

  describe('aztec_getPublicEvents', () => {
    const METHOD = 'aztec_getPublicEvents';

    it('should serialize and deserialize params', () => {
      const event = {
        eventSelector: EventSelector.fromString('0x12345678'),
        abiType: {
          kind: 'field',
        } as AbiType,
        fieldNames: ['field1', 'field2'],
      };
      const params = {
        event,
        from: 0,
        limit: 10,
      };

      const serialized = aztecGetPublicEventsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPublicEventsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.event.eventSelector.toString()).toBe(event.eventSelector.toString());
      expect(deserialized.event.abiType).toEqual(event.abiType);
      expect(deserialized.event.fieldNames).toEqual(event.fieldNames);
      expect(deserialized.from).toBe(params.from);
      expect(deserialized.limit).toBe(params.limit);
    });
  });

  describe('aztec_getContractClassLogs', () => {
    const METHOD = 'aztec_getContractClassLogs';

    it('should serialize and deserialize params with complete filter', async () => {
      const txHash = await TxHash.random();
      const contractAddress = await AztecAddress.random();
      const afterLog = await LogId.random();

      const filter: LogFilter = {
        txHash,
        fromBlock: 0,
        toBlock: 100,
        afterLog,
        contractAddress,
      };

      const params = { filter };
      const serialized = aztecGetContractClassLogsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetContractClassLogsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.contractAddress?.toString()).toBe(filter.contractAddress?.toString());
      expect(deserialized.filter.txHash?.toString()).toBe(filter.txHash?.toString());
      expect(deserialized.filter.fromBlock).toBe(filter.fromBlock);
      expect(deserialized.filter.toBlock).toBe(filter.toBlock);
      expect(deserialized.filter.afterLog?.toString()).toBe(filter.afterLog?.toString());
    });

    it('should serialize and deserialize params with minimal filter', () => {
      const filter: LogFilter = {
        fromBlock: 0,
        toBlock: 100,
      };

      const params = { filter };
      const serialized = aztecGetContractClassLogsSerializer.params.serialize(METHOD, params);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetContractClassLogsSerializer.params.deserialize(METHOD, serialized);
      expect(deserialized.filter.contractAddress).toBeUndefined();
      expect(deserialized.filter.txHash).toBeUndefined();
      expect(deserialized.filter.fromBlock).toBe(filter.fromBlock);
      expect(deserialized.filter.toBlock).toBe(filter.toBlock);
      expect(deserialized.filter.afterLog).toBeUndefined();
    });

    it('should serialize and deserialize result', async () => {
      // Create a mock response that matches the schema
      const result: GetContractClassLogsResponse = {
        logs: [],
        maxLogsHit: false,
      };

      const serialized = aztecGetContractClassLogsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetContractClassLogsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized.logs).toEqual([]);
      expect(deserialized.maxLogsHit).toBe(result.maxLogsHit);
    });
  });

  describe('aztec_getPrivateEvents result handling', () => {
    const METHOD = 'aztec_getPrivateEvents';

    it('should serialize and deserialize empty result array', () => {
      const result: unknown[] = [];
      const serialized = aztecGetPrivateEventsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPrivateEventsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toEqual([]);
    });

    it('should serialize and deserialize result with multiple events', () => {
      const result = [
        { id: 1, data: 'event1' },
        { id: 2, data: 'event2' },
        { id: 3, data: 'event3' },
      ];

      const serialized = aztecGetPrivateEventsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPrivateEventsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toEqual(result);
    });
  });

  describe('aztec_getPublicEvents result handling', () => {
    const METHOD = 'aztec_getPublicEvents';

    it('should serialize and deserialize empty result array', () => {
      const result: unknown[] = [];
      const serialized = aztecGetPublicEventsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPublicEventsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toEqual([]);
    });

    it('should serialize and deserialize result with multiple events', () => {
      const result = [
        { id: 1, data: 'event1' },
        { id: 2, data: 'event2' },
        { id: 3, data: 'event3' },
      ];

      const serialized = aztecGetPublicEventsSerializer.result.serialize(METHOD, result);
      expect(serialized.method).toBe(METHOD);

      const deserialized = aztecGetPublicEventsSerializer.result.deserialize(METHOD, serialized);
      expect(deserialized).toEqual(result);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid JSON in deserialization', () => {
      const METHOD = 'aztec_getPublicLogs';
      const invalidData = { method: METHOD, serialized: 'invalid json' };

      expect(() => {
        aztecGetPublicLogsSerializer.params.deserialize(METHOD, invalidData);
      }).toThrow();
    });

    it('should handle malformed event selector', () => {
      const METHOD = 'aztec_getPublicEvents';
      const params = {
        event: {
          // Create an invalid event selector by extending a valid one
          eventSelector: Object.create(EventSelector.fromString('0x12345678'), {
            toString: {
              value: () => {
                throw new Error('Invalid selector');
              },
            },
          }),
          abiType: { kind: 'field' } as AbiType,
          fieldNames: ['field1'],
        },
        from: 0,
        limit: 10,
      };

      expect(() => {
        aztecGetPublicEventsSerializer.params.serialize(METHOD, params);
      }).toThrow();
    });

    it('should handle undefined filter fields', async () => {
      const METHOD = 'aztec_getPublicLogs';
      const filter: LogFilter = {
        fromBlock: undefined,
        toBlock: undefined,
      };

      const params = { filter };
      const serialized = aztecGetPublicLogsSerializer.params.serialize(METHOD, params);
      const deserialized = aztecGetPublicLogsSerializer.params.deserialize(METHOD, serialized);

      expect(deserialized.filter.fromBlock).toBeUndefined();
      expect(deserialized.filter.toBlock).toBeUndefined();
    });
  });
});
