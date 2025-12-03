/**
 * ChainService Core Tests
 *
 * Tests for additional ChainService functionality not covered in main test file:
 * - Chain Statistics and Analysis
 * - Chain Requirement Validation
 * - Advanced Chain Compatibility Checks
 * - Chain Configuration Management
 * - Error Handling and Edge Cases
 *
 * @group unit
 * @group services
 * @group core
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { WalletInfo } from '../../core/types.js';
import { createLogger } from '../../internal/core/logger/logger.js';
import { createMockWalletInfo, createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { ChainType } from '../../types.js';
import type { ChainServiceDependencies } from './ChainService.js';
import { ChainService } from './ChainService.js';
import type { ChainCompatibilityOptions, ChainInfo, ValidateChainParams } from './types.js';

// Install domain-specific matchers
installCustomMatchers();

describe('ChainService Core Functionality', () => {
  let service: ChainService;
  let dependencies: ChainServiceDependencies;
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    dependencies = {
      logger: createLogger('test'),
    };

    service = new ChainService(dependencies, {
      enableValidation: true,
      allowDynamicChains: false,
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Chain Statistics and Analysis', () => {
    it('should get chain statistics', () => {
      const stats = service.getChainStats();

      expect(stats.total).toBeGreaterThan(0);
      expect(stats.byType).toHaveProperty('evm');
      expect(stats.byType).toHaveProperty('solana');
      expect(stats.byType).toHaveProperty('aztec');
      expect(stats.byType.evm).toBeGreaterThan(0);
      expect(stats.byType.solana).toBeGreaterThan(0);
      expect(stats.byType.aztec).toBeGreaterThan(0);
    });

    it('should get supported chain types', () => {
      const supportedTypes = service.getSupportedChainTypes();

      expect(supportedTypes).toContain(ChainType.Evm);
      expect(supportedTypes).toContain(ChainType.Solana);
      expect(supportedTypes).toContain(ChainType.Aztec);
      expect(supportedTypes.length).toBe(3);
    });

    it('should check if chain exists', () => {
      expect(service.hasChain('eip155:1')).toBe(true);
      expect(service.hasChain('eip155:999999')).toBe(false);
      expect(service.hasChain('invalid-chain-id')).toBe(false);
    });

    it('should clear all chains', () => {
      // Add a custom chain first
      const customChain: ChainInfo = {
        chainId: 'eip155:1000',
        chainType: 'evm',
        name: 'Test Chain',
        nativeCurrency: { name: 'Test', symbol: 'TEST', decimals: 18 },
        rpcUrls: ['https://test.rpc'],
      };

      service.registerChain(customChain);
      expect(service.hasChain('eip155:1000')).toBe(true);

      // Clear all chains
      service.clearChains();

      // Should have no chains now
      expect(service.getAllChains()).toHaveLength(0);
      expect(service.hasChain('eip155:1')).toBe(false);
      expect(service.hasChain('eip155:1000')).toBe(false);
    });
  });

  describe('Chain Requirement Validation', () => {
    it('should validate chain requirements successfully', () => {
      const result = service.validateChainRequirements('eip155:1', ['wallet_connect', 'metamask']);

      expect(result.isValid).toBe(true);
      expect(result.chainId).toBe('eip155:1');
      expect(result.requirements).toEqual(['wallet_connect', 'metamask']);
      expect(result.missingRequirements).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle missing chain for requirements validation', () => {
      const result = service.validateChainRequirements('eip155:999999', ['wallet_connect']);

      expect(result.isValid).toBe(false);
      expect(result.chainId).toBe('eip155:999999');
      expect(result.requirements).toEqual(['wallet_connect']);
      expect(result.error?.message).toContain('Chain eip155:999999 not found');
    });

    it('should validate empty requirements', () => {
      const result = service.validateChainRequirements('eip155:1', []);

      expect(result.isValid).toBe(true);
      expect(result.requirements).toHaveLength(0);
      expect(result.missingRequirements).toHaveLength(0);
    });

    it('should handle invalid chain ID format', () => {
      const result = service.validateChainRequirements('invalid-chain', ['requirement']);

      expect(result.isValid).toBe(false);
      expect(result.error?.message).toContain('Invalid chain ID format');
    });
  });

  describe('Advanced Chain Compatibility', () => {
    it('should check compatibility with features', () => {
      const wallet = createMockWalletInfo('test-wallet', {
        chains: [ChainType.Evm],
        features: ['wallet_connect', 'eth_sign'],
      });

      const options: ChainCompatibilityOptions = {
        wallet,
        requireFeatures: ['wallet_connect'],
      };

      const result = service.checkChainCompatibility('eip155:1', options);

      expect(result.isCompatible).toBe(true);
      expect(result.chainId).toBe('eip155:1');
      expect(result.walletId).toBe('test-wallet');
    });

    it('should detect missing required features', () => {
      const wallet = createMockWalletInfo('test-wallet', {
        chains: [ChainType.Evm],
        features: ['basic_features'],
      });

      const options: ChainCompatibilityOptions = {
        wallet,
        requireFeatures: ['wallet_connect', 'advanced_features'],
      };

      const result = service.checkChainCompatibility('eip155:1', options);

      expect(result.isCompatible).toBe(false);
      expect(result.reason).toContain('missing required features');
      expect(result.missingFeatures).toEqual(['wallet_connect', 'advanced_features']);
    });

    it('should check compatibility with version requirements', () => {
      const wallet = createMockWalletInfo('test-wallet', {
        chains: [ChainType.Evm],
        version: '1.5.0',
      });

      const options: ChainCompatibilityOptions = {
        wallet,
        minVersion: '1.0.0',
      };

      const result = service.checkChainCompatibility('eip155:1', options);

      expect(result.isCompatible).toBe(true);
    });

    it('should detect incompatible version', () => {
      const wallet = createMockWalletInfo('test-wallet', {
        chains: [ChainType.Evm],
        version: '0.9.0',
      });

      const options: ChainCompatibilityOptions = {
        wallet,
        minVersion: '1.0.0',
      };

      const result = service.checkChainCompatibility('eip155:1', options);

      expect(result.isCompatible).toBe(false);
      expect(result.reason).toContain('version requirement not met');
    });

    it('should handle missing version information', () => {
      const wallet = createMockWalletInfo('test-wallet', {
        chains: [ChainType.Evm],
        // No version property
      });

      const options: ChainCompatibilityOptions = {
        wallet,
        minVersion: '1.0.0',
      };

      const result = service.checkChainCompatibility('eip155:1', options);

      expect(result.isCompatible).toBe(false);
      expect(result.reason).toContain('version information not available');
    });
  });

  describe('Chain Configuration Management', () => {
    it('should handle chain registration with validation enabled', () => {
      const validChain: ChainInfo = {
        chainId: 'eip155:5000',
        chainType: 'evm',
        name: 'Valid Test Chain',
        nativeCurrency: { name: 'Test', symbol: 'TEST', decimals: 18 },
        rpcUrls: ['https://valid.rpc'],
        blockExplorerUrls: ['https://valid.explorer'],
      };

      expect(() => service.registerChain(validChain)).not.toThrow();
      expect(service.getChain('eip155:5000')).toEqual(validChain);
    });

    it('should reject invalid chain configuration', () => {
      const invalidChain = {
        chainId: 'invalid-format',
        chainType: 'unknown' as ChainType,
        name: '',
        // Missing required fields
      } as ChainInfo;

      expect(() => service.registerChain(invalidChain)).toThrow();
    });

    it('should handle chain with missing optional fields', () => {
      const minimalChain: ChainInfo = {
        chainId: 'eip155:6000',
        chainType: 'evm',
        name: 'Minimal Chain',
        nativeCurrency: { name: 'Min', symbol: 'MIN', decimals: 18 },
        rpcUrls: ['https://minimal.rpc'],
        // Missing optional blockExplorerUrls
      };

      expect(() => service.registerChain(minimalChain)).not.toThrow();
      const registered = service.getChain('eip155:6000');
      expect(registered).toEqual(minimalChain);
    });

    it('should handle duplicate chain registration', () => {
      const chain1: ChainInfo = {
        chainId: 'eip155:7000',
        chainType: 'evm',
        name: 'First Chain',
        nativeCurrency: { name: 'First', symbol: 'FST', decimals: 18 },
        rpcUrls: ['https://first.rpc'],
      };

      const chain2: ChainInfo = {
        chainId: 'eip155:7000', // Same chain ID
        chainType: 'evm',
        name: 'Second Chain',
        nativeCurrency: { name: 'Second', symbol: 'SND', decimals: 18 },
        rpcUrls: ['https://second.rpc'],
      };

      service.registerChain(chain1);
      service.registerChain(chain2); // Should overwrite

      const registered = service.getChain('eip155:7000');
      expect(registered?.name).toBe('Second Chain');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle validation with null current chain', () => {
      const params: ValidateChainParams = {
        currentChain: null,
        requiredChain: { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum' },
      };

      const result = service.validateChain(params);

      expect(result.isValid).toBe(false);
      expect(result.currentChain).toBe(null);
      expect(result.requiredChain).toEqual(params.requiredChain);
      expect(result.error?.message).toBe('No chain connected');
    });

    it('should handle validation with undefined required chain', () => {
      const params: ValidateChainParams = {
        currentChain: { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum' },
        requiredChain: undefined as unknown,
      };

      const result = service.validateChain(params);

      expect(result.isValid).toBe(false);
      expect(result.error?.message).toContain('Invalid validation parameters');
    });

    it('should handle compatibility check with empty wallet chains', () => {
      const wallet = createMockWalletInfo('empty-wallet', { chains: [] });

      const result = service.checkChainCompatibility('eip155:1', { wallet });

      expect(result.isCompatible).toBe(false);
      expect(result.reason).toContain('does not support any chains');
    });

    it('should handle getSupportedChainsForWallet with unsupported chain types', () => {
      const wallet = createMockWalletInfo('limited-wallet', { chains: [ChainType.Evm] });

      const supportedChains = service.getSupportedChainsForWallet(wallet);

      // Should only return EVM chains
      expect(supportedChains.every((chain) => chain.chainType === 'evm')).toBe(true);
      expect(supportedChains.length).toBeGreaterThan(0);
    });

    it('should handle wallet with no supported chains', () => {
      // Create a wallet that supports a hypothetical unsupported chain type
      const wallet = {
        id: 'unsupported-wallet',
        name: 'Unsupported Wallet',
        chains: ['unsupported'] as ChainType[],
        icon: 'icon.svg',
      } as WalletInfo;

      const supportedChains = service.getSupportedChainsForWallet(wallet);

      expect(supportedChains).toHaveLength(0);
    });

    it('should handle malformed chain IDs gracefully', () => {
      const malformedIds = ['', ' ', 'eip155:', ':1', 'eip155:abc', 'invalid-namespace:123'];

      for (const chainId of malformedIds) {
        expect(service.hasChain(chainId)).toBe(false);
        expect(service.getChain(chainId)).toBeUndefined();
      }
    });

    it('should handle unregistration of non-existent chains', () => {
      const result = service.unregisterChain('eip155:999999');
      expect(result).toBe(false);

      // Should not throw error
      expect(() => service.unregisterChain('invalid-chain-id')).not.toThrow();
    });

    it('should handle chain stats after clearing chains', () => {
      service.clearChains();
      const stats = service.getChainStats();

      expect(stats.total).toBe(0);
      expect(stats.byType.evm).toBe(0);
      expect(stats.byType.solana).toBe(0);
      expect(stats.byType.aztec).toBe(0);
    });
  });

  describe('Service Configuration Edge Cases', () => {
    it('should work with allowDynamicChains enabled', () => {
      const dynamicService = new ChainService(dependencies, {
        allowDynamicChains: true,
      });

      const customChain: ChainInfo = {
        chainId: 'eip155:8000',
        chainType: 'evm',
        name: 'Dynamic Chain',
        nativeCurrency: { name: 'Dynamic', symbol: 'DYN', decimals: 18 },
        rpcUrls: ['https://dynamic.rpc'],
      };

      expect(() => dynamicService.registerChain(customChain)).not.toThrow();
      expect(dynamicService.hasChain('eip155:8000')).toBe(true);
    });

    it('should work with validation disabled', () => {
      const noValidationService = new ChainService(dependencies, {
        enableValidation: false,
      });

      // Should still work normally
      expect(noValidationService.getAllChains().length).toBeGreaterThan(0);
      expect(noValidationService.hasChain('eip155:1')).toBe(true);
    });

    it('should work with empty configuration', () => {
      const defaultService = new ChainService(dependencies, {});

      expect(defaultService.getAllChains().length).toBeGreaterThan(0);
      expect(defaultService.getSupportedChainTypes().length).toBe(3);
    });

    it('should handle custom chains in configuration', () => {
      const customChain: ChainInfo = {
        chainId: 'eip155:9000',
        chainType: 'evm',
        name: 'Config Chain',
        nativeCurrency: { name: 'Config', symbol: 'CFG', decimals: 18 },
        rpcUrls: ['https://config.rpc'],
      };

      const configService = new ChainService(dependencies, {
        customChains: { 'eip155:9000': customChain },
      });

      expect(configService.hasChain('eip155:9000')).toBe(true);
      expect(configService.getChain('eip155:9000')).toEqual(customChain);
    });
  });
});
