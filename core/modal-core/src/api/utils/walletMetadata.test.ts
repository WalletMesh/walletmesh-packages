import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import type { WalletDisplayData } from '../api/core/headless.js';
import { WalletMetadataManager } from './walletMetadata.js';

// Install custom matchers
installCustomMatchers();

describe('WalletMetadataManager', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  const mockWalletData: WalletDisplayData = {
    wallet: {
      id: 'evm-wallet',
      name: 'EVM Wallet',
      icon: 'https://example.com/icon.png',
      homepage: 'https://example.com',
    },
    status: {
      installed: true,
      available: true,
      recent: true,
      recommended: true,
    },
    capabilities: {
      chains: ['ethereum', 'polygon'],
      features: ['sign', 'encrypt'],
    },
  };

  it('should export WalletMetadataManager class', () => {
    expect(WalletMetadataManager).toBeDefined();
    expect(typeof WalletMetadataManager).toBe('function');
  });

  it('should create WalletMetadataManager instance', () => {
    const manager = new WalletMetadataManager();
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(WalletMetadataManager);
  });

  it('should transform wallet data correctly', () => {
    const manager = new WalletMetadataManager();
    const transformed = manager.transformWalletData(mockWalletData);

    expect(transformed).toMatchObject({
      id: 'evm-wallet',
      name: 'EVM Wallet',
      icon: 'https://example.com/icon.png',
      homepage: 'https://example.com',
      installed: true,
      available: true,
      recent: true,
      recommended: true,
      chains: ['ethereum', 'polygon'],
      features: ['sign', 'encrypt'],
      category: 'injected',
      popularity: expect.any(Number),
      lastUsed: expect.any(Number),
    });
  });

  it('should calculate popularity correctly', () => {
    const manager = new WalletMetadataManager();
    const popularity = manager.calculatePopularity(mockWalletData);
    // Should have high popularity due to being installed, recommended, and recent
    expect(popularity).toBeGreaterThan(50);
  });

  it('should categorize wallet correctly', () => {
    const manager = new WalletMetadataManager();
    const category = manager.categorizeWallet(mockWalletData);
    expect(category).toBe('injected');
  });

  it('should allow creating new instances', () => {
    const customManager = new WalletMetadataManager();
    expect(customManager).toBeInstanceOf(WalletMetadataManager);
    const defaultManager = new WalletMetadataManager();
    expect(customManager).not.toBe(defaultManager);
  });
});
