import { describe, it, expect, beforeEach } from 'vitest';
import { MessageType, type Message } from './types.js';
import { ProtocolValidator } from './protocol-validator.js';
import { ProtocolErrorCode } from './errors.js';
import type { ProtocolError } from './errors.js';

type AnyMessage = Message<unknown>;

describe('ProtocolValidator', () => {
  let validator: ProtocolValidator;

  beforeEach(() => {
    validator = new ProtocolValidator();
  });

  describe('validatePayload', () => {
    it('should validate valid payloads', () => {
      const validPayloads = [
        { method: 'test' },
        { result: 'success' },
        { error: 'failed' },
        { method: 'test', additionalField: true },
      ];

      for (const payload of validPayloads) {
        const result = validator.validatePayload(payload) as { success: true; data: unknown };
        expect(result.success).toBe(true);
        expect(result.data).toBe(payload);
      }
    });

    it('should reject invalid payload types', () => {
      const invalidPayloads = [null, undefined, 123, 'string', true, [], () => {}];

      for (const payload of invalidPayloads) {
        const result = validator.validatePayload(payload as unknown) as {
          success: false;
          error: ProtocolError;
        };
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });

    it('should reject payloads without required fields', () => {
      const invalidPayload = { someField: 'value' };
      const result = validator.validatePayload(invalidPayload) as { success: false; error: ProtocolError };
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
    });
  });

  describe('validateMessage', () => {
    const validMessage: AnyMessage = {
      id: 'test-id',
      type: MessageType.REQUEST,
      timestamp: Date.now(),
      payload: { method: 'test' },
    };

    it('should validate valid messages', () => {
      const result = validator.validateMessage(validMessage) as { success: true; data: AnyMessage };
      expect(result.success).toBe(true);
      expect(result.data).toBe(validMessage);
    });

    it('should reject non-object messages', () => {
      const invalidMessages = [null, undefined];

      for (const message of invalidMessages) {
        const result = validator.validateMessage(message as unknown as AnyMessage) as {
          success: false;
          error: ProtocolError;
        };
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
      }
    });

    it('should reject invalid object-like messages', () => {
      const invalidMessages = [
        {},
        { id: 'test' },
        { type: MessageType.REQUEST },
        { timestamp: Date.now() },
        { payload: {} },
      ];

      for (const message of invalidMessages) {
        const result = validator.validateMessage(message as unknown as AnyMessage) as {
          success: false;
          error: ProtocolError;
        };
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should reject messages with invalid id format', () => {
      const invalidIds = ['', 123, true, [], {}, null, undefined];

      for (const id of invalidIds) {
        const message = {
          ...validMessage,
          id,
        };
        const result = validator.validateMessage(message as unknown as AnyMessage) as {
          success: false;
          error: ProtocolError;
        };
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
      }
    });

    it('should reject messages with invalid type', () => {
      const invalidTypes = ['', 'invalid-type', 123, true, [], {}, null, undefined];

      for (const type of invalidTypes) {
        const message = {
          ...validMessage,
          type,
        };
        const result = validator.validateMessage(message as unknown as AnyMessage) as {
          success: false;
          error: ProtocolError;
        };
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE);
      }
    });

    it('should reject messages with invalid timestamp', () => {
      const makeMessage = (timestamp: unknown): Record<string, unknown> => ({
        ...validMessage,
        timestamp,
      });

      const invalidTimestamps = [
        makeMessage(undefined),
        makeMessage(null),
        makeMessage('123'),
        makeMessage(true),
        makeMessage([]),
        makeMessage({}),
        makeMessage(() => {}),
        makeMessage(String(Date.now())),
        makeMessage(new Date()),
        makeMessage({ valueOf: () => Date.now() }),
      ];

      for (const message of invalidTimestamps) {
        const result = validator.validateMessage(message as unknown as AnyMessage);
        expect(result.success).toBe(false);
        expect((result as { success: false; error: ProtocolError }).error.code).toBe(
          ProtocolErrorCode.INVALID_FORMAT,
        );
      }
    });

    it('should reject messages with invalid payload', () => {
      const invalidPayloads = [null, undefined, 123, 'string', true, [], { invalidField: true }];

      for (const payload of invalidPayloads) {
        const message = {
          ...validMessage,
          payload,
        };
        const result = validator.validateMessage(message as unknown as AnyMessage) as {
          success: false;
          error: ProtocolError;
        };
        expect(result.success).toBe(false);
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });
  });
});
