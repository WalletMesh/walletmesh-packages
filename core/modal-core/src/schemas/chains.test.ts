/**
 * @fileoverview Tests for chain configuration schemas
 */

import { describe, it, expect } from 'vitest';
import {
  nativeCurrencySchema,
  rpcEndpointSchema,
  blockExplorerSchema,
  evmChainConfigSchema,
  solanaChainConfigSchema,
  aztecChainConfigSchema,
  fullChainConfigSchema,
  chainMetadataSchema,
  chainSwitchParamsSchema,
  chainValidationResultSchema,
  wellKnownChainIds,
  knownChainIdSchema,
} from './chains.js';
import {
  caip2Schema as chainIdSchema,
  evmCAIP2Schema as evmChainIdSchema,
  solanaCAIP2Schema as solanaChainIdSchema,
  aztecCAIP2Schema as aztecChainIdSchema,
} from './caip2.js';

describe('Chain ID Validation Schemas', () => {
  describe('chainIdSchema', () => {
    it('should accept CAIP-2 chain IDs', () => {
      expect(() => chainIdSchema.parse('eip155:1')).not.toThrow();
      expect(() => chainIdSchema.parse('eip155:137')).not.toThrow();
      expect(() => chainIdSchema.parse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).not.toThrow();
      expect(() => chainIdSchema.parse('aztec:31337')).not.toThrow();
    });

    it('should reject invalid formats', () => {
      expect(() => chainIdSchema.parse('1')).toThrow();
      expect(() => chainIdSchema.parse('no-colon')).toThrow();
      expect(() => chainIdSchema.parse('toolongnamespace:ref')).toThrow();
      expect(() => chainIdSchema.parse('')).toThrow();
    });
  });

  describe('evmChainIdSchema', () => {
    it('should validate EVM CAIP-2 chain IDs', () => {
      const result = evmChainIdSchema.parse('eip155:1');
      expect(result).toBe('eip155:1');

      const result2 = evmChainIdSchema.parse('eip155:137');
      expect(result2).toBe('eip155:137'); // Polygon

      const result3 = evmChainIdSchema.parse('eip155:42161');
      expect(result3).toBe('eip155:42161'); // Arbitrum
    });

    it('should reject invalid EVM formats', () => {
      expect(() => evmChainIdSchema.parse('eip155:not-a-number')).toThrow();
      expect(() => evmChainIdSchema.parse('solana:mainnet')).toThrow();
      expect(() => evmChainIdSchema.parse('1')).toThrow();
      expect(() => evmChainIdSchema.parse('eip155:-1')).toThrow();
    });
  });

  describe('solanaChainIdSchema', () => {
    it('should validate Solana CAIP-2 chain IDs', () => {
      expect(() => solanaChainIdSchema.parse('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).not.toThrow(); // mainnet
      expect(() => solanaChainIdSchema.parse('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z')).not.toThrow(); // testnet
      expect(() => solanaChainIdSchema.parse('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1')).not.toThrow(); // devnet
    });

    it('should reject invalid Solana chain IDs', () => {
      expect(() => solanaChainIdSchema.parse('solana:invalid')).toThrow();
      expect(() => solanaChainIdSchema.parse('5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp')).toThrow();
      expect(() => solanaChainIdSchema.parse('eip155:1')).toThrow();
    });
  });

  describe('aztecChainIdSchema', () => {
    it('should validate Aztec CAIP-2 chain IDs', () => {
      expect(() => aztecChainIdSchema.parse('aztec:mainnet')).not.toThrow();
      expect(() => aztecChainIdSchema.parse('aztec:testnet')).not.toThrow();
      expect(() => aztecChainIdSchema.parse('aztec:31337')).not.toThrow(); // sandbox
    });

    it('should reject invalid Aztec chain IDs', () => {
      expect(() => aztecChainIdSchema.parse('aztec:invalid')).toThrow();
      expect(() => aztecChainIdSchema.parse('mainnet')).toThrow();
      expect(() => aztecChainIdSchema.parse('eip155:1')).toThrow();
    });
  });
});

describe('Chain Configuration Schemas', () => {
  describe('nativeCurrencySchema', () => {
    it('should validate native currency', () => {
      const eth = {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      };
      expect(() => nativeCurrencySchema.parse(eth)).not.toThrow();

      const sol = {
        name: 'Solana',
        symbol: 'SOL',
        decimals: 9,
      };
      expect(() => nativeCurrencySchema.parse(sol)).not.toThrow();
    });

    it('should reject invalid currency', () => {
      expect(() => nativeCurrencySchema.parse({ name: '', symbol: 'ETH', decimals: 18 })).toThrow(
        'Currency name is required',
      );

      expect(() =>
        nativeCurrencySchema.parse({ name: 'Ether', symbol: 'VERYLONGSYMBOL', decimals: 18 }),
      ).toThrow('Symbol must be 1-10 characters');

      expect(() => nativeCurrencySchema.parse({ name: 'Ether', symbol: 'ETH', decimals: -1 })).toThrow();
    });
  });

  describe('rpcEndpointSchema', () => {
    it('should validate RPC endpoint', () => {
      const endpoint = {
        url: 'https://eth-mainnet.g.alchemy.com/v2/key',
        timeout: 30000,
        priority: 1,
      };
      expect(() => rpcEndpointSchema.parse(endpoint)).not.toThrow();
    });

    it('should validate endpoint with API key', () => {
      const endpoint = {
        url: 'https://rpc.example.com',
        apiKeyHeader: 'X-API-Key',
        apiKey: 'secret-key',
      };
      expect(() => rpcEndpointSchema.parse(endpoint)).not.toThrow();
    });

    it('should reject endpoint with header but no key', () => {
      const endpoint = {
        url: 'https://rpc.example.com',
        apiKeyHeader: 'X-API-Key',
      };
      expect(() => rpcEndpointSchema.parse(endpoint)).toThrow(
        'API key is required when API key header is specified',
      );
    });

    it('should reject invalid URLs', () => {
      expect(() => rpcEndpointSchema.parse({ url: 'not-a-url' })).toThrow('Invalid RPC endpoint URL');
    });
  });

  describe('blockExplorerSchema', () => {
    it('should validate block explorer', () => {
      const explorer = {
        name: 'Etherscan',
        url: 'https://etherscan.io',
        apiUrl: 'https://api.etherscan.io',
        apiKey: 'api-key',
      };
      expect(() => blockExplorerSchema.parse(explorer)).not.toThrow();
    });

    it('should validate minimal explorer', () => {
      const explorer = {
        name: 'Etherscan',
        url: 'https://etherscan.io',
      };
      expect(() => blockExplorerSchema.parse(explorer)).not.toThrow();
    });
  });
});

describe('Chain-Specific Configuration Schemas', () => {
  describe('evmChainConfigSchema', () => {
    it('should validate complete EVM chain config', () => {
      const config = {
        chainId: 'eip155:1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [
          {
            url: 'https://eth-mainnet.g.alchemy.com/v2/key',
          },
        ],
        blockExplorers: [
          {
            name: 'Etherscan',
            url: 'https://etherscan.io',
          },
        ],
        icon: 'https://example.com/eth.png',
        testnet: false,
        ensAddress: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
        multicallAddress: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
      };
      expect(() => evmChainConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate minimal EVM chain config', () => {
      const config = {
        chainId: 'eip155:137', // Polygon CAIP-2
        chainType: 'evm',
        name: 'Polygon',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: [
          {
            url: 'https://polygon-rpc.com',
          },
        ],
      };
      const result = evmChainConfigSchema.parse(config);
      expect(result.chainId).toBe('eip155:137'); // CAIP-2 format
    });

    it('should reject invalid chain type', () => {
      const config = {
        chainId: 'eip155:1',
        chainType: 'solana', // Wrong type
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: [{ url: 'https://eth.com' }],
      };
      expect(() => evmChainConfigSchema.parse(config)).toThrow();
    });

    it('should reject empty RPC URLs', () => {
      const config = {
        chainId: 'eip155:1',
        chainType: 'evm',
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: [],
      };
      expect(() => evmChainConfigSchema.parse(config)).toThrow();
    });
  });

  describe('solanaChainConfigSchema', () => {
    it('should validate complete Solana chain config', () => {
      const config = {
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        chainType: 'solana',
        name: 'Solana Mainnet',
        nativeCurrency: {
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9,
        },
        rpcUrls: [
          {
            url: 'https://api.mainnet-beta.solana.com',
          },
        ],
        wsUrls: ['wss://api.mainnet-beta.solana.com'],
        blockExplorers: [
          {
            name: 'Solscan',
            url: 'https://solscan.io',
          },
        ],
        icon: 'https://example.com/sol.png',
        testnet: false,
        commitment: 'confirmed',
      };
      expect(() => solanaChainConfigSchema.parse(config)).not.toThrow();
    });

    it('should enforce SOL as native currency', () => {
      const config = {
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        chainType: 'solana',
        name: 'Solana',
        nativeCurrency: {
          name: 'Ether', // Wrong currency
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: [{ url: 'https://api.solana.com' }],
      };
      expect(() => solanaChainConfigSchema.parse(config)).toThrow(
        'Solana native currency must be SOL with 9 decimals',
      );
    });

    it('should validate WebSocket URLs', () => {
      const config = {
        chainId: 'solana:devnet',
        chainType: 'solana',
        name: 'Solana Devnet',
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
        rpcUrls: [{ url: 'https://api.devnet.solana.com' }],
        wsUrls: ['ws://localhost:8900'], // Not wss://
      };
      expect(() => solanaChainConfigSchema.parse(config)).toThrow();
    });

    it('should validate commitment levels', () => {
      const validCommitments = ['processed', 'confirmed', 'finalized'];
      for (const commitment of validCommitments) {
        const config = {
          chainId: 'solana:devnet',
          chainType: 'solana',
          name: 'Solana Devnet',
          nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
          rpcUrls: [{ url: 'https://api.devnet.solana.com' }],
          commitment,
        };
        expect(() => solanaChainConfigSchema.parse(config)).not.toThrow();
      }
    });
  });

  describe('aztecChainConfigSchema', () => {
    it('should validate complete Aztec chain config', () => {
      const config = {
        chainId: 'aztec:mainnet',
        chainType: 'aztec',
        name: 'Aztec Mainnet',
        nativeCurrency: {
          name: 'Aztec',
          symbol: 'AZT',
          decimals: 18,
        },
        rpcUrls: [
          {
            url: 'https://api.aztec.network',
          },
        ],
        blockExplorers: [
          {
            name: 'Aztec Explorer',
            url: 'https://explorer.aztec.network',
          },
        ],
        icon: 'https://example.com/aztec.png',
        testnet: false,
        rollupAddress: '0x1234567890123456789012345678901234567890',
        privacyLevel: 'private',
      };
      expect(() => aztecChainConfigSchema.parse(config)).not.toThrow();
    });

    it('should validate privacy levels', () => {
      const levels = ['private', 'public'];
      for (const privacyLevel of levels) {
        const config = {
          chainId: 'aztec:testnet',
          chainType: 'aztec',
          name: 'Aztec Testnet',
          nativeCurrency: { name: 'Aztec', symbol: 'AZT', decimals: 18 },
          rpcUrls: [{ url: 'https://testnet.aztec.network' }],
          privacyLevel,
        };
        expect(() => aztecChainConfigSchema.parse(config)).not.toThrow();
      }
    });

    it('should validate rollup address format', () => {
      const config = {
        chainId: 'aztec:sandbox',
        chainType: 'aztec',
        name: 'Aztec Sandbox',
        nativeCurrency: { name: 'Aztec', symbol: 'AZT', decimals: 18 },
        rpcUrls: [{ url: 'http://localhost:8080' }],
        rollupAddress: 'invalid-address',
      };
      expect(() => aztecChainConfigSchema.parse(config)).toThrow();
    });
  });

  describe('fullChainConfigSchema', () => {
    it('should discriminate between chain types', () => {
      const evmConfig = {
        chainId: 'eip155:1',
        chainType: 'evm',
        name: 'Ethereum',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: [{ url: 'https://eth.com' }],
      };
      const evmResult = fullChainConfigSchema.parse(evmConfig);
      expect(evmResult.chainType).toBe('evm');

      const solanaConfig = {
        chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
        chainType: 'solana',
        name: 'Solana',
        nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
        rpcUrls: [{ url: 'https://api.solana.com' }],
      };
      const solanaResult = fullChainConfigSchema.parse(solanaConfig);
      expect(solanaResult.chainType).toBe('solana');

      const aztecConfig = {
        chainId: 'aztec:mainnet',
        chainType: 'aztec',
        name: 'Aztec',
        nativeCurrency: { name: 'Aztec', symbol: 'AZT', decimals: 18 },
        rpcUrls: [{ url: 'https://aztec.com' }],
      };
      const aztecResult = fullChainConfigSchema.parse(aztecConfig);
      expect(aztecResult.chainType).toBe('aztec');
    });
  });
});

describe('Chain Validation Utilities', () => {
  describe('chainMetadataSchema', () => {
    it('should validate chain metadata', () => {
      const metadata = {
        chainId: 'eip155:1',
        chainType: 'evm',
        name: 'Ethereum Mainnet',
        shortName: 'eth',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
        },
        testnet: false,
      };
      expect(() => chainMetadataSchema.parse(metadata)).not.toThrow();
    });

    it('should provide default testnet value', () => {
      const metadata = {
        chainId: 'eip155:1',
        chainType: 'evm',
        name: 'Ethereum',
        nativeCurrency: {
          symbol: 'ETH',
          decimals: 18,
        },
      };
      const result = chainMetadataSchema.parse(metadata);
      expect(result.testnet).toBe(false);
    });
  });

  describe('chainSwitchParamsSchema', () => {
    it('should validate switch params', () => {
      const params = {
        chainId: 'eip155:137',
        force: true,
        showConfirmation: false,
      };
      expect(() => chainSwitchParamsSchema.parse(params)).not.toThrow();
    });

    it('should validate minimal params', () => {
      const params = {
        chainId: 'eip155:1',
      };
      expect(() => chainSwitchParamsSchema.parse(params)).not.toThrow();
    });
  });

  describe('chainValidationResultSchema', () => {
    it('should validate validation result', () => {
      const result = {
        valid: false,
        errors: ['Chain not supported', 'RPC endpoint unreachable'],
        warnings: ['This is a testnet'],
        suggestions: ['eip155:1', 'eip155:137', 'eip155:42161'],
      };
      expect(() => chainValidationResultSchema.parse(result)).not.toThrow();
    });

    it('should validate minimal result', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: [],
      };
      expect(() => chainValidationResultSchema.parse(result)).not.toThrow();
    });
  });
});

describe('Well-Known Chain IDs', () => {
  it('should have correct EVM chain IDs', () => {
    expect(wellKnownChainIds.ethereum).toBe('eip155:1');
    expect(wellKnownChainIds.polygon).toBe('eip155:137');
    expect(wellKnownChainIds.arbitrum).toBe('eip155:42161');
    expect(wellKnownChainIds.optimism).toBe('eip155:10');
  });

  it('should have correct Solana chain IDs', () => {
    expect(wellKnownChainIds.solanaMainnet).toBe('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
    expect(wellKnownChainIds.solanaDevnet).toBe('solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');
    expect(wellKnownChainIds.solanaTestnet).toBe('solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z');
  });

  it('should have correct Aztec chain IDs', () => {
    expect(wellKnownChainIds.aztecMainnet).toBe('aztec:mainnet');
    expect(wellKnownChainIds.aztecTestnet).toBe('aztec:testnet');
    expect(wellKnownChainIds.aztecSandbox).toBe('aztec:31337');
  });

  it('should validate known chain IDs', () => {
    for (const chainId of Object.values(wellKnownChainIds)) {
      expect(() => knownChainIdSchema.parse(chainId)).not.toThrow();
    }

    expect(() => knownChainIdSchema.parse('unknown-chain')).toThrow();
  });
});
