import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createMockEvmProvider, testSetupPatterns } from '../../testing/index.js';
import { CHAIN_CONFIGS, type ChainInfo, ChainManager } from './chainManager.js';

describe('ChainManager', () => {
  let mockProvider: ReturnType<typeof createMockEvmProvider>;
  let chainManager: ChainManager;

  // Use centralized test setup pattern
  const testEnv = testSetupPatterns.standard();

  beforeEach(async () => {
    await testEnv.setup();
    mockProvider = createMockEvmProvider();
    chainManager = new ChainManager(mockProvider, ['eip155:1', 'eip155:137']);
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('constructor', () => {
    it('should create instance with provider and supported chains', () => {
      const manager = new ChainManager(mockProvider, ['eip155:1', 'eip155:137']);
      expect(manager).toBeDefined();
    });

    it('should create instance with empty supported chains by default', () => {
      const manager = new ChainManager(mockProvider);
      expect(manager).toBeDefined();
    });
  });

  describe('switchChain', () => {
    it('should successfully switch to supported chain', async () => {
      mockProvider.request.mockResolvedValue(null);

      await chainManager.switchChain('eip155:1');

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: 'eip155:1' }],
      });
    });

    it('should add chain and switch when chain not added error occurs', async () => {
      const switchError = { code: 4902 };
      mockProvider.request.mockRejectedValueOnce(switchError).mockResolvedValueOnce(null); // addChain success

      await chainManager.switchChain('eip155:1');

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: 'eip155:1' }],
      });

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [CHAIN_CONFIGS['eip155:1']],
      });
    });

    it('should throw error if unsupported chain when adding', async () => {
      const switchError = { code: 4902 };
      mockProvider.request.mockRejectedValueOnce(switchError);

      await expect(chainManager.switchChain('eip155:2457')).rejects.toThrow(
        'Chain eip155:2457 is not supported',
      );
    });

    it('should re-throw non-chain-not-added errors', async () => {
      const otherError = new Error('User rejected request');
      mockProvider.request.mockRejectedValueOnce(otherError);

      await expect(chainManager.switchChain('eip155:1')).rejects.toThrow('User rejected request');
    });

    it('should throw error if provider is null', async () => {
      const managerWithoutProvider = new ChainManager(null);

      await expect(managerWithoutProvider.switchChain('eip155:1')).rejects.toThrow(
        'No wallet provider available',
      );
    });

    it('should throw error if provider does not have request method', async () => {
      const invalidProvider = {};
      const managerWithInvalidProvider = new ChainManager(invalidProvider);

      await expect(managerWithInvalidProvider.switchChain('eip155:1')).rejects.toThrow(
        'Provider does not support request method',
      );
    });
  });

  describe('addChain', () => {
    const validChainInfo: ChainInfo = {
      id: 'eip155:137',
      name: 'Polygon Mainnet',
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    };

    it('should successfully add valid chain', async () => {
      mockProvider.request.mockResolvedValue(null);

      await chainManager.addChain(validChainInfo);

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_addEthereumChain',
        params: [validChainInfo],
      });
    });

    it('should throw error for chain without id', async () => {
      const invalidChain = { ...validChainInfo, id: '' };

      await expect(chainManager.addChain(invalidChain)).rejects.toThrow(
        'Chain configuration must have an id',
      );
    });

    it('should throw error for chain without name', async () => {
      const invalidChain = { ...validChainInfo, name: '' };

      await expect(chainManager.addChain(invalidChain)).rejects.toThrow(
        'Chain configuration must have a name',
      );
    });

    it('should throw error for chain without nativeCurrency', async () => {
      const invalidChain = {
        ...validChainInfo,
        // @ts-expect-error Testing invalid configuration
        nativeCurrency: null,
      };

      await expect(chainManager.addChain(invalidChain)).rejects.toThrow(
        'Chain configuration must have nativeCurrency',
      );
    });

    it('should throw error for chain without rpcUrls', async () => {
      const invalidChain = { ...validChainInfo, rpcUrls: [] };

      await expect(chainManager.addChain(invalidChain)).rejects.toThrow(
        'Chain configuration must have at least one RPC URL',
      );
    });

    it('should throw error for chain with null rpcUrls', async () => {
      const invalidChain = {
        ...validChainInfo,
        // @ts-expect-error Testing invalid configuration
        rpcUrls: null,
      };

      await expect(chainManager.addChain(invalidChain)).rejects.toThrow(
        'Chain configuration must have at least one RPC URL',
      );
    });

    it('should throw error if provider is null', async () => {
      const managerWithoutProvider = new ChainManager(null);

      await expect(managerWithoutProvider.addChain(validChainInfo)).rejects.toThrow(
        'No wallet provider available',
      );
    });
  });

  describe('isChainSupported', () => {
    it('should return true for supported chain ID', () => {
      expect(chainManager.isChainSupported('eip155:1')).toBe(true);
      expect(chainManager.isChainSupported('eip155:137')).toBe(true);
    });

    it('should return false for unsupported chain ID', () => {
      expect(chainManager.isChainSupported('eip155:2457')).toBe(false);
    });

    it('should return false for empty supported chains', () => {
      const manager = new ChainManager(mockProvider, []);
      expect(manager.isChainSupported('eip155:1')).toBe(false);
    });
  });

  describe('static methods', () => {
    describe('getChainConfig', () => {
      it('should return chain config for valid chain ID', () => {
        const config = ChainManager.getChainConfig('eip155:1');
        expect(config).toEqual(CHAIN_CONFIGS['eip155:1']);
      });

      it('should return null for invalid chain ID', () => {
        const config = ChainManager.getChainConfig('eip155:2457');
        expect(config).toBeNull();
      });
    });

    describe('getAllChainConfigs', () => {
      it('should return all chain configurations', () => {
        const configs = ChainManager.getAllChainConfigs();
        expect(configs).toEqual(Object.values(CHAIN_CONFIGS));
        expect(configs.length).toBeGreaterThan(0);
      });

      it('should return array of ChainInfo objects', () => {
        const configs = ChainManager.getAllChainConfigs();
        for (const config of configs) {
          expect(config).toHaveProperty('id');
          expect(config).toHaveProperty('name');
          expect(config).toHaveProperty('nativeCurrency');
          expect(config).toHaveProperty('rpcUrls');
        }
      });
    });
  });

  describe('CHAIN_CONFIGS', () => {
    it('should contain expected chain configurations', () => {
      expect(CHAIN_CONFIGS).toHaveProperty('eip155:1');
      expect(CHAIN_CONFIGS).toHaveProperty('eip155:137');
      expect(CHAIN_CONFIGS).toHaveProperty('eip155:42161');
      expect(CHAIN_CONFIGS).toHaveProperty('eip155:10');
      expect(CHAIN_CONFIGS).toHaveProperty('eip155:56');
    });

    it('should have valid structure for each chain config', () => {
      for (const config of Object.values(CHAIN_CONFIGS)) {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('nativeCurrency');
        expect(config).toHaveProperty('rpcUrls');
        expect(config.nativeCurrency).toHaveProperty('name');
        expect(config.nativeCurrency).toHaveProperty('symbol');
        expect(config.nativeCurrency).toHaveProperty('decimals');
        expect(Array.isArray(config.rpcUrls)).toBe(true);
        expect(config.rpcUrls.length).toBeGreaterThan(0);
      }
    });

    it('should have correct Ethereum mainnet configuration', () => {
      const ethConfig = CHAIN_CONFIGS['eip155:1'];
      expect(ethConfig).toBeDefined();
      expect(ethConfig?.name).toBe('Ethereum Mainnet');
      expect(ethConfig?.nativeCurrency.symbol).toBe('ETH');
      expect(ethConfig?.nativeCurrency.decimals).toBe(18);
    });

    it('should have correct Polygon configuration', () => {
      const polygonConfig = CHAIN_CONFIGS['eip155:137'];
      expect(polygonConfig).toBeDefined();
      expect(polygonConfig?.name).toBe('Polygon Mainnet');
      expect(polygonConfig?.nativeCurrency.symbol).toBe('MATIC');
      expect(polygonConfig?.nativeCurrency.decimals).toBe(18);
    });
  });

  describe('error handling', () => {
    it('should handle provider request failures gracefully', async () => {
      const requestError = new Error('Network error');
      mockProvider.request.mockRejectedValue(requestError);

      await expect(chainManager.switchChain('eip155:1')).rejects.toThrow('Network error');
    });

    it('should validate provider before making requests', async () => {
      const manager = new ChainManager({ request: 'not a function' });

      await expect(manager.switchChain('eip155:1')).rejects.toThrow(
        'Provider does not support request method',
      );
    });

    it('should handle undefined provider gracefully', async () => {
      const manager = new ChainManager(undefined);

      await expect(manager.switchChain('eip155:1')).rejects.toThrow('No wallet provider available');
    });
  });

  describe('isChainNotAddedError', () => {
    it('should correctly identify chain not added error', async () => {
      const chainNotAddedError = { code: 4902 };
      mockProvider.request.mockRejectedValueOnce(chainNotAddedError).mockResolvedValueOnce(null);

      // Should not throw and should attempt to add chain
      await chainManager.switchChain('eip155:1');

      expect(mockProvider.request).toHaveBeenCalledTimes(2);
      expect(mockProvider.request).toHaveBeenNthCalledWith(2, {
        method: 'wallet_addEthereumChain',
        params: [CHAIN_CONFIGS['eip155:1']],
      });
    });

    it('should not identify other errors as chain not added', async () => {
      const otherError = { code: 4001 }; // User rejected
      mockProvider.request.mockRejectedValue(otherError);

      await expect(chainManager.switchChain('eip155:1')).rejects.toEqual(otherError);
      expect(mockProvider.request).toHaveBeenCalledTimes(1);
    });

    it('should handle non-object errors', async () => {
      const stringError = 'Something went wrong';
      mockProvider.request.mockRejectedValue(stringError);

      await expect(chainManager.switchChain('eip155:1')).rejects.toBe(stringError);
    });

    it('should handle null errors', async () => {
      mockProvider.request.mockRejectedValue(null);

      await expect(chainManager.switchChain('eip155:1')).rejects.toBeNull();
    });
  });
});
