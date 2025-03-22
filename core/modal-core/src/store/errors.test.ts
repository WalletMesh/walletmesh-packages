import { describe, expect, it } from 'vitest';
import { StoreError, StoreErrorCode, createStoreError, isStoreError } from './errors.js';

describe('Store Errors', () => {
  describe('StoreError', () => {
    it('should create error with code and message', () => {
      const error = new StoreError('test message', StoreErrorCode.INVALID_SESSION_ID);
      expect(error.message).toBe('test message');
      expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_ID);
      expect(error.name).toBe('StoreError');
    });

    it('should format toString with details', () => {
      const error = new StoreError('test message', StoreErrorCode.STORAGE_ERROR, { key: 'value' });
      expect(error.toString()).toBe('StoreError[storage_error]: test message: {"key":"value"}');
    });

    it('should format toString without details', () => {
      const error = new StoreError('test message', StoreErrorCode.STORE_REQUIRED);
      expect(error.toString()).toBe('StoreError[store_required]: test message');
    });
  });

  describe('createStoreError', () => {
    it('should create invalid session ID error', () => {
      const error = createStoreError.invalidSessionId('test-id');
      expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_ID);
      expect(error.message).toBe('Invalid session ID: test-id');
    });

    it('should create invalid session data error', () => {
      const error = createStoreError.invalidSessionData('Invalid wallet data');
      expect(error.code).toBe(StoreErrorCode.INVALID_SESSION_DATA);
      expect(error.message).toBe('Invalid wallet data');
    });

    it('should create initialization failed error', () => {
      const error = createStoreError.initializationFailed('Failed to init');
      expect(error.code).toBe(StoreErrorCode.INITIALIZATION_FAILED);
      expect(error.message).toBe('Failed to init');
    });

    it('should create store required error with default message', () => {
      const error = createStoreError.storeRequired();
      expect(error.code).toBe(StoreErrorCode.STORE_REQUIRED);
      expect(error.message).toBe('Store instance is required');
    });

    it('should create store required error with custom message', () => {
      const error = createStoreError.storeRequired('Custom message');
      expect(error.code).toBe(StoreErrorCode.STORE_REQUIRED);
      expect(error.message).toBe('Custom message');
    });

    it('should create storage error', () => {
      const error = createStoreError.storageError('Storage failed');
      expect(error.code).toBe(StoreErrorCode.STORAGE_ERROR);
      expect(error.message).toBe('Storage failed');
    });

    it('should include error details when provided', () => {
      const details = { cause: 'network error' };
      const error = createStoreError.storageError('Storage failed', details);
      expect(error.details).toBe(details);
    });
  });

  describe('isStoreError', () => {
    it('should return true for StoreError instances', () => {
      const error = new StoreError('test', StoreErrorCode.STORAGE_ERROR);
      expect(isStoreError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      expect(isStoreError(new Error('test'))).toBe(false);
      expect(isStoreError('not an error')).toBe(false);
      expect(isStoreError(null)).toBe(false);
      expect(isStoreError(undefined)).toBe(false);
    });
  });
});
