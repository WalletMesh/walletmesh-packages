/**
 * @file Tests for headless modal interfaces and helpers
 */

import { describe, expect, it } from 'vitest';
import type { WalletDisplayData } from './headless.js';
import { displayHelpers } from './headless.js';

describe('headless modal', () => {
  const createMockWallet = (
    id: string,
    name: string,
    overrides: Partial<WalletDisplayData> = {},
  ): WalletDisplayData => ({
    wallet: {
      id,
      name,
      icon: `https://example.com/${id}.png`,
      homepage: `https://example.com/${id}`,
    },
    status: {
      installed: false,
      available: true,
      recent: false,
      recommended: false,
    },
    capabilities: {
      chains: ['ethereum'],
      features: ['sign'],
    },
    ...overrides,
  });

  describe('displayHelpers', () => {
    describe('sortWallets', () => {
      it('should sort installed wallets first', () => {
        const wallets = [
          createMockWallet('wallet1', 'Wallet 1'),
          createMockWallet('wallet2', 'Wallet 2', {
            status: { installed: true, available: true, recent: false, recommended: false },
          }),
          createMockWallet('wallet3', 'Wallet 3'),
        ];

        const sorted = displayHelpers.sortWallets(wallets);
        expect(sorted[0].wallet.id).toBe('wallet2');
      });

      it('should sort recent wallets second (after installed)', () => {
        const wallets = [
          createMockWallet('wallet1', 'Wallet 1'),
          createMockWallet('wallet2', 'Wallet 2', {
            status: { installed: false, available: true, recent: true, recommended: false },
          }),
          createMockWallet('wallet3', 'Wallet 3', {
            status: { installed: false, available: true, recent: false, recommended: true },
          }),
        ];

        const sorted = displayHelpers.sortWallets(wallets);
        expect(sorted[0].wallet.id).toBe('wallet2'); // recent
        expect(sorted[1].wallet.id).toBe('wallet3'); // recommended
        expect(sorted[2].wallet.id).toBe('wallet1'); // normal
      });

      it('should sort recommended wallets third', () => {
        const wallets = [
          createMockWallet('wallet1', 'Wallet 1'),
          createMockWallet('wallet2', 'Wallet 2', {
            status: { installed: false, available: true, recent: false, recommended: true },
          }),
        ];

        const sorted = displayHelpers.sortWallets(wallets);
        expect(sorted[0].wallet.id).toBe('wallet2');
        expect(sorted[1].wallet.id).toBe('wallet1');
      });

      it('should sort alphabetically within same priority group', () => {
        const wallets = [
          createMockWallet('wallet1', 'Zebra Wallet'),
          createMockWallet('wallet2', 'Alpha Wallet'),
          createMockWallet('wallet3', 'Beta Wallet'),
        ];

        const sorted = displayHelpers.sortWallets(wallets);
        expect(sorted[0].wallet.name).toBe('Alpha Wallet');
        expect(sorted[1].wallet.name).toBe('Beta Wallet');
        expect(sorted[2].wallet.name).toBe('Zebra Wallet');
      });

      it('should handle complex priority combinations', () => {
        const wallets = [
          createMockWallet('wallet1', 'Zebra Wallet', {
            status: { installed: false, available: true, recent: false, recommended: true },
          }),
          createMockWallet('wallet2', 'Alpha Wallet', {
            status: { installed: true, available: true, recent: false, recommended: false },
          }),
          createMockWallet('wallet3', 'Beta Wallet', {
            status: { installed: false, available: true, recent: true, recommended: false },
          }),
          createMockWallet('wallet4', 'Charlie Wallet'),
        ];

        const sorted = displayHelpers.sortWallets(wallets);
        expect(sorted[0].wallet.name).toBe('Alpha Wallet'); // installed
        expect(sorted[1].wallet.name).toBe('Beta Wallet'); // recent
        expect(sorted[2].wallet.name).toBe('Zebra Wallet'); // recommended
        expect(sorted[3].wallet.name).toBe('Charlie Wallet'); // normal
      });
    });

    describe('groupWallets', () => {
      it('should group wallets by installation status', () => {
        const wallets = [
          createMockWallet('wallet1', 'Installed Wallet', {
            status: { installed: true, available: true, recent: false, recommended: false },
          }),
          createMockWallet('wallet2', 'Available Wallet 1'),
          createMockWallet('wallet3', 'Available Wallet 2'),
        ];

        const groups = displayHelpers.groupWallets(wallets);

        expect(groups.has('installed')).toBe(true);
        expect(groups.has('available')).toBe(true);
        expect(groups.get('installed')).toHaveLength(1);
        expect(groups.get('available')).toHaveLength(2);
        expect(groups.get('installed')?.[0].wallet.id).toBe('wallet1');
      });

      it('should handle all installed wallets', () => {
        const wallets = [
          createMockWallet('wallet1', 'Wallet 1', {
            status: { installed: true, available: true, recent: false, recommended: false },
          }),
          createMockWallet('wallet2', 'Wallet 2', {
            status: { installed: true, available: true, recent: false, recommended: false },
          }),
        ];

        const groups = displayHelpers.groupWallets(wallets);

        expect(groups.has('installed')).toBe(true);
        expect(groups.has('available')).toBe(false);
        expect(groups.get('installed')).toHaveLength(2);
      });

      it('should handle all available wallets', () => {
        const wallets = [createMockWallet('wallet1', 'Wallet 1'), createMockWallet('wallet2', 'Wallet 2')];

        const groups = displayHelpers.groupWallets(wallets);

        expect(groups.has('installed')).toBe(false);
        expect(groups.has('available')).toBe(true);
        expect(groups.get('available')).toHaveLength(2);
      });

      it('should handle empty wallet list', () => {
        const wallets: WalletDisplayData[] = [];
        const groups = displayHelpers.groupWallets(wallets);

        expect(groups.size).toBe(0);
      });
    });

    describe('getWalletStatusLabel', () => {
      it('should return "Installed" for installed wallets', () => {
        const wallet = createMockWallet('test', 'Test', {
          status: { installed: true, available: true, recent: false, recommended: false },
        });
        expect(displayHelpers.getWalletStatusLabel(wallet)).toBe('Installed');
      });

      it('should return "Recently Used" for recent wallets', () => {
        const wallet = createMockWallet('test', 'Test', {
          status: { installed: false, available: true, recent: true, recommended: false },
        });
        expect(displayHelpers.getWalletStatusLabel(wallet)).toBe('Recently Used');
      });

      it('should return "Recommended" for recommended wallets', () => {
        const wallet = createMockWallet('test', 'Test', {
          status: { installed: false, available: true, recent: false, recommended: true },
        });
        expect(displayHelpers.getWalletStatusLabel(wallet)).toBe('Recommended');
      });

      it('should return "Available" for regular wallets', () => {
        const wallet = createMockWallet('test', 'Test');
        expect(displayHelpers.getWalletStatusLabel(wallet)).toBe('Available');
      });

      it('should prioritize status by importance (installed > recent > recommended)', () => {
        const installedAndRecent = createMockWallet('test', 'Test', {
          status: { installed: true, available: true, recent: true, recommended: true },
        });
        expect(displayHelpers.getWalletStatusLabel(installedAndRecent)).toBe('Installed');

        const recentAndRecommended = createMockWallet('test', 'Test', {
          status: { installed: false, available: true, recent: true, recommended: true },
        });
        expect(displayHelpers.getWalletStatusLabel(recentAndRecommended)).toBe('Recently Used');
      });
    });
  });

  describe('interfaces', () => {
    it('should define WalletDisplayData interface structure', () => {
      const wallet: WalletDisplayData = {
        wallet: {
          id: 'test',
          name: 'Test Wallet',
          icon: 'test.png',
          homepage: 'https://test.com',
        },
        status: {
          installed: true,
          available: true,
          recent: false,
          recommended: true,
        },
        capabilities: {
          chains: ['ethereum', 'polygon'],
          features: ['sign', 'encrypt'],
        },
      };

      expect(wallet.wallet.id).toBe('test');
      expect(wallet.status.installed).toBe(true);
      expect(wallet.capabilities.chains).toContain('ethereum');
    });

    it('should handle optional properties in WalletDisplayData', () => {
      const wallet: WalletDisplayData = {
        wallet: {
          id: 'test',
          name: 'Test Wallet',
          icon: 'test.png',
          // homepage is optional
        },
        status: {
          installed: false,
          available: true,
          recent: false,
          recommended: false,
        },
        capabilities: {
          chains: ['ethereum'],
          features: ['sign'],
        },
      };

      expect(wallet.wallet.homepage).toBeUndefined();
    });
  });
});
