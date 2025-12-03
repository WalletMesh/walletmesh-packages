import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { walletInfoSchema, chainConfigSchema } from '../wallet.js';

describe('Wallet Icon Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('walletInfoSchema', () => {
    it('should accept valid SVG data URI', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjwvc3ZnPg==',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should accept SVG data URI without encoding', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml,<svg width="24" height="24"></svg>',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should accept URL-encoded SVG data URI', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234A5568"%3E%3Cpath d="M12 2l5.5 9.5L12 22l-5.5-10.5L12 2z"/%3E%3C/svg%3E',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should reject URL icons', () => {
      const invalidWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'https://example.com/icon.svg',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(invalidWallet);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Icon must be a data URI with a safe image format (SVG, PNG, JPEG, WebP, or GIF)',
      );
    });

    it('should accept PNG data URIs', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should accept JPEG data URIs', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAQICAgICAwUDAwMDAwYEBAMF',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should accept WebP data URIs', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/webp;base64,UklGRiAAAABXRUJQVlA4IBQAAAAwAQCdASoB',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should accept GIF data URIs', () => {
      const validWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(validWallet);
      expect(result.success).toBe(true);
    });

    it('should reject relative paths', () => {
      const invalidWallet = {
        id: 'test-wallet',
        name: 'Test Wallet',
        icon: './icons/wallet.svg',
        chains: ['evm'],
      };

      const result = walletInfoSchema.safeParse(invalidWallet);
      expect(result.success).toBe(false);
    });
  });

  describe('chainConfigSchema', () => {
    it('should accept valid chain config with SVG data URI icon', () => {
      const validChain = {
        chainId: '0x1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiPjwvc3ZnPg==',
      };

      const result = chainConfigSchema.safeParse(validChain);
      expect(result.success).toBe(true);
    });

    it('should accept chain config without icon', () => {
      const validChain = {
        chainId: '0x1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
      };

      const result = chainConfigSchema.safeParse(validChain);
      expect(result.success).toBe(true);
    });

    it('should accept chain config with PNG data URI icon', () => {
      const validChain = {
        chainId: '0x1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      };

      const result = chainConfigSchema.safeParse(validChain);
      expect(result.success).toBe(true);
    });

    it('should reject chain config with URL icon', () => {
      const invalidChain = {
        chainId: '0x1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
        icon: 'https://ethereum.org/icon.svg',
      };

      const result = chainConfigSchema.safeParse(invalidChain);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe(
        'Icon must be a data URI with a safe image format (SVG, PNG, JPEG, WebP, or GIF)',
      );
    });
  });
});
