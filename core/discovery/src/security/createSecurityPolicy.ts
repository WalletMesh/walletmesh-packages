/**
 * Security policy factory functions for creating common security configurations.
 *
 * Provides pre-configured security policies optimized for different deployment
 * scenarios from strict production settings to permissive testing environments.
 * Each policy balances security with usability for its intended use case.
 *
 * @module security/createSecurityPolicy
 * @since 0.1.0
 */

import type { SecurityPolicy } from '../core/types.js';

/**
 * Helper functions to create common security policies for different deployment environments.
 *
 * @example Production deployment:
 * ```typescript
 * const policy = createSecurityPolicy.strict({
 *   allowedOrigins: ['https://myapp.com', 'https://app.mydomain.com']
 * });
 * // → HTTPS required, no localhost, rate limiting enabled
 * ```
 *
 * @example Development environment:
 * ```typescript
 * const policy = createSecurityPolicy.development();
 * // → Allows localhost, relaxed HTTPS, higher rate limits
 * ```
 *
 * @category Helpers
 * @since 0.1.0
 * @see {@link SecurityPolicy} for the structure
 */
export const createSecurityPolicy = {
  /**
   * Create a strict security policy optimized for production environments.
   *
   * Enforces strong security requirements including HTTPS, certificate validation,
   * and strict rate limiting. Suitable for production deployments where security
   * is paramount and all traffic should be from known, trusted sources.
   *
   * @param options - Optional allowlist/blocklist customization
   * @returns Strict security policy for production use
   *
   * @example Production web app:
   * ```typescript
   * const policy = createSecurityPolicy.strict({
   *   allowedOrigins: [
   *     'https://app.mycompany.com',
   *     'https://admin.mycompany.com'
   *   ],
   *   blockedOrigins: [
   *     'https://known-malicious-site.com'
   *   ]
   * });
   * ```
   *
   * @example Default strict policy:
   * ```typescript
   * const policy = createSecurityPolicy.strict();
   * // Settings:
   * // - requireHttps: true
   * // - allowLocalhost: false
   * // - certificateValidation: true
   * // - rateLimit: 10 requests per minute
   * ```
   *
   * @category Security
   * @since 0.1.0
   */
  strict(
    options: {
      allowedOrigins?: string[];
      blockedOrigins?: string[];
    } = {},
  ): SecurityPolicy {
    return {
      ...(options.allowedOrigins && { allowedOrigins: options.allowedOrigins }),
      ...(options.blockedOrigins && { blockedOrigins: options.blockedOrigins }),
      requireHttps: true,
      allowLocalhost: false,
      certificateValidation: true,
      rateLimit: {
        enabled: true,
        maxRequests: 10,
        windowMs: 60 * 1000,
      },
    };
  },

  /**
   * Create a development-friendly security policy.
   *
   * Relaxed security settings suitable for development environments where
   * localhost access is needed and HTTPS may not be available. Maintains
   * basic protections while allowing development workflows.
   *
   * @param options - Optional allowlist/blocklist customization
   * @returns Development-optimized security policy
   *
   * @example Local development:
   * ```typescript
   * const policy = createSecurityPolicy.development();
   * // Allows:
   * // - http://localhost:3000
   * // - http://127.0.0.1:8080
   * // - https://production-api.com (if needed for testing)
   * ```
   *
   * @example Development with specific origins:
   * ```typescript
   * const policy = createSecurityPolicy.development({
   *   allowedOrigins: [
   *     'http://localhost:3000',
   *     'https://staging.myapp.com'
   *   ]
   * });
   * ```
   *
   * @category Security
   * @since 0.1.0
   */
  development(
    options: {
      allowedOrigins?: string[];
      blockedOrigins?: string[];
    } = {},
  ): SecurityPolicy {
    return {
      ...(options.allowedOrigins && { allowedOrigins: options.allowedOrigins }),
      ...(options.blockedOrigins && { blockedOrigins: options.blockedOrigins }),
      requireHttps: false,
      allowLocalhost: true,
      certificateValidation: false,
      rateLimit: {
        enabled: true,
        maxRequests: 50,
        windowMs: 60 * 1000,
      },
    };
  },

  /**
   * Create a production security policy with moderate restrictions.
   *
   * Balanced security settings suitable for production environments where
   * strict certificate validation might cause issues. Requires HTTPS but
   * allows for some flexibility in certificate handling.
   *
   * @param options - Optional allowlist/blocklist customization
   * @returns Production security policy with balanced settings
   *
   * @example Production deployment:
   * ```typescript
   * const policy = createSecurityPolicy.production();
   * // Requires HTTPS, moderate rate limiting
   * ```
   *
   * @category Security
   * @since 0.1.0
   */
  production(
    options: {
      allowedOrigins?: string[];
      blockedOrigins?: string[];
    } = {},
  ): SecurityPolicy {
    return {
      ...(options.allowedOrigins && { allowedOrigins: options.allowedOrigins }),
      ...(options.blockedOrigins && { blockedOrigins: options.blockedOrigins }),
      requireHttps: true,
      allowLocalhost: false,
      certificateValidation: false, // More permissive than strict
      rateLimit: {
        enabled: true,
        maxRequests: 20, // More permissive than strict (10)
        windowMs: 60 * 1000,
      },
    };
  },

  /**
   * Create a permissive security policy suitable for testing.
   *
   * Minimal security restrictions designed for automated testing environments
   * where full control over the test environment exists. Should never be used
   * in production as it disables most security protections.
   *
   * @returns Permissive security policy for testing
   *
   * @example Test environment:
   * ```typescript
   * const policy = createSecurityPolicy.permissive();
   * // Settings:
   * // - No HTTPS requirement
   * // - Localhost allowed
   * // - No rate limiting
   * // - No certificate validation
   * ```
   *
   * @category Security
   * @since 0.1.0
   */
  permissive(): SecurityPolicy {
    return {
      requireHttps: false,
      allowLocalhost: true,
      certificateValidation: false,
      rateLimit: {
        enabled: false,
        maxRequests: 1000,
        windowMs: 60 * 1000,
      },
    };
  },

  /**
   * Create a custom security policy with user-defined settings.
   *
   * Flexible factory for creating security policies with specific requirements.
   * All settings are optional and default to secure values if not specified.
   *
   * @param options - Custom security policy settings
   * @returns Custom security policy
   *
   * @example Custom policy with specific requirements:
   * ```typescript
   * const policy = createSecurityPolicy.custom({
   *   requireHttps: true,
   *   allowLocalhost: true, // Allow localhost in production for debugging
   *   allowedOrigins: ['https://app.example.com'],
   *   rateLimit: {
   *     enabled: true,
   *     maxRequests: 30,
   *     windowMs: 60000
   *   }
   * });
   * ```
   *
   * @category Security
   * @since 0.1.0
   */
  custom(options: Partial<SecurityPolicy> = {}): SecurityPolicy {
    return {
      requireHttps: options.requireHttps ?? true,
      allowLocalhost: options.allowLocalhost ?? false,
      certificateValidation: options.certificateValidation ?? false,
      ...(options.allowedOrigins && { allowedOrigins: options.allowedOrigins }),
      ...(options.blockedOrigins && { blockedOrigins: options.blockedOrigins }),
      ...(options.contentSecurityPolicy && { contentSecurityPolicy: options.contentSecurityPolicy }),
      rateLimit: options.rateLimit ?? {
        enabled: true,
        maxRequests: 20,
        windowMs: 60 * 1000,
      },
    };
  },
};
