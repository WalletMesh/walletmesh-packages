import { describe, it, expect } from 'vitest';
import { ConnectorError, ConnectorErrorCode, createConnectorError, isConnectorError } from './errors.js';

describe('Connector Errors', () => {
  describe('ConnectorError', () => {
    it('should create error with code and message', () => {
      const error = new ConnectorError('test message', ConnectorErrorCode.INVALID_TYPE);
      expect(error.message).toBe('test message');
      expect(error.code).toBe(ConnectorErrorCode.INVALID_TYPE);
      expect(error.name).toBe('ConnectorError');
    });

    it('should format toString with details', () => {
      const error = new ConnectorError('test message', ConnectorErrorCode.CONNECTION_FAILED, {
        reason: 'network error',
      });
      expect(error.toString()).toBe(
        'ConnectorError[connection_failed]: test message: {"reason":"network error"}',
      );
    });

    it('should format toString without details', () => {
      const error = new ConnectorError('test message', ConnectorErrorCode.NOT_CONNECTED);
      expect(error.toString()).toBe('ConnectorError[not_connected]: test message');
    });
  });

  describe('createConnectorError', () => {
    it('should create invalid type error', () => {
      const error = createConnectorError.invalidType('test-type');
      expect(error.code).toBe(ConnectorErrorCode.INVALID_TYPE);
      expect(error.message).toBe('Invalid connector type: test-type');
    });

    it('should create invalid config error', () => {
      const error = createConnectorError.invalidConfig('Invalid config object');
      expect(error.code).toBe(ConnectorErrorCode.INVALID_CONFIG);
      expect(error.message).toBe('Invalid config object');
    });

    it('should create invalid creator error with default message', () => {
      const error = createConnectorError.invalidCreator();
      expect(error.code).toBe(ConnectorErrorCode.INVALID_CREATOR);
      expect(error.message).toBe('Creator must be a function');
    });

    it('should create invalid creator error with custom message', () => {
      const error = createConnectorError.invalidCreator('Custom message');
      expect(error.code).toBe(ConnectorErrorCode.INVALID_CREATOR);
      expect(error.message).toBe('Custom message');
    });

    it('should create not registered error', () => {
      const error = createConnectorError.notRegistered('test-type');
      expect(error.code).toBe(ConnectorErrorCode.NOT_REGISTERED);
      expect(error.message).toBe('No connector registered for type: test-type');
    });

    it('should create connection failed error', () => {
      const error = createConnectorError.connectionFailed('Connection timeout');
      expect(error.code).toBe(ConnectorErrorCode.CONNECTION_FAILED);
      expect(error.message).toBe('Connection timeout');
    });

    it('should create validation failed error', () => {
      const error = createConnectorError.validationFailed('Invalid response format');
      expect(error.code).toBe(ConnectorErrorCode.VALIDATION_FAILED);
      expect(error.message).toBe('Invalid response format');
    });

    it('should create not connected error with default message', () => {
      const error = createConnectorError.notConnected();
      expect(error.code).toBe(ConnectorErrorCode.NOT_CONNECTED);
      expect(error.message).toBe('Operation requires connection');
    });

    it('should create not connected error with custom message', () => {
      const error = createConnectorError.notConnected('Custom message');
      expect(error.code).toBe(ConnectorErrorCode.NOT_CONNECTED);
      expect(error.message).toBe('Custom message');
    });

    it('should create general connector error', () => {
      const error = createConnectorError.error('Unknown error occurred');
      expect(error.code).toBe(ConnectorErrorCode.CONNECTOR_ERROR);
      expect(error.message).toBe('Unknown error occurred');
    });

    it('should include error details when provided', () => {
      const details = { cause: 'network timeout' };
      const error = createConnectorError.connectionFailed('Connection failed', details);
      expect(error.details).toBe(details);
    });
  });

  describe('isConnectorError', () => {
    it('should return true for ConnectorError instances', () => {
      const error = new ConnectorError('test', ConnectorErrorCode.CONNECTOR_ERROR);
      expect(isConnectorError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      expect(isConnectorError(new Error('test'))).toBe(false);
      expect(isConnectorError('not an error')).toBe(false);
      expect(isConnectorError(null)).toBe(false);
      expect(isConnectorError(undefined)).toBe(false);
    });
  });
});
