/**
 * Common test constants to reduce duplication across test files
 */

import { ChainType } from '../types.js';

// ============================================
// Common Ethereum Addresses
// ============================================

/** Standard test Ethereum address */
export const TEST_ADDRESS = '0x1234567890123456789012345678901234567890';

/** Alternative test Ethereum address */
export const TEST_ADDRESS_2 = '0x0987654321098765432109876543210987654321';

/** Common token contract addresses */
export const TOKEN_ADDRESSES = {
  USDC: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
  WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
} as const;

/** Common DEX/protocol addresses */
export const PROTOCOL_ADDRESSES = {
  UNISWAP_V2_ROUTER: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
  UNISWAP_V3_ROUTER: '0xe592427a0aece92de3edee1f18e0157c05861564',
  COMPOUND_COMPTROLLER: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
} as const;

// ============================================
// Transaction Hashes
// ============================================

/** Standard test transaction hash */
export const TEST_TX_HASH = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

/** Alternative test transaction hash */
export const TEST_TX_HASH_2 = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

/** Test block hash */
export const TEST_BLOCK_HASH = '0xblockhash1234567890abcdef1234567890abcdef1234567890abcdef12345678';

// ============================================
// Solana Test Data
// ============================================

/** Test Solana address/public key */
export const SOLANA_TEST_ADDRESS = '11111111111111111111111111111111';

/** Test Solana transaction signature */
export const SOLANA_TEST_SIGNATURE = 'SolanaTransactionSignature123';

/** Test SPL token addresses */
export const SOLANA_TOKEN_ADDRESSES = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
} as const;

// ============================================
// Aztec Test Data
// ============================================

/** Test Aztec address */
export const AZTEC_TEST_ADDRESS = '0xaztec1234567890123456789012345678901234567890';

/** Test Aztec transaction hash */
export const AZTEC_TEST_TX_HASH = 'AztecTxHash123';

// ============================================
// Chain IDs
// ============================================

export const CHAIN_IDS = {
  // EVM chains
  ETHEREUM_MAINNET: '1',
  ETHEREUM_SEPOLIA: '11155111',
  POLYGON_MAINNET: '137',
  POLYGON_MUMBAI: '80001',
  BSC_MAINNET: '56',
  BSC_TESTNET: '97',
  ARBITRUM_ONE: '42161',
  ARBITRUM_SEPOLIA: '421614',
  OPTIMISM_MAINNET: '10',
  OPTIMISM_SEPOLIA: '11155420',

  // Solana chains
  SOLANA_MAINNET: 'solana-mainnet-beta',
  SOLANA_TESTNET: 'solana-testnet',
  SOLANA_DEVNET: 'solana-devnet',

  // Aztec chains
  AZTEC_MAINNET: 'aztec-mainnet',
  AZTEC_TESTNET: 'aztec-testnet',
  AZTEC_LOCAL: 'aztec:31337',
} as const;

// ============================================
// Common Transaction Data
// ============================================

/** Standard EVM transaction params */
export const EVM_TX_PARAMS = {
  simple: {
    to: TOKEN_ADDRESSES.USDC,
    value: '1000000000000000000', // 1 ETH
    from: TEST_ADDRESS,
  },
  withData: {
    to: TOKEN_ADDRESSES.USDC,
    value: '0',
    data: '0xa9059cbb', // transfer(address,uint256) signature
    from: TEST_ADDRESS,
  },
  withGas: {
    to: TOKEN_ADDRESSES.USDC,
    value: '1000',
    gas: '21000',
    from: TEST_ADDRESS,
  },
} as const;

/** Standard transaction receipt data */
export const EVM_TX_RECEIPT = {
  transactionHash: TEST_TX_HASH,
  blockHash: TEST_BLOCK_HASH,
  blockNumber: 12345,
  from: TEST_ADDRESS,
  to: TOKEN_ADDRESSES.USDC,
  status: '0x1', // Success
  gasUsed: '21000',
  effectiveGasPrice: '20000000000',
  logs: [],
  logsBloom: '0x00000000',
  transactionIndex: 5,
  cumulativeGasUsed: '1000000',
} as const;

// ============================================
// Test Wallet Data
// ============================================

/** Common test wallet configurations */
export const TEST_WALLETS = {
  metamask: {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,metamask-icon',
    chains: [ChainType.Evm],
  },
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    icon: 'data:image/svg+xml;base64,phantom-icon',
    chains: [ChainType.Solana],
  },
  aztecWallet: {
    id: 'aztec-wallet',
    name: 'Aztec Wallet',
    icon: 'data:image/svg+xml;base64,aztec-icon',
    chains: [ChainType.Aztec],
  },
} as const;

// ============================================
// Test Session Data
// ============================================

/** Standard test session data */
export const TEST_SESSION = {
  sessionId: 'test-session-123',
  walletId: 'metamask',
  status: 'connected' as const,
  primaryAddress: TEST_ADDRESS,
  addresses: [TEST_ADDRESS],
  chain: {
    chainId: CHAIN_IDS.ETHEREUM_MAINNET,
    chainType: ChainType.Evm,
  },
  permissions: {
    methods: ['eth_accounts', 'eth_sendTransaction'],
    chains: [CHAIN_IDS.ETHEREUM_MAINNET],
  },
  metadata: {
    name: 'Test Session',
  },
  lifecycle: {
    createdAt: 1640995200000, // 2022-01-01
    lastActiveAt: 1640995200000,
    lastAccessedAt: 1640995200000,
    operationCount: 0,
    activeTime: 0,
  },
  accounts: [{ address: TEST_ADDRESS }],
  activeAccount: { address: TEST_ADDRESS },
} as const;

// ============================================
// Gas Values
// ============================================

export const GAS_VALUES = {
  MIN_GAS_LIMIT: '21000',
  STANDARD_GAS_LIMIT: '100000',
  HIGH_GAS_LIMIT: '300000',

  // Gas prices in wei
  LOW_GAS_PRICE: '10000000000', // 10 gwei
  STANDARD_GAS_PRICE: '20000000000', // 20 gwei
  HIGH_GAS_PRICE: '50000000000', // 50 gwei

  // EIP-1559 values
  BASE_FEE: '15000000000', // 15 gwei
  PRIORITY_FEE: '2000000000', // 2 gwei
} as const;

// ============================================
// Balance Values
// ============================================

export const BALANCE_VALUES = {
  // Wei values
  ZERO: '0',
  ONE_WEI: '1',
  ONE_GWEI: '1000000000',
  ONE_ETH: '1000000000000000000',
  TEN_ETH: '10000000000000000000',

  // Formatted values
  FORMATTED_ONE_ETH: '1.0',
  FORMATTED_TEN_ETH: '10.0',
  FORMATTED_SMALL: '0.000000000000000001',
} as const;

// ============================================
// Error Messages
// ============================================

export const ERROR_MESSAGES = {
  USER_REJECTED: 'User rejected the request',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  NETWORK_ERROR: 'Network error',
  TIMEOUT: 'Request timeout',
  INVALID_PARAMS: 'Invalid parameters',
  METHOD_NOT_FOUND: 'Method not found',
  CHAIN_NOT_SUPPORTED: 'Chain not supported',
} as const;

// ============================================
// Test Timeouts
// ============================================

export const TEST_TIMEOUTS = {
  FAST: 100,
  STANDARD: 1000,
  SLOW: 5000,
  VERY_SLOW: 10000,
} as const;

// ============================================
// Mock Provider Responses
// ============================================

/** Common provider method responses */
export const PROVIDER_RESPONSES = {
  ETH_ACCOUNTS: [TEST_ADDRESS],
  ETH_CHAIN_ID: '0x1',
  ETH_BLOCK_NUMBER: '0xf4240', // 1000000
  ETH_GET_BALANCE: BALANCE_VALUES.ONE_ETH,
  ETH_GAS_PRICE: GAS_VALUES.STANDARD_GAS_PRICE,
  ETH_ESTIMATE_GAS: GAS_VALUES.STANDARD_GAS_LIMIT,
  ETH_SEND_TRANSACTION: TEST_TX_HASH,
  ETH_GET_TRANSACTION_RECEIPT: EVM_TX_RECEIPT,

  // Solana methods
  getBalance: 2000000000, // 2 SOL in lamports
  getLatestBlockhash: {
    blockhash: 'EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N',
    lastValidBlockHeight: 1234567,
  },
  sendTransaction: SOLANA_TEST_SIGNATURE,
} as const;

// ============================================
// Factory Functions
// ============================================

/**
 * Generate a test address with optional index
 */
export function generateTestAddress(index = 0): string {
  const hex = index.toString(16).padStart(40, '0');
  return `0x${hex}`;
}

/**
 * Generate a test transaction hash with optional index
 */
export function generateTestTxHash(index = 0): string {
  const hex = index.toString(16).padStart(64, '0');
  return `0x${hex}`;
}

/**
 * Generate multiple test addresses
 */
export function generateTestAddresses(count: number): string[] {
  return Array.from({ length: count }, (_, i) => generateTestAddress(i + 1));
}

/**
 * Create a test transaction with overrides
 */
export function createTestTransaction(overrides: Partial<typeof EVM_TX_PARAMS.simple> = {}) {
  return {
    ...EVM_TX_PARAMS.simple,
    ...overrides,
  };
}

/**
 * Create a test session with overrides
 */
export function createTestSession(overrides: Record<string, unknown> = {}) {
  return {
    ...TEST_SESSION,
    ...overrides,
  };
}
