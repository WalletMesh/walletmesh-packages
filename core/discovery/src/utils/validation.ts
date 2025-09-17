/**
 * Shared validation utilities and error handling for the discovery protocol.
 *
 * Consolidates validation logic, protocol errors, and transport validation
 * used across initiator and responder implementations to reduce code duplication
 * and ensure consistency.
 *
 * @module utils/validation
 * @category Utils
 * @since 0.1.0
 */

import type { InitiatorInfo, TransportConfig, ErrorCategory } from '../types/core.js';
import type {
  CapabilityRequirements,
  CapabilityPreferences,
  ResponderInfo,
  TechnologyRequirement,
} from '../types/capabilities.js';
import type { SecurityPolicy } from '../types/security.js';
import { ERROR_CODES, ERROR_MESSAGES, SILENT_FAILURE_CODES, getErrorCategory } from '../core/constants.js';

// ============================================================================
// Validation Error Class
// ============================================================================

/**
 * Validation error class for structured error reporting.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Protocol Error Class (Consolidated from protocolError.ts)
// ============================================================================

/**
 * Protocol error with standardized error codes and categories.
 *
 * Extends the standard Error class with protocol-specific error codes,
 * categories, metadata, and silent failure handling for consistent error
 * management across the discovery protocol implementation.
 *
 * @category Errors
 * @since 0.1.0
 */
export class ProtocolError extends Error {
  readonly code: number;
  readonly category: ErrorCategory | 'unknown';
  readonly silent: boolean;
  readonly context?: Record<string, unknown>;

  constructor(code: number, context?: Record<string, unknown>, customMessage?: string) {
    const message = customMessage || ERROR_MESSAGES[code] || 'Unknown protocol error';
    super(message);

    this.name = 'ProtocolError';
    this.code = code;
    this.category = getErrorCategory(code);
    this.silent = SILENT_FAILURE_CODES.has(code as Parameters<typeof SILENT_FAILURE_CODES.has>[0]);
    if (context) {
      this.context = context;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProtocolError);
    }
  }

  static originValidationFailed(origin: string, reason?: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.ORIGIN_VALIDATION_FAILED, { origin, reason });
  }

  static rateLimitExceeded(origin: string, limit: number): ProtocolError {
    return new ProtocolError(ERROR_CODES.RATE_LIMIT_EXCEEDED, { origin, limit });
  }

  static sessionReplayDetected(sessionId: string, origin: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.SESSION_REPLAY_DETECTED, { sessionId, origin });
  }

  static originBlocked(origin: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.ORIGIN_BLOCKED, { origin });
  }

  static capabilityNotSupported(capability: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.CAPABILITY_NOT_SUPPORTED, { capability });
  }

  static chainNotSupported(chain: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.CHAIN_NOT_SUPPORTED, { chain });
  }

  static messageTooLarge(size: number, maxSize: number): ProtocolError {
    return new ProtocolError(ERROR_CODES.MESSAGE_TOO_LARGE, { size, maxSize });
  }

  static invalidMessageFormat(reason: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.INVALID_MESSAGE_FORMAT, { reason });
  }

  static missingRequiredField(field: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.MISSING_REQUIRED_FIELD, { field });
  }

  static isProtocolError(error: unknown): error is ProtocolError {
    return error instanceof ProtocolError;
  }

  static shouldSilentlyFail(error: unknown): boolean {
    if (error instanceof ProtocolError) {
      return error.silent;
    }
    return false;
  }
}

// ============================================================================
// Basic Validation Functions
// ============================================================================

/**
 * Validate InitiatorInfo structure and content.
 */
export function validateInitiatorInfo(info: InitiatorInfo): void {
  if (!info) {
    throw new ValidationError('Initiator info is required', 'initiatorInfo', info);
  }

  if (!info.name || typeof info.name !== 'string') {
    throw new ValidationError('Initiator name is required and must be a string', 'name', info.name);
  }

  if (!info.url || typeof info.url !== 'string') {
    throw new ValidationError('Initiator URL is required and must be a string', 'url', info.url);
  }

  // Validate URL format
  try {
    new URL(info.url);
  } catch {
    throw new ValidationError('Initiator URL must be a valid URL', 'url', info.url);
  }

  // Validate icon if provided
  if (info.icon && !info.icon.startsWith('data:')) {
    throw new ValidationError('Initiator icon must be a data URI', 'icon', info.icon);
  }
}

/**
 * Validate CapabilityRequirements structure and content.
 */
export function validateCapabilityRequirements(requirements: CapabilityRequirements): void {
  if (!requirements) {
    throw new ValidationError('Requirements are required', 'requirements', requirements);
  }

  if (!Array.isArray(requirements.technologies)) {
    throw new ValidationError(
      'Required technologies must be an array',
      'technologies',
      requirements.technologies,
    );
  }

  if (requirements.technologies.length === 0) {
    throw new ValidationError(
      'At least one technology is required',
      'technologies',
      requirements.technologies,
    );
  }

  // Validate each technology requirement
  for (const tech of requirements.technologies) {
    validateTechnologyRequirement(tech);
  }

  if (!Array.isArray(requirements.features)) {
    throw new ValidationError('Required features must be an array', 'features', requirements.features);
  }
}

/**
 * Validate CapabilityPreferences structure and content.
 */
export function validateCapabilityPreferences(preferences?: CapabilityPreferences): void {
  if (!preferences) {
    return; // Preferences are optional
  }

  if (preferences.technologies && !Array.isArray(preferences.technologies)) {
    throw new ValidationError(
      'Preference technologies must be an array',
      'technologies',
      preferences.technologies,
    );
  }

  if (preferences.features && !Array.isArray(preferences.features)) {
    throw new ValidationError('Preference features must be an array', 'features', preferences.features);
  }

  // Validate technology preferences if provided
  if (preferences.technologies) {
    for (const tech of preferences.technologies) {
      validateTechnologyRequirement(tech);
    }
  }
}

/**
 * Validate TechnologyRequirement structure and content.
 */
export function validateTechnologyRequirement(tech: TechnologyRequirement): void {
  if (!tech || typeof tech !== 'object') {
    throw new ValidationError('Technology must be an object', 'technology', tech);
  }

  if (!tech.type || typeof tech.type !== 'string') {
    throw new ValidationError('Technology type is required and must be a string', 'type', tech.type);
  }

  if (!['evm', 'solana', 'aztec'].includes(tech.type)) {
    throw new ValidationError('Technology type must be one of: evm, solana, aztec', 'type', tech.type);
  }

  if (!Array.isArray(tech.interfaces)) {
    throw new ValidationError('Technology interfaces must be an array', 'interfaces', tech.interfaces);
  }

  if (tech.interfaces.length === 0) {
    throw new ValidationError(
      'Technology must specify at least one interface',
      'interfaces',
      tech.interfaces,
    );
  }

  if (tech.features && !Array.isArray(tech.features)) {
    throw new ValidationError('Technology features must be an array if provided', 'features', tech.features);
  }
}

/**
 * Validate ResponderInfo structure and content.
 */
export function validateResponderInfo(info: ResponderInfo): void {
  if (!info) {
    throw new ValidationError('Responder info is required', 'responderInfo', info);
  }

  if (!info.uuid || typeof info.uuid !== 'string') {
    throw new ValidationError('Responder UUID is required and must be a string', 'uuid', info.uuid);
  }

  if (!info.rdns || typeof info.rdns !== 'string') {
    throw new ValidationError('Responder RDNS is required and must be a string', 'rdns', info.rdns);
  }

  // Validate RDNS format (must have at least one dot for reverse domain notation)
  const rdnsPattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!rdnsPattern.test(info.rdns)) {
    throw new ValidationError('Responder RDNS must be in reverse domain notation format', 'rdns', info.rdns);
  }

  if (!info.name || typeof info.name !== 'string') {
    throw new ValidationError('Responder name is required and must be a string', 'name', info.name);
  }

  if (!info.icon || typeof info.icon !== 'string') {
    throw new ValidationError('Responder icon is required and must be a string', 'icon', info.icon);
  }

  // Validate icon format (should be data URI)
  if (!info.icon.startsWith('data:')) {
    throw new ValidationError('Responder icon must be a data URI', 'icon', info.icon);
  }

  if (!info.type || !['web', 'extension', 'hardware', 'mobile', 'desktop'].includes(info.type)) {
    throw new ValidationError(
      'Responder type must be one of: web, extension, hardware, mobile, desktop',
      'type',
      info.type,
    );
  }

  if (!Array.isArray(info.technologies) || info.technologies.length === 0) {
    throw new ValidationError(
      'Responder must support at least one technology',
      'technologies',
      info.technologies,
    );
  }

  if (!Array.isArray(info.features)) {
    throw new ValidationError('Responder features must be an array', 'features', info.features);
  }

  // Validate each technology capability
  for (const tech of info.technologies) {
    validateTechnologyCapability(tech);
  }

  // Validate each feature
  for (const feature of info.features) {
    validateResponderFeature(feature);
  }
}

/**
 * Validate technology capability structure.
 */
export function validateTechnologyCapability(tech: unknown): void {
  if (!tech || typeof tech !== 'object') {
    throw new ValidationError('Technology must be an object', 'technology', tech);
  }

  const techObj = tech as Record<string, unknown>;

  if (!techObj['type'] || typeof techObj['type'] !== 'string') {
    throw new ValidationError('Technology type is required and must be a string', 'type', techObj['type']);
  }

  if (!['evm', 'solana', 'aztec'].includes(techObj['type'] as string)) {
    throw new ValidationError('Technology type must be one of: evm, solana, aztec', 'type', techObj['type']);
  }

  if (!Array.isArray(techObj['interfaces'])) {
    throw new ValidationError('Technology interfaces must be an array', 'interfaces', techObj['interfaces']);
  }

  if (techObj['features'] && !Array.isArray(techObj['features'])) {
    throw new ValidationError(
      'Technology features must be an array if provided',
      'features',
      techObj['features'],
    );
  }
}

/**
 * Validate responder feature structure.
 */
export function validateResponderFeature(feature: unknown): void {
  if (!feature || typeof feature !== 'object') {
    throw new ValidationError('Feature must be an object', 'feature', feature);
  }

  const featureObj = feature as Record<string, unknown>;

  if (!featureObj['id'] || typeof featureObj['id'] !== 'string') {
    throw new ValidationError('Feature ID is required and must be a string', 'id', featureObj['id']);
  }

  if (!featureObj['name'] || typeof featureObj['name'] !== 'string') {
    throw new ValidationError('Feature name is required and must be a string', 'name', featureObj['name']);
  }
}

/**
 * Validate SecurityPolicy structure and content.
 */
export function validateSecurityPolicy(policy: SecurityPolicy): SecurityPolicy {
  if (!policy || typeof policy !== 'object') {
    throw new ValidationError('Security policy must be an object', 'securityPolicy', policy);
  }

  // Create a sanitized policy with default values for invalid fields
  const sanitized: SecurityPolicy = {};

  // Validate and sanitize allowedOrigins
  if (policy.allowedOrigins) {
    if (Array.isArray(policy.allowedOrigins)) {
      sanitized.allowedOrigins = policy.allowedOrigins.filter((origin) => typeof origin === 'string');
    }
  }

  // Validate and sanitize blockedOrigins
  if (policy.blockedOrigins) {
    if (Array.isArray(policy.blockedOrigins)) {
      sanitized.blockedOrigins = policy.blockedOrigins.filter((origin) => typeof origin === 'string');
    } else {
      sanitized.blockedOrigins = [];
    }
  }

  // Validate and sanitize boolean fields with defaults
  sanitized.requireHttps = typeof policy.requireHttps === 'boolean' ? policy.requireHttps : true;
  sanitized.allowLocalhost = typeof policy.allowLocalhost === 'boolean' ? policy.allowLocalhost : false;
  sanitized.certificateValidation =
    typeof policy.certificateValidation === 'boolean' ? policy.certificateValidation : false;

  // Validate and sanitize rate limit
  if (policy.rateLimit && typeof policy.rateLimit === 'object') {
    sanitized.rateLimit = {
      enabled: typeof policy.rateLimit.enabled === 'boolean' ? policy.rateLimit.enabled : true,
      maxRequests:
        typeof policy.rateLimit.maxRequests === 'number' && policy.rateLimit.maxRequests > 0
          ? policy.rateLimit.maxRequests
          : 20,
      windowMs:
        typeof policy.rateLimit.windowMs === 'number' && policy.rateLimit.windowMs > 0
          ? policy.rateLimit.windowMs
          : 60000,
    };
  } else {
    sanitized.rateLimit = {
      enabled: true,
      maxRequests: 20,
      windowMs: 60000,
    };
  }

  // Copy valid string fields
  if (typeof policy.contentSecurityPolicy === 'string') {
    sanitized.contentSecurityPolicy = policy.contentSecurityPolicy;
  }

  return sanitized;
}

/**
 * Validate timeout value.
 */
export function validateTimeout(timeout: unknown): number {
  if (timeout === undefined || timeout === null) {
    return 3000; // Default timeout
  }

  if (typeof timeout !== 'number' || timeout <= 0) {
    throw new ValidationError('Timeout must be a positive number', 'timeout', timeout);
  }

  return timeout;
}

/**
 * Validate session ID format.
 */
export function validateSessionId(sessionId: unknown): void {
  if (!sessionId || typeof sessionId !== 'string') {
    throw new ValidationError('Session ID is required and must be a string', 'sessionId', sessionId);
  }

  // Basic UUID format validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(sessionId)) {
    throw new ValidationError('Session ID must be a valid UUID', 'sessionId', sessionId);
  }
}

// ============================================================================
// Transport Validation (Consolidated from transportValidator.ts)
// ============================================================================

const CHROME_EXTENSION_ID_REGEX = /^[a-z]{32}$/;
const FIREFOX_EXTENSION_ID_REGEX =
  /^(\{[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\}|[\w.-]+@[\w.-]+)$/i;

/**
 * Validate transport configuration.
 */
export function validateTransportConfig(config: TransportConfig): void {
  if (!config || typeof config !== 'object') {
    throw ProtocolError.invalidMessageFormat('Transport configuration must be an object');
  }

  const { type } = config;

  if (!type || typeof type !== 'string') {
    throw ProtocolError.missingRequiredField('transport.type');
  }

  switch (type) {
    case 'extension':
      validateExtensionTransport(config);
      break;
    case 'popup':
      validatePopupTransport(config);
      break;
    case 'websocket':
      validateWebsocketTransport(config);
      break;
    case 'iframe':
      validateIframeTransport(config);
      break;
    case 'postmessage':
      // PostMessage doesn't require additional validation
      break;
    default:
      throw ProtocolError.invalidMessageFormat(`Unknown transport type: ${type}`);
  }
}

function validateExtensionTransport(config: TransportConfig): void {
  const { extensionId } = config;

  if (!extensionId || typeof extensionId !== 'string') {
    throw ProtocolError.missingRequiredField('transport.extensionId');
  }

  if (!CHROME_EXTENSION_ID_REGEX.test(extensionId) && !FIREFOX_EXTENSION_ID_REGEX.test(extensionId)) {
    throw new ProtocolError(
      ERROR_CODES.INVALID_MESSAGE_FORMAT,
      {
        field: 'transport.extensionId',
        value: extensionId,
        format: 'Expected 32 lowercase letters (Chrome) or email/GUID format (Firefox)',
      },
      'Invalid extension ID format',
    );
  }
}

function validatePopupTransport(config: TransportConfig): void {
  const { url } = config;

  if (!url || typeof url !== 'string') {
    throw ProtocolError.missingRequiredField('transport.url');
  }

  try {
    const urlObj = new URL(url);

    if (urlObj.protocol !== 'https:' && urlObj.hostname !== 'localhost' && urlObj.hostname !== '127.0.0.1') {
      throw new ProtocolError(
        ERROR_CODES.HTTPS_REQUIRED,
        {
          url,
          protocol: urlObj.protocol,
        },
        'Popup URLs must use HTTPS (except for localhost)',
      );
    }

    if (
      urlObj.hostname.includes('..') ||
      urlObj.pathname.includes('..') ||
      urlObj.hostname.includes('\u0000')
    ) {
      throw new ProtocolError(
        ERROR_CODES.INVALID_MESSAGE_FORMAT,
        {
          url,
          reason: 'Suspicious URL pattern detected',
        },
        'Invalid popup URL',
      );
    }
  } catch (error) {
    if (error instanceof ProtocolError) {
      throw error;
    }
    throw ProtocolError.invalidMessageFormat(`Invalid popup URL: ${url}`);
  }
}

function validateIframeTransport(config: TransportConfig): void {
  // Iframe uses same validation as popup
  validatePopupTransport(config);
}

function validateWebsocketTransport(config: TransportConfig): void {
  const { url: websocketUrl } = config;

  if (!websocketUrl || typeof websocketUrl !== 'string') {
    throw ProtocolError.missingRequiredField('transport.url');
  }

  try {
    const url = new URL(websocketUrl);

    if (!['ws:', 'wss:'].includes(url.protocol)) {
      throw new ProtocolError(
        ERROR_CODES.INVALID_MESSAGE_FORMAT,
        {
          url: websocketUrl,
          protocol: url.protocol,
        },
        'WebSocket URLs must use ws:// or wss:// protocol',
      );
    }

    if (url.protocol === 'ws:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      throw new ProtocolError(
        ERROR_CODES.HTTPS_REQUIRED,
        {
          url: websocketUrl,
          protocol: url.protocol,
        },
        'WebSocket URLs must use WSS (except for localhost)',
      );
    }

    if (url.port) {
      const port = Number.parseInt(url.port, 10);
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        throw new ProtocolError(
          ERROR_CODES.INVALID_MESSAGE_FORMAT,
          {
            url: websocketUrl,
            port: url.port,
          },
          'Invalid WebSocket port',
        );
      }
    }
  } catch (error) {
    if (error instanceof ProtocolError) {
      throw error;
    }
    throw ProtocolError.invalidMessageFormat(`Invalid WebSocket URL: ${websocketUrl}`);
  }
}

/**
 * Check if a transport configuration is valid without throwing.
 */
export function isValidTransportConfig(config: unknown): config is TransportConfig {
  try {
    validateTransportConfig(config as TransportConfig);
    return true;
  } catch {
    return false;
  }
}
