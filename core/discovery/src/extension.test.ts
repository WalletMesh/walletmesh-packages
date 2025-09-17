import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ResponderInfo } from './types/capabilities.js';
import type { SecurityPolicy } from './types/security.js';
import { setupFakeTimers, cleanupFakeTimers } from './testing/timingHelpers.js';

describe('extension module exports', () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    cleanupFakeTimers();
  });

  it('should export ContentScriptRelay from content module', async () => {
    const { ContentScriptRelay } = await import('./extension.js');
    expect(ContentScriptRelay).toBeDefined();
    expect(ContentScriptRelay).toBeTypeOf('function');
  });

  it('should export getContentScriptRelay from content module', async () => {
    const { getContentScriptRelay } = await import('./extension.js');
    expect(getContentScriptRelay).toBeDefined();
    expect(getContentScriptRelay).toBeTypeOf('function');
  });

  it('should export WalletDiscovery from wallet module', async () => {
    const { WalletDiscovery } = await import('./extension.js');
    expect(WalletDiscovery).toBeDefined();
    expect(WalletDiscovery).toBeTypeOf('function');
  });

  it('should export createSecurityPolicy from security module', async () => {
    const { createSecurityPolicy } = await import('./extension.js');
    expect(createSecurityPolicy).toBeDefined();
    expect(createSecurityPolicy).toBeTypeOf('function');
    expect(createSecurityPolicy.strict).toBeTypeOf('function');
    expect(createSecurityPolicy.development).toBeTypeOf('function');
  });

  it('should export validateOrigin from security module', async () => {
    const { validateOrigin } = await import('./extension.js');
    expect(validateOrigin).toBeDefined();
    expect(validateOrigin).toBeTypeOf('function');
  });

  it('should export all expected types', async () => {
    // This tests that the type exports compile correctly
    const module = await import('./extension.js');

    // Type exports don't appear as runtime values, but we can verify
    // that the module exports the expected runtime values
    expect(module).toHaveProperty('ContentScriptRelay');
    expect(module).toHaveProperty('getContentScriptRelay');
    expect(module).toHaveProperty('WalletDiscovery');
    expect(module).toHaveProperty('createSecurityPolicy');
    expect(module).toHaveProperty('validateOrigin');
  });

  it('should allow usage as documented in module comments', async () => {
    const { ContentScriptRelay, WalletDiscovery } = await import('./extension.js');

    // Test that ContentScriptRelay can be instantiated
    const relay = new ContentScriptRelay();
    expect(relay).toBeDefined();
    expect(relay.isReady).toBeTypeOf('function');
    expect(relay.getStatus).toBeTypeOf('function');

    // Test that WalletDiscovery can be instantiated with proper config
    const mockResponderInfo: ResponderInfo = {
      uuid: 'test-wallet',
      rdns: 'com.test.wallet',
      name: 'Test Wallet',
      icon: 'data:image/svg+xml;base64,',
      type: 'extension',
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
          features: ['eth_accounts', 'eth_sendTransaction'],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
        },
      ],
    };

    const mockSecurityPolicy: SecurityPolicy = {
      allowedOrigins: ['https://example.com'],
      requireHttps: true,
    };

    const discovery = new WalletDiscovery({
      responderInfo: mockResponderInfo,
      securityPolicy: mockSecurityPolicy,
    });

    expect(discovery).toBeDefined();
    expect(discovery.startAnnouncing).toBeTypeOf('function');
    expect(discovery.stopAnnouncing).toBeTypeOf('function');
    expect(discovery.isAnnouncing).toBeTypeOf('function');
  });

  it('should allow all exported components to work together', async () => {
    const { ContentScriptRelay, WalletDiscovery, createSecurityPolicy, validateOrigin } = await import(
      './extension.js'
    );

    // Test security policy creation
    const strictPolicy = createSecurityPolicy.strict();
    expect(strictPolicy).toBeDefined();
    expect(strictPolicy.requireHttps).toBe(true);

    const devPolicy = createSecurityPolicy.development();
    expect(devPolicy).toBeDefined();
    expect(devPolicy.requireHttps).toBe(false);

    // Test origin validation
    const validResult = validateOrigin('https://example.com', strictPolicy);
    expect(validResult.valid).toBe(true);

    const invalidResult = validateOrigin('http://example.com', strictPolicy);
    expect(invalidResult.valid).toBe(false);

    // Test content script relay
    const relay = new ContentScriptRelay();
    expect(relay.isReady()).toBe(true);

    // Test wallet discovery with created policy
    const responderInfo: ResponderInfo = {
      uuid: 'test-wallet',
      rdns: 'com.test.wallet',
      name: 'Test Wallet',
      icon: 'data:image/svg+xml;base64,',
      type: 'extension',
      version: '1.0.0',
      protocolVersion: '0.1.0',
      technologies: [
        {
          type: 'evm',
          interfaces: ['eip-1193'],
          features: ['eth_accounts', 'eth_sendTransaction'],
        },
      ],
      features: [
        {
          id: 'account-management',
          name: 'Account Management',
        },
      ],
    };

    const discovery = new WalletDiscovery({
      responderInfo,
      securityPolicy: strictPolicy,
    });

    expect(discovery.getStats()).toMatchObject({
      isEnabled: false,
      requestsProcessed: 0,
      announcementsSent: 0,
      requestsRejected: 0,
      connectedOrigins: [],
    });
  });
});
