/**
 * Mock factories for wallet adapters
 */

import { vi } from 'vitest';
import { ChainType } from '../../types.js';
import { createMockEvmProvider, createMockSolanaProvider } from '../helpers/mocks.js';

/**
 * Create a mock AbstractWalletAdapter for testing
 */
export function createMockAbstractWalletAdapter(id = 'mock-adapter', chainType: ChainType = ChainType.Evm) {
  return {
    id,
    metadata: {
      name: `Mock ${chainType} Adapter`,
      icon: 'data:image/svg+xml,<svg></svg>',
      description: `Mock adapter for ${chainType} testing`,
    },
    capabilities: {
      chains: [{ type: chainType, chainIds: '*' as const }],
      features: new Set(['sign_message', 'sign_transaction']),
    },
    state: {
      isAvailable: true,
      isConnected: false,
      isConnecting: false,
      accounts: [],
      chainId: null,
    },
    supportedProviders: {},
    isAvailable: vi.fn().mockResolvedValue(true),
    connect: vi.fn().mockResolvedValue({
      accounts: ['0x1234567890123456789012345678901234567890'],
      chainId: chainType === ChainType.Solana ? 'mainnet-beta' : '0x1',
      provider: chainType === ChainType.Solana ? createMockSolanaProvider() : createMockEvmProvider(),
    }),
    disconnect: vi.fn().mockResolvedValue(undefined),
    switchChain: vi.fn().mockResolvedValue({ success: true }),
    getProvider: vi.fn().mockReturnValue(null),
    on: vi.fn(),
    off: vi.fn(),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock EvmAdapter for testing
 */
export function createMockEvmAdapter(id = 'mock-evm-adapter') {
  const baseAdapter = createMockAbstractWalletAdapter(id, ChainType.Evm);
  const provider = createMockEvmProvider();

  return {
    ...baseAdapter,
    provider,
    getProvider: vi.fn().mockReturnValue(provider),
    signMessage: vi.fn().mockResolvedValue('0xsignedmessage'),
    signTypedData: vi.fn().mockResolvedValue('0xsignedtypeddata'),
    sendTransaction: vi.fn().mockResolvedValue('0xtransactionhash'),
    addChain: vi.fn().mockResolvedValue({ success: true }),
    watchAsset: vi.fn().mockResolvedValue(true),
  };
}

/**
 * Create a mock SolanaAdapter for testing
 */
export function createMockSolanaAdapter(id = 'mock-solana-adapter') {
  const baseAdapter = createMockAbstractWalletAdapter(id, ChainType.Solana);
  const provider = createMockSolanaProvider();

  return {
    ...baseAdapter,
    provider,
    getProvider: vi.fn().mockReturnValue(provider),
    signMessage: vi.fn().mockResolvedValue({
      signature: Buffer.from('mock-signature'),
      publicKey: 'mock-pubkey',
    }),
    signTransaction: vi.fn().mockResolvedValue({
      signature: Buffer.from('mock-tx-signature'),
    }),
    signAllTransactions: vi
      .fn()
      .mockResolvedValue([
        { signature: Buffer.from('mock-tx-signature-1') },
        { signature: Buffer.from('mock-tx-signature-2') },
      ]),
    sendTransaction: vi.fn().mockResolvedValue('mock-tx-signature'),
  };
}

/**
 * Note: createMockAztecAdapter has been removed as AztecAdapter is deprecated.
 * For Aztec wallet testing, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet instead.
 */

/**
 * Create a mock DiscoveryAdapter for testing
 */
export function createMockDiscoveryAdapter() {
  return {
    id: 'discovery-adapter',
    metadata: {
      name: 'Discovery Wallet',
      icon: 'data:image/svg+xml,<svg></svg>',
      description: 'Mock discovery wallet adapter',
    },
    capabilities: {
      chains: [
        { type: ChainType.Evm, chainIds: '*' as const },
        { type: ChainType.Solana, chainIds: '*' as const },
      ],
      features: new Set(['discovery', 'multi_chain']),
    },
    discoverWallets: vi.fn().mockResolvedValue([
      {
        id: 'discovered-wallet-1',
        name: 'Discovered Wallet 1',
        chains: [ChainType.Evm],
      },
      {
        id: 'discovered-wallet-2',
        name: 'Discovered Wallet 2',
        chains: [ChainType.Solana],
      },
    ]),
    announcePresence: vi.fn().mockResolvedValue(undefined),
    listenForAnnouncements: vi.fn().mockReturnValue(() => {}),
    dispose: vi.fn(),
  };
}
