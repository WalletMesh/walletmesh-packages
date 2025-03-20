import { describe, it, expect } from 'vitest';
import { ProtocolValidator } from '../protocol-validator.js';
import { ProtocolError, ProtocolErrorCode } from '../errors.js';
import { MessageType } from '../types.js';
import type { Message } from '../types.js';

describe('ProtocolValidator', () => {
  const validator = new ProtocolValidator();

  describe('validateMessage', () => {
    it('should validate a valid request message', async () => {
      const message: Message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: {
          method: 'test',
          params: ['param1']
        },
        timestamp: Date.now()
      };

      const result = await validator.validateMessage(message);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should validate a valid response message', async () => {
      const message: Message = {
        id: '1',
        type: MessageType.RESPONSE,
        payload: {
          result: 'success'
        },
        timestamp: Date.now()
      };

      const result = await validator.validateMessage(message);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should fail on invalid request message structure', async () => {
      const message: Message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: {
          // Missing required method field
          params: ['param1']
        },
        timestamp: Date.now()
      };

      const result = await validator.validateMessage(message);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        expect((result.error as ProtocolError).code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });

    it('should fail on invalid response structure', async () => {
      const invalidMessage = {
        id: '1',
        type: MessageType.RESPONSE,
        timestamp: Date.now()
      } as Message; // Force type assertion for testing

      const result = await validator.validateMessage(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        expect((result.error as ProtocolError).code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should fail on missing message ID', async () => {
      const invalidMessage = {
        type: MessageType.REQUEST,
        payload: {
          method: 'test',
          params: ['param1']
        },
        timestamp: Date.now()
      } as Message; // Force type assertion for testing

      const result = await validator.validateMessage(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        expect((result.error as ProtocolError).code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should fail on invalid message type', async () => {
      const invalidMessage = {
        id: '1',
        type: 'INVALID_TYPE' as MessageType, // Force type assertion for testing
        payload: {
          method: 'test',
          params: ['param1']
        },
        timestamp: Date.now()
      } as Message;

      const result = await validator.validateMessage(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        expect((result.error as ProtocolError).code).toBe(ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE);
      }
    });

    it('should fail on missing timestamp', async () => {
      const invalidMessage = {
        id: '1',
        type: MessageType.REQUEST,
        payload: {
          method: 'test',
          params: ['param1']
        }
      } as Message; // Force type assertion for testing

      const result = await validator.validateMessage(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        expect((result.error as ProtocolError).code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should fail on invalid payload type', async () => {
      const invalidMessage = {
        id: '1',
        type: MessageType.REQUEST,
        payload: 'not an object',
        timestamp: Date.now()
      } as Message; // Force type assertion for testing

      const result = await validator.validateMessage(invalidMessage);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ProtocolError);
        expect((result.error as ProtocolError).code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });
  });
});