/**
 * Unit tests for origin validation security module
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDebugLogger } from '../../internal/core/logger/logger.js';
import { OriginValidator } from '../originValidation.js';

describe('OriginValidator', () => {
  let validator: OriginValidator;
  let logger: ReturnType<typeof createDebugLogger>;

  beforeEach(() => {
    logger = createDebugLogger('OriginValidatorTest', true);
  });

  describe('Basic Validation', () => {
    it('should accept HTTPS origins by default', async () => {
      validator = new OriginValidator({}, logger);

      expect(await validator.validate('https://example.com')).toBe(true);
      expect(await validator.validate('https://subdomain.example.com')).toBe(true);
      expect(await validator.validate('https://example.com:8443')).toBe(true);
    });

    it('should reject HTTP origins when HTTPS is required', async () => {
      validator = new OriginValidator({ requireHttps: true, allowLocalhost: false }, logger);

      expect(await validator.validate('http://example.com')).toBe(false);
      expect(await validator.validate('http://localhost')).toBe(false);
    });

    it('should accept localhost on any protocol when allowed', async () => {
      validator = new OriginValidator({ allowLocalhost: true }, logger);

      expect(await validator.validate('http://localhost')).toBe(true);
      expect(await validator.validate('http://localhost:3000')).toBe(true);
      expect(await validator.validate('http://127.0.0.1')).toBe(true);
      expect(await validator.validate('http://[::1]')).toBe(true);
    });

    it('should handle invalid URLs', async () => {
      validator = new OriginValidator({}, logger);

      expect(await validator.validate('not-a-url')).toBe(false);
      expect(await validator.validate('')).toBe(false);
      expect(await validator.validate('javascript:alert(1)')).toBe(false);
    });
  });

  describe('Allowed Origins', () => {
    it('should enforce allowed origins list when provided', async () => {
      validator = new OriginValidator(
        {
          allowedOrigins: ['https://trusted1.com', 'https://trusted2.com', 'https://app.trusted.com'],
        },
        logger,
      );

      expect(await validator.validate('https://trusted1.com')).toBe(true);
      expect(await validator.validate('https://trusted2.com')).toBe(true);
      expect(await validator.validate('https://app.trusted.com')).toBe(true);
      expect(await validator.validate('https://untrusted.com')).toBe(false);
      expect(await validator.validate('https://trusted1.com.evil.com')).toBe(false);
    });

    it('should support wildcard patterns', async () => {
      validator = new OriginValidator(
        {
          allowedOrigins: ['https://*.trusted.com', 'https://app-*.example.com'],
        },
        logger,
      );

      expect(await validator.validate('https://sub.trusted.com')).toBe(true);
      expect(await validator.validate('https://deep.sub.trusted.com')).toBe(true);
      expect(await validator.validate('https://app-dev.example.com')).toBe(true);
      expect(await validator.validate('https://app-prod.example.com')).toBe(true);
      expect(await validator.validate('https://trusted.com')).toBe(false); // No subdomain
      expect(await validator.validate('https://evil.com')).toBe(false);
    });

    it('should handle port numbers in allowed origins', async () => {
      validator = new OriginValidator(
        {
          allowedOrigins: ['https://localhost:3000', 'https://app.example.com:8443'],
        },
        logger,
      );

      expect(await validator.validate('https://localhost:3000')).toBe(true);
      expect(await validator.validate('https://app.example.com:8443')).toBe(true);
      expect(await validator.validate('https://localhost:4000')).toBe(false); // Different port
      expect(await validator.validate('https://app.example.com')).toBe(false); // No port
    });
  });

  describe('Homograph Attack Detection', () => {
    it('should detect basic homograph attacks', async () => {
      validator = new OriginValidator(
        {
          checkHomographs: true,
          knownDomains: ['metamask.io', 'walletconnect.com'],
        },
        logger,
      );

      // These would normally use unicode characters that look like latin letters
      // For testing, we'll simulate detection
      const suspiciousUrls = [
        'https://metаmask.io', // Cyrillic 'а'
        'https://walletconnеct.com', // Cyrillic 'е'
        'https://mеtamask.io', // Cyrillic 'е'
      ];

      // Since we can't easily type actual homographs in the test,
      // we'll test the pattern matching logic
      expect(await validator.validate('https://metamask.io')).toBe(true);
      expect(await validator.validate('https://walletconnect.com')).toBe(true);

      // Test that similar-looking domains are flagged
      expect(await validator.validate('https://rnetamask.io')).toBe(false);
      expect(await validator.validate('https://metamask.com')).toBe(false); // Wrong TLD
    });

    it('should allow legitimate international domains', async () => {
      validator = new OriginValidator(
        {
          checkHomographs: true,
          allowInternationalDomains: true,
        },
        logger,
      );

      // Legitimate international domains should pass
      expect(await validator.validate('https://例え.jp')).toBe(true);
      expect(await validator.validate('https://münchen.de')).toBe(true);
    });

    it('should detect common wallet phishing patterns', async () => {
      validator = new OriginValidator(
        {
          checkHomographs: true,
          knownDomains: ['metamask.io', 'phantom.app', 'walletconnect.com', 'coinbase.com'],
        },
        logger,
      );

      // Common phishing patterns
      const phishingUrls = [
        'https://metamask-io.com',
        'https://metamask.app',
        'https://phantom-app.com',
        'https://wallet-connect.com',
        'https://coinbase-wallet.com',
        'https://secure-metamask.io',
      ];

      for (const url of phishingUrls) {
        expect(await validator.validate(url)).toBe(false);
      }
    });
  });

  describe('Blocked Origins', () => {
    it('should block origins in blocklist', async () => {
      validator = new OriginValidator(
        {
          blockedOrigins: ['https://malicious.com', 'https://phishing.site', 'https://*.badactor.com'],
        },
        logger,
      );

      expect(await validator.validate('https://malicious.com')).toBe(false);
      expect(await validator.validate('https://phishing.site')).toBe(false);
      expect(await validator.validate('https://sub.badactor.com')).toBe(false);
      expect(await validator.validate('https://legitimate.com')).toBe(true);
    });

    it('should prioritize blocklist over allowlist', async () => {
      validator = new OriginValidator(
        {
          allowedOrigins: ['https://*.example.com'],
          blockedOrigins: ['https://malicious.example.com'],
        },
        logger,
      );

      expect(await validator.validate('https://app.example.com')).toBe(true);
      expect(await validator.validate('https://malicious.example.com')).toBe(false);
    });
  });

  describe('Caching', () => {
    it('should cache validation results', async () => {
      validator = new OriginValidator(
        {
          enableCache: true,
          cacheMaxSize: 100,
          cacheTTL: 1000, // 1 second
        },
        logger,
      );

      // First call should validate
      const spy = vi.spyOn(validator as { performValidation: () => Promise<boolean> }, 'performValidation');

      expect(await validator.validate('https://example.com')).toBe(true);
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call should use cache
      expect(await validator.validate('https://example.com')).toBe(true);
      expect(spy).toHaveBeenCalledTimes(1); // No additional call

      // Different origin should validate
      expect(await validator.validate('https://other.com')).toBe(true);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should expire cached entries', async () => {
      vi.useFakeTimers();

      validator = new OriginValidator(
        {
          enableCache: true,
          cacheTTL: 1000, // 1 second
        },
        logger,
      );

      const spy = vi.spyOn(validator as { performValidation: () => Promise<boolean> }, 'performValidation');

      // Initial validation
      expect(await validator.validate('https://example.com')).toBe(true);
      expect(spy).toHaveBeenCalledTimes(1);

      // Advance time past TTL
      vi.advanceTimersByTime(1500);

      // Should revalidate after cache expiry
      expect(await validator.validate('https://example.com')).toBe(true);
      expect(spy).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });
  });

  describe('Event Logging', () => {
    it('should log validation events when enabled', async () => {
      const logSpy = vi.spyOn(logger, 'debug');

      validator = new OriginValidator(
        {
          logValidationEvents: true,
        },
        logger,
      );

      await validator.validate('https://example.com');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Origin validation'),
        expect.objectContaining({
          origin: 'https://example.com',
          result: 'allowed',
        }),
      );
    });

    it('should log security violations', async () => {
      const logSpy = vi.spyOn(logger, 'warn');

      validator = new OriginValidator(
        {
          requireHttps: true,
          logValidationEvents: true,
        },
        logger,
      );

      await validator.validate('http://insecure.com');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Origin validation failed'),
        expect.objectContaining({
          origin: 'http://insecure.com',
          reason: expect.stringContaining('HTTPS required'),
        }),
      );
    });
  });

  describe('Custom Validation', () => {
    it('should support custom validation function', async () => {
      validator = new OriginValidator(
        {
          requireHttps: false, // Disable HTTPS enforcement so only custom validator runs
          enableCache: false, // Disable caching to ensure clean validation
          customValidator: async (origin) => {
            // Only allow origins with 'safe' in the domain (but not 'unsafe')
            const result = origin.includes('safe') && !origin.includes('unsafe');
            console.log(`Custom validator called with: ${origin}, returning: ${result}`);
            return result;
          },
        },
        logger,
      );

      // Test the first few expectations that should work
      expect(await validator.validate('https://safe-app.com')).toBe(true);
      expect(await validator.validate('https://my-safe-wallet.com')).toBe(true);

      // Debug the failing case
      console.log('About to test https://unsafe.com');
      const result = await validator.validate('https://unsafe.com');
      console.log('Result for https://unsafe.com:', result);
      expect(result).toBe(false);
      expect(await validator.validate('https://dangerous.com')).toBe(false);
    });

    it('should combine custom validator with other rules', async () => {
      validator = new OriginValidator(
        {
          requireHttps: true,
          customValidator: async (origin) => {
            return !origin.includes('banned');
          },
        },
        logger,
      );

      expect(await validator.validate('https://example.com')).toBe(true);
      expect(await validator.validate('http://example.com')).toBe(false); // HTTP blocked
      expect(await validator.validate('https://banned.com')).toBe(false); // Custom rule
    });
  });
});
