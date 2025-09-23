/**
 * @fileoverview Tests for security-related schemas
 */

import { describe, it, expect, vi } from 'vitest';
import {
  originValidationConfigSchema,
  crossOriginMessageSchema,
  rateLimitConfigSchema,
  rateLimitStatusSchema,
  sessionSecurityConfigSchema,
  sessionValidationResultSchema,
  permissionScopeSchema,
  permissionRequestSchema,
  permissionGrantSchema,
  cspDirectiveSchema,
  cspConfigSchema,
  securityAuditEntrySchema,
  securityAuditConfigSchema,
  securityHeadersSchema,
} from './security.js';

describe('Origin Validation Schemas', () => {
  describe('originValidationConfigSchema', () => {
    it('should provide defaults', () => {
      const result = originValidationConfigSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.allowedOrigins).toEqual(['*']);
      expect(result.mode).toBe('strict');
      expect(result.logFailures).toBe(true);
    });

    it('should validate complete config', () => {
      const config = {
        enabled: true,
        allowedOrigins: ['https://app.example.com', 'https://beta.example.com'],
        blockedOrigins: ['https://malicious.com'],
        mode: 'strict',
        customValidator: (origin: string) => origin.endsWith('.example.com'),
        logFailures: true,
      };
      expect(() => originValidationConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate modes', () => {
      const modes = ['strict', 'permissive', 'custom'];
      for (const mode of modes) {
        expect(() => originValidationConfigSchema.parse({ mode })).not.toThrow();
      }
    });

    it('should allow non-URL strings in allowedOrigins for wildcards', () => {
      // Should allow '*' and other patterns
      expect(() =>
        originValidationConfigSchema.parse({
          allowedOrigins: ['*'],
        }),
      ).not.toThrow();

      // Should allow other strings for pattern matching
      expect(() =>
        originValidationConfigSchema.parse({
          allowedOrigins: ['*.example.com'],
        }),
      ).not.toThrow();
    });
  });

  describe('crossOriginMessageSchema', () => {
    it('should validate cross-origin message', () => {
      const message = {
        origin: 'https://app.example.com',
        source: window,
        data: { type: 'connect', walletId: 'metamask' },
        timestamp: Date.now(),
        validated: true,
      };
      expect(() => crossOriginMessageSchema.parse(message)).not.toThrow();
    });

    it('should require valid origin URL', () => {
      const message = {
        origin: 'invalid-origin',
        source: window,
        data: {},
        timestamp: Date.now(),
      };
      expect(() => crossOriginMessageSchema.parse(message)).toThrow();
    });
  });
});

describe('Rate Limiting Schemas', () => {
  describe('rateLimitConfigSchema', () => {
    it('should provide defaults', () => {
      const result = rateLimitConfigSchema.parse({});
      expect(result.maxRequests).toBe(100);
      expect(result.windowMs).toBe(60000);
      expect(result.skipSuccessful).toBe(false);
      expect(result.skipFailed).toBe(false);
      expect(result.keyGenerator).toBe('origin');
    });

    it('should validate complete config', () => {
      const config = {
        maxRequests: 50,
        windowMs: 30000,
        skipSuccessful: true,
        skipFailed: false,
        keyGenerator: 'wallet',
        onLimitReached: vi.fn(),
      };
      expect(() => rateLimitConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate custom key generator', () => {
      const config = {
        keyGenerator: 'custom',
        customKeyGenerator: (req: unknown) => (req as { ip?: string }).ip || 'anonymous',
      };
      expect(() => rateLimitConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate ranges', () => {
      expect(() => rateLimitConfigSchema.parse({ maxRequests: 0 })).toThrow();
      expect(() => rateLimitConfigSchema.parse({ maxRequests: 10001 })).toThrow();
      expect(() => rateLimitConfigSchema.parse({ windowMs: 999 })).toThrow();
      expect(() => rateLimitConfigSchema.parse({ windowMs: 3600001 })).toThrow();
    });
  });

  describe('rateLimitStatusSchema', () => {
    it('should validate rate limit status', () => {
      const status = {
        count: 45,
        remaining: 55,
        resetTime: Date.now() + 30000,
        isLimited: false,
      };
      expect(() => rateLimitStatusSchema.parse(status)).not.toThrow();
    });

    it('should validate limited status', () => {
      const status = {
        count: 100,
        remaining: 0,
        resetTime: Date.now() + 60000,
        isLimited: true,
      };
      expect(() => rateLimitStatusSchema.parse(status)).not.toThrow();
    });
  });
});

describe('Session Security Schemas', () => {
  describe('sessionSecurityConfigSchema', () => {
    it('should provide defaults', () => {
      const result = sessionSecurityConfigSchema.parse({});
      expect(result.timeout).toBe(3600000); // 1 hour
      expect(result.maxConcurrentSessions).toBe(5);
      expect(result.tokenLength).toBe(32);
      expect(result.validateOnRequest).toBe(true);
      expect(result.rotateToken).toBe(false);
    });

    it('should validate complete config', () => {
      const config = {
        timeout: 7200000, // 2 hours
        idleTimeout: 900000, // 15 minutes
        maxConcurrentSessions: 3,
        tokenLength: 64,
        cookie: {
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
          domain: '.example.com',
          path: '/api',
        },
        validateOnRequest: true,
        rotateToken: true,
      };
      expect(() => sessionSecurityConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate cookie settings', () => {
      const sameSiteOptions = ['strict', 'lax', 'none'];
      for (const sameSite of sameSiteOptions) {
        const config = {
          cookie: { sameSite },
        };
        expect(() => sessionSecurityConfigSchema.parse(config)).not.toThrow();
      }
    });

    it('should validate ranges', () => {
      expect(() => sessionSecurityConfigSchema.parse({ timeout: 59999 })).toThrow();
      expect(() => sessionSecurityConfigSchema.parse({ timeout: 86400001 })).toThrow();
      expect(() => sessionSecurityConfigSchema.parse({ tokenLength: 15 })).toThrow();
      expect(() => sessionSecurityConfigSchema.parse({ tokenLength: 129 })).toThrow();
    });
  });

  describe('sessionValidationResultSchema', () => {
    it('should validate valid session', () => {
      const result = {
        valid: true,
        sessionId: 'session-123',
        walletId: 'metamask',
        expiresAt: Date.now() + 3600000,
        lastActivity: Date.now() - 60000,
      };
      expect(() => sessionValidationResultSchema.parse(result)).not.toThrow();
    });

    it('should validate invalid session', () => {
      const result = {
        valid: false,
        errors: ['Session expired', 'Invalid token'],
      };
      expect(() => sessionValidationResultSchema.parse(result)).not.toThrow();
    });
  });
});

describe('Permission Schemas', () => {
  describe('permissionScopeSchema', () => {
    it('should validate basic scope', () => {
      const scope = {
        method: 'eth_accounts',
      };
      const result = permissionScopeSchema.parse(scope);
      expect(result.usageCount).toBe(0);
    });

    it('should validate complete scope', () => {
      const scope = {
        method: 'eth_sendTransaction',
        chains: ['1', 137, '0x89'],
        params: {
          maxGas: '100000',
          maxValue: '1000000000000000000',
        },
        expiresAt: Date.now() + 86400000,
        maxUses: 100,
        usageCount: 25,
      };
      expect(() => permissionScopeSchema.parse(scope)).not.toThrow();
    });
  });

  describe('permissionRequestSchema', () => {
    it('should validate permission request', () => {
      const request = {
        walletId: 'metamask',
        scopes: [{ method: 'eth_accounts' }, { method: 'eth_sendTransaction', chains: ['1'] }],
        reason: 'Required for DeFi operations',
        metadata: {
          appName: 'DeFi App',
          appUrl: 'https://defi.example.com',
        },
      };
      expect(() => permissionRequestSchema.parse(request)).not.toThrow();
    });

    it('should require at least one scope', () => {
      const request = {
        walletId: 'metamask',
        scopes: [],
      };
      expect(() => permissionRequestSchema.parse(request)).toThrow();
    });
  });

  describe('permissionGrantSchema', () => {
    it('should validate permission grant', () => {
      const grant = {
        id: 'grant-123',
        walletId: 'metamask',
        scopes: [{ method: 'eth_accounts' }, { method: 'eth_sendTransaction' }],
        grantedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        revoked: false,
      };
      expect(() => permissionGrantSchema.parse(grant)).not.toThrow();
    });

    it('should validate revoked grant', () => {
      const grant = {
        id: 'grant-123',
        walletId: 'metamask',
        scopes: [{ method: 'eth_accounts' }],
        grantedAt: Date.now() - 3600000,
        revoked: true,
        revokedAt: Date.now() - 1800000,
      };
      expect(() => permissionGrantSchema.parse(grant)).not.toThrow();
    });
  });
});

describe('Content Security Policy Schemas', () => {
  describe('cspDirectiveSchema', () => {
    it('should validate string arrays', () => {
      const directive = ['https://example.com', 'https://api.example.com'];
      expect(() => cspDirectiveSchema.parse(directive)).not.toThrow();
    });

    it('should validate CSP keywords', () => {
      const keywords = ["'none'", "'self'", "'unsafe-inline'", "'unsafe-eval'"];
      for (const keyword of keywords) {
        expect(() => cspDirectiveSchema.parse(keyword)).not.toThrow();
      }
    });
  });

  describe('cspConfigSchema', () => {
    it('should validate minimal CSP', () => {
      const csp = {
        'default-src': "'self'",
      };
      const result = cspConfigSchema.parse(csp);
      expect(result.reportOnly).toBe(false);
    });

    it('should validate complete CSP', () => {
      const csp = {
        'default-src': "'self'",
        'script-src': ["'self'", 'https://cdn.example.com'],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ['*', 'data:', 'blob:'],
        'connect-src': ["'self'", 'https://api.example.com', 'wss://ws.example.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'frame-src': "'none'",
        'frame-ancestors': "'none'",
        'form-action': "'self'",
        'base-uri': "'self'",
        'report-uri': 'https://example.com/csp-report',
        reportOnly: true,
      };
      expect(() => cspConfigSchema.parse(csp)).not.toThrow();
    });
  });
});

describe('Security Audit Schemas', () => {
  describe('securityAuditEntrySchema', () => {
    it('should validate audit entry', () => {
      const entry = {
        timestamp: Date.now(),
        event: 'auth_success',
        walletId: 'metamask',
        details: {
          method: 'eth_requestAccounts',
          duration: 1250,
        },
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        origin: 'https://app.example.com',
        riskLevel: 'low',
      };
      expect(() => securityAuditEntrySchema.parse(entry)).not.toThrow();
    });

    it('should validate event types', () => {
      const events = [
        'auth_success',
        'auth_failure',
        'permission_grant',
        'permission_deny',
        'permission_revoke',
        'rate_limit_exceeded',
        'origin_validation_failed',
        'session_expired',
        'suspicious_activity',
      ];
      for (const event of events) {
        const entry = {
          timestamp: Date.now(),
          event,
          details: {},
        };
        expect(() => securityAuditEntrySchema.parse(entry)).not.toThrow();
      }
    });

    it('should validate risk levels', () => {
      const levels = ['low', 'medium', 'high', 'critical'];
      for (const riskLevel of levels) {
        const entry = {
          timestamp: Date.now(),
          event: 'suspicious_activity',
          details: {},
          riskLevel,
        };
        expect(() => securityAuditEntrySchema.parse(entry)).not.toThrow();
      }
    });
  });

  describe('securityAuditConfigSchema', () => {
    it('should provide defaults', () => {
      const result = securityAuditConfigSchema.parse({});
      expect(result.enabled).toBe(true);
      expect(result.retentionDays).toBe(90);
      expect(result.maxEntries).toBe(100000);
      expect(result.storage).toBe('memory');
    });

    it('should validate complete config', () => {
      const config = {
        enabled: true,
        logEvents: ['auth_failure', 'permission_deny', 'suspicious_activity'],
        retentionDays: 180,
        maxEntries: 500000,
        storage: 'indexeddb',
      };
      expect(() => securityAuditConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate custom storage', () => {
      const config = {
        storage: 'custom',
        customStorage: {
          write: vi.fn().mockResolvedValue(undefined),
          read: vi.fn().mockResolvedValue([]),
          clear: vi.fn().mockResolvedValue(undefined),
        },
      };
      expect(() => securityAuditConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate storage types', () => {
      const types = ['memory', 'localStorage', 'indexeddb', 'custom'];
      for (const storage of types) {
        expect(() => securityAuditConfigSchema.parse({ storage })).not.toThrow();
      }
    });
  });
});

describe('Security Headers Schema', () => {
  it('should validate minimal headers', () => {
    const headers = {
      'X-Content-Type-Options': 'nosniff',
    };
    expect(() => securityHeadersSchema.parse(headers)).not.toThrow();
  });

  it('should validate complete headers', () => {
    const headers = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
    };
    expect(() => securityHeadersSchema.parse(headers)).not.toThrow();
  });

  it('should validate X-Frame-Options values', () => {
    const values = ['DENY', 'SAMEORIGIN'];
    for (const value of values) {
      expect(() => securityHeadersSchema.parse({ 'X-Frame-Options': value })).not.toThrow();
    }
  });

  it('should validate Referrer-Policy values', () => {
    const values = [
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url',
    ];
    for (const value of values) {
      expect(() => securityHeadersSchema.parse({ 'Referrer-Policy': value })).not.toThrow();
    }
  });
});
