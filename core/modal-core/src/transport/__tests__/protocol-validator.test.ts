import { describe, it, expect } from 'vitest';
import { ProtocolValidator, type ValidationResult } from '../protocol-validator.js';
import { ProtocolErrorCode } from '../errors.js';
import { MessageType, type Message, type ProtocolPayload } from '../types.js';

interface TestPayload extends ProtocolPayload {
  request: {
    method: string;
    params: Record<string, unknown>;
  };
  response: {
    result?: unknown;
    error?: string;
  };
}

describe('ProtocolValidator', () => {
  const validator = new ProtocolValidator<TestPayload>();

  describe('validateMessageStructure', () => {
    it('should validate correct message structure', () => {
      const message: Message<TestPayload> = {
        type: MessageType.REQUEST,
        id: 'test-1',
        timestamp: Date.now(),
        payload: {
          request: {
            method: 'test',
            params: {},
          },
          response: {},
        },
      };

      const result = validator.validateMessageStructure(message);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should reject non-object messages', () => {
      const result = validator.validateMessageStructure('not an object');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
      }
    });

    it('should require message type', () => {
      const message = {
        id: 'test-1',
        timestamp: Date.now(),
        payload: {},
      };

      const result = validator.validateMessageStructure(message);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should require message id', () => {
      const message = {
        type: MessageType.REQUEST,
        timestamp: Date.now(),
        payload: {},
      };

      const result = validator.validateMessageStructure(message);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });
  });

  describe('validatePayload', () => {
    it('should validate correct payload', () => {
      const payload: TestPayload = {
        request: {
          method: 'test',
          params: {},
        },
        response: {
          result: 'success',
        },
      };

      const result = validator.validatePayload(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(payload);
      }
    });

    it('should validate payload with error response', () => {
      const payload: TestPayload = {
        request: {
          method: 'test',
          params: {},
        },
        response: {
          error: 'Test error',
        },
      };

      const result = validator.validatePayload(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(payload);
      }
    });

    it('should reject missing request when required', () => {
      const payload = {
        response: {
          result: 'success',
        },
      };

      const result = validator.validatePayload(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });

    it('should accept missing request when not required', () => {
      const payload = {
        response: {
          result: 'success',
        },
      };

      const result = validator.validatePayload(payload, false);
      expect(result.success).toBe(true);
    });

    it('should reject invalid request format', () => {
      const payload = {
        request: {
          // Missing method
          params: {},
        },
        response: {},
      };

      const result = validator.validatePayload(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });

    it('should reject invalid response format', () => {
      const payload = {
        request: {
          method: 'test',
          params: {},
        },
        response: {
          // Can't have both result and error
          result: 'success',
          error: 'failure',
        },
      };

      const result = validator.validatePayload(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });
  });

  describe('validateMessage', () => {
    it('should validate complete valid message', () => {
      const message: Message<TestPayload> = {
        type: MessageType.REQUEST,
        id: 'test-1',
        timestamp: Date.now(),
        payload: {
          request: {
            method: 'test',
            params: {},
          },
          response: {
            result: 'success',
          },
        },
      };

      const result = validator.validateMessage(message);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(message);
      }
    });

    it('should reject message with invalid structure', () => {
      const message = {
        // Missing required fields
        payload: {},
      };

      const result = validator.validateMessage(message);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      }
    });

    it('should reject message with invalid payload', () => {
      const message: Message<TestPayload> = {
        type: MessageType.REQUEST,
        id: 'test-1',
        timestamp: Date.now(),
        payload: {
          // Invalid payload structure
          request: { 
            method: '',  // Empty method name is invalid
            params: {}
          },
          response: {},
        },
      };

      const result = validator.validateMessage(message);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      }
    });
  });
});