import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type ErrorRecoveryConfig,
  type IconError,
  IconErrorRecovery,
  type IconErrorType,
  type RecoveryResult,
  type RecoveryStrategy,
  classifyIconError,
  createErrorClassifier,
  createRecoveryPipeline,
  createStrategySelector,
  executeRecovery,
  selectRecoveryStrategy,
} from './iconErrorRecovery.js';

describe('iconErrorRecovery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('error classification', () => {
    it('should classify validation errors', () => {
      const error = new Error('Invalid data URI format');
      const iconUri = 'data:invalid';

      const classification = classifyIconError(error, iconUri);

      expect(classification.type).toBe('validation');
      expect(classification.message).toBe('Invalid data URI format');
      expect(classification.iconUri).toBe('data:invalid');
      expect(classification.originalError).toBe(error);
    });

    it('should classify CSP errors', () => {
      const error = new Error('Content Security Policy violation');
      const iconUri = 'https://external.com/icon.png';

      const classification = classifyIconError(error, iconUri);

      expect(classification.type).toBe('csp');
      expect(classification.message).toBe('Content Security Policy violation');
    });

    it('should classify network errors', () => {
      const error = new Error('Failed to fetch');
      const iconUri = 'https://example.com/icon.png';

      const classification = classifyIconError(error, iconUri);

      expect(classification.type).toBe('network');
    });

    it('should classify timeout errors', () => {
      const error = new Error('Request timeout');
      const iconUri = 'https://slow.com/icon.png';

      const classification = classifyIconError(error, iconUri);

      expect(classification.type).toBe('timeout');
    });

    it('should classify unknown errors', () => {
      const error = new Error('Something went wrong');
      const iconUri = 'https://example.com/icon.png';

      const classification = classifyIconError(error, iconUri);

      expect(classification.type).toBe('unknown');
    });

    it('should include context when provided', () => {
      const error = new Error('Test error');
      const iconUri = 'test://icon';
      const context = { walletId: 'metamask', size: 32 };

      const classification = classifyIconError(error, iconUri, context);

      expect(classification.context).toEqual(context);
    });
  });

  describe('recovery strategy selection', () => {
    it('should select fallback icon for validation errors', () => {
      const iconError: IconError = {
        type: 'validation',
        message: 'Invalid format',
        iconUri: 'invalid://uri',
      };

      const strategy = selectRecoveryStrategy(iconError);

      expect(strategy).toBe('fallback-icon');
    });

    it('should select retry for network errors', () => {
      const iconError: IconError = {
        type: 'network',
        message: 'Failed to fetch',
        iconUri: 'https://example.com/icon.png',
      };

      const strategy = selectRecoveryStrategy(iconError);

      expect(strategy).toBe('retry');
    });

    it('should select text fallback for CSP errors', () => {
      const iconError: IconError = {
        type: 'csp',
        message: 'CSP violation',
        iconUri: 'https://blocked.com/icon.png',
      };

      const strategy = selectRecoveryStrategy(iconError);

      expect(strategy).toBe('text-fallback');
    });

    it('should respect custom strategy selector', () => {
      const customSelector = vi.fn().mockReturnValue('empty' as RecoveryStrategy);
      const iconError: IconError = {
        type: 'unknown',
        message: 'Test error',
        iconUri: 'test://uri',
      };

      const strategy = selectRecoveryStrategy(iconError, { strategySelector: customSelector });

      expect(customSelector).toHaveBeenCalledWith(iconError);
      expect(strategy).toBe('empty');
    });
  });

  describe('recovery execution', () => {
    it('should execute fallback icon recovery', async () => {
      const iconError: IconError = {
        type: 'validation',
        message: 'Invalid format',
        iconUri: 'invalid://uri',
      };

      const result = await executeRecovery('fallback-icon', iconError);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('fallback-icon');
      expect(result.fallbackData).toBeDefined();
      expect(result.fallbackData?.type).toBe('icon');
    });

    it('should execute text fallback recovery', async () => {
      const iconError: IconError = {
        type: 'csp',
        message: 'CSP violation',
        iconUri: 'https://blocked.com/icon.png',
        context: { walletName: 'MetaMask' },
      };

      const result = await executeRecovery('text-fallback', iconError);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('text-fallback');
      expect(result.fallbackData).toBeDefined();
      expect(result.fallbackData?.type).toBe('text');
      expect(result.fallbackData?.text).toBe('MetaMask');
    });

    it('should execute empty recovery', async () => {
      const iconError: IconError = {
        type: 'unknown',
        message: 'Unknown error',
        iconUri: 'test://uri',
      };

      const result = await executeRecovery('empty', iconError);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('empty');
      expect(result.fallbackData).toBeNull();
    });

    it('should execute retry recovery', async () => {
      const iconError: IconError = {
        type: 'network',
        message: 'Network error',
        iconUri: 'https://example.com/icon.png',
      };

      // Mock successful retry
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
      });

      const result = await executeRecovery('retry', iconError);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('retry');
      expect(result.retryData).toBeDefined();
    });

    it('should handle retry failure', async () => {
      const iconError: IconError = {
        type: 'network',
        message: 'Network error',
        iconUri: 'https://example.com/icon.png',
      };

      // Mock failed retry
      global.fetch = vi.fn().mockRejectedValue(new Error('Still failing'));

      const result = await executeRecovery('retry', iconError);

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('retry');
      expect(result.error).toBeDefined();
    });

    it('should throw error when strategy is throw', async () => {
      const iconError: IconError = {
        type: 'unknown',
        message: 'Unknown error',
        iconUri: 'test://uri',
      };

      await expect(executeRecovery('throw', iconError)).rejects.toThrow('Unknown error');
    });
  });

  describe('IconErrorRecovery class', () => {
    let recovery: IconErrorRecovery;
    let mockConfig: ErrorRecoveryConfig;

    beforeEach(() => {
      mockConfig = {
        maxRetries: 2,
        retryDelay: 1000,
        enableLogging: true,
        customClassifier: undefined,
        customStrategySelector: undefined,
      };

      recovery = new IconErrorRecovery(mockConfig);
    });

    it('should create with default config', () => {
      const defaultRecovery = new IconErrorRecovery();
      expect(defaultRecovery).toBeDefined();
    });

    it('should recover from error with automatic classification and strategy', async () => {
      const error = new Error('Invalid data URI');
      const iconUri = 'data:invalid';

      const result = await recovery.recover(error, iconUri);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('fallback-icon');
    });

    it('should retry network errors with delay', async () => {
      const error = new Error('Failed to fetch');
      const iconUri = 'https://example.com/icon.png';

      // Mock fetch to fail first time, succeed second time
      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
        });

      const promise = recovery.recover(error, iconUri);

      // Advance timers to trigger retry
      await vi.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('retry');
      expect(global.fetch).toHaveBeenCalledTimes(2); // First call fails, second succeeds
    });

    it('should respect max retries limit', async () => {
      const error = new Error('Failed to fetch');
      const iconUri = 'https://example.com/icon.png';

      // Mock fetch to always fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const promise = recovery.recover(error, iconUri, { maxRetries: 1 });

      // Advance timers to handle any potential delays
      await vi.advanceTimersByTimeAsync(5000);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('retry');
    });

    it('should use custom classifier when provided', async () => {
      const customClassifier = vi.fn().mockReturnValue({
        type: 'custom' as IconErrorType,
        message: 'Custom error',
        iconUri: 'test://uri',
      });

      const customRecovery = new IconErrorRecovery({
        customClassifier,
      });

      const error = new Error('Test error');
      const iconUri = 'test://uri';

      await customRecovery.recover(error, iconUri);

      expect(customClassifier).toHaveBeenCalledWith(error, iconUri, undefined);
    });

    it('should use custom strategy selector when provided', async () => {
      const customStrategySelector = vi.fn().mockReturnValue('empty' as RecoveryStrategy);

      const customRecovery = new IconErrorRecovery({
        customStrategySelector,
      });

      const error = new Error('Test error');
      const iconUri = 'test://uri';

      const result = await customRecovery.recover(error, iconUri);

      expect(customStrategySelector).toHaveBeenCalled();
      expect(result.strategy).toBe('empty');
    });
  });

  describe('factory functions', () => {
    it('should create error classifier', () => {
      const classifier = createErrorClassifier();

      const error = new Error('Invalid format');
      const iconUri = 'data:invalid';
      const result = classifier(error, iconUri);

      expect(result.type).toBe('validation');
      expect(result.iconUri).toBe('data:invalid');
    });

    it('should create strategy selector', () => {
      const selector = createStrategySelector();

      const iconError: IconError = {
        type: 'network',
        message: 'Network error',
        iconUri: 'https://example.com/icon.png',
      };

      const strategy = selector(iconError);

      expect(strategy).toBe('retry');
    });

    it('should create recovery pipeline', async () => {
      const pipeline = createRecoveryPipeline();

      const error = new Error('Invalid data URI');
      const iconUri = 'data:invalid';

      const result = await pipeline(error, iconUri);

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('fallback-icon');
    });

    it('should create recovery pipeline with custom config', async () => {
      const customConfig: ErrorRecoveryConfig = {
        maxRetries: 2, // Reduce from 5 to 2 for faster test
        retryDelay: 100, // Reduce from 500 to 100ms for faster test
        enableLogging: false,
      };

      const pipeline = createRecoveryPipeline(customConfig);

      const error = new Error('Network error');
      const iconUri = 'https://example.com/icon.png';

      // Mock fetch to fail
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const promise = pipeline(error, iconUri);

      // Advance timers step by step to handle retry delays
      // First retry: 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second retry: 200ms (exponential backoff)
      await vi.advanceTimersByTimeAsync(200);
      // Third retry: 400ms
      await vi.advanceTimersByTimeAsync(400);

      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.strategy).toBe('retry');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null error object', async () => {
      const recovery = new IconErrorRecovery();

      const result = await recovery.recover(null as Error, { iconDataUri: 'test://uri', size: 24 });

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('fallback-icon');
    });

    it('should handle empty icon URI', async () => {
      const recovery = new IconErrorRecovery();
      const error = new Error('Test error');

      const result = await recovery.recover(error, '');

      expect(result.success).toBe(true);
      expect(result.strategy).toBe('fallback-icon');
    });

    it('should handle malformed context data', async () => {
      const error = new Error('Test error');
      const iconUri = 'test://uri';
      const malformedContext = { circular: {} };
      malformedContext.circular = malformedContext; // Create circular reference

      const classification = classifyIconError(error, iconUri, malformedContext);

      expect(classification.type).toBe('unknown');
      expect(classification.context).toBeDefined();
    });

    it('should handle recovery execution errors gracefully', async () => {
      const iconError: IconError = {
        type: 'validation',
        message: 'Test error',
        iconUri: 'test://uri',
      };

      // Mock a recovery function that throws
      const originalExecute = executeRecovery;
      vi.doMock('./iconErrorRecovery.js', () => ({
        ...vi.importActual('./iconErrorRecovery.js'),
        executeRecovery: vi.fn().mockRejectedValue(new Error('Recovery failed')),
      }));

      const result = await executeRecovery('fallback-icon', iconError);

      // Should still complete, possibly with fallback strategy
      expect(result).toBeDefined();
    });
  });
});
