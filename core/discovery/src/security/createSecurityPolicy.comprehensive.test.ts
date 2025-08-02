/**
 * Comprehensive tests for createSecurityPolicy to improve coverage
 * Tests all policy types and edge cases
 */

import { describe, it, expect } from 'vitest';
import { createSecurityPolicy } from './createSecurityPolicy.js';
import type { SecurityPolicy } from '../core/types.js';

describe('createSecurityPolicy Comprehensive Tests', () => {
  describe('strict policy', () => {
    it('should create strict policy with default settings', () => {
      const policy = createSecurityPolicy.strict();

      expect(policy).toEqual({
        requireHttps: true,
        allowLocalhost: false,
        certificateValidation: true,
        rateLimit: {
          enabled: true,
          maxRequests: 10,
          windowMs: 60 * 1000,
        },
      });
    });

    it('should create strict policy with allowed origins', () => {
      const allowedOrigins = ['https://app.example.com', 'https://secure.example.com'];
      const policy = createSecurityPolicy.strict({ allowedOrigins });

      expect(policy.allowedOrigins).toEqual(allowedOrigins);
      expect(policy.requireHttps).toBe(true);
      expect(policy.allowLocalhost).toBe(false);
    });

    it('should create strict policy with blocked origins', () => {
      const blockedOrigins = ['https://malicious.com', 'https://spam.com'];
      const policy = createSecurityPolicy.strict({ blockedOrigins });

      expect(policy.blockedOrigins).toEqual(blockedOrigins);
      expect(policy.requireHttps).toBe(true);
    });

    it('should create strict policy with both allowed and blocked origins', () => {
      const allowedOrigins = ['https://trusted.com'];
      const blockedOrigins = ['https://blocked.com'];
      const policy = createSecurityPolicy.strict({ allowedOrigins, blockedOrigins });

      expect(policy.allowedOrigins).toEqual(allowedOrigins);
      expect(policy.blockedOrigins).toEqual(blockedOrigins);
    });

    it('should handle empty options object', () => {
      const policy = createSecurityPolicy.strict({});

      expect(policy.allowedOrigins).toBeUndefined();
      expect(policy.blockedOrigins).toBeUndefined();
      expect(policy.requireHttps).toBe(true);
    });
  });

  describe('development policy', () => {
    it('should create development policy with default settings', () => {
      const policy = createSecurityPolicy.development();

      expect(policy).toEqual({
        requireHttps: false,
        allowLocalhost: true,
        certificateValidation: false,
        rateLimit: {
          enabled: true,
          maxRequests: 50,
          windowMs: 60 * 1000,
        },
      });
    });

    it('should create development policy with custom origins', () => {
      const allowedOrigins = ['http://localhost:3000', 'https://staging.example.com'];
      const blockedOrigins = ['https://production.example.com']; // Block production in dev

      const policy = createSecurityPolicy.development({ allowedOrigins, blockedOrigins });

      expect(policy.allowedOrigins).toEqual(allowedOrigins);
      expect(policy.blockedOrigins).toEqual(blockedOrigins);
      expect(policy.allowLocalhost).toBe(true);
      expect(policy.requireHttps).toBe(false);
    });

    it('should handle empty options', () => {
      const policy = createSecurityPolicy.development({});

      expect(policy.allowedOrigins).toBeUndefined();
      expect(policy.blockedOrigins).toBeUndefined();
      expect(policy.allowLocalhost).toBe(true);
    });
  });

  describe('production policy', () => {
    it('should create production policy with default settings', () => {
      const policy = createSecurityPolicy.production();

      expect(policy).toEqual({
        requireHttps: true,
        allowLocalhost: false,
        certificateValidation: false,
        rateLimit: {
          enabled: true,
          maxRequests: 20,
          windowMs: 60 * 1000,
        },
      });
    });

    it('should create production policy with custom origins', () => {
      const allowedOrigins = ['https://app.production.com'];
      const blockedOrigins = ['https://known-threat.com'];

      const policy = createSecurityPolicy.production({ allowedOrigins, blockedOrigins });

      expect(policy.allowedOrigins).toEqual(allowedOrigins);
      expect(policy.blockedOrigins).toEqual(blockedOrigins);
      expect(policy.requireHttps).toBe(true);
      expect(policy.certificateValidation).toBe(false); // More permissive than strict
    });

    it('should handle empty options', () => {
      const policy = createSecurityPolicy.production({});

      expect(policy.allowedOrigins).toBeUndefined();
      expect(policy.blockedOrigins).toBeUndefined();
    });
  });

  describe('permissive policy', () => {
    it('should create permissive policy with minimal restrictions', () => {
      const policy = createSecurityPolicy.permissive();

      expect(policy).toEqual({
        requireHttps: false,
        allowLocalhost: true,
        certificateValidation: false,
        rateLimit: {
          enabled: false,
          maxRequests: 1000,
          windowMs: 60 * 1000,
        },
      });
    });

    it('should not accept any parameters', () => {
      // Test that permissive doesn't accept options (according to its signature)
      const policy = createSecurityPolicy.permissive();

      expect(policy.allowedOrigins).toBeUndefined();
      expect(policy.blockedOrigins).toBeUndefined();
      expect(policy.rateLimit?.enabled).toBe(false);
      expect(policy.rateLimit?.maxRequests).toBe(1000);
    });

    it('should have the most permissive settings for testing', () => {
      const policy = createSecurityPolicy.permissive();

      // Most permissive settings
      expect(policy.requireHttps).toBe(false);
      expect(policy.allowLocalhost).toBe(true);
      expect(policy.certificateValidation).toBe(false);
      expect(policy.rateLimit?.enabled).toBe(false);
      expect(policy.rateLimit?.maxRequests).toBe(1000); // High limit even when disabled
    });
  });

  describe('custom policy', () => {
    it('should create custom policy with default values when no options provided', () => {
      const policy = createSecurityPolicy.custom();

      expect(policy).toEqual({
        requireHttps: true,
        allowLocalhost: false,
        certificateValidation: false,
        rateLimit: {
          enabled: true,
          maxRequests: 20,
          windowMs: 60 * 1000,
        },
      });
    });

    it('should create custom policy with empty options object', () => {
      const policy = createSecurityPolicy.custom({});

      expect(policy).toEqual({
        requireHttps: true,
        allowLocalhost: false,
        certificateValidation: false,
        rateLimit: {
          enabled: true,
          maxRequests: 20,
          windowMs: 60 * 1000,
        },
      });
    });

    it('should override specific properties', () => {
      const policy = createSecurityPolicy.custom({
        requireHttps: false,
        allowLocalhost: true,
        certificateValidation: true,
      });

      expect(policy.requireHttps).toBe(false);
      expect(policy.allowLocalhost).toBe(true);
      expect(policy.certificateValidation).toBe(true);
      // Rate limit should use default
      expect(policy.rateLimit).toEqual({
        enabled: true,
        maxRequests: 20,
        windowMs: 60 * 1000,
      });
    });

    it('should include allowed origins when provided', () => {
      const allowedOrigins = ['https://custom1.com', 'https://custom2.com'];
      const policy = createSecurityPolicy.custom({ allowedOrigins });

      expect(policy.allowedOrigins).toEqual(allowedOrigins);
    });

    it('should include blocked origins when provided', () => {
      const blockedOrigins = ['https://blocked1.com', 'https://blocked2.com'];
      const policy = createSecurityPolicy.custom({ blockedOrigins });

      expect(policy.blockedOrigins).toEqual(blockedOrigins);
    });

    it('should include content security policy when provided', () => {
      const contentSecurityPolicy = "default-src 'self'; script-src 'self' 'unsafe-inline'";
      const policy = createSecurityPolicy.custom({ contentSecurityPolicy });

      expect(policy.contentSecurityPolicy).toBe(contentSecurityPolicy);
    });

    it('should use custom rate limit settings', () => {
      const customRateLimit = {
        enabled: false,
        maxRequests: 100,
        windowMs: 30 * 1000,
      };

      const policy = createSecurityPolicy.custom({
        rateLimit: customRateLimit,
      });

      expect(policy.rateLimit).toEqual(customRateLimit);
    });

    it('should handle all properties together', () => {
      const fullCustomPolicy: Partial<SecurityPolicy> = {
        requireHttps: false,
        allowLocalhost: true,
        certificateValidation: true,
        allowedOrigins: ['https://allowed.com'],
        blockedOrigins: ['https://blocked.com'],
        contentSecurityPolicy: "default-src 'self'",
        rateLimit: {
          enabled: true,
          maxRequests: 75,
          windowMs: 45 * 1000,
        },
      };

      const policy = createSecurityPolicy.custom(fullCustomPolicy);

      expect(policy).toEqual(fullCustomPolicy);
    });
  });

  describe('policy comparison', () => {
    it('should have different security levels across policy types', () => {
      const strict = createSecurityPolicy.strict();
      const development = createSecurityPolicy.development();
      const production = createSecurityPolicy.production();
      const permissive = createSecurityPolicy.permissive();

      // HTTPS requirements
      expect(strict.requireHttps).toBe(true);
      expect(development.requireHttps).toBe(false);
      expect(production.requireHttps).toBe(true);
      expect(permissive.requireHttps).toBe(false);

      // Localhost access
      expect(strict.allowLocalhost).toBe(false);
      expect(development.allowLocalhost).toBe(true);
      expect(production.allowLocalhost).toBe(false);
      expect(permissive.allowLocalhost).toBe(true);

      // Certificate validation
      expect(strict.certificateValidation).toBe(true);
      expect(development.certificateValidation).toBe(false);
      expect(production.certificateValidation).toBe(false);
      expect(permissive.certificateValidation).toBe(false);

      // Rate limiting enabled
      expect(strict.rateLimit?.enabled).toBe(true);
      expect(development.rateLimit?.enabled).toBe(true);
      expect(production.rateLimit?.enabled).toBe(true);
      expect(permissive.rateLimit?.enabled).toBe(false);
    });

    it('should have appropriate rate limit levels', () => {
      const strict = createSecurityPolicy.strict();
      const development = createSecurityPolicy.development();
      const production = createSecurityPolicy.production();
      const permissive = createSecurityPolicy.permissive();

      // Rate limits from most to least restrictive
      expect(strict.rateLimit?.maxRequests).toBe(10); // Most restrictive
      expect(production.rateLimit?.maxRequests).toBe(20); // Moderate
      expect(development.rateLimit?.maxRequests).toBe(50); // Development friendly
      expect(permissive.rateLimit?.maxRequests).toBe(1000); // Essentially unlimited
    });
  });

  describe('nullish coalescing behavior', () => {
    it('should use defaults when custom options are undefined', () => {
      const policy = createSecurityPolicy.custom({});

      // Should use defaults due to nullish coalescing
      expect(policy.requireHttps).toBe(true);
      expect(policy.allowLocalhost).toBe(false);
      expect(policy.certificateValidation).toBe(false);
      expect(policy.rateLimit).toEqual({
        enabled: true,
        maxRequests: 20,
        windowMs: 60 * 1000,
      });
    });

    it('should use false values when explicitly provided', () => {
      const policy = createSecurityPolicy.custom({
        requireHttps: false,
        allowLocalhost: false,
        certificateValidation: false,
      });

      // Should use explicit false values, not defaults
      expect(policy.requireHttps).toBe(false);
      expect(policy.allowLocalhost).toBe(false);
      expect(policy.certificateValidation).toBe(false);
    });
  });
});
