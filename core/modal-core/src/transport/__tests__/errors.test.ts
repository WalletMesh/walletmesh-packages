import { describe, it, expect } from 'vitest';
import {
  ProtocolError,
  ProtocolErrorCode,
  createProtocolError,
  isProtocolError,
  isProtocolErrorCode,
} from '../errors.js';

describe('Protocol Errors', () => {
  describe('ProtocolError', () => {
    it('should create error with correct properties', () => {
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED);
      
      expect(error.name).toBe('ProtocolError');
      expect(error.message).toBe('test message');
      expect(error.code).toBe(ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.details).toBeUndefined();
    });

    it('should include optional details', () => {
      const details = { field: 'test', value: 123 };
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED, details);
      
      expect(error.details).toEqual(details);
    });

    it('should format toString correctly', () => {
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.toString()).toBe('ProtocolError [validation_failed]: test message');

      const errorWithDetails = new ProtocolError(
        'test message',
        ProtocolErrorCode.VALIDATION_FAILED,
        { detail: 'test' }
      );
      expect(errorWithDetails.toString()).toBe(
        'ProtocolError [validation_failed]: test message\nDetails: {"detail":"test"}'
      );
    });

    it('should work with instanceof checks', () => {
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED);
      expect(error).toBeInstanceOf(ProtocolError);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Error Factory Methods', () => {
    it('should create validation error', () => {
      const error = createProtocolError.validation('Invalid data');
      expect(error.code).toBe(ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.message).toBe('Invalid data');
    });

    it('should create invalid format error', () => {
      const error = createProtocolError.invalidFormat('Bad format');
      expect(error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
      expect(error.message).toBe('Bad format');
    });

    it('should create unknown message type error', () => {
      const error = createProtocolError.unknownMessageType('invalid_type');
      expect(error.code).toBe(ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE);
      expect(error.message).toBe('Unknown message type: invalid_type');
      expect(error.details).toEqual({ type: 'invalid_type' });
    });

    it('should create missing field error', () => {
      const error = createProtocolError.missingField('username');
      expect(error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      expect(error.message).toBe('Missing required field: username');
      expect(error.details).toEqual({ field: 'username' });
    });

    it('should create invalid payload error', () => {
      const error = createProtocolError.invalidPayload('Invalid data structure');
      expect(error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      expect(error.message).toBe('Invalid data structure');
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify protocol errors', () => {
      const protocolError = new ProtocolError('test', ProtocolErrorCode.VALIDATION_FAILED);
      const standardError = new Error('test');
      
      expect(isProtocolError(protocolError)).toBe(true);
      expect(isProtocolError(standardError)).toBe(false);
      expect(isProtocolError(undefined)).toBe(false);
      expect(isProtocolError(null)).toBe(false);
      expect(isProtocolError({ name: 'ProtocolError' })).toBe(false);
    });

    it('should correctly identify protocol error codes', () => {
      expect(isProtocolErrorCode(ProtocolErrorCode.VALIDATION_FAILED)).toBe(true);
      expect(isProtocolErrorCode('invalid_code')).toBe(false);
      expect(isProtocolErrorCode('')).toBe(false);
    });
  });
});