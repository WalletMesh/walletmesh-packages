import { describe, it, expect } from 'vitest';
import { ClientError, ClientErrorCode, createClientError, isClientError } from './errors.js';

describe('Client Errors', () => {
  describe('ClientError', () => {
    it('should create error with code and message', () => {
      const error = new ClientError('test message', ClientErrorCode.CLIENT_ERROR);
      expect(error.message).toBe('test message');
      expect(error.code).toBe(ClientErrorCode.CLIENT_ERROR);
      expect(error.name).toBe('ClientError');
    });

    it('should format toString with details', () => {
      const error = new ClientError('test message', ClientErrorCode.CONNECTION_ERROR, { reason: 'timeout' });
      expect(error.toString()).toBe('ClientError[connection_error]: test message: {"reason":"timeout"}');
    });

    it('should format toString without details', () => {
      const error = new ClientError('test message', ClientErrorCode.CONNECT_FAILED);
      expect(error.toString()).toBe('ClientError[connect_failed]: test message');
    });
  });

  describe('createClientError', () => {
    it('should create origin mismatch error', () => {
      const error = createClientError.originMismatch('expected.com', 'actual.com');
      expect(error.code).toBe(ClientErrorCode.ORIGIN_MISMATCH);
      expect(error.message).toBe(
        "Origin mismatch: DApp info specifies 'expected.com' but is being served from 'actual.com'",
      );
    });

    it('should create init failed error with default message', () => {
      const error = createClientError.initFailed();
      expect(error.code).toBe(ClientErrorCode.INIT_FAILED);
      expect(error.message).toBe('Failed to initialize session manager');
    });

    it('should create init failed error with custom message', () => {
      const error = createClientError.initFailed('Custom init error');
      expect(error.code).toBe(ClientErrorCode.INIT_FAILED);
      expect(error.message).toBe('Custom init error');
    });

    it('should create restore failed error with default message', () => {
      const error = createClientError.restoreFailed();
      expect(error.code).toBe(ClientErrorCode.RESTORE_FAILED);
      expect(error.message).toBe('Failed to restore sessions');
    });

    it('should create restore failed error with custom message', () => {
      const error = createClientError.restoreFailed('Custom restore error');
      expect(error.code).toBe(ClientErrorCode.RESTORE_FAILED);
      expect(error.message).toBe('Custom restore error');
    });

    it('should create connection error with default message', () => {
      const error = createClientError.connectionError();
      expect(error.code).toBe(ClientErrorCode.CONNECTION_ERROR);
      expect(error.message).toBe('Not connected');
    });

    it('should create connection error with custom message', () => {
      const error = createClientError.connectionError('Custom connection error');
      expect(error.code).toBe(ClientErrorCode.CONNECTION_ERROR);
      expect(error.message).toBe('Custom connection error');
    });

    it('should create connect failed error with default message', () => {
      const error = createClientError.connectFailed();
      expect(error.code).toBe(ClientErrorCode.CONNECT_FAILED);
      expect(error.message).toBe('Failed to connect wallet');
    });

    it('should create connect failed error with custom message', () => {
      const error = createClientError.connectFailed('Custom connect error');
      expect(error.code).toBe(ClientErrorCode.CONNECT_FAILED);
      expect(error.message).toBe('Custom connect error');
    });

    it('should create disconnect failed error with default message', () => {
      const error = createClientError.disconnectFailed();
      expect(error.code).toBe(ClientErrorCode.DISCONNECT_FAILED);
      expect(error.message).toBe('Failed to disconnect wallet');
    });

    it('should create disconnect failed error with custom message', () => {
      const error = createClientError.disconnectFailed('Custom disconnect error');
      expect(error.code).toBe(ClientErrorCode.DISCONNECT_FAILED);
      expect(error.message).toBe('Custom disconnect error');
    });

    it('should create factory error', () => {
      const error = createClientError.factoryError('Factory creation failed');
      expect(error.code).toBe(ClientErrorCode.FACTORY_ERROR);
      expect(error.message).toBe('Factory creation failed');
    });

    it('should create general client error', () => {
      const error = createClientError.error('Unknown error occurred');
      expect(error.code).toBe(ClientErrorCode.CLIENT_ERROR);
      expect(error.message).toBe('Unknown error occurred');
    });

    it('should include error details when provided', () => {
      const details = { cause: 'network error' };
      const error = createClientError.connectFailed('Connection failed', details);
      expect(error.details).toBe(details);
    });
  });

  describe('isClientError', () => {
    it('should return true for ClientError instances', () => {
      const error = new ClientError('test', ClientErrorCode.CLIENT_ERROR);
      expect(isClientError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      expect(isClientError(new Error('test'))).toBe(false);
      expect(isClientError('not an error')).toBe(false);
      expect(isClientError(null)).toBe(false);
      expect(isClientError(undefined)).toBe(false);
    });
  });
});
