/**
 * @fileoverview Security-related validation schemas
 */

import { z } from 'zod';
import { walletIdSchema } from './actions.js';

// ============================================================================
// ORIGIN VALIDATION SCHEMAS
// ============================================================================

/**
 * Origin validation configuration
 */
export const originValidationConfigSchema = z.object({
  /** Enable origin validation */
  enabled: z.boolean().default(true),
  /** Allowed origins list */
  allowedOrigins: z.array(z.string()).default(['*']), // Allow '*' for wildcard
  /** Block specific origins */
  blockedOrigins: z.array(z.string().url()).optional(),
  /** Validation mode */
  mode: z.enum(['strict', 'permissive', 'custom']).default('strict'),
  /** Custom validation function */
  customValidator: z.function().args(z.string()).returns(z.boolean()).optional(),
  /** Log validation failures */
  logFailures: z.boolean().default(true),
});

/**
 * Cross-origin message validation
 */
export const crossOriginMessageSchema = z.object({
  /** Message origin */
  origin: z.string().url(),
  /** Message source window reference */
  source: z.any(), // Window reference
  /** Message data */
  data: z.unknown(),
  /** Message timestamp */
  timestamp: z.number(),
  /** Validated flag */
  validated: z.boolean().optional(),
});

// ============================================================================
// RATE LIMITING SCHEMAS
// ============================================================================

/**
 * Rate limit configuration
 */
export const rateLimitConfigSchema = z.object({
  /** Maximum requests per window */
  maxRequests: z.number().int().min(1).max(10000).default(100),
  /** Time window in milliseconds */
  windowMs: z.number().int().min(1000).max(3600000).default(60000), // 1 minute
  /** Skip successful requests */
  skipSuccessful: z.boolean().default(false),
  /** Skip failed requests */
  skipFailed: z.boolean().default(false),
  /** Key generator for rate limit buckets */
  keyGenerator: z.enum(['ip', 'wallet', 'origin', 'session', 'custom']).default('origin'),
  /** Custom key generator function */
  customKeyGenerator: z.function().args(z.any()).returns(z.string()).optional(),
  /** Handler for rate limit exceeded */
  onLimitReached: z
    .function()
    .args(
      z.object({
        key: z.string(),
        requests: z.number(),
        resetTime: z.number(),
      }),
    )
    .returns(z.void())
    .optional(),
});

/**
 * Rate limit status
 */
export const rateLimitStatusSchema = z.object({
  /** Current request count */
  count: z.number().int().min(0),
  /** Remaining requests */
  remaining: z.number().int().min(0),
  /** Reset timestamp */
  resetTime: z.number(),
  /** Is currently limited */
  isLimited: z.boolean(),
});

// ============================================================================
// SESSION SECURITY SCHEMAS
// ============================================================================

/**
 * Session security configuration
 */
export const sessionSecurityConfigSchema = z.object({
  /** Session timeout in milliseconds */
  timeout: z.number().int().min(60000).max(86400000).default(3600000), // 1 hour
  /** Idle timeout in milliseconds */
  idleTimeout: z.number().int().min(60000).max(3600000).optional(),
  /** Maximum concurrent sessions */
  maxConcurrentSessions: z.number().int().min(1).max(100).default(5),
  /** Session token length */
  tokenLength: z.number().int().min(16).max(128).default(32),
  /** Secure cookie settings */
  cookie: z
    .object({
      secure: z.boolean().default(true),
      httpOnly: z.boolean().default(true),
      sameSite: z.enum(['strict', 'lax', 'none']).default('strict'),
      domain: z.string().optional(),
      path: z.string().default('/'),
    })
    .optional(),
  /** Session validation on each request */
  validateOnRequest: z.boolean().default(true),
  /** Rotate session token on validation */
  rotateToken: z.boolean().default(false),
});

/**
 * Session validation result
 */
export const sessionValidationResultSchema = z.object({
  /** Is session valid */
  valid: z.boolean(),
  /** Session ID */
  sessionId: z.string().optional(),
  /** Wallet ID associated with session */
  walletId: walletIdSchema.optional(),
  /** Session expiry time */
  expiresAt: z.number().optional(),
  /** Last activity time */
  lastActivity: z.number().optional(),
  /** Validation errors */
  errors: z.array(z.string()).optional(),
});

// ============================================================================
// PERMISSION SCHEMAS
// ============================================================================

/**
 * Permission scope
 */
export const permissionScopeSchema = z.object({
  /** Permission method or action */
  method: z.string(),
  /** Chain IDs this permission applies to */
  chains: z.array(z.union([z.string(), z.number()])).optional(),
  /** Permission parameters */
  params: z.record(z.unknown()).optional(),
  /** Permission expiry */
  expiresAt: z.number().optional(),
  /** Usage limit */
  maxUses: z.number().int().min(1).optional(),
  /** Current usage count */
  usageCount: z.number().int().min(0).default(0),
});

/**
 * Permission request
 */
export const permissionRequestSchema = z.object({
  /** Requesting wallet ID */
  walletId: walletIdSchema,
  /** Requested scopes */
  scopes: z.array(permissionScopeSchema).min(1),
  /** Request reason */
  reason: z.string().optional(),
  /** Request metadata */
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Permission grant
 */
export const permissionGrantSchema = z.object({
  /** Grant ID */
  id: z.string(),
  /** Wallet ID */
  walletId: walletIdSchema,
  /** Granted scopes */
  scopes: z.array(permissionScopeSchema),
  /** Grant timestamp */
  grantedAt: z.number(),
  /** Grant expiry */
  expiresAt: z.number().optional(),
  /** Revoked flag */
  revoked: z.boolean().default(false),
  /** Revocation timestamp */
  revokedAt: z.number().optional(),
});

// ============================================================================
// CONTENT SECURITY POLICY SCHEMAS
// ============================================================================

/**
 * CSP directive configuration
 */
export const cspDirectiveSchema = z.union([
  z.array(z.string()),
  z.literal("'none'"),
  z.literal("'self'"),
  z.literal("'unsafe-inline'"),
  z.literal("'unsafe-eval'"),
]);

/**
 * Content Security Policy configuration
 */
export const cspConfigSchema = z.object({
  /** Default source */
  'default-src': cspDirectiveSchema.optional(),
  /** Script source */
  'script-src': cspDirectiveSchema.optional(),
  /** Style source */
  'style-src': cspDirectiveSchema.optional(),
  /** Image source */
  'img-src': cspDirectiveSchema.optional(),
  /** Connect source (for fetch, XHR, WebSocket) */
  'connect-src': cspDirectiveSchema.optional(),
  /** Font source */
  'font-src': cspDirectiveSchema.optional(),
  /** Frame source */
  'frame-src': cspDirectiveSchema.optional(),
  /** Frame ancestors */
  'frame-ancestors': cspDirectiveSchema.optional(),
  /** Form action */
  'form-action': cspDirectiveSchema.optional(),
  /** Base URI */
  'base-uri': cspDirectiveSchema.optional(),
  /** Report URI */
  'report-uri': z.string().url().optional(),
  /** Report only mode */
  reportOnly: z.boolean().default(false),
});

// ============================================================================
// SECURITY AUDIT SCHEMAS
// ============================================================================

/**
 * Security audit entry
 */
export const securityAuditEntrySchema = z.object({
  /** Audit timestamp */
  timestamp: z.number(),
  /** Event type */
  event: z.enum([
    'auth_success',
    'auth_failure',
    'permission_grant',
    'permission_deny',
    'permission_revoke',
    'rate_limit_exceeded',
    'origin_validation_failed',
    'session_expired',
    'suspicious_activity',
  ]),
  /** Associated wallet ID */
  walletId: walletIdSchema.optional(),
  /** Event details */
  details: z.record(z.unknown()),
  /** IP address */
  ip: z.string().optional(),
  /** User agent */
  userAgent: z.string().optional(),
  /** Origin */
  origin: z.string().optional(),
  /** Risk level */
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

/**
 * Security audit configuration
 */
export const securityAuditConfigSchema = z.object({
  /** Enable audit logging */
  enabled: z.boolean().default(true),
  /** Events to log */
  logEvents: z.array(z.string()).optional(),
  /** Retention period in days */
  retentionDays: z.number().int().min(1).max(365).default(90),
  /** Maximum entries */
  maxEntries: z.number().int().min(1000).max(1000000).default(100000),
  /** Storage backend */
  storage: z.enum(['memory', 'localStorage', 'indexeddb', 'custom']).default('memory'),
  /** Custom storage handler */
  customStorage: z
    .object({
      write: z.function().args(securityAuditEntrySchema).returns(z.promise(z.void())),
      read: z
        .function()
        .args(
          z.object({
            start: z.number().optional(),
            end: z.number().optional(),
            limit: z.number().optional(),
          }),
        )
        .returns(z.promise(z.array(securityAuditEntrySchema))),
      clear: z.function().returns(z.promise(z.void())),
    })
    .optional(),
});

// ============================================================================
// SECURITY HEADERS SCHEMAS
// ============================================================================

/**
 * Security headers configuration
 */
export const securityHeadersSchema = z.object({
  /** Strict Transport Security */
  'Strict-Transport-Security': z.string().optional(),
  /** X-Content-Type-Options */
  'X-Content-Type-Options': z.literal('nosniff').optional(),
  /** X-Frame-Options */
  'X-Frame-Options': z.enum(['DENY', 'SAMEORIGIN']).optional(),
  /** X-XSS-Protection */
  'X-XSS-Protection': z.string().optional(),
  /** Referrer-Policy */
  'Referrer-Policy': z
    .enum([
      'no-referrer',
      'no-referrer-when-downgrade',
      'origin',
      'origin-when-cross-origin',
      'same-origin',
      'strict-origin',
      'strict-origin-when-cross-origin',
      'unsafe-url',
    ])
    .optional(),
  /** Permissions-Policy */
  'Permissions-Policy': z.string().optional(),
  /** Cross-Origin-Embedder-Policy */
  'Cross-Origin-Embedder-Policy': z.enum(['require-corp', 'credentialless']).optional(),
  /** Cross-Origin-Opener-Policy */
  'Cross-Origin-Opener-Policy': z.enum(['unsafe-none', 'same-origin-allow-popups', 'same-origin']).optional(),
  /** Cross-Origin-Resource-Policy */
  'Cross-Origin-Resource-Policy': z.enum(['same-site', 'same-origin', 'cross-origin']).optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type OriginValidationConfig = z.infer<typeof originValidationConfigSchema>;
export type CrossOriginMessage = z.infer<typeof crossOriginMessageSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;
export type RateLimitStatus = z.infer<typeof rateLimitStatusSchema>;
export type SessionSecurityConfig = z.infer<typeof sessionSecurityConfigSchema>;
export type SessionValidationResult = z.infer<typeof sessionValidationResultSchema>;
export type PermissionScope = z.infer<typeof permissionScopeSchema>;
export type PermissionRequest = z.infer<typeof permissionRequestSchema>;
export type PermissionGrant = z.infer<typeof permissionGrantSchema>;
export type CSPDirective = z.infer<typeof cspDirectiveSchema>;
export type CSPConfig = z.infer<typeof cspConfigSchema>;
export type SecurityAuditEntry = z.infer<typeof securityAuditEntrySchema>;
export type SecurityAuditConfig = z.infer<typeof securityAuditConfigSchema>;
export type SecurityHeaders = z.infer<typeof securityHeadersSchema>;
