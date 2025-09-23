/**
 * @fileoverview Tests for wallet information schemas
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  chainTypeSchema,
  walletMetadataSchema,
  walletInfoSchema,
  chainConfigSchema,
  providerInterfaceSchema,
} from '../wallet.js';

describe('Wallet Schemas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe('chainTypeSchema', () => {
    it('should validate supported chain types', () => {
      const validChainTypes = ['evm', 'solana', 'aztec'];

      for (const chainType of validChainTypes) {
        expect(() => chainTypeSchema.parse(chainType)).not.toThrow();
      }
    });

    it('should reject unsupported chain types', () => {
      const invalidChainTypes = ['bitcoin', 'cosmos', 'polkadot', ''];

      for (const chainType of invalidChainTypes) {
        expect(() => chainTypeSchema.parse(chainType)).toThrow();
      }
    });
  });

  describe('walletMetadataSchema', () => {
    it('should validate valid wallet metadata', () => {
      const validMeta = {
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc+',
        description: 'A popular Ethereum wallet',
      };

      expect(() => walletMetadataSchema.parse(validMeta)).not.toThrow();
    });

    it('should validate metadata without description', () => {
      const validMeta = {
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc+',
      };

      expect(() => walletMetadataSchema.parse(validMeta)).not.toThrow();
    });

    it('should require name and icon', () => {
      const invalidMeta = {
        description: 'Missing name and icon',
      };

      expect(() => walletMetadataSchema.parse(invalidMeta)).toThrow();
    });

    it('should reject empty name', () => {
      const invalidMeta = {
        name: '',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
      };

      expect(() => walletMetadataSchema.parse(invalidMeta)).toThrow();
    });

    it('should reject invalid icon URL', () => {
      const invalidMeta = {
        name: 'TestWallet',
        icon: 'not-a-url',
      };

      expect(() => walletMetadataSchema.parse(invalidMeta)).toThrow();
    });
  });

  describe('walletInfoSchema', () => {
    it('should validate complete wallet info', () => {
      const validInfo = {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc+',
        description: 'Ethereum wallet',
        chains: ['evm'],
      };

      expect(() => walletInfoSchema.parse(validInfo)).not.toThrow();
    });

    it('should validate wallet with multiple chains', () => {
      const validInfo = {
        id: 'multi-wallet',
        name: 'MultiWallet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
        chains: ['evm', 'solana', 'aztec'],
      };

      expect(() => walletInfoSchema.parse(validInfo)).not.toThrow();
    });

    it('should require at least one chain', () => {
      const invalidInfo = {
        id: 'no-chains',
        name: 'NoChains',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
        chains: [],
      };

      expect(() => walletInfoSchema.parse(invalidInfo)).toThrow();
    });

    it('should reject invalid chain types', () => {
      const invalidInfo = {
        id: 'invalid-chain',
        name: 'InvalidChain',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
        chains: ['bitcoin'],
      };

      expect(() => walletInfoSchema.parse(invalidInfo)).toThrow();
    });

    it('should require id', () => {
      const invalidInfo = {
        name: 'NoId',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
        chains: ['evm'],
      };

      expect(() => walletInfoSchema.parse(invalidInfo)).toThrow();
    });
  });

  describe('chainConfigSchema', () => {
    it('should validate chain config with string chainId', () => {
      const validConfig = {
        chainId: '1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
      };

      expect(() => chainConfigSchema.parse(validConfig)).not.toThrow();
    });

    it('should validate chain config with number chainId', () => {
      const validConfig = {
        chainId: 1,
        chainType: 'evm',
        name: 'Ethereum Mainnet',
      };

      expect(() => chainConfigSchema.parse(validConfig)).not.toThrow();
    });

    it('should validate chain config without icon', () => {
      const validConfig = {
        chainId: '1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
      };

      expect(() => chainConfigSchema.parse(validConfig)).not.toThrow();
    });

    it('should require chainId, chainType, and name', () => {
      const invalidConfig = {
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjE2IiBmaWxsPSIjZjY4NTFlIi8+PC9zdmc>',
      };

      expect(() => chainConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject invalid chainType', () => {
      const invalidConfig = {
        chainId: '1',
        chainType: 'invalid',
        name: 'Test Chain',
      };

      expect(() => chainConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject empty name', () => {
      const invalidConfig = {
        chainId: '1',
        chainType: 'evm',
        name: '',
      };

      expect(() => chainConfigSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe('providerInterfaceSchema', () => {
    it('should validate supported provider interfaces', () => {
      const validInterfaces = ['evm', 'solana', 'aztec'];

      for (const interfaceType of validInterfaces) {
        expect(() => providerInterfaceSchema.parse(interfaceType)).not.toThrow();
      }
    });

    it('should reject unsupported provider interfaces', () => {
      const invalidInterfaces = ['bitcoin', 'cosmos', 'near'];

      for (const interfaceType of invalidInterfaces) {
        expect(() => providerInterfaceSchema.parse(interfaceType)).toThrow();
      }
    });
  });
});
