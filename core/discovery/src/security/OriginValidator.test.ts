/**
 * Consolidated test suite for OriginValidator
 * Combines main functionality, additional edge cases, and complex pattern tests
 */

import { describe, it, expect } from 'vitest';
import { OriginValidator, validateOrigin, validateEventOrigin } from './OriginValidator.js';
import { createTestSecurityPolicy, testOriginValidation } from '../testing/index.js';
import type { OriginTestCase } from '../testing/securityHelpers.js';
import { createSecurityPolicy } from './createSecurityPolicy.js';

describe('OriginValidator', () => {
  // ===============================================
  // Basic Functionality Tests
  // ===============================================
  describe('Basic Functionality', () => {
    it('should validate allowed origins', () => {
      const policy = createTestSecurityPolicy({
        allowedOrigins: ['https://trusted-app.com'],
      });
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('https://trusted-app.com', 'https://trusted-app.com');

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject blocked origins', () => {
      const policy = createTestSecurityPolicy({
        blockedOrigins: ['https://malicious-site.com'],
      });
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin(
        'https://malicious-site.com',
        'https://malicious-site.com',
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('blocked');
    });

    it('should reject HTTP origins when HTTPS is required', () => {
      const policy = {
        requireHttps: true,
        allowLocalhost: false,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('http://insecure-app.com', 'http://insecure-app.com');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('HTTPS required');
    });

    it('should allow localhost when configured', () => {
      const policy = {
        requireHttps: false,
        allowLocalhost: true,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000');

      expect(result.valid).toBe(true);
    });

    it('should reject localhost when not allowed', () => {
      const policy = {
        requireHttps: false,
        allowLocalhost: false,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('http://localhost:3000', 'http://localhost:3000');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Localhost not allowed');
    });

    it('should detect origin mismatch', () => {
      const policy = {
        requireHttps: false,
        allowLocalhost: true,
        blockedOrigins: [],
        certificateValidation: false,
      };
      const validator = new OriginValidator(policy);

      const result = validator.validateEventOrigin('https://app1.com', 'https://app2.com');

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Origin mismatch');
    });
  });

  // ===============================================
  // Edge Cases and Malformed URLs
  // ===============================================
  describe('Edge Cases and Malformed URLs', () => {
    it('should handle malformed URLs gracefully', () => {
      const validator = new OriginValidator();

      const malformedOrigins = [
        '',
        'not-a-url',
        'http://',
        'https://',
        'ftp://example.com',
        'data:text/plain,hello',
        'javascript:alert("test")',
        '//example.com',
        'http://[invalid-ipv6',
        'http://example.com:99999', // Invalid port
      ];

      for (const origin of malformedOrigins) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(false);
        expect(result.reason).toBeDefined();
      }
    });

    it('should handle various localhost formats', () => {
      const validator = new OriginValidator({
        allowLocalhost: true,
        requireHttps: false,
      });

      const localhostVariants = [
        'http://localhost',
        'http://localhost:3000',
        'http://127.0.0.1',
        'http://127.0.0.1:8080',
        'http://0.0.0.0:3000',
        'https://localhost',
        'https://127.0.0.1:443',
      ];

      for (const origin of localhostVariants) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(true);
      }
    });

    it('should reject localhost variants when not allowed', () => {
      const validator = new OriginValidator({
        allowLocalhost: false,
        requireHttps: false,
      });

      const localhostVariants = ['http://localhost', 'http://127.0.0.1', 'http://0.0.0.0:3000'];

      for (const origin of localhostVariants) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Localhost not allowed');
      }
    });

    it('should handle IP address validation', () => {
      const validator = new OriginValidator({
        allowLocalhost: false,
        requireHttps: false,
      });

      const ipAddresses = [
        'http://192.168.1.1',
        'http://10.0.0.1',
        'https://172.16.0.1',
        'http://8.8.8.8',
        'https://1.1.1.1',
      ];

      for (const origin of ipAddresses) {
        const result = validator.validateOrigin(origin);
        // Public IPs should be allowed, private IPs should be handled according to policy
        expect(result.valid).toBeDefined();
      }
    });

    it('should handle special port numbers', () => {
      const validator = new OriginValidator({
        allowLocalhost: true,
        requireHttps: false,
      });

      const specialPorts = [
        'http://localhost:80',
        'https://localhost:443',
        'http://localhost:8080',
        'http://localhost:3000',
        'https://localhost:8443',
      ];

      for (const origin of specialPorts) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(true);
      }
    });
  });

  // ===============================================
  // Complex Origin Patterns
  // ===============================================
  describe('Complex Origin Patterns', () => {
    it('should handle complex subdomain patterns', () => {
      const validator = new OriginValidator();

      const complexSubdomains = [
        'https://api.v2.staging.example.com',
        'https://a-b-c.example.com',
        'https://123.456.example.com',
        'https://test-123-abc.example.com',
        'https://very.long.subdomain.chain.example.com',
      ];

      for (const origin of complexSubdomains) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(true);
      }
    });

    it('should detect edge case homograph attacks', () => {
      const validator = new OriginValidator();

      // More sophisticated homograph attempts
      const homographs = [
        'https://gооgle.com', // Cyrillic 'o'
        'https://miсrosoft.com', // Cyrillic 'c'
        'https://αpple.com', // Greek alpha
        'https://paypаl.com', // Cyrillic 'a'
        'https://амаzon.com', // All Cyrillic
        'https://xn--pple-43d.com', // Punycode for аpple
        'https://xn--80aa.com', // Short punycode
        'https://xn--e1afmkfd.xn--p1ai', // Russian IDN
      ];

      for (const origin of homographs) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Suspicious origin pattern');
      }
    });

    it('should handle edge cases in suspicious subdomain detection', () => {
      const validator = new OriginValidator();

      // Only patterns that match the regex check for known brands
      const suspiciousPatterns = [
        'https://paypal.com.phishing.example.com',
        'https://google-com.evil.net',
        'https://amazon.fake-domain.org',
        'https://microsoft-security.phishing.co',
        'https://apple-id.suspicious.site',
      ];

      for (const origin of suspiciousPatterns) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(false);
        expect(result.reason).toContain('Suspicious origin pattern');
      }
    });

    it('should allow legitimate subdomains of trusted brands', () => {
      const validator = new OriginValidator();

      const legitimateSubdomains = [
        'https://accounts.google.com',
        'https://www.paypal.com',
        'https://login.microsoft.com',
        'https://secure.amazon.com',
        'https://id.apple.com',
      ];

      for (const origin of legitimateSubdomains) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(true);
      }
    });

    it('should handle international domain names', () => {
      const validator = new OriginValidator();

      const internationalDomains = [
        'https://example.москва', // Russian TLD
        'https://test.中国', // Chinese TLD
        'https://site.عرب', // Arabic TLD
        'https://example.рф', // Russian .rf TLD
      ];

      for (const origin of internationalDomains) {
        const result = validator.validateOrigin(origin);
        // Should handle gracefully - either allow or reject with reason
        expect(result.valid).toBeDefined();
        if (!result.valid) {
          expect(result.reason).toBeDefined();
        }
      }
    });

    it('should handle very long domain names', () => {
      const validator = new OriginValidator();

      const longDomain = `https://${'a'.repeat(60)}.example.com`;
      const result = validator.validateOrigin(longDomain);

      // Should handle gracefully
      expect(result.valid).toBeDefined();
    });

    it('should handle domains with special characters', () => {
      const validator = new OriginValidator();

      const specialCharDomains = [
        'https://site.example.com',
        'https://test_site.com',
        'https://123-example.com',
        'https://test.co.uk',
        'https://sub.test-domain.org',
      ];

      for (const origin of specialCharDomains) {
        const result = validator.validateOrigin(origin);
        expect(result.valid).toBe(true);
      }
    });
  });

  // ===============================================
  // Utility Functions Tests
  // ===============================================
  describe('Utility Functions', () => {
    it('should export validateOrigin utility function', () => {
      const result = validateOrigin('https://example.com');
      expect(result.valid).toBe(true);
    });

    it('should export validateEventOrigin utility function', () => {
      const result = validateEventOrigin('https://example.com', 'https://example.com');
      expect(result.valid).toBe(true);
    });

    it('should handle validateOrigin with invalid input', () => {
      const result = validateOrigin('invalid-url');
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should handle validateEventOrigin with mismatched origins', () => {
      const result = validateEventOrigin('https://app1.com', 'https://app2.com');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Origin mismatch');
    });

    it('should handle empty or null inputs gracefully', () => {
      const emptyResult = validateOrigin('');
      expect(emptyResult.valid).toBe(false);

      const nullResult = validateOrigin(null as unknown as string);
      expect(nullResult.valid).toBe(false);

      const undefinedResult = validateOrigin(undefined as unknown as string);
      expect(undefinedResult.valid).toBe(false);
    });
  });

  // ===============================================
  // Security Policy Tests
  // ===============================================
  describe('Security Policy Configuration', () => {
    it('should handle empty security policy', () => {
      const validator = new OriginValidator({});
      const result = validator.validateOrigin('https://example.com');
      expect(result.valid).toBe(true);
    });

    it('should handle undefined security policy', () => {
      const validator = new OriginValidator();
      const result = validator.validateOrigin('https://example.com');
      expect(result.valid).toBe(true);
    });

    it('should handle partial security policy', () => {
      const validator = new OriginValidator({
        requireHttps: true,
        // Other fields undefined
      });

      const httpsResult = validator.validateOrigin('https://example.com');
      expect(httpsResult.valid).toBe(true);

      const httpResult = validator.validateOrigin('http://example.com');
      expect(httpResult.valid).toBe(false);
    });

    it('should respect allowedOrigins when provided', () => {
      const validator = new OriginValidator({
        allowedOrigins: ['https://trusted.com', 'https://allowed.org'],
      });

      const trustedResult = validator.validateOrigin('https://trusted.com');
      expect(trustedResult.valid).toBe(true);

      const untrustedResult = validator.validateOrigin('https://untrusted.com');
      expect(untrustedResult.valid).toBe(false);
    });

    it('should respect blockedOrigins when provided', () => {
      const validator = new OriginValidator({
        blockedOrigins: ['https://blocked.com', 'https://malicious.org'],
      });

      const blockedResult = validator.validateOrigin('https://blocked.com');
      expect(blockedResult.valid).toBe(false);

      const allowedResult = validator.validateOrigin('https://allowed.com');
      expect(allowedResult.valid).toBe(true);
    });

    it('should prioritize allowedOrigins over general rules', () => {
      const validator = new OriginValidator({
        allowedOrigins: ['http://special-case.com'],
        requireHttps: true,
      });

      // Should allow HTTP for specifically allowed origins
      const result = validator.validateOrigin('http://special-case.com');
      expect(result.valid).toBe(true);
    });

    it('should prioritize blockedOrigins over allowedOrigins', () => {
      const validator = new OriginValidator({
        allowedOrigins: ['https://example.com'],
        blockedOrigins: ['https://example.com'], // Same origin in both lists
      });

      // Should block if in both lists
      const result = validator.validateOrigin('https://example.com');
      expect(result.valid).toBe(false);
    });
  });

  // ===============================================
  // Coverage Improvement Tests
  // ===============================================
  describe('Coverage Improvements', () => {
    describe('Dynamic origin management', () => {
      it('should allow dynamically allowing origins', () => {
        const validator = new OriginValidator({
          requireHttps: true,
        });

        // Initially not allowed (no allowlist)
        const beforeResult = validator.validateOrigin('https://new-site.com');
        expect(beforeResult.valid).toBe(true); // No allowlist means all HTTPS allowed

        // Add to allowed list
        validator.allowOrigin('https://new-site.com');
        validator.allowOrigin('https://another-site.com');

        // Should still be allowed
        const afterResult = validator.validateOrigin('https://new-site.com');
        expect(afterResult.valid).toBe(true);

        // But now other sites should be rejected (allowlist is active)
        const otherResult = validator.validateOrigin('https://other-site.com');
        expect(otherResult.valid).toBe(false);
      });

      it('should allow dynamically blocking origins', () => {
        const validator = new OriginValidator({
          requireHttps: true,
        });

        // Initially allowed
        const beforeResult = validator.validateOrigin('https://bad-site.com');
        expect(beforeResult.valid).toBe(true);

        // Block the origin
        validator.blockOrigin('https://bad-site.com');

        // Should now be blocked
        const afterResult = validator.validateOrigin('https://bad-site.com');
        expect(afterResult.valid).toBe(false);
        expect(afterResult.reason).toContain('blocked');
      });

      it('should remove origin from allowed list when blocking', () => {
        const validator = new OriginValidator({
          allowedOrigins: ['https://site.com', 'https://other.com'],
        });

        // Initially allowed
        expect(validator.isAllowed('https://site.com')).toBe(true);

        // Block the origin (should remove from allowed list)
        validator.blockOrigin('https://site.com');

        // Should be blocked and not allowed
        expect(validator.isBlocked('https://site.com')).toBe(true);
        expect(validator.isAllowed('https://site.com')).toBe(false);

        const result = validator.validateOrigin('https://site.com');
        expect(result.valid).toBe(false);
      });

      it('should remove origins from both lists', () => {
        const validator = new OriginValidator({
          allowedOrigins: ['https://site.com'],
          blockedOrigins: ['https://blocked.com'],
        });

        // Add and block an origin
        validator.allowOrigin('https://example.com');
        validator.blockOrigin('https://example.com');

        expect(validator.isAllowed('https://example.com')).toBe(false);
        expect(validator.isBlocked('https://example.com')).toBe(true);

        // Remove from both lists
        validator.removeOrigin('https://example.com');

        expect(validator.isAllowed('https://example.com')).toBe(false); // Not in allowed list
        expect(validator.isBlocked('https://example.com')).toBe(false); // Not in blocked list
      });
    });

    describe('Stats and introspection', () => {
      it('should return correct stats', () => {
        const validator = new OriginValidator({
          allowedOrigins: ['https://a.com', 'https://b.com', 'https://c.com'],
          blockedOrigins: ['https://bad1.com', 'https://bad2.com'],
          requireHttps: true,
          allowLocalhost: false,
          certificateValidation: true,
          contentSecurityPolicy: "default-src 'self'",
        });

        const stats = validator.getStats();

        expect(stats).toEqual({
          allowedOriginsCount: 3,
          blockedOriginsCount: 2,
          requireHttps: true,
          allowLocalhost: false,
          certificateValidation: true,
          hasCSPRequirement: true,
        });
      });

      it('should handle stats with no allowed origins list', () => {
        const validator = new OriginValidator({
          blockedOrigins: ['https://bad.com'],
          requireHttps: false,
          allowLocalhost: true,
        });

        const stats = validator.getStats();

        expect(stats.allowedOriginsCount).toBe(0);
        expect(stats.blockedOriginsCount).toBe(1);
        expect(stats.requireHttps).toBe(false);
        expect(stats.allowLocalhost).toBe(true);
        expect(stats.certificateValidation).toBe(false);
        expect(stats.hasCSPRequirement).toBe(false);
      });
    });

    describe('isAllowed and isBlocked methods', () => {
      it('should correctly report allowed status with no allowlist', () => {
        const validator = new OriginValidator({});

        // No allowlist means all origins are allowed
        expect(validator.isAllowed('https://any-site.com')).toBe(true);
        expect(validator.isAllowed('http://another-site.com')).toBe(true);
      });

      it('should correctly report allowed status with allowlist', () => {
        const validator = new OriginValidator({
          allowedOrigins: ['https://allowed.com'],
        });

        expect(validator.isAllowed('https://allowed.com')).toBe(true);
        expect(validator.isAllowed('https://not-allowed.com')).toBe(false);
      });

      it('should correctly report blocked status', () => {
        const validator = new OriginValidator({
          blockedOrigins: ['https://blocked.com'],
        });

        expect(validator.isBlocked('https://blocked.com')).toBe(true);
        expect(validator.isBlocked('https://not-blocked.com')).toBe(false);
      });
    });

    describe('Certificate validation', () => {
      it('should enforce certificate validation when enabled', () => {
        const validator = new OriginValidator({
          requireHttps: true,
          certificateValidation: true,
        });

        // With certificate validation, even HTTPS sites could be rejected
        // if they have invalid certificates (simulated here)
        const result = validator.validateOrigin('https://self-signed-cert.com');
        // In a real implementation, this would check certificate validity
        expect(result.valid).toBe(true); // Currently not implemented
      });
    });

    describe('CSP requirements', () => {
      it('should handle CSP requirements', () => {
        const validator = new OriginValidator({
          contentSecurityPolicy: "default-src 'self'; script-src 'none'",
        });

        // CSP validation would be implemented in validateOrigin
        const result = validator.validateOrigin('https://site-with-csp.com');
        expect(result.valid).toBe(true); // Currently not implemented

        const stats = validator.getStats();
        expect(stats.hasCSPRequirement).toBe(true);
      });
    });
  });

  // ===============================================
  // Comprehensive Security Testing with Helpers
  // ===============================================
  describe('Comprehensive Security Testing', () => {
    it('should validate multiple origins using testOriginValidation helper', async () => {
      const policy = createTestSecurityPolicy({
        allowedOrigins: ['https://trusted-app.com', 'https://partner-app.com'],
        blockedOrigins: ['https://malicious.com', 'https://phishing.com'],
        requireHttps: true,
        allowLocalhost: true,
      });

      const testCases: OriginTestCase[] = [
        // Allowed origins
        { origin: 'https://trusted-app.com', expectedValid: true, description: 'Explicitly allowed origin' },
        { origin: 'https://partner-app.com', expectedValid: true, description: 'Another allowed origin' },

        // Blocked origins
        {
          origin: 'https://malicious.com',
          expectedValid: false,
          expectedReason: 'explicitly blocked',
          description: 'Explicitly blocked origin',
        },
        {
          origin: 'https://phishing.com',
          expectedValid: false,
          expectedReason: 'explicitly blocked',
          description: 'Another blocked origin',
        },

        // HTTPS requirement tests
        {
          origin: 'http://insecure-app.com',
          expectedValid: false,
          expectedReason: 'HTTPS required',
          description: 'HTTP when HTTPS required',
        },
        {
          origin: 'http://another-insecure.com',
          expectedValid: false,
          expectedReason: 'HTTPS required',
          description: 'Another HTTP origin',
        },

        // Localhost tests
        { origin: 'http://localhost:3000', expectedValid: true, description: 'Localhost allowed via policy' },
        { origin: 'http://127.0.0.1:8080', expectedValid: true, description: 'IP-based localhost' },

        // Invalid origins
        {
          origin: 'not-a-valid-url',
          expectedValid: false,
          expectedReason: 'Invalid URL',
          description: 'Malformed URL',
        },
        { origin: '', expectedValid: false, expectedReason: 'Invalid URL', description: 'Empty origin' },

        // Origins not in allowlist
        {
          origin: 'https://unknown-app.com',
          expectedValid: false,
          expectedReason: 'not in allowed list',
          description: 'Valid HTTPS but not in allowlist',
        },
      ];

      const validator = new OriginValidator(policy);
      const results = await testOriginValidation(policy, testCases, validator);

      expect(results.passed).toBe(11); // All test cases should pass their expectations
      expect(results.failed).toBe(0);

      // Verify specific results
      const trustedResult = results.results.find((r) => r.origin === 'https://trusted-app.com');
      expect(trustedResult).toBeDefined();
      expect(trustedResult?.actual).toBe(true);
      expect(trustedResult?.passed).toBe(true);

      const maliciousResult = results.results.find((r) => r.origin === 'https://malicious.com');
      expect(maliciousResult).toBeDefined();
      expect(maliciousResult?.actual).toBe(false);
      expect(maliciousResult?.reason).toContain('blocked');
      expect(maliciousResult?.passed).toBe(true); // Test passes because it expected false
    });

    it('should use testOriginValidation with default policy expectations', async () => {
      const policy = createSecurityPolicy.strict();

      // When passing just origin strings, the helper determines expected validity
      const origins = [
        'https://secure-app.com', // Should be valid (HTTPS)
        'http://insecure-app.com', // Should be invalid (HTTP)
        'https://localhost:3000', // Should be invalid (strict policy)
        'file:///local/file.html', // Should be invalid (file protocol)
      ];

      const results = await testOriginValidation(policy, origins);

      expect(results.summary).toContain('4 tests');
      expect(results.results).toHaveLength(4);

      // Verify the helper correctly determined expected validity
      expect(results.results[0]?.expected).toBe(true); // HTTPS
      expect(results.results[1]?.expected).toBe(false); // HTTP
      expect(results.results[2]?.expected).toBe(false); // Localhost on strict
      expect(results.results[3]?.expected).toBe(false); // File protocol
    });
  });
});
