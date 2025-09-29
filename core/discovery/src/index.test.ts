/**
 * Test suite for main package exports
 * Validates that all expected exports are available and correctly typed
 */

import { describe, it, expect } from 'vitest';

describe('Package Exports', () => {
  it('should export core types and constants', async () => {
    const constants = await import('./core/constants.js');
    expect(constants).toBeDefined();
    expect(constants.DISCOVERY_PROTOCOL_VERSION).toBeDefined();
  });

  it('should export initiator functionality', async () => {
    const initiatorModule = await import('./initiator/index.js');

    expect(initiatorModule.DiscoveryInitiator).toBeDefined();
    expect(initiatorModule.createCapabilityRequirements).toBeDefined();
    expect(initiatorModule.createInitiatorSession).toBeDefined();
    expect(initiatorModule.runDiscovery).toBeDefined();
  });

  it('should export responder functionality', async () => {
    const responderModule = await import('./responder/index.js');

    expect(responderModule.DiscoveryResponder).toBeDefined();
    expect(responderModule.CapabilityMatcher).toBeDefined();
    expect(responderModule.startResponder).toBeDefined();
    expect(responderModule.createResponderServer).toBeDefined();
  });

  it('should export security utilities', async () => {
    const securityModule = await import('./security.js');

    expect(securityModule.SessionTracker).toBeDefined();
    expect(securityModule.OriginValidator).toBeDefined();
    expect(securityModule.RateLimiter).toBeDefined();
    expect(securityModule.validateOrigin).toBeDefined();
    expect(securityModule.validateEventOrigin).toBeDefined();
  });

  it('should export testing utilities', async () => {
    const testingModule = await import('./testing/index.js');

    expect(testingModule.MockDiscoveryInitiator).toBeDefined();
    expect(testingModule.MockDiscoveryResponder).toBeDefined();
    expect(testingModule.MockEventTarget).toBeDefined();
  });

  it('should export all expected main package exports', async () => {
    const mainExports = await import('./index.js');

    // Check that all main exports are available
    expect(mainExports.DiscoveryInitiator).toBeDefined();
    expect(mainExports.DiscoveryResponder).toBeDefined();
    expect(mainExports.CapabilityMatcher).toBeDefined();

    // Helper functions
    expect(mainExports.createCapabilityRequirements).toBeDefined();
    expect(mainExports.createInitiatorSession).toBeDefined();
    expect(mainExports.runDiscovery).toBeDefined();
    expect(mainExports.createResponderServer).toBeDefined();
    expect(mainExports.startResponder).toBeDefined();

    // Security utilities (including createSecurityPolicy)
    expect(mainExports.SessionTracker).toBeDefined();
    expect(mainExports.OriginValidator).toBeDefined();
    expect(mainExports.RateLimiter).toBeDefined();
    expect(mainExports.validateOrigin).toBeDefined();
    expect(mainExports.validateEventOrigin).toBeDefined();
    expect(mainExports.createSecurityPolicy).toBeDefined();

    // Constants
    expect(mainExports.DISCOVERY_PROTOCOL_VERSION).toBeDefined();
    expect(mainExports.DISCOVERY_EVENTS).toBeDefined();
  });
});
