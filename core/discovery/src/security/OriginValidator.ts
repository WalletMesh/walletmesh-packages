import type { SecurityPolicy, OriginValidationResult } from '../core/types.js';

/**
 * Origin validator implementing robust validation and anti-spoofing measures.
 *
 * Provides comprehensive origin validation to prevent cross-origin attacks,
 * session poisoning, and malicious discovery requests. Features configurable
 * security policies with support for allowlists, blocklists, HTTPS enforcement,
 * and sophisticated suspicious pattern detection.
 *
 * Key security features:
 * - Configurable allowlist/blocklist of trusted/blocked origins
 * - HTTPS enforcement with development localhost exceptions
 * - Homograph attack detection (Unicode spoofing)
 * - Suspicious domain pattern detection
 * - Event origin vs claimed origin validation
 * - Hostname format validation and length limits
 *
 * @example Basic security policy:
 * ```typescript
 * const validator = new OriginValidator({
 *   requireHttps: true,
 *   allowLocalhost: false,
 *   allowedOrigins: ['https://trusted-dapp.com'],
 *   blockedOrigins: ['https://malicious-site.com']
 * });
 *
 * const result = validator.validateOrigin('https://example.com');
 * if (result.valid) {
 *   console.log('Origin is valid');
 * } else {
 *   console.warn('Blocked:', result.reason);
 * }
 * ```
 *
 * @example Development environment:
 * ```typescript
 * const devValidator = new OriginValidator({
 *   requireHttps: false,
 *   allowLocalhost: true,
 *   // More permissive for development
 * });
 *
 * // Allows localhost:3000, 127.0.0.1:8080, etc.
 * const result = devValidator.validateOrigin('http://localhost:3000');
 * ```
 *
 * @example Anti-spoofing validation:
 * ```typescript
 * // Validates that event origin matches claimed origin
 * const result = validator.validateEventOrigin(
 *   event.origin,           // Actual event origin
 *   request.origin          // Claimed origin in message
 * );
 *
 * if (!result.valid) {
 *   console.error('Possible spoofing attempt:', result.reason);
 * }
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link SecurityPolicy} for configuration options
 * @see {@link OriginValidationResult} for validation results
 */
export class OriginValidator {
  private allowedOrigins: Set<string> | null = null;
  private blockedOrigins: Set<string> = new Set();
  private requireHttps = true;
  private allowLocalhost = false;
  private certificateValidation = false;
  private requiredCSP: string | null = null;

  constructor(policy: SecurityPolicy = {}) {
    this.updatePolicy(policy);
  }

  /**
   * Update the security policy configuration.
   *
   * Applies new security settings while maintaining the current validator state.
   * Policy changes take effect immediately for subsequent validations.
   *
   * @param policy - New security policy settings to apply
   *
   * @example
   * ```typescript
   * // Update to stricter production settings
   * validator.updatePolicy({
   *   requireHttps: true,
   *   allowLocalhost: false,
   *   allowedOrigins: ['https://production-app.com']
   * });
   * ```
   *
   * @category Configuration
   * @since 0.1.0
   */
  updatePolicy(policy: SecurityPolicy): void {
    if (policy.allowedOrigins) {
      this.allowedOrigins = new Set(policy.allowedOrigins);
    }

    if (policy.blockedOrigins) {
      this.blockedOrigins = new Set(policy.blockedOrigins);
    }

    this.requireHttps = policy.requireHttps ?? this.requireHttps;
    this.allowLocalhost = policy.allowLocalhost ?? this.allowLocalhost;
    this.certificateValidation = policy.certificateValidation ?? this.certificateValidation;
    this.requiredCSP = policy.contentSecurityPolicy ?? this.requiredCSP;
  }

  /**
   * Validate an origin against the configured security policy.
   *
   * Performs comprehensive validation including format checking, allowlist/blocklist
   * evaluation, HTTPS enforcement, localhost handling, and suspicious pattern detection.
   * Returns detailed validation result with specific failure reasons.
   *
   * @param origin - Origin URL to validate (e.g., 'https://example.com')
   * @returns Validation result with status and optional failure reason
   *
   * @example Valid cases:
   * ```typescript
   * // HTTPS origin with valid policy
   * validator.validateOrigin('https://trusted-app.com');
   * // → { valid: true, origin: '...', timestamp: ... }
   *
   * // Localhost in development mode
   * devValidator.validateOrigin('http://localhost:3000');
   * // → { valid: true, origin: '...', timestamp: ... }
   * ```
   *
   * @example Invalid cases:
   * ```typescript
   * // HTTP when HTTPS required
   * validator.validateOrigin('http://example.com');
   * // → { valid: false, reason: 'HTTPS required', ... }
   *
   * // Blocked origin
   * validator.validateOrigin('https://malicious.com');
   * // → { valid: false, reason: 'Origin is explicitly blocked', ... }
   *
   * // Suspicious homograph attack
   * validator.validateOrigin('https://аpple.com');  // Cyrillic 'а'
   * // → { valid: false, reason: 'Suspicious origin pattern detected', ... }
   * ```
   *
   * @category Validation
   * @since 0.1.0
   */
  validateOrigin(origin: string): OriginValidationResult {
    const timestamp = Date.now();
    const result: OriginValidationResult = {
      valid: false,
      origin,
      timestamp,
    };

    try {
      // Basic format validation
      const url = new URL(origin);

      // Check if origin is blocked
      if (this.blockedOrigins.has(origin)) {
        result.reason = 'Origin is explicitly blocked';
        return result;
      }

      // Check if it's localhost and if localhost is allowed
      const isLocalhost = this.isLocalhost(url.hostname);

      // Check allowed origins list - if explicitly allowed, skip other checks
      const isExplicitlyAllowed = this.allowedOrigins?.has(origin);

      // If we have an allowed list, check if origin is allowed or is localhost (when localhost is allowed)
      if (this.allowedOrigins && !isExplicitlyAllowed && !(isLocalhost && this.allowLocalhost)) {
        result.reason = 'Origin not in allowed list';
        return result;
      }

      // Check HTTPS requirement (skip if explicitly allowed or localhost with allowLocalhost)
      if (!isExplicitlyAllowed && this.requireHttps && url.protocol !== 'https:') {
        // Allow localhost exception if configured
        if (!this.allowLocalhost || !isLocalhost) {
          result.reason = 'HTTPS required';
          return result;
        }
      }

      // Check localhost allowance
      if (isLocalhost && !this.allowLocalhost) {
        result.reason = 'Localhost not allowed';
        return result;
      }

      // Check for suspicious patterns
      if (this.isSuspiciousOrigin(origin)) {
        result.reason = 'Suspicious origin pattern detected';
        return result;
      }

      // Additional hostname validation
      if (!this.isValidHostname(url.hostname)) {
        result.reason = 'Invalid hostname format';
        return result;
      }

      result.valid = true;
      return result;
    } catch (error) {
      result.reason = `Invalid origin format: ${error instanceof Error ? error.message : 'Unknown error'}`;
      return result;
    }
  }

  /**
   * Validate that event origin matches the claimed origin in the message.
   *
   * Critical security check to prevent session poisoning attacks where malicious
   * sites attempt to forge messages claiming to be from trusted origins.
   * Validates both the event origin and the consistency between event and claimed origins.
   *
   * @param eventOrigin - Actual origin from the event (e.g., event.origin)
   * @param claimedOrigin - Origin claimed in the message payload
   * @returns Validation result with mismatch detection
   *
   * @example Valid scenario:
   * ```typescript
   * const result = validator.validateEventOrigin(
   *   'https://trusted-app.com',    // Event origin
   *   'https://trusted-app.com'     // Claimed origin
   * );
   * // → { valid: true, origin: 'https://trusted-app.com', ... }
   * ```
   *
   * @example Attack scenario (origin spoofing):
   * ```typescript
   * const result = validator.validateEventOrigin(
   *   'https://malicious-site.com',  // Actual event origin
   *   'https://trusted-app.com'      // Falsely claimed origin
   * );
   * // → { valid: false, reason: 'Origin mismatch: event origin...', ... }
   * ```
   *
   * @example Combined validation failure:
   * ```typescript
   * const result = validator.validateEventOrigin(
   *   'http://blocked-site.com',     // Invalid event origin
   *   'http://blocked-site.com'      // Matching but still invalid
   * );
   * // → { valid: false, reason: 'HTTPS required', ... }
   * ```
   *
   * @category Security
   * @since 0.1.0
   * @see {@link validateOrigin} for individual origin validation
   */
  validateEventOrigin(eventOrigin: string, claimedOrigin: string): OriginValidationResult {
    const timestamp = Date.now();

    // First validate the event origin itself
    const eventValidation = this.validateOrigin(eventOrigin);
    if (!eventValidation.valid) {
      return eventValidation;
    }

    // Check if event origin matches claimed origin
    if (eventOrigin !== claimedOrigin) {
      return {
        valid: false,
        origin: eventOrigin,
        reason: `Origin mismatch: event origin '${eventOrigin}' does not match claimed origin '${claimedOrigin}'`,
        timestamp,
      };
    }

    return {
      valid: true,
      origin: eventOrigin,
      timestamp,
    };
  }

  /**
   * Check if an origin is localhost.
   */
  private isLocalhost(hostname: string): boolean {
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      /^127\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^192\.168\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)
    );
  }

  /**
   * Check for suspicious origin patterns that might indicate attacks.
   */
  private isSuspiciousOrigin(origin: string): boolean {
    const suspiciousPatterns = [
      // Homograph attacks
      /[а-яё]/i, // Cyrillic characters
      /[αβγδεζηθικλμνξοπρστυφχψω]/i, // Greek characters

      // Suspicious TLDs
      /\.(tk|ml|ga|cf)$/i,

      // IDN homograph patterns
      /xn--/,

      // Suspicious subdomains that mimic legitimate domains
      /^https?:\/\/[^/.]+\.(com|org|net)\.[^/.]+/,

      // URL shorteners (could be used for attacks)
      /\/(bit\.ly|tinyurl|t\.co|goo\.gl)/i,

      // Brand impersonation patterns
      /(paypal|google|amazon|microsoft|apple|github|metamask|uniswap)\.com\./i,
      /^https?:\/\/[^/]*?(paypal|google|amazon|microsoft|apple|github|metamask|uniswap)-/i,
      /^https?:\/\/[^/]*?-(paypal|google|amazon|microsoft|apple|github|metamask|uniswap)/i,

      // Additional suspicious patterns
      /\.(phishing|evil|fake-domain|suspicious)\./i,
    ];

    return suspiciousPatterns.some((pattern) => pattern.test(origin));
  }

  /**
   * Validate hostname format.
   */
  private isValidHostname(hostname: string): boolean {
    // Basic hostname validation
    if (hostname.length === 0 || hostname.length > 253) {
      return false;
    }

    // Check for valid characters (including underscores for compatibility)
    const validHostnamePattern =
      /^[a-zA-Z0-9]([a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?)*$/;

    if (!validHostnamePattern.test(hostname)) {
      return false;
    }

    // Check for consecutive dots
    if (hostname.includes('..')) {
      return false;
    }

    // Check for leading/trailing dots
    if (hostname.startsWith('.') || hostname.endsWith('.')) {
      return false;
    }

    return true;
  }

  /**
   * Get the current security policy configuration.
   *
   * Returns a copy of the current policy settings including allowlists,
   * blocklists, HTTPS requirements, and other security configurations.
   *
   * @returns Current security policy configuration
   *
   * @example
   * ```typescript
   * const policy = validator.getPolicy();
   * console.log('HTTPS required:', policy.requireHttps);
   * console.log('Allowed origins:', policy.allowedOrigins);
   * ```
   *
   * @category Configuration
   * @since 0.1.0
   */
  getPolicy(): SecurityPolicy {
    return {
      ...(this.allowedOrigins && { allowedOrigins: Array.from(this.allowedOrigins) }),
      blockedOrigins: Array.from(this.blockedOrigins),
      requireHttps: this.requireHttps,
      allowLocalhost: this.allowLocalhost,
      certificateValidation: this.certificateValidation,
      ...(this.requiredCSP && { contentSecurityPolicy: this.requiredCSP }),
    };
  }

  /**
   * Add an origin to the allowed list.
   *
   * Adds the specified origin to the allowlist, creating the allowlist
   * if it doesn't exist. If the origin was previously blocked, it
   * remains blocked (blocklist takes precedence).
   *
   * @param origin - Origin to add to allowlist
   *
   * @example
   * ```typescript
   * validator.allowOrigin('https://new-partner.com');
   *
   * // Now this origin will pass validation
   * const result = validator.validateOrigin('https://new-partner.com');
   * ```
   *
   * @category Configuration
   * @since 0.1.0
   */
  allowOrigin(origin: string): void {
    if (!this.allowedOrigins) {
      this.allowedOrigins = new Set();
    }
    this.allowedOrigins.add(origin);
  }

  /**
   * Add an origin to the blocked list.
   *
   * Adds the specified origin to the blocklist and removes it from
   * the allowlist if present. Blocked origins are rejected regardless
   * of other policy settings.
   *
   * @param origin - Origin to block
   *
   * @example
   * ```typescript
   * validator.blockOrigin('https://suspicious-site.com');
   *
   * // This origin will now be rejected
   * const result = validator.validateOrigin('https://suspicious-site.com');
   * // → { valid: false, reason: 'Origin is explicitly blocked' }
   * ```
   *
   * @category Configuration
   * @since 0.1.0
   */
  blockOrigin(origin: string): void {
    this.blockedOrigins.add(origin);

    // Remove from allowed list if present
    if (this.allowedOrigins) {
      this.allowedOrigins.delete(origin);
    }
  }

  /**
   * Remove an origin from both allowed and blocked lists.
   */
  removeOrigin(origin: string): void {
    if (this.allowedOrigins) {
      this.allowedOrigins.delete(origin);
    }
    this.blockedOrigins.delete(origin);
  }

  /**
   * Check if an origin is explicitly allowed.
   */
  isAllowed(origin: string): boolean {
    if (!this.allowedOrigins) {
      return true; // No allow list means all origins are allowed (unless blocked)
    }
    return this.allowedOrigins.has(origin);
  }

  /**
   * Check if an origin is explicitly blocked.
   */
  isBlocked(origin: string): boolean {
    return this.blockedOrigins.has(origin);
  }

  /**
   * Get statistics about current origin validation configuration.
   *
   * Returns detailed statistics about the validator's current state
   * including list sizes, policy settings, and configuration status.
   *
   * @returns Statistics object with configuration details
   *
   * @example
   * ```typescript
   * const stats = validator.getStats();
   * console.log(`${stats.allowedOriginsCount} allowed origins`);
   * console.log(`${stats.blockedOriginsCount} blocked origins`);
   * console.log('HTTPS required:', stats.requireHttps);
   * ```
   *
   * @category Statistics
   * @since 0.1.0
   */
  getStats() {
    return {
      allowedOriginsCount: this.allowedOrigins?.size ?? 0,
      blockedOriginsCount: this.blockedOrigins.size,
      requireHttps: this.requireHttps,
      allowLocalhost: this.allowLocalhost,
      certificateValidation: this.certificateValidation,
      hasCSPRequirement: !!this.requiredCSP,
    };
  }
}

/**
 * Convenience function to validate an origin with configurable policy.
 *
 * Creates a temporary OriginValidator instance and validates the specified
 * origin. Useful for one-off validations without maintaining validator state.
 *
 * @param origin - Origin URL to validate
 * @param policy - Optional security policy (uses defaults if not provided)
 * @returns Validation result with status and optional failure reason
 *
 * @example
 * ```typescript
 * // Quick validation with default policy
 * const result = validateOrigin('https://example.com');
 *
 * // Validation with custom policy
 * const result = validateOrigin('http://localhost:3000', {
 *   requireHttps: false,
 *   allowLocalhost: true
 * });
 * ```
 *
 * @category Validation
 * @since 0.1.0
 * @see {@link OriginValidator.validateOrigin} for instance method
 */
export function validateOrigin(origin: string, policy?: SecurityPolicy): OriginValidationResult {
  const validator = new OriginValidator(policy);
  return validator.validateOrigin(origin);
}

/**
 * Convenience function to validate event origin matches claimed origin.
 *
 * Creates a temporary OriginValidator instance and performs anti-spoofing
 * validation. Essential for preventing session poisoning attacks in
 * cross-origin communication.
 *
 * @param eventOrigin - Actual origin from the event
 * @param claimedOrigin - Origin claimed in the message
 * @param policy - Optional security policy (uses defaults if not provided)
 * @returns Validation result with mismatch detection
 *
 * @example
 * ```typescript
 * // Validate CustomEvent origin consistency
 * const result = validateEventOrigin(
 *   event.origin || window.location.origin,
 *   capabilityRequest.origin
 * );
 *
 * if (!result.valid) {
 *   console.warn('Possible spoofing attack:', result.reason);
 *   return; // Reject the message
 * }
 * ```
 *
 * @category Security
 * @since 0.1.0
 * @see {@link OriginValidator.validateEventOrigin} for instance method
 */
export function validateEventOrigin(
  eventOrigin: string,
  claimedOrigin: string,
  policy?: SecurityPolicy,
): OriginValidationResult {
  const validator = new OriginValidator(policy);
  return validator.validateEventOrigin(eventOrigin, claimedOrigin);
}
