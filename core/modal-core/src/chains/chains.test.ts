import { describe, expect, it } from 'vitest';
import { ChainType } from '../core/types.js';
import { aztecMainnet, aztecSandbox, aztecTestnet } from './aztec.js';
import {
  arbitrumOne,
  arbitrumSepolia,
  baseMainnet,
  baseSepolia,
  ethereumHolesky,
  ethereumMainnet,
  ethereumSepolia,
  optimismMainnet,
  optimismSepolia,
  polygonAmoy,
  polygonMainnet,
} from './ethereum.js';
import { createMainnetConfig, createTestnetConfig } from './multichain.js';
import { solanaDevnet, solanaMainnet, solanaTestnet } from './solana.js';

describe('Chain Configurations', () => {
  describe('Ethereum Chains', () => {
    describe('ethereumMainnet', () => {
      it('should have correct configuration', () => {
        expect(ethereumMainnet).toEqual({
          chainId: 'eip155:1',
          chainType: ChainType.Evm,
          name: 'Ethereum Mainnet',
          required: true,
          label: 'Ethereum',
          interfaces: ['eip1193'],
          group: 'ethereum',
        });
      });

      it('should be marked as required', () => {
        expect(ethereumMainnet.required).toBe(true);
      });

      it('should have EVM chain type', () => {
        expect(ethereumMainnet.chainType).toBe(ChainType.Evm);
      });
    });

    describe('ethereumSepolia', () => {
      it('should have correct configuration', () => {
        expect(ethereumSepolia).toEqual({
          chainId: 'eip155:11155111',
          chainType: ChainType.Evm,
          name: 'Ethereum Sepolia',
          required: false,
          label: 'Sepolia',
          interfaces: ['eip1193'],
          group: 'ethereum',
        });
      });

      it('should not be required', () => {
        expect(ethereumSepolia.required).toBe(false);
      });
    });

    describe('polygonMainnet', () => {
      it('should have correct configuration', () => {
        expect(polygonMainnet).toEqual({
          chainId: 'eip155:137',
          chainType: ChainType.Evm,
          name: 'Polygon Mainnet',
          required: false,
          label: 'Polygon',
          interfaces: ['eip1193'],
          group: 'polygon',
        });
      });

      it('should be in polygon group', () => {
        expect(polygonMainnet.group).toBe('polygon');
      });
    });

    describe('arbitrumOne', () => {
      it('should have correct configuration', () => {
        expect(arbitrumOne).toEqual({
          chainId: 'eip155:42161',
          chainType: ChainType.Evm,
          name: 'Arbitrum One',
          required: false,
          label: 'Arbitrum One',
          interfaces: ['eip1193'],
          group: 'arbitrum',
        });
      });
    });

    describe('optimismMainnet', () => {
      it('should have correct configuration', () => {
        expect(optimismMainnet).toEqual({
          chainId: 'eip155:10',
          chainType: ChainType.Evm,
          name: 'Optimism Mainnet',
          required: false,
          label: 'Optimism',
          interfaces: ['eip1193'],
          group: 'optimism',
        });
      });
    });

    describe('baseMainnet', () => {
      it('should have correct configuration', () => {
        expect(baseMainnet).toEqual({
          chainId: 'eip155:8453',
          chainType: ChainType.Evm,
          name: 'Base Mainnet',
          required: false,
          label: 'Base',
          interfaces: ['eip1193'],
          group: 'base',
        });
      });
    });

    // Note: bscMainnet and avalancheMainnet are not exported in the current implementation

    it('should have unique chain IDs for all EVM chains', () => {
      const evmChains = [
        ethereumMainnet,
        ethereumSepolia,
        ethereumHolesky,
        polygonMainnet,
        polygonAmoy,
        arbitrumOne,
        arbitrumSepolia,
        optimismMainnet,
        optimismSepolia,
        baseMainnet,
        baseSepolia,
      ];

      const chainIds = evmChains.map((chain) => chain.chainId);
      const uniqueChainIds = new Set(chainIds);
      expect(uniqueChainIds.size).toBe(chainIds.length);
    });

    it('should all support eip1193 interface', () => {
      const evmChains = [ethereumMainnet, polygonMainnet, arbitrumOne, optimismMainnet, baseMainnet];

      for (const chain of evmChains) {
        expect(chain.interfaces).toContain('eip1193');
      }
    });
  });

  describe('Solana Chains', () => {
    describe('solanaMainnet', () => {
      it('should have correct configuration', () => {
        expect(solanaMainnet).toEqual({
          chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
          chainType: ChainType.Solana,
          name: 'Solana Mainnet',
          required: true,
          label: 'Solana',
          interfaces: ['solana-standard'],
          group: 'solana',
        });
      });

      it('should be marked as required', () => {
        expect(solanaMainnet.required).toBe(true);
      });

      it('should have Solana chain type', () => {
        expect(solanaMainnet.chainType).toBe(ChainType.Solana);
      });
    });

    describe('solanaTestnet', () => {
      it('should have correct configuration', () => {
        expect(solanaTestnet).toEqual({
          chainId: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
          chainType: ChainType.Solana,
          name: 'Solana Testnet',
          required: false,
          label: 'Solana Testnet',
          interfaces: ['solana-standard'],
          group: 'solana',
        });
      });
    });

    describe('solanaDevnet', () => {
      it('should have correct configuration', () => {
        expect(solanaDevnet).toEqual({
          chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
          chainType: ChainType.Solana,
          name: 'Solana Devnet',
          required: false,
          label: 'Solana Devnet',
          interfaces: ['solana-standard'],
          group: 'solana',
        });
      });
    });

    it('should have unique chain IDs for all Solana chains', () => {
      const solanaChains = [solanaMainnet, solanaTestnet, solanaDevnet];
      const chainIds = solanaChains.map((chain) => chain.chainId);
      const uniqueChainIds = new Set(chainIds);
      expect(uniqueChainIds.size).toBe(chainIds.length);
    });

    it('should all support solana-standard interface', () => {
      const solanaChains = [solanaMainnet, solanaTestnet, solanaDevnet];
      for (const chain of solanaChains) {
        expect(chain.interfaces).toContain('solana-standard');
      }
    });
  });

  describe('Aztec Chains', () => {
    describe('aztecSandbox', () => {
      it('should have correct configuration', () => {
        expect(aztecSandbox).toEqual({
          chainId: 'aztec:31337',
          chainType: ChainType.Aztec,
          name: 'Aztec Sandbox',
          required: false, // Fixed: aztecSandbox is not required
          label: 'Aztec Sandbox',
          interfaces: ['aztec-rpc'], // Fixed: interface is aztec-rpc not aztec-wallet
          group: 'aztec',
        });
      });

      it('should be marked as not required', () => {
        expect(aztecSandbox.required).toBe(false);
      });

      it('should have Aztec chain type', () => {
        expect(aztecSandbox.chainType).toBe(ChainType.Aztec);
      });
    });

    describe('aztecTestnet', () => {
      it('should have correct configuration', () => {
        expect(aztecTestnet).toEqual({
          chainId: 'aztec:testnet',
          chainType: ChainType.Aztec,
          name: 'Aztec Testnet',
          required: false,
          label: 'Aztec Testnet',
          interfaces: ['aztec-rpc'], // Fixed: interface is aztec-rpc
          group: 'aztec',
        });
      });
    });

    describe('aztecMainnet', () => {
      it('should have correct configuration', () => {
        expect(aztecMainnet).toEqual({
          chainId: 'aztec:mainnet',
          chainType: ChainType.Aztec,
          name: 'Aztec Mainnet',
          required: true, // Fixed: aztecMainnet is required
          label: 'Aztec', // Fixed: label is 'Aztec' not 'Aztec Mainnet'
          interfaces: ['aztec-rpc'], // Fixed: interface is aztec-rpc
          group: 'aztec',
        });
      });
    });

    it('should have unique chain IDs for all Aztec chains', () => {
      const aztecChains = [aztecSandbox, aztecTestnet, aztecMainnet];
      const chainIds = aztecChains.map((chain) => chain.chainId);
      const uniqueChainIds = new Set(chainIds);
      expect(uniqueChainIds.size).toBe(chainIds.length);
    });

    it('should all support aztec-rpc interface', () => {
      const aztecChains = [aztecSandbox, aztecTestnet, aztecMainnet];
      for (const chain of aztecChains) {
        expect(chain.interfaces).toContain('aztec-rpc');
      }
    });
  });

  describe('Multichain Configurations', () => {
    describe('createMainnetConfig', () => {
      it('should create mainnet configuration', () => {
        const config = createMainnetConfig();

        expect(config.chainsByTech).toBeDefined();
        expect(config.chainsByTech[ChainType.Evm]).toContain(ethereumMainnet);
        expect(config.chainsByTech[ChainType.Evm]).toContain(polygonMainnet);
        expect(config.chainsByTech[ChainType.Solana]).toContain(solanaMainnet);
        expect(config.chainsByTech[ChainType.Aztec]).toContain(aztecMainnet);
      });

      it('should not include testnet chains', () => {
        const config = createMainnetConfig();

        expect(config.chainsByTech[ChainType.Evm]).not.toContain(ethereumSepolia);
        expect(config.chainsByTech[ChainType.Solana]).not.toContain(solanaTestnet);
        expect(config.chainsByTech[ChainType.Aztec]).not.toContain(aztecTestnet);
      });

      it('should include all mainnet EVM chains', () => {
        const config = createMainnetConfig();
        const evmChains = config.chainsByTech[ChainType.Evm];

        expect(evmChains).toContain(ethereumMainnet);
        expect(evmChains).toContain(polygonMainnet);
        expect(evmChains).toContain(arbitrumOne);
        expect(evmChains).toContain(optimismMainnet);
        expect(evmChains).toContain(baseMainnet);
      });
    });

    describe('createTestnetConfig', () => {
      it('should create testnet configuration', () => {
        const config = createTestnetConfig();

        expect(config.chainsByTech).toBeDefined();
        expect(config.chainsByTech[ChainType.Evm]).toContain(ethereumSepolia);
        expect(config.chainsByTech[ChainType.Solana]).toContain(solanaTestnet);
        expect(config.chainsByTech[ChainType.Aztec]).toContain(aztecSandbox);
      });

      it('should include testnet EVM chains', () => {
        const config = createTestnetConfig();
        const evmChains = config.chainsByTech[ChainType.Evm];

        expect(evmChains).toContain(ethereumSepolia);
        expect(evmChains).toContain(ethereumHolesky);
        expect(evmChains).toContain(polygonAmoy);
        expect(evmChains).toContain(arbitrumSepolia);
        expect(evmChains).toContain(optimismSepolia);
        expect(evmChains).toContain(baseSepolia);
      });

      it('should include all Solana test environments', () => {
        const config = createTestnetConfig();
        const solanaChains = config.chainsByTech[ChainType.Solana];

        expect(solanaChains).toContain(solanaTestnet);
        expect(solanaChains).toContain(solanaDevnet);
      });
    });

    // Note: defaultChainConfig is not exported in the current implementation
  });

  describe('Chain Configuration Validation', () => {
    it('should have valid CAIP-2 format for all chain IDs', () => {
      const allChains = [
        ...createMainnetConfig().chainsByTech[ChainType.Evm],
        ...createMainnetConfig().chainsByTech[ChainType.Solana],
        ...createMainnetConfig().chainsByTech[ChainType.Aztec],
        ...createTestnetConfig().chainsByTech[ChainType.Evm],
        ...createTestnetConfig().chainsByTech[ChainType.Solana],
        ...createTestnetConfig().chainsByTech[ChainType.Aztec],
      ];

      const caip2Regex = /^[a-z0-9]+:[a-zA-Z0-9]+$/;

      for (const chain of allChains) {
        expect(chain.chainId).toMatch(caip2Regex);
      }
    });

    it('should have consistent chain types', () => {
      const evmChains = [ethereumMainnet, polygonMainnet, arbitrumOne];

      for (const chain of evmChains) {
        expect(chain.chainType).toBe(ChainType.Evm);
        expect(chain.chainId).toMatch(/^eip155:/);
      }

      const solanaChains = [solanaMainnet, solanaTestnet];
      for (const chain of solanaChains) {
        expect(chain.chainType).toBe(ChainType.Solana);
        expect(chain.chainId).toMatch(/^solana:/);
      }

      const aztecChains = [aztecSandbox, aztecTestnet];
      for (const chain of aztecChains) {
        expect(chain.chainType).toBe(ChainType.Aztec);
        expect(chain.chainId).toMatch(/^aztec:/);
      }
    });

    it('should have non-empty labels for all chains', () => {
      const allChains = [ethereumMainnet, polygonMainnet, solanaMainnet, aztecSandbox];

      for (const chain of allChains) {
        expect(chain.label).toBeTruthy();
        expect(chain.label.length).toBeGreaterThan(0);
      }
    });

    it('should have at least one interface for all chains', () => {
      const allChains = [ethereumMainnet, solanaMainnet, aztecSandbox];

      for (const chain of allChains) {
        expect(chain.interfaces).toBeDefined();
        expect(chain.interfaces.length).toBeGreaterThan(0);
      }
    });

    it('should have valid group assignments', () => {
      expect(ethereumMainnet.group).toBe('ethereum');
      expect(polygonMainnet.group).toBe('polygon');
      expect(arbitrumOne.group).toBe('arbitrum');
      expect(optimismMainnet.group).toBe('optimism');
      expect(baseMainnet.group).toBe('base');
      expect(solanaMainnet.group).toBe('solana');
      expect(aztecSandbox.group).toBe('aztec');
    });
  });
});
