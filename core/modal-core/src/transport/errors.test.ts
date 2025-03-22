import { describe, it, expect } from 'vitest';
import {
  ProtocolError,
  TransportError,
  ProtocolErrorCode,
  TransportErrorCode,
  createProtocolError,
  createTransportError,
  isProtocolError,
  isTransportError,
} from './errors.js';

describe('Protocol and Transport Errors', () => {
  describe('ProtocolError', () => {
    it('should create with basic properties', () => {
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.message).toBe('test message');
      expect(error.code).toBe(ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.name).toBe('ProtocolError');
      expect(error.details).toBeUndefined();
    });

    it('should create with details', () => {
      const details = { field: 'test' };
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED, details);
      expect(error.details).toBe(details);
    });

    it('should format toString without details', () => {
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.toString()).toBe('ProtocolError[validation_failed]: test message');
    });

    it('should format toString with details', () => {
      const error = new ProtocolError('test message', ProtocolErrorCode.VALIDATION_FAILED, { field: 'test' });
      expect(error.toString()).toBe('ProtocolError[validation_failed]: test message: {"field":"test"}');
    });
  });

  describe('TransportError', () => {
    it('should create with basic properties', () => {
      const error = new TransportError('test message', TransportErrorCode.CONNECTION_FAILED);
      expect(error.message).toBe('test message');
      expect(error.code).toBe(TransportErrorCode.CONNECTION_FAILED);
      expect(error.name).toBe('TransportError');
      expect(error.details).toBeUndefined();
    });

    it('should create with details', () => {
      const details = { reason: 'timeout' };
      const error = new TransportError('test message', TransportErrorCode.CONNECTION_FAILED, details);
      expect(error.details).toBe(details);
    });

    it('should format toString without details', () => {
      const error = new TransportError('test message', TransportErrorCode.CONNECTION_FAILED);
      expect(error.toString()).toBe('TransportError[connection_failed]: test message');
    });

    it('should format toString with details', () => {
      const error = new TransportError('test message', TransportErrorCode.CONNECTION_FAILED, {
        reason: 'timeout',
      });
      expect(error.toString()).toBe('TransportError[connection_failed]: test message: {"reason":"timeout"}');
    });
  });

  describe('Protocol Error Factory', () => {
    it('should create validation error', () => {
      const error = createProtocolError.validation('test message', { field: 'test' });
      expect(error.code).toBe(ProtocolErrorCode.VALIDATION_FAILED);
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should create invalid format error', () => {
      const error = createProtocolError.invalidFormat('test message');
      expect(error.code).toBe(ProtocolErrorCode.INVALID_FORMAT);
    });

    it('should create unknown message type error', () => {
      const error = createProtocolError.unknownMessageType('INVALID_TYPE');
      expect(error.code).toBe(ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE);
      expect(error.details).toEqual({ receivedType: 'INVALID_TYPE' });
    });

    it('should create missing field error', () => {
      const error = createProtocolError.missingField('id', { context: 'message' });
      expect(error.code).toBe(ProtocolErrorCode.MISSING_REQUIRED_FIELD);
      expect(error.message).toBe('Missing required field: id');
    });

    it('should create invalid payload error', () => {
      const error = createProtocolError.invalidPayload('Invalid data', { data: null });
      expect(error.code).toBe(ProtocolErrorCode.INVALID_PAYLOAD);
      expect(error.details).toEqual({ data: null });
    });
  });

  describe('Transport Error Factory', () => {
    it('should create connection failed error', () => {
      const error = createTransportError.connectionFailed('Connection timeout');
      expect(error.code).toBe(TransportErrorCode.CONNECTION_FAILED);
    });

    it('should create not connected error', () => {
      const error = createTransportError.notConnected('Transport not ready');
      expect(error.code).toBe(TransportErrorCode.NOT_CONNECTED);
    });

    it('should create send failed error', () => {
      const error = createTransportError.sendFailed('Network error');
      expect(error.code).toBe(TransportErrorCode.SEND_FAILED);
    });

    it('should create protocol error', () => {
      const error = createTransportError.protocolError('Invalid message format');
      expect(error.code).toBe(TransportErrorCode.PROTOCOL_ERROR);
    });

    it('should create timeout error', () => {
      const error = createTransportError.timeout('Operation timed out');
      expect(error.code).toBe(TransportErrorCode.TIMEOUT);
    });

    it('should create generic transport error', () => {
      const error = createTransportError.error('Unknown error');
      expect(error.code).toBe(TransportErrorCode.TRANSPORT_ERROR);
    });

    it('should create invalid message error', () => {
      const error = createTransportError.invalidMessage('Malformed message');
      expect(error.code).toBe(TransportErrorCode.INVALID_MESSAGE);
    });
  });

  describe('Type Guards', () => {
    it('should identify protocol errors', () => {
      const protocolError = new ProtocolError('test', ProtocolErrorCode.VALIDATION_FAILED);
      const transportError = new TransportError('test', TransportErrorCode.CONNECTION_FAILED);
      const regularError = new Error('test');

      expect(isProtocolError(protocolError)).toBe(true);
      expect(isProtocolError(transportError)).toBe(false);
      expect(isProtocolError(regularError)).toBe(false);
      expect(isProtocolError(null)).toBe(false);
      expect(isProtocolError(undefined)).toBe(false);
      expect(isProtocolError({ name: 'ProtocolError' })).toBe(false);
    });

    it('should identify transport errors', () => {
      const transportError = new TransportError('test', TransportErrorCode.CONNECTION_FAILED);
      const protocolError = new ProtocolError('test', ProtocolErrorCode.VALIDATION_FAILED);
      const regularError = new Error('test');

      expect(isTransportError(transportError)).toBe(true);
      expect(isTransportError(protocolError)).toBe(false);
      expect(isTransportError(regularError)).toBe(false);
      expect(isTransportError(null)).toBe(false);
      expect(isTransportError(undefined)).toBe(false);
      expect(isTransportError({ name: 'TransportError' })).toBe(false);
    });
  });
});
