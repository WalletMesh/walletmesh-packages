import { describe, it, expect } from 'vitest';
import {
  DiscoveryError,
  ErrorCategory,
  createError,
  wrapError,
  isDiscoveryError,
  isErrorCategory,
  extractErrorInfo,
  formatErrorForUser,
  standardErrors,
} from './errorUtils.js';

describe('errorUtils', () => {
  describe('DiscoveryError', () => {
    it('should create error with basic message and category', () => {
      const error = new DiscoveryError('Test message', ErrorCategory.VALIDATION);

      expect(error.message).toBe('Test message');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.name).toBe('DiscoveryError');
    });

    it('should create error with context', () => {
      const error = new DiscoveryError('Test message', ErrorCategory.STATE, {
        component: 'TestComponent',
        operation: 'testOperation',
        metadata: { key: 'value' },
      });

      expect(error.message).toBe('[TestComponent] testOperation: Test message (key=value)');
      expect(error.component).toBe('TestComponent');
      expect(error.operation).toBe('testOperation');
      expect(error.metadata).toEqual({ key: 'value' });
    });

    it('should create error with cause', () => {
      const originalError = new Error('Original error');
      const error = new DiscoveryError('Wrapped message', ErrorCategory.INTERNAL, {
        cause: originalError,
      });

      expect(error.message).toBe('Wrapped message Caused by: Original error');
      expect(error.cause).toBe(originalError);
    });

    it('should serialize to JSON correctly', () => {
      const error = new DiscoveryError('Test message', ErrorCategory.VALIDATION, {
        component: 'TestComponent',
        metadata: { key: 'value' },
      });

      const json = error.toJSON();
      expect(json['name']).toBe('DiscoveryError');
      expect(json['message']).toBe('[TestComponent] Test message (key=value)');
      expect(json['category']).toBe(ErrorCategory.VALIDATION);
      expect(json['component']).toBe('TestComponent');
      expect(json['metadata']).toEqual({ key: 'value' });
    });
  });

  describe('createError factory functions', () => {
    it('should create validation error', () => {
      const error = createError.validation('Invalid input');
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.message).toBe('Invalid input');
    });

    it('should create state error', () => {
      const error = createError.state('Invalid state');
      expect(error.category).toBe(ErrorCategory.STATE);
      expect(error.message).toBe('Invalid state');
    });

    it('should create network error', () => {
      const error = createError.network('Connection failed');
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.message).toBe('Connection failed');
    });

    it('should create security error', () => {
      const error = createError.security('Access denied');
      expect(error.category).toBe(ErrorCategory.SECURITY);
      expect(error.message).toBe('Access denied');
    });

    it('should create configuration error', () => {
      const error = createError.configuration('Missing config');
      expect(error.category).toBe(ErrorCategory.CONFIGURATION);
      expect(error.message).toBe('Missing config');
    });

    it('should create internal error', () => {
      const error = createError.internal('Unexpected condition');
      expect(error.category).toBe(ErrorCategory.INTERNAL);
      expect(error.message).toBe('Unexpected condition');
    });
  });

  describe('wrapError', () => {
    it('should wrap Error instance', () => {
      const originalError = new Error('Original message');
      const wrappedError = wrapError(originalError, ErrorCategory.NETWORK, {
        component: 'TestComponent',
      });

      expect(wrappedError.message).toBe('[TestComponent] Original message Caused by: Original message');
      expect(wrappedError.category).toBe(ErrorCategory.NETWORK);
      expect(wrappedError.cause).toBe(originalError);
    });

    it('should wrap string error', () => {
      const wrappedError = wrapError('String error', ErrorCategory.VALIDATION);

      expect(wrappedError.category).toBe(ErrorCategory.VALIDATION);
      expect(wrappedError.cause).toBeInstanceOf(Error);
      expect(wrappedError.cause?.message).toBe('String error');
    });
  });

  describe('utility functions', () => {
    it('should identify DiscoveryError', () => {
      const discoveryError = createError.validation('Test');
      const regularError = new Error('Test');

      expect(isDiscoveryError(discoveryError)).toBe(true);
      expect(isDiscoveryError(regularError)).toBe(false);
      expect(isDiscoveryError('string')).toBe(false);
    });

    it('should check error category', () => {
      const validationError = createError.validation('Test');
      const stateError = createError.state('Test');

      expect(isErrorCategory(validationError, ErrorCategory.VALIDATION)).toBe(true);
      expect(isErrorCategory(validationError, ErrorCategory.STATE)).toBe(false);
      expect(isErrorCategory(stateError, ErrorCategory.STATE)).toBe(true);
      expect(isErrorCategory(new Error('Test'), ErrorCategory.VALIDATION)).toBe(false);
    });

    it('should extract error info from DiscoveryError', () => {
      const error = createError.validation('Test message', {
        component: 'TestComponent',
        operation: 'testOp',
      });

      const info = extractErrorInfo(error);
      expect(info.message).toBe('[TestComponent] testOp: Test message');
      expect(info.category).toBe(ErrorCategory.VALIDATION);
      expect(info.component).toBe('TestComponent');
      expect(info.operation).toBe('testOp');
    });

    it('should extract error info from regular Error', () => {
      const error = new Error('Regular error');
      const info = extractErrorInfo(error);

      expect(info.message).toBe('Regular error');
      expect(info.category).toBeUndefined();
      expect(info.component).toBeUndefined();
    });

    it('should extract error info from string', () => {
      const info = extractErrorInfo('String error');
      expect(info.message).toBe('String error');
    });
  });

  describe('formatErrorForUser', () => {
    it('should format validation error', () => {
      const error = createError.validation('Invalid data');
      expect(formatErrorForUser(error)).toBe('Invalid input: Invalid data');
    });

    it('should format state error', () => {
      const error = createError.state('Cannot transition');
      expect(formatErrorForUser(error)).toBe('Operation not allowed: Cannot transition');
    });

    it('should format network error', () => {
      const error = createError.network('Timeout');
      expect(formatErrorForUser(error)).toBe('Connection problem: Timeout');
    });

    it('should format security error', () => {
      const error = createError.security('Access denied');
      expect(formatErrorForUser(error)).toBe('Security error: Access denied');
    });

    it('should format configuration error', () => {
      const error = createError.configuration('Missing field');
      expect(formatErrorForUser(error)).toBe('Configuration error: Missing field');
    });

    it('should format internal error', () => {
      const error = createError.internal('Unexpected');
      expect(formatErrorForUser(error)).toBe('Internal error: Unexpected');
    });

    it('should format regular Error', () => {
      const error = new Error('Regular error');
      expect(formatErrorForUser(error)).toBe('Regular error');
    });

    it('should format string', () => {
      expect(formatErrorForUser('String error')).toBe('String error');
    });
  });

  describe('standardErrors', () => {
    it('should create invalid state transition error', () => {
      const error = standardErrors.invalidStateTransition('IDLE', 'CONNECTED', ['DISCOVERING']);

      expect(error.category).toBe(ErrorCategory.STATE);
      expect(error.component).toBe('StateMachine');
      expect(error.operation).toBe('transition');
      expect(error.message).toContain('Cannot transition from IDLE to CONNECTED');
      expect(error.message).toContain('Valid transitions: DISCOVERING');
    });

    it('should create discovery timeout error', () => {
      const error = standardErrors.discoveryTimeout(5000);

      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.component).toBe('DiscoveryInitiator');
      expect(error.message).toContain('Discovery timed out after 5000ms');
    });

    it('should create invalid origin error', () => {
      const error = standardErrors.invalidOrigin('https://evil.com', 'not in allowlist');

      expect(error.category).toBe(ErrorCategory.SECURITY);
      expect(error.component).toBe('OriginValidator');
      expect(error.message).toContain("Origin validation failed for 'https://evil.com'");
      expect(error.message).toContain('not in allowlist');
    });

    it('should create rate limit exceeded error', () => {
      const error = standardErrors.rateLimitExceeded('https://app.com', 10, 60000);

      expect(error.category).toBe(ErrorCategory.SECURITY);
      expect(error.component).toBe('RateLimiter');
      expect(error.message).toContain("Rate limit exceeded for origin 'https://app.com'");
      expect(error.message).toContain('Maximum 10 requests per 60000ms');
    });

    it('should create invalid discovery request error', () => {
      const error = standardErrors.invalidCapabilityRequest('missing chains field');

      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.component).toBe('CapabilityMatcher');
      expect(error.message).toContain('Invalid discovery request: missing chains field');
    });

    it('should create session not found error', () => {
      const error = standardErrors.sessionNotFound('session-123');

      expect(error.category).toBe(ErrorCategory.STATE);
      expect(error.component).toBe('SessionTracker');
      expect(error.message).toContain('Session not found: session-123');
    });

    it('should create configuration missing error', () => {
      const error = standardErrors.configurationMissing('apiKey');

      expect(error.category).toBe(ErrorCategory.CONFIGURATION);
      expect(error.component).toBe('Configuration');
      expect(error.message).toContain('Missing required configuration: apiKey');
    });
  });
});
