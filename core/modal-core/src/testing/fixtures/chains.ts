import { ChainType } from '../../types.js';

/**
 * Test chain configurations using CAIP-2 format
 */
export const testChains = {
  // EVM Chains - CAIP-2 format (eip155:chainId)
  ethereum: {
    chainId: 'eip155:1',
    name: 'Ethereum Mainnet',
    type: ChainType.Evm,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    testnet: false,
  },

  polygon: {
    chainId: 'eip155:137',
    name: 'Polygon',
    type: ChainType.Evm,
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    testnet: false,
  },

  optimism: {
    chainId: 'eip155:10',
    name: 'Optimism',
    type: ChainType.Evm,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    testnet: false,
  },

  arbitrum: {
    chainId: 'eip155:42161',
    name: 'Arbitrum One',
    type: ChainType.Evm,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    testnet: false,
  },

  // Solana Chains - CAIP-2 format (solana:genesisHash)
  solanaMainnet: {
    chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana Mainnet',
    type: ChainType.Solana,
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    testnet: false,
  },

  solanaDevnet: {
    chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    name: 'Solana Devnet',
    type: ChainType.Solana,
    nativeCurrency: {
      name: 'SOL',
      symbol: 'SOL',
      decimals: 9,
    },
    rpcUrls: ['https://api.devnet.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com/?cluster=devnet'],
    testnet: true,
  },

  // Aztec Chains - CAIP-2 format (aztec:reference)
  aztecSandbox: {
    chainId: 'aztec:31337',
    name: 'Aztec Sandbox',
    type: ChainType.Aztec,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
    testnet: true,
  },

  // Test chains - CAIP-2 format
  evmTestnet: {
    chainId: 'eip155:1337',
    name: 'Local EVM Testnet',
    type: ChainType.Evm,
    nativeCurrency: {
      name: 'Test Ether',
      symbol: 'tETH',
      decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
    testnet: true,
  },
};

/**
 * Get test chains by type
 */
export function getTestChainsByType(type: ChainType, includeTestnets = true) {
  return Object.values(testChains).filter(
    (chain) => chain.type === type && (includeTestnets || !chain.testnet),
  );
}

/**
 * Get chain by ID
 */
export function getTestChainById(chainId: string) {
  return Object.values(testChains).find((chain) => chain.chainId === chainId);
}

/**
 * Create a custom test chain
 */
export function createTestChain(overrides: {
  chainId: string;
  name: string;
  type: ChainType;
  nativeCurrency?: Partial<typeof testChains.ethereum.nativeCurrency>;
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  testnet?: boolean;
}) {
  return {
    chainId: overrides.chainId,
    name: overrides.name,
    type: overrides.type,
    nativeCurrency: {
      name: overrides.nativeCurrency?.name || 'Test Token',
      symbol: overrides.nativeCurrency?.symbol || 'TEST',
      decimals: overrides.nativeCurrency?.decimals || 18,
    },
    rpcUrls: overrides.rpcUrls || ['http://localhost:8545'],
    blockExplorerUrls: overrides.blockExplorerUrls || [],
    testnet: overrides.testnet ?? true,
  };
}

/**
 * Chain test scenarios
 */
export const chainScenarios = {
  /**
   * All mainnet chains
   */
  allMainnets: () => Object.values(testChains).filter((c) => !c.testnet),

  /**
   * All testnet chains
   */
  allTestnets: () => Object.values(testChains).filter((c) => c.testnet),

  /**
   * EVM chains only
   */
  evmOnly: () => getTestChainsByType(ChainType.Evm),

  /**
   * Solana chains only
   */
  solanaOnly: () => getTestChainsByType(ChainType.Solana),

  /**
   * Aztec chains only
   */
  aztecOnly: () => getTestChainsByType(ChainType.Aztec),

  /**
   * Popular chains
   */
  popularChains: () => [
    testChains.ethereum,
    testChains.polygon,
    testChains.arbitrum,
    testChains.solanaMainnet,
  ],

  /**
   * Local development chains
   */
  localChains: () => [testChains.evmTestnet, testChains.aztecSandbox],
};

/**
 * Test tokens for different chains using CAIP-2 format
 */
export const testTokens = {
  // ERC-20 tokens - CAIP-2 format
  usdc: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 'eip155:1',
  },

  dai: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    chainId: 'eip155:1',
  },

  weth: {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    chainId: 'eip155:1',
  },

  // SPL tokens - CAIP-2 format
  usdcSolana: {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  },
};

/**
 * Gas price scenarios
 */
export const gasPriceScenarios = {
  low: {
    maxFeePerGas: '15000000000', // 15 gwei
    maxPriorityFeePerGas: '1000000000', // 1 gwei
  },

  medium: {
    maxFeePerGas: '30000000000', // 30 gwei
    maxPriorityFeePerGas: '2000000000', // 2 gwei
  },

  high: {
    maxFeePerGas: '100000000000', // 100 gwei
    maxPriorityFeePerGas: '5000000000', // 5 gwei
  },
};
