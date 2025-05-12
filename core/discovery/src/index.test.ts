import { describe, it, expect } from 'vitest';
import * as discovery from './index.js';

describe('@walletmesh/discovery exports', () => {
  it('should export core classes', () => {
    expect(discovery.DiscoveryListener).toBeDefined();
    expect(discovery.DiscoveryAnnouncer).toBeDefined();
  });

  it('should export factory functions', () => {
    expect(discovery.createDiscoveryListener).toBeDefined();
    expect(discovery.createExtensionWalletAnnouncer).toBeDefined();
    expect(discovery.createWebWalletAnnouncer).toBeDefined();
  });

  it('should export type guards', () => {
    expect(discovery.isDiscoveryRequestEvent).toBeDefined();
    expect(discovery.isDiscoveryResponseEvent).toBeDefined();
    expect(discovery.isDiscoveryAckEvent).toBeDefined();
  });

  it('should export constants', () => {
    expect(discovery.WmDiscovery).toBeDefined();
    expect(discovery.CONFIG).toBeDefined();
  });

  // Type system tests
  it('should provide correct type information', () => {
    // Create test objects that must satisfy the types
    const webWallet: discovery.WebWalletInfo = {
      name: 'Test Web Wallet',
      icon: 'test.png',
      rdns: 'com.test',
      url: 'https://test.com',
      technologies: ['test'],
    };

    const extWallet: discovery.ExtensionWalletInfo = {
      name: 'Test Ext Wallet',
      icon: 'test.png',
      rdns: 'com.test',
      extensionId: 'test-id',
      technologies: ['test'],
    };

    const request: discovery.DiscoveryRequestEvent = {
      version: '1.0.0',
      discoveryId: 'test',
      technologies: ['test'],
    };

    const response: discovery.DiscoveryResponseEvent = {
      version: '1.0.0',
      discoveryId: 'test',
      walletId: 'test',
      wallet: webWallet,
    };

    const ack: discovery.DiscoveryAckEvent = {
      version: '1.0.0',
      discoveryId: 'test',
      walletId: 'test',
    };

    const listenerOpts: discovery.DiscoveryListenerOptions = {
      technologies: ['test'],
      callback: () => {},
    };

    const announcerOpts: discovery.DiscoveryAnnouncerOptions = {
      walletInfo: webWallet,
      supportedTechnologies: ['test'],
      callback: () => true,
    };

    // Verify objects match their types
    expect(webWallet.url).toBe('https://test.com');
    expect(extWallet.extensionId).toBe('test-id');
    expect(request.technologies).toEqual(['test']);
    expect(response.wallet).toBe(webWallet);
    expect(ack.walletId).toBe('test');
    expect(listenerOpts.technologies).toEqual(['test']);
    expect(announcerOpts.walletInfo).toBe(webWallet);
  });

  // Test type constraints
  it('should enforce type constraints', () => {
    type BadExtensionWallet = {
      name: string;
      icon: string;
      rdns: string;
      url: string; // This should cause a type error
    };

    type BadWebWallet = {
      name: string;
      icon: string;
      rdns: string;
      extensionId: string; // This should cause a type error
    };

    // These type assertions should fail at compile time
    // @ts-expect-error ExtensionWalletInfo cannot have url
    const invalidExt: discovery.ExtensionWalletInfo = {
      name: 'Test',
      icon: 'test.png',
      rdns: 'com.test',
      url: 'https://test.com',
    } satisfies BadExtensionWallet;

    // @ts-expect-error WebWalletInfo cannot have extensionId
    const invalidWeb: discovery.WebWalletInfo = {
      name: 'Test',
      icon: 'test.png',
      rdns: 'com.test',
      extensionId: 'test-id',
    } satisfies BadWebWallet;

    // Just to make sure the variables are used
    expect(invalidExt).toBeDefined();
    expect(invalidWeb).toBeDefined();
  });
});
