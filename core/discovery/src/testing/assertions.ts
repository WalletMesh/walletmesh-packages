import type { DiscoveryRequestEvent, DiscoveryResponseEvent, InitiatorInfo } from '../types/core.js';
import type { ResponderInfo, CapabilityIntersection, QualifiedResponder } from '../types/capabilities.js';
import { DISCOVERY_PROTOCOL_VERSION } from '../core/constants.js';

/**
 * Assertion helpers for testing discovery protocol implementations.
 *
 * These functions provide TypeScript type assertions that validate the structure
 * and content of discovery protocol messages. They throw descriptive errors if
 * validation fails, making them ideal for use in tests.
 *
 * @module assertions
 * @category Testing
 * @since 1.0.0
 */

/**
 * Expect a valid discovery request.
 *
 * Validates that the provided value is a properly formatted DiscoveryRequestEvent
 * with all required fields and correct types. Throws descriptive errors if
 * validation fails.
 *
 * @param request - The value to validate as a DiscoveryRequestEvent
 * @throws Error with specific details about what validation failed
 * @example
 * ```typescript
 * const request = createTestDiscoveryRequest();
 *
 * // This will pass
 * expectValidDiscoveryRequestEvent(request);
 *
 * // This will throw an error
 * expectValidDiscoveryRequestEvent({ type: 'wrong-type' });
 * // Error: Expected type 'discovery:request', got 'wrong-type'
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function expectValidDiscoveryRequestEvent(request: unknown): asserts request is DiscoveryRequestEvent {
  if (!request || typeof request !== 'object') {
    throw new Error('Request must be an object');
  }

  const req = request as Record<string, unknown>;

  if (req['type'] !== 'discovery:wallet:request') {
    throw new Error(`Expected type 'discovery:wallet:request', got '${req['type']}'`);
  }

  if (req['version'] !== DISCOVERY_PROTOCOL_VERSION) {
    throw new Error(`Expected version '${DISCOVERY_PROTOCOL_VERSION}', got '${req['version']}'`);
  }

  if (!req['sessionId'] || typeof req['sessionId'] !== 'string') {
    throw new Error('Request must have a valid sessionId');
  }

  if (!req['origin'] || typeof req['origin'] !== 'string') {
    throw new Error('Request must have a valid origin');
  }

  expectValidInitiatorInfo(req['initiatorInfo']);
  expectValidCapabilityRequirements(req['required']);

  if (req['optional']) {
    expectValidCapabilityPreferences(req['optional']);
  }
}

/**
 * Expect a valid discovery response.
 *
 * Validates that the provided value is a properly formatted DiscoveryResponseEvent
 * with all required fields including wallet metadata and matched capabilities.
 *
 * @param response - The value to validate as a DiscoveryResponseEvent
 * @throws Error with specific details about what validation failed
 * @example
 * ```typescript
 * const response = createTestDiscoveryResponse();
 *
 * // This will pass
 * expectValidDiscoveryResponseEvent(response);
 *
 * // This will throw if icon is not a data URI
 * expectValidDiscoveryResponseEvent({
 *   ...response,
 *   icon: 'https://example.com/icon.png'
 * });
 * // Error: Response icon must be a data URI
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function expectValidDiscoveryResponseEvent(
  response: unknown,
): asserts response is DiscoveryResponseEvent {
  if (!response || typeof response !== 'object') {
    throw new Error('Response must be an object');
  }

  const res = response as Record<string, unknown>;

  if (res['type'] !== 'discovery:wallet:response') {
    throw new Error(`Expected type 'discovery:wallet:response', got '${res['type']}'`);
  }

  if (res['version'] !== DISCOVERY_PROTOCOL_VERSION) {
    throw new Error(`Expected version '${DISCOVERY_PROTOCOL_VERSION}', got '${res['version']}'`);
  }

  if (!res['sessionId'] || typeof res['sessionId'] !== 'string') {
    throw new Error('Response must have a valid sessionId');
  }

  if (!res['responderId'] || typeof res['responderId'] !== 'string') {
    throw new Error('Response must have a valid responderId');
  }

  if (!res['rdns'] || typeof res['rdns'] !== 'string') {
    throw new Error('Response must have a valid rdns');
  }

  if (!res['name'] || typeof res['name'] !== 'string') {
    throw new Error('Response must have a valid name');
  }

  if (!res['icon'] || typeof res['icon'] !== 'string') {
    throw new Error('Response must have a valid icon');
  }

  if (typeof res['icon'] === 'string' && !res['icon'].startsWith('data:')) {
    throw new Error('Response icon must be a data URI');
  }

  expectValidCapabilityIntersection(res['matched']);
}

export function expectValidResponderInfo(walletInfo: unknown): asserts walletInfo is ResponderInfo {
  if (!walletInfo || typeof walletInfo !== 'object') {
    throw new Error('ResponderInfo must be an object');
  }

  const wallet = walletInfo as Record<string, unknown>;

  if (!wallet['uuid'] || typeof wallet['uuid'] !== 'string') {
    throw new Error('ResponderInfo must have a valid uuid');
  }

  if (!wallet['rdns'] || typeof wallet['rdns'] !== 'string') {
    throw new Error('ResponderInfo must have a valid rdns');
  }

  if (!wallet['name'] || typeof wallet['name'] !== 'string') {
    throw new Error('ResponderInfo must have a valid name');
  }

  if (!wallet['icon'] || typeof wallet['icon'] !== 'string') {
    throw new Error('ResponderInfo must have a valid icon');
  }

  if (typeof wallet['icon'] === 'string' && !wallet['icon'].startsWith('data:')) {
    throw new Error('ResponderInfo icon must be a data URI');
  }

  if (!['web', 'extension', 'hardware', 'mobile'].includes(wallet['type'] as string)) {
    throw new Error('ResponderInfo must have a valid type');
  }

  if (!Array.isArray(wallet['technologies']) || wallet['technologies'].length === 0) {
    throw new Error('ResponderInfo must have at least one technology');
  }

  if (!Array.isArray(wallet['features'])) {
    throw new Error('ResponderInfo must have features as an array');
  }

  // Validate each technology
  for (const tech of wallet['technologies']) {
    if (!tech || typeof tech !== 'object') {
      throw new Error('Technology must be an object');
    }
    const t = tech as Record<string, unknown>;
    if (!t['type'] || typeof t['type'] !== 'string') {
      throw new Error('Technology must have a type');
    }
    if (!Array.isArray(t['interfaces'])) {
      throw new Error('Technology must have interfaces as an array');
    }
    if (t['features'] && !Array.isArray(t['features'])) {
      throw new Error('Technology features must be an array');
    }
  }

  // Validate each feature
  for (const feature of wallet['features']) {
    expectValidWalletFeature(feature);
  }
}

/**
 * Expect valid dApp info.
 *
 * Validates that the provided value is a properly formatted InitiatorInfo
 * with required name and valid URL.
 *
 * @param initiatorInfo - The value to validate as InitiatorInfo
 * @throws Error with specific details about what validation failed
 * @example
 * ```typescript
 * const dappInfo = createTestDAppInfo();
 *
 * // This will pass
 * expectValidInitiatorInfo(dappInfo);
 *
 * // This will throw if URL is invalid
 * expectValidInitiatorInfo({
 *   name: 'My dApp',
 *   url: 'not-a-valid-url'
 * });
 * // Error: InitiatorInfo url must be a valid URL
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function expectValidInitiatorInfo(initiatorInfo: unknown): asserts initiatorInfo is InitiatorInfo {
  if (!initiatorInfo || typeof initiatorInfo !== 'object') {
    throw new Error('InitiatorInfo must be an object');
  }

  const initiator = initiatorInfo as Record<string, unknown>;

  if (!initiator['name'] || typeof initiator['name'] !== 'string') {
    throw new Error('InitiatorInfo must have a valid name');
  }

  if (!initiator['url'] || typeof initiator['url'] !== 'string') {
    throw new Error('InitiatorInfo must have a valid url');
  }

  // Validate URL format
  try {
    new URL(initiator['url']);
  } catch {
    throw new Error('InitiatorInfo url must be a valid URL');
  }

  if (initiator['icon'] && typeof initiator['icon'] === 'string' && !initiator['icon'].startsWith('data:')) {
    throw new Error('InitiatorInfo icon must be a data URI if provided');
  }
}

/**
 * Expect valid qualified wallet.
 *
 * Validates that the provided value is a properly formatted QualifiedResponder
 * representing a wallet that has been qualified through the discovery process.
 *
 * @param wallet - The value to validate as QualifiedResponder
 * @throws Error with specific details about what validation failed
 * @example
 * ```typescript
 * const qualifiedWallet = {
 *   responderId: 'wallet-123',
 *   rdns: 'com.example.wallet',
 *   name: 'Example Wallet',
 *   icon: 'data:image/png;base64,...',
 *   matched: {
 *     required: {
 *       technologies: [{ type: 'evm', interfaces: ['eip-1193'] }],
 *       features: []
 *     },
 *     optional: { features: [] }
 *   }
 * };
 *
 * // This will pass
 * expectValidQualifiedResponder(qualifiedWallet);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function expectValidQualifiedResponder(wallet: unknown): asserts wallet is QualifiedResponder {
  if (!wallet || typeof wallet !== 'object') {
    throw new Error('QualifiedWallet must be an object');
  }

  const qual = wallet as Record<string, unknown>;

  if (!qual['responderId'] || typeof qual['responderId'] !== 'string') {
    throw new Error('QualifiedWallet must have a valid walletId');
  }

  if (!qual['rdns'] || typeof qual['rdns'] !== 'string') {
    throw new Error('QualifiedWallet must have a valid rdns');
  }

  if (!qual['name'] || typeof qual['name'] !== 'string') {
    throw new Error('QualifiedWallet must have a valid name');
  }

  if (!qual['icon'] || typeof qual['icon'] !== 'string') {
    throw new Error('QualifiedWallet must have a valid icon');
  }

  expectValidCapabilityIntersection(qual['matched']);

  if (qual['score'] !== undefined && typeof qual['score'] !== 'number') {
    throw new Error('QualifiedWallet score must be a number if provided');
  }
}

/**
 * Expect valid capability requirements.
 *
 * Internal helper that validates the structure of capability requirements
 * including chains, features, and interfaces arrays.
 *
 * @param requirements - The value to validate as capability requirements
 * @throws Error if any required array is missing or invalid
 * @internal
 * @category Testing
 * @since 1.0.0
 */
function expectValidCapabilityRequirements(requirements: unknown): void {
  if (!requirements || typeof requirements !== 'object') {
    throw new Error('Capability requirements must be an object');
  }

  const reqs = requirements as Record<string, unknown>;

  if (!Array.isArray(reqs['technologies'])) {
    throw new Error('Capability requirements must have technologies as an array');
  }

  // Validate each technology
  for (const tech of reqs['technologies'] as unknown[]) {
    if (!tech || typeof tech !== 'object') {
      throw new Error('Technology must be an object');
    }
    const t = tech as Record<string, unknown>;
    if (!t['type'] || typeof t['type'] !== 'string') {
      throw new Error('Technology must have a type');
    }
    if (!Array.isArray(t['interfaces'])) {
      throw new Error('Technology must have interfaces as an array');
    }
    if (t['features'] && !Array.isArray(t['features'])) {
      throw new Error('Technology features must be an array');
    }
  }

  if (!Array.isArray(reqs['features'])) {
    throw new Error('Capability requirements must have features as an array');
  }
}

/**
 * Expect valid capability preferences.
 *
 * Internal helper that validates the structure of optional capability preferences
 * including chains and features arrays when provided.
 *
 * @param preferences - The value to validate as capability preferences
 * @throws Error if any provided array is not actually an array
 * @internal
 * @category Testing
 * @since 1.0.0
 */
function expectValidCapabilityPreferences(preferences: unknown): void {
  if (!preferences || typeof preferences !== 'object') {
    throw new Error('Capability preferences must be an object');
  }

  const prefs = preferences as Record<string, unknown>;

  if (prefs['features'] && !Array.isArray(prefs['features'])) {
    throw new Error('Capability preferences features must be an array if provided');
  }
}

/**
 * Expect valid capability intersection.
 *
 * Internal helper that validates the structure of a capability intersection
 * which represents the matched capabilities between requirements and wallet capabilities.
 *
 * @param intersection - The value to validate as CapabilityIntersection
 * @throws Error if required capabilities are missing or invalid
 * @internal
 * @category Testing
 * @since 1.0.0
 */
function expectValidCapabilityIntersection(
  intersection: unknown,
): asserts intersection is CapabilityIntersection {
  if (!intersection || typeof intersection !== 'object') {
    throw new Error('Capability intersection must be an object');
  }

  const inter = intersection as Record<string, unknown>;

  if (!inter['required']) {
    throw new Error('Capability intersection must have required capabilities');
  }

  expectValidCapabilityRequirements(inter['required']);

  if (inter['optional']) {
    expectValidCapabilityPreferences(inter['optional']);
  }
}

/**
 * Expect valid wallet feature.
 *
 * Internal helper that validates the structure of a wallet feature
 * including required id and name fields.
 *
 * @param feature - The value to validate as wallet feature
 * @throws Error if any required field is missing or invalid
 * @internal
 * @category Testing
 * @since 1.0.0
 */
function expectValidWalletFeature(feature: unknown): void {
  if (!feature || typeof feature !== 'object') {
    throw new Error('Wallet feature must be an object');
  }

  const feat = feature as Record<string, unknown>;

  if (!feat['id'] || typeof feat['id'] !== 'string') {
    throw new Error('Wallet feature must have a valid id');
  }

  if (!feat['name'] || typeof feat['name'] !== 'string') {
    throw new Error('Wallet feature must have a valid name');
  }

  // enabled field is optional and not required in the current interface
}

/**
 * Assert that a value is a valid discovery request (alias for expectValidDiscoveryRequestEvent).
 */
export function assertValidDiscoveryRequestEvent(request: unknown): asserts request is DiscoveryRequestEvent {
  expectValidDiscoveryRequestEvent(request);
}

/**
 * Assert that a value is a valid responder announcement (alias for expectValidDiscoveryResponseEvent).
 */
export function assertValidResponderAnnouncement(
  response: unknown,
): asserts response is DiscoveryResponseEvent {
  expectValidDiscoveryResponseEvent(response);
}

/**
 * Assert that a value is a valid origin validation result.
 */
export function assertValidOriginValidation(
  result: unknown,
): asserts result is { valid: boolean; reason?: string; details?: string } {
  if (!result || typeof result !== 'object') {
    throw new Error('Origin validation result must be an object');
  }

  const r = result as Partial<{ valid: boolean; reason?: string; details?: string }>;

  if (typeof r.valid !== 'boolean') {
    throw new Error('Origin validation result.valid must be a boolean');
  }

  if (!r.valid && (!r.reason || typeof r.reason !== 'string')) {
    throw new Error('Origin validation result.reason must be a string when valid is false');
  }

  if (r.details !== undefined && typeof r.details !== 'string') {
    throw new Error('Origin validation result.details must be a string if provided');
  }
}
