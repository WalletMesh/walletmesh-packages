/**
 * @packageDocumentation
 * Tests for protocol error types and factories
 */

import { describe, it, expect } from 'vitest';
import { ProtocolError, ProtocolErrorCode, createProtocolError, isProtocolError } from '../errors.js';

describe('Protocol Errors', () => {
  describe('ProtocolError', () => {
    it('should create error with code and details', () => {
      const error = new ProtocolError('Test error', ProtocolErrorCode.VALIDATION_FAILED, { test: true });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.details).toEqual({ test: true });
      expect(error.name).toBe('ProtocolError');
    });

    it('should format error message with toString', () => {
      const error = new ProtocolError(
        'Test error',
        ProtocolErrorCode.VALIDATION_FAILED,
        { data: 'test' }
      );

      expect(error.toString()).toBe(
        'ProtocolError[validation_failed]: Test error: {"data":"test"}'
      );
    });

    it('should format error message without details', () => {
      const error = new ProtocolError(
        'Test error',
        ProtocolErrorCode.VALIDATION_FAILED
      );

      expect(error.toString()).toBe(
        'ProtocolError[validation_failed]: Test error'
      );
    });
  });

  describe('Error Factory Methods', () => {
    it('should create validation error', () => {
      const error = createProtocolError.validation('Validation failed', { field: 'test' });
      
      expect(error.code).toBe(ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should create invalid format error', () => {
      const error = createProtocolError.invalidFormat('Invalid message');
      
      expect(error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
      expect(error.message).toBe('Invalid message');
    });

    it('should create unknown message type error', () => {
      const error = createProtocolError.unknownMessageType('custom');
      
      expect(error.code).toBe(ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE);
      expect(error.message).toBe('Unknown message type: custom');
    });

    it('should create missing field error', () => {
      const error = createProtocolError.missingField('id', { path: 'message.id' });
      
      expect(error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      expect(error.message).toBe('Missing required field: id');
      expect(error.details).toEqual({ path: 'message.id' });
    });

    it('should create invalid payload error', () => {
      const error = createProtocolError.invalidPayload(
        'Invalid payload structure',
        { expected: 'string', received: 'number' }
      );
      
      expect(error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      expect(error.message).toBe('Invalid payload structure');
      expect(error.details).toEqual({ expected: 'string', received: 'number' });
    });
  });

  describe('Type Guards', () => {
    it('should identify ProtocolError instances', () => {
      const protocolError = new ProtocolError('Test', ProtocolErrorCode.VALIDATION_FAILED);
      const otherError = new Error('Test');

      expect(isProtocolError(protocolError)).toBe(true);
      expect(isProtocolError(otherError)).toBe(false);
      expect(isProtocolError(null)).toBe(false);
      expect(isProtocolError(undefined)).toBe(false);
      expect(isProtocolError({ name: 'ProtocolError' })).toBe(false);
    });
  });

  describe('Error Messages', () => {
    it('should provide detailed error messages for debugging', () => {
      const error = createProtocolError.validation(
        'Failed to validate message',
        {
          messageId: '123',
          path: 'payload.method',
          expected: 'string',
          received: null
        }
      );

      const errorString = error.toString();
      
      expect(errorString).toContain('ProtocolError[validation_failed]');
      expect(errorString).toContain('Failed to validate message');
      expect(errorString).toContain('messageId');
      expect(errorString).toContain('payload.method');
    });

    it('should include context in error details', () => {
      const context = {
        field: 'method',
        value: null,
        constraint: 'required',
        messageId: '123'
      };

      const error = createProtocolError.invalidPayload('Invalid method value', context);
      
      expect(error.details).toEqual(context);
      expect(error.toString()).toContain('messageId');
      expect(error.toString()).toContain('required');
    });
  });
});