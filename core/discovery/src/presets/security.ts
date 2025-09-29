/**
 * Security policy presets for different deployment environments.
 *
 * Provides pre-configured security policies for common scenarios
 * like development, testing, and production deployments.
 *
 * @module presets/security
 * @category Presets
 * @since 0.1.0
 */

import type { SecurityPolicy } from '../types/security.js';

/**
 * Pre-configured security policies for different environments.
 *
 * Use these presets to quickly configure appropriate security settings
 * for your deployment environment.
 *
 * @example Development usage
 * ```typescript
 * const initiator = new DiscoveryInitiator(
 *   CAPABILITY_PRESETS.ethereum,
 *   { name: 'My App', url: 'https://localhost:3000' },
 *   { security: SECURITY_PRESETS.development }
 * );
 * ```
 *
 * @category Presets
 * @since 0.1.0
 */
// Use a strongly-typed map so property access (dot syntax) is safe in tests
export const SECURITY_PRESETS: Record<'development' | 'testing' | 'production' | 'strict', SecurityPolicy> = {
  /**
   * Development security policy.
   * Relaxed settings for local development and testing.
   */
  development: {
    requireHttps: false,
    allowLocalhost: true,
    certificateValidation: false,
    rateLimit: {
      enabled: false,
      maxRequests: 1000,
      windowMs: 60000,
    },
  },

  /**
   * Testing security policy.
   * Moderate settings for staging and testing environments.
   */
  testing: {
    requireHttps: true,
    allowLocalhost: true,
    certificateValidation: false,
    rateLimit: {
      enabled: true,
      maxRequests: 50,
      windowMs: 60000,
    },
  },

  /**
   * Production security policy.
   * Strict settings for production deployments.
   */
  production: {
    requireHttps: true,
    allowLocalhost: false,
    certificateValidation: true,
    rateLimit: {
      enabled: true,
      maxRequests: 10,
      windowMs: 60000,
    },
  },

  /**
   * Strict security policy.
   * Maximum security settings for high-risk environments.
   */
  strict: {
    requireHttps: true,
    allowLocalhost: false,
    certificateValidation: true,
    rateLimit: {
      enabled: true,
      maxRequests: 5,
      windowMs: 60000,
    },
  },
} as const;
