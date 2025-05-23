import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createEventHandlers } from './event.js';
import type { AccountWallet, PXE, AztecAddress } from '@aztec/aztec.js';
import type { EventMetadataDefinition } from '@aztec/stdlib/interfaces/client';
import type { AztecHandlerContext } from './index.js';
import type { ContractArtifactCache } from '../../contractArtifactCache.js';

// Mock dependencies
const createMockWallet = () =>
  ({
    // No specific methods needed for event handlers
  }) as unknown as AccountWallet;

const createMockPXE = () =>
  ({
    getPrivateEvents: vi.fn(),
    getPublicEvents: vi.fn(),
  }) as unknown as PXE;

const createMockContext = (wallet: AccountWallet, pxe: PXE): AztecHandlerContext => ({
  wallet,
  pxe,
  cache: {} as ContractArtifactCache,
});

describe('Event Handlers', () => {
  let mockWallet: AccountWallet;
  let mockPXE: PXE;
  let context: AztecHandlerContext;
  let handlers: ReturnType<typeof createEventHandlers>;

  beforeEach(() => {
    mockWallet = createMockWallet();
    mockPXE = createMockPXE();
    context = createMockContext(mockWallet, mockPXE);
    handlers = createEventHandlers();
  });

  describe('aztec_getPrivateEvents', () => {
    it('should get private events with all parameters', async () => {
      const contractAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      const eventMetadata = {
        eventSelector: 'TestEvent',
        fieldNames: ['field1', 'field2'],
      } as unknown as EventMetadataDefinition;
      const from = 100;
      const numBlocks = 50;
      const recipients = [
        '0xabcdef1234567890' as unknown as AztecAddress,
        '0x567890abcdef1234' as unknown as AztecAddress,
      ];

      const expectedEvents = [
        { eventType: 'TestEvent', data: { field1: 'value1', field2: 'value2' } },
        { eventType: 'TestEvent', data: { field1: 'value3', field2: 'value4' } },
      ];

      vi.mocked(mockPXE.getPrivateEvents).mockResolvedValue(expectedEvents);

      const result = await handlers.aztec_getPrivateEvents(context, [
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      ]);

      expect(mockPXE.getPrivateEvents).toHaveBeenCalledWith(
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      );
      expect(result).toBe(expectedEvents);
    });

    it('should get private events with minimal parameters', async () => {
      const contractAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      const eventMetadata = {
        eventSelector: 'TestEvent',
        fieldNames: ['field1'],
      } as unknown as EventMetadataDefinition;
      const from = 0;
      const numBlocks = 10;
      const recipients: AztecAddress[] = [];

      const expectedEvents = [{ eventType: 'TestEvent', data: { field1: 'value1' } }];

      vi.mocked(mockPXE.getPrivateEvents).mockResolvedValue(expectedEvents);

      const result = await handlers.aztec_getPrivateEvents(context, [
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      ]);

      expect(mockPXE.getPrivateEvents).toHaveBeenCalledWith(
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      );
      expect(result).toBe(expectedEvents);
    });

    it('should propagate errors from pxe.getPrivateEvents', async () => {
      const contractAddress = '0x1234567890abcdef' as unknown as AztecAddress;
      const eventMetadata = {
        eventSelector: 'TestEvent',
        fieldNames: ['field1'],
      } as unknown as EventMetadataDefinition;
      const from = 100;
      const numBlocks = 50;
      const recipients: AztecAddress[] = [];

      const error = new Error('Failed to get private events');
      vi.mocked(mockPXE.getPrivateEvents).mockRejectedValue(error);

      await expect(
        handlers.aztec_getPrivateEvents(context, [
          contractAddress,
          eventMetadata,
          from,
          numBlocks,
          recipients,
        ]),
      ).rejects.toThrow('Failed to get private events');
      expect(mockPXE.getPrivateEvents).toHaveBeenCalledWith(
        contractAddress,
        eventMetadata,
        from,
        numBlocks,
        recipients,
      );
    });

    it('should handle missing required parameters', async () => {
      await expect(
        handlers.aztec_getPrivateEvents(context, ['0x1234567890abcdef' as unknown as AztecAddress] as never),
      ).rejects.toThrow();
    });
  });

  describe('aztec_getPublicEvents', () => {
    it('should get public events with all parameters', async () => {
      const eventMetadata = {
        eventSelector: 'PublicTestEvent',
        fieldNames: ['publicField1', 'publicField2'],
      } as unknown as EventMetadataDefinition;
      const from = 200;
      const limit = 25;

      const expectedEvents = [
        { eventType: 'PublicTestEvent', data: { publicField1: 'pubValue1', publicField2: 'pubValue2' } },
        { eventType: 'PublicTestEvent', data: { publicField1: 'pubValue3', publicField2: 'pubValue4' } },
      ];

      vi.mocked(mockPXE.getPublicEvents).mockResolvedValue(expectedEvents);

      const result = await handlers.aztec_getPublicEvents(context, [eventMetadata, from, limit]);

      expect(mockPXE.getPublicEvents).toHaveBeenCalledWith(eventMetadata, from, limit);
      expect(result).toBe(expectedEvents);
    });

    it('should get public events with minimal parameters', async () => {
      const eventMetadata = {
        eventSelector: 'PublicTestEvent',
        fieldNames: ['publicField1'],
      } as unknown as EventMetadataDefinition;
      const from = 0;
      const limit = 100;

      const expectedEvents = [{ eventType: 'PublicTestEvent', data: { publicField1: 'pubValue1' } }];

      vi.mocked(mockPXE.getPublicEvents).mockResolvedValue(expectedEvents);

      const result = await handlers.aztec_getPublicEvents(context, [eventMetadata, from, limit]);

      expect(mockPXE.getPublicEvents).toHaveBeenCalledWith(eventMetadata, from, limit);
      expect(result).toBe(expectedEvents);
    });

    it('should propagate errors from pxe.getPublicEvents', async () => {
      const eventMetadata = {
        eventSelector: 'PublicTestEvent',
        fieldNames: ['publicField1'],
      } as unknown as EventMetadataDefinition;
      const from = 200;
      const limit = 25;

      const error = new Error('Failed to get public events');
      vi.mocked(mockPXE.getPublicEvents).mockRejectedValue(error);

      await expect(handlers.aztec_getPublicEvents(context, [eventMetadata, from, limit])).rejects.toThrow(
        'Failed to get public events',
      );
      expect(mockPXE.getPublicEvents).toHaveBeenCalledWith(eventMetadata, from, limit);
    });

    it('should handle missing required parameters', async () => {
      await expect(
        handlers.aztec_getPublicEvents(context, [
          {
            eventSelector: 'PublicTestEvent',
            fieldNames: ['publicField1'],
          } as unknown as EventMetadataDefinition,
        ] as never),
      ).rejects.toThrow();
    });
  });
});
