/**
 * Origin Validation Security Module
 *
 * This module implements origin validation with HTTPS enforcement,
 * homograph attack detection, and configurable security policies.
 *
 * Based on security requirements from Quint specification.
 *
 * @module security/originValidation
 */

import type { Logger } from '../internal/core/logger/logger.js';

/**
 * Origin validation configuration
 *
 * @remarks
 * Configures the origin validation security module with various security policies
 * including HTTPS enforcement, homograph attack detection, and custom validation rules.
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const config: OriginValidationConfig = {
 *   enforceHttps: true,
 *   allowLocalhost: true,
 *   allowedOrigins: ['https://myapp.com', 'https://app.myapp.com'],
 *   detectHomographs: true,
 *   knownDomains: ['myapp.com', 'trusted-partner.com'],
 *   logValidation: true
 * };
 * ```
 */
export interface OriginValidationConfig {
  /** Enforce HTTPS for all origins except localhost */
  enforceHttps?: boolean;
  requireHttps?: boolean; // Alias for enforceHttps

  /** Allow localhost origins for development */
  allowLocalhost?: boolean;

  /** Allowed origins (exact match) */
  allowedOrigins?: string[];

  /** Blocked origins (exact match) */
  blockedOrigins?: string[];

  /** Allowed origin patterns (regex) */
  allowedPatterns?: RegExp[];

  /** Blocked origin patterns (regex) */
  blockedPatterns?: RegExp[];

  /** Enable homograph attack detection */
  detectHomographs?: boolean;
  checkHomographs?: boolean; // Alias for detectHomographs

  /** Known legitimate domains for homograph detection */
  knownDomains?: string[];

  /** Allow international domain names */
  allowInternationalDomains?: boolean;

  /** Custom validation function */
  customValidator?: (origin: string) => boolean | Promise<boolean>;

  /** Log validation attempts */
  logValidation?: boolean;
  logValidationEvents?: boolean; // Alias for logValidation

  /** Enable caching */
  enableCache?: boolean;

  /** Cache max size */
  cacheMaxSize?: number;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

/**
 * Common homograph characters used in phishing attacks
 */
const HOMOGRAPH_MAPPINGS: Record<string, string[]> = {
  a: ['а', 'ɑ', 'α', 'ａ'], // Cyrillic, Latin, Greek, fullwidth
  c: ['с', 'ϲ', 'ｃ'], // Cyrillic, Greek, fullwidth
  e: ['е', 'е', 'ｅ'], // Cyrillic, fullwidth
  i: ['і', 'ı', 'ｉ'], // Cyrillic, Turkish, fullwidth
  o: ['о', 'ο', 'ｏ'], // Cyrillic, Greek, fullwidth
  p: ['р', 'ρ', 'ｐ'], // Cyrillic, Greek, fullwidth
  s: ['ѕ', 'ｓ'], // Cyrillic, fullwidth
  u: ['υ', 'ｕ'], // Greek, fullwidth
  v: ['ν', 'ｖ'], // Greek, fullwidth
  x: ['х', 'χ', 'ｘ'], // Cyrillic, Greek, fullwidth
  y: ['у', 'ｙ'], // Cyrillic, fullwidth
};

/**
 * Known legitimate domains (for homograph detection)
 */
const KNOWN_DOMAINS = new Set([
  'metamask.io',
  'walletconnect.com',
  'walletconnect.org',
  'phantom.app',
  'coinbase.com',
  'binance.com',
  'uniswap.org',
  'opensea.io',
  'etherscan.io',
  'ethereum.org',
]);

/**
 * Origin validator class
 *
 * @remarks
 * Implements comprehensive origin validation with security features including:
 * - HTTPS enforcement with localhost exceptions
 * - Homograph attack detection using character mapping
 * - Phishing pattern detection
 * - Configurable allow/block lists with regex pattern support
 * - Caching for performance optimization
 * - Extensible with custom validation logic
 *
 * @public
 * @category Security
 * @example
 * ```typescript
 * const validator = new OriginValidator({
 *   enforceHttps: true,
 *   detectHomographs: true,
 *   allowedOrigins: ['https://myapp.com']
 * }, logger);
 *
 * const isValid = await validator.validate('https://myapp.com');
 * if (!isValid) {
 *   throw new Error('Origin not allowed');
 * }
 * ```
 */
export class OriginValidator {
  private readonly config: Required<OriginValidationConfig>;
  private readonly logger: Logger;
  private validationCache = new Map<string, { result: boolean; timestamp: number }>();
  private knownDomainsSet: Set<string>;

  // Pre-compiled regex patterns for performance
  private readonly compiledAllowedPatterns: RegExp[] = [];
  private readonly compiledBlockedPatterns: RegExp[] = [];
  private readonly homographRegexCache = new Map<string, RegExp>();

  constructor(config: OriginValidationConfig, logger: Logger) {
    // Handle both naming conventions for backwards compatibility
    const normalizedConfig = {
      enforceHttps: config.requireHttps ?? config.enforceHttps ?? true,
      allowLocalhost: config.allowLocalhost ?? true,
      allowedOrigins: config.allowedOrigins ?? [],
      blockedOrigins: config.blockedOrigins ?? [],
      allowedPatterns: config.allowedPatterns ?? [],
      blockedPatterns: config.blockedPatterns ?? [],
      detectHomographs: config.checkHomographs ?? config.detectHomographs ?? true,
      knownDomains: config.knownDomains ?? [],
      allowInternationalDomains: config.allowInternationalDomains ?? false,
      customValidator: config.customValidator,
      logValidation: config.logValidationEvents ?? config.logValidation ?? true,
      enableCache: config.enableCache ?? false,
      cacheMaxSize: config.cacheMaxSize ?? 1000,
      cacheTTL: config.cacheTTL ?? 300000, // 5 minutes
    };

    // Pre-compile wildcard patterns to regex for performance
    if (config.allowedOrigins) {
      for (const origin of config.allowedOrigins) {
        if (origin.includes('*')) {
          const pattern = origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
          const compiledPattern = new RegExp(`^${pattern}$`);
          normalizedConfig.allowedPatterns?.push(compiledPattern);
          this.compiledAllowedPatterns.push(compiledPattern);
        }
      }
    } else {
      // If allowedPatterns are directly provided, compile them
      if (normalizedConfig.allowedPatterns) {
        this.compiledAllowedPatterns.push(...normalizedConfig.allowedPatterns);
      }
    }

    if (config.blockedOrigins) {
      for (const origin of config.blockedOrigins) {
        if (origin.includes('*')) {
          const pattern = origin.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
          const compiledPattern = new RegExp(`^${pattern}$`);
          normalizedConfig.blockedPatterns?.push(compiledPattern);
          this.compiledBlockedPatterns.push(compiledPattern);
        }
      }
    } else {
      // If blockedPatterns are directly provided, compile them
      if (normalizedConfig.blockedPatterns) {
        this.compiledBlockedPatterns.push(...normalizedConfig.blockedPatterns);
      }
    }

    // Pre-compile homograph regex patterns
    for (const [, homographs] of Object.entries(HOMOGRAPH_MAPPINGS)) {
      for (const homograph of homographs) {
        if (!this.homographRegexCache.has(homograph)) {
          this.homographRegexCache.set(homograph, new RegExp(homograph, 'g'));
        }
      }
    }

    this.config = {
      ...normalizedConfig,
      requireHttps: normalizedConfig.enforceHttps,
      checkHomographs: normalizedConfig.detectHomographs,
      logValidationEvents: normalizedConfig.logValidation,
    } as Required<OriginValidationConfig>;
    this.logger = logger;

    // Initialize known domains set
    this.knownDomainsSet = new Set([...KNOWN_DOMAINS, ...(normalizedConfig.knownDomains || [])]);
  }

  /**
   * Validate an origin
   *
   * @remarks
   * Performs comprehensive validation checks on the provided origin including:
   * - Protocol validation (HTTPS enforcement)
   * - Blocklist/allowlist checking
   * - Pattern matching
   * - Homograph attack detection
   * - Custom validation logic
   *
   * Results are cached if caching is enabled for performance optimization.
   *
   * @param origin - The origin URL to validate
   * @returns Promise resolving to true if origin is valid, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = await validator.validate('https://example.com');
   * if (!isValid) {
   *   console.error('Origin validation failed');
   * }
   * ```
   */
  async validate(origin: string): Promise<boolean> {
    // Check cache first if enabled
    if (this.config.enableCache && this.validationCache.has(origin)) {
      const cached = this.validationCache.get(origin);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
        return cached.result;
      }
      // Remove expired entry
      this.validationCache.delete(origin);
    }

    // Perform the actual validation
    const result = await this.performValidation(origin);

    // Cache result if enabled
    if (this.config.enableCache) {
      this.validationCache.set(origin, { result, timestamp: Date.now() });

      // Enforce cache size limit
      if (this.validationCache.size > this.config.cacheMaxSize) {
        const firstKey = this.validationCache.keys().next().value;
        if (firstKey !== undefined) {
          this.validationCache.delete(firstKey);
        }
      }
    }

    return result;
  }

  /**
   * Perform the actual validation logic
   */
  private async performValidation(origin: string): Promise<boolean> {
    try {
      // Parse origin
      const url = new URL(origin);

      // Run validation checks
      const protocolCheck = this.checkProtocol(url);
      const blocklistCheck = this.checkBlocklist(origin);
      const allowlistCheck = this.checkAllowlist(origin);
      const patternsCheck = this.checkPatterns(origin);
      const homographCheck = this.checkHomographs(url);
      const customCheck = await this.checkCustomValidator(origin);

      const checks = [
        protocolCheck,
        blocklistCheck,
        allowlistCheck,
        patternsCheck,
        homographCheck,
        customCheck,
      ];

      // Validation fails if any check explicitly returns false
      const isValid = !checks.some((result) => result === false);

      // Log if enabled
      if (this.config.logValidation) {
        if (isValid) {
          this.logger.debug('Origin validation', {
            origin,
            result: 'allowed',
            checks: {
              protocol: protocolCheck,
              blocklist: blocklistCheck,
              allowlist: allowlistCheck,
              patterns: patternsCheck,
              homographs: homographCheck,
              custom: customCheck,
            },
          });
        } else {
          // Log validation failure with reason
          let reason = 'Unknown';
          if (protocolCheck === false) {
            reason = 'HTTPS required but HTTP protocol used';
          } else if (blocklistCheck === false) {
            reason = 'Origin is in blocklist';
          } else if (allowlistCheck === false) {
            reason = 'Origin not in allowlist';
          } else if (homographCheck === false) {
            reason = 'Potential homograph attack detected';
          } else if (customCheck === false) {
            reason = 'Custom validator rejected origin';
          }

          this.logger.warn('Origin validation failed', {
            origin,
            reason,
          });
        }
      }

      return isValid;
    } catch (error) {
      // Invalid URL
      this.logger.warn('Invalid origin URL', { origin, error });
      return false;
    }
  }

  /**
   * Check protocol (HTTPS enforcement)
   */
  private checkProtocol(url: URL): boolean | null {
    if (!this.config.enforceHttps) {
      return null; // Skip check
    }

    // Allow localhost
    if (this.config.allowLocalhost && this.isLocalhost(url)) {
      return true;
    }

    // Require HTTPS
    return url.protocol === 'https:';
  }

  /**
   * Check if origin is blocked
   */
  private checkBlocklist(origin: string): boolean | null {
    if (this.config.blockedOrigins.length === 0 && this.compiledBlockedPatterns.length === 0) {
      return null; // Skip check
    }

    // Check exact match first (faster)
    if (this.config.blockedOrigins.includes(origin)) {
      return false;
    }

    // Check pre-compiled patterns
    for (const pattern of this.compiledBlockedPatterns) {
      if (pattern.test(origin)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if origin is allowed
   */
  private checkAllowlist(origin: string): boolean | null {
    if (this.config.allowedOrigins.length === 0 && this.compiledAllowedPatterns.length === 0) {
      return null; // Skip check - allow by default
    }

    // Check exact match first (faster)
    if (this.config.allowedOrigins.includes(origin)) {
      return true;
    }

    // Check pre-compiled patterns
    for (const pattern of this.compiledAllowedPatterns) {
      if (pattern.test(origin)) {
        return true;
      }
    }

    // Not in allowlist
    return false;
  }

  /**
   * Check patterns (combined check for efficiency)
   */
  private checkPatterns(_origin: string): boolean | null {
    // This is handled by allowlist/blocklist checks
    return null;
  }

  /**
   * Check for homograph attacks
   */
  private checkHomographs(url: URL): boolean | null {
    if (!this.config.detectHomographs) {
      return null; // Skip check
    }

    const hostname = url.hostname.toLowerCase();

    // Check if international domain names are allowed for non-ASCII domains
    const hasNonAsciiChars = Array.from(hostname).some((char) => char.charCodeAt(0) > 127);
    if (hasNonAsciiChars && !this.config.allowInternationalDomains) {
      return null; // Let other checks handle it
    }

    // Check against known domains (for both ASCII and non-ASCII)
    for (const knownDomain of this.knownDomainsSet) {
      // For non-ASCII domains, check homographs
      const hostnameHasNonAscii = Array.from(hostname).some((char) => char.charCodeAt(0) > 127);
      if (hostnameHasNonAscii && this.compareHomographs(hostname, knownDomain)) {
        this.logger.warn('Potential homograph attack detected', {
          hostname,
          similar: knownDomain,
        });
        return false;
      }

      // Always check common phishing patterns (for both ASCII and non-ASCII)
      // But skip check if hostname is already a known legitimate domain
      if (!this.knownDomainsSet.has(hostname) && this.isPhishingPattern(hostname, knownDomain)) {
        this.logger.warn('Potential phishing pattern detected', {
          hostname,
          target: knownDomain,
        });
        return false;
      }
    }

    return null; // Pass to next check
  }

  /**
   * Run custom validator
   */
  private async checkCustomValidator(origin: string): Promise<boolean | null> {
    if (!this.config.customValidator) {
      return null; // Skip check
    }

    try {
      return await this.config.customValidator(origin);
    } catch (error) {
      this.logger.error('Custom validator error', { origin, error });
      return false; // Fail closed
    }
  }

  /**
   * Check if URL is localhost
   */
  private isLocalhost(url: URL): boolean {
    const hostname = url.hostname.toLowerCase();
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost')
    );
  }

  /**
   * Normalize domain for homograph comparison
   */
  private normalizeForHomograph(domain: string): string {
    let normalized = domain.toLowerCase();

    // Replace homograph characters using pre-compiled regex
    for (const [ascii, homographs] of Object.entries(HOMOGRAPH_MAPPINGS)) {
      for (const homograph of homographs) {
        const regex = this.homographRegexCache.get(homograph);
        if (regex) {
          normalized = normalized.replace(regex, ascii);
        }
      }
    }

    return normalized;
  }

  /**
   * Compare two domains for homograph similarity
   */
  private compareHomographs(test: string, known: string): boolean {
    // Normalize domains
    const norm1 = this.normalizeForHomograph(test);
    const norm2 = this.normalizeForHomograph(known);

    // Check if normalized forms are identical
    return norm1 === norm2 && test !== known;
  }

  /**
   * Check for phishing patterns
   */
  private isPhishingPattern(hostname: string, knownDomain: string): boolean {
    const knownParts = knownDomain.split('.');
    const hostParts = hostname.split('.');

    // Check for wrong TLD (e.g., metamask.com when expecting metamask.io)
    if (knownParts[0] === hostParts[0] && knownParts[1] !== hostParts[1]) {
      return true;
    }

    // Common phishing patterns
    const patterns = [
      `${knownDomain.replace('.', '-')}`, // metamask-io.com
      `${knownParts[0]}-`, // metamask-wallet.com
      `secure-${knownDomain}`, // secure-metamask.io
    ];

    for (const pattern of patterns) {
      if (hostname.includes(pattern)) {
        return true;
      }
    }

    // Check for character substitutions (e.g., rnetamask.io)
    // Look for strings that are very similar but have character changes
    const knownName = knownParts[0];
    const hostName = hostParts[0];

    // Check if the hostname contains most of the known domain name but with changes
    if (knownName && hostName && this.isSimilarWithSubstitutions(hostName, knownName)) {
      return true;
    }

    return false;
  }

  /**
   * Check if two strings are similar with character substitutions
   */
  private isSimilarWithSubstitutions(test: string, known: string): boolean {
    // If lengths are very different, probably not a substitution attack
    if (Math.abs(test.length - known.length) > 2) {
      return false;
    }

    // Calculate edit distance (Levenshtein distance)
    const editDistance = this.calculateEditDistance(test, known);

    // If edit distance is small relative to the length, it's likely a substitution
    const threshold = Math.max(1, Math.floor(known.length * 0.3)); // 30% of known length
    return editDistance <= threshold && editDistance > 0;
  }

  /**
   * Calculate edit distance between two strings
   */
  private calculateEditDistance(str1: string, str2: string): number {
    if (str1 === str2) return 0;
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    const m = str1.length;
    const n = str2.length;

    // Use a simpler implementation that TypeScript can better understand
    const prev = new Array(n + 1).fill(0).map((_, j) => j);
    const curr = new Array(n + 1).fill(0);

    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          curr[j] = prev[j - 1];
        } else {
          curr[j] = Math.min(
            (prev[j] ?? 0) + 1, // deletion
            (curr[j - 1] ?? 0) + 1, // insertion
            (prev[j - 1] ?? 0) + 1, // substitution
          );
        }
      }
      // Swap arrays for next iteration
      const temp = prev.slice();
      for (let k = 0; k <= n; k++) {
        prev[k] = curr[k];
        curr[k] = temp[k];
      }
    }

    return prev[n] ?? 0;
  }

  /**
   * Clear validation cache
   *
   * @remarks
   * Removes all cached validation results. Useful when security policies
   * have been updated and cached results need to be invalidated.
   *
   * @example
   * ```typescript
   * // Update security policy
   * validator.updateConfig(newConfig);
   * // Clear cache to ensure new policy is applied
   * validator.clearCache();
   * ```
   */
  clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get cache size
   *
   * @remarks
   * Returns the current number of cached validation results.
   * Useful for monitoring cache usage and performance.
   *
   * @returns The number of entries in the validation cache
   *
   * @example
   * ```typescript
   * const cacheSize = validator.getCacheSize();
   * console.log(`Cache contains ${cacheSize} entries`);
   * ```
   */
  getCacheSize(): number {
    return this.validationCache.size;
  }
}

/**
 * Create a default origin validator
 *
 * @remarks
 * Factory function to create an origin validator with default secure settings.
 *
 * @param logger - Logger instance for security event logging
 * @param config - Optional configuration to override defaults
 * @returns A configured OriginValidator instance
 *
 * @example
 * ```typescript
 * const validator = createOriginValidator(logger, {
 *   enforceHttps: true,
 *   allowedOrigins: ['https://myapp.com']
 * });
 * ```
 */
export function createOriginValidator(logger: Logger, config: OriginValidationConfig = {}): OriginValidator {
  return new OriginValidator(config, logger);
}

/**
 * Validate origin with default settings
 *
 * @remarks
 * Convenience function to validate an origin without creating a validator instance.
 * Creates a temporary validator with the provided configuration.
 *
 * @param origin - The origin URL to validate
 * @param logger - Logger instance for security event logging
 * @param config - Optional configuration to override defaults
 * @returns Promise resolving to true if origin is valid, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await validateOrigin(
 *   'https://example.com',
 *   logger,
 *   { enforceHttps: true }
 * );
 * ```
 */
export async function validateOrigin(
  origin: string,
  logger: Logger,
  config: OriginValidationConfig = {},
): Promise<boolean> {
  const validator = createOriginValidator(logger, config);
  return validator.validate(origin);
}

/**
 * Check if origin is secure (HTTPS or localhost)
 *
 * @remarks
 * Quick check to determine if an origin uses a secure protocol.
 * Considers HTTPS and localhost origins as secure.
 *
 * @param origin - The origin URL to check
 * @returns True if origin is secure, false otherwise
 *
 * @example
 * ```typescript
 * if (!isSecureOrigin(window.location.origin)) {
 *   console.warn('Application is not running on a secure origin');
 * }
 * ```
 */
export function isSecureOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      url.protocol === 'https:' ||
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '[::1]'
    );
  } catch {
    return false;
  }
}

/**
 * Extract hostname from origin
 *
 * @remarks
 * Safely extracts the hostname from an origin URL.
 * Returns null if the origin is not a valid URL.
 *
 * @param origin - The origin URL to extract hostname from
 * @returns The hostname or null if extraction fails
 *
 * @example
 * ```typescript
 * const hostname = extractHostname('https://example.com:8080');
 * console.log(hostname); // 'example.com'
 * ```
 */
export function extractHostname(origin: string): string | null {
  try {
    const url = new URL(origin);
    return url.hostname;
  } catch {
    return null;
  }
}
