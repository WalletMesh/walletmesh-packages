/**
 * Mock factories for chain-specific services
 */

import { vi } from 'vitest';
import { ChainType } from '../../types.js';

/**
 * Create a mock ChainServiceRegistry for testing
 */
export function createMockChainServiceRegistry() {
  const chainServices = new Map<ChainType, unknown>();

  return {
    register: vi.fn((chainType: ChainType, service: unknown) => {
      chainServices.set(chainType, service);
    }),
    getService: vi.fn((chainType: ChainType) => chainServices.get(chainType)),
    hasService: vi.fn((chainType: ChainType) => chainServices.has(chainType)),
    getAllServices: vi.fn(() => Array.from(chainServices.values())),
    dispose: vi.fn(() => chainServices.clear()),
  };
}

/**
 * Create a mock BaseChainService for testing
 */
export function createMockBaseChainService(chainType: ChainType = ChainType.Evm) {
  return {
    chainType,
    getChainInfo: vi.fn().mockReturnValue({
      chainId: chainType === ChainType.Solana ? 'mainnet-beta' : '0x1',
      name: chainType === ChainType.Solana ? 'Solana Mainnet' : 'Ethereum Mainnet',
      nativeCurrency: {
        name: chainType === ChainType.Solana ? 'SOL' : 'ETH',
        symbol: chainType === ChainType.Solana ? 'SOL' : 'ETH',
        decimals: chainType === ChainType.Solana ? 9 : 18,
      },
    }),
    validateChain: vi.fn().mockResolvedValue({ isValid: true }),
    switchChain: vi.fn().mockResolvedValue({ success: true }),
    getBlockExplorerUrl: vi.fn((txHash: string) =>
      chainType === ChainType.Solana
        ? `https://explorer.solana.com/tx/${txHash}`
        : `https://etherscan.io/tx/${txHash}`,
    ),
    formatAddress: vi.fn((address: string) => {
      if (address.length > 10) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      }
      return address;
    }),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock EVMChainService for testing
 */
export function createMockEVMChainService() {
  const baseService = createMockBaseChainService(ChainType.Evm);

  return {
    ...baseService,
    addChain: vi.fn().mockResolvedValue({ success: true }),
    switchEthereumChain: vi.fn().mockResolvedValue({ success: true }),
    getGasPrice: vi.fn().mockResolvedValue('0x4a817c800'), // 20 gwei
    estimateGas: vi.fn().mockResolvedValue('0x5208'), // 21000
    getBalance: vi.fn().mockResolvedValue('0xde0b6b3a7640000'), // 1 ETH
    getNonce: vi.fn().mockResolvedValue(0),
    getChainMetadata: vi.fn().mockReturnValue({
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://mainnet.infura.io/v3/'],
      blockExplorerUrls: ['https://etherscan.io'],
    }),
  };
}

/**
 * Create a mock SolanaChainService for testing
 */
export function createMockSolanaChainService() {
  const baseService = createMockBaseChainService(ChainType.Solana);

  return {
    ...baseService,
    getCluster: vi.fn().mockReturnValue('mainnet-beta'),
    getRecentBlockhash: vi.fn().mockResolvedValue({
      blockhash: 'GfWcPWDgYWJkvTpvAaZZ7h1ueVvdXE7jNnVvFuDqQwFZ',
      feeCalculator: { lamportsPerSignature: 5000 },
    }),
    getMinimumBalanceForRentExemption: vi.fn().mockResolvedValue(890880),
    requestAirdrop: vi.fn().mockResolvedValue('mockAirdropSignature'),
    getSlot: vi.fn().mockResolvedValue(123456789),
    getEpochInfo: vi.fn().mockResolvedValue({
      epoch: 350,
      slotIndex: 12345,
      slotsInEpoch: 432000,
      absoluteSlot: 151632345,
      blockHeight: 145897234,
    }),
  };
}

/**
 * Create a mock AztecChainService for testing
 */
export function createMockAztecChainService() {
  const baseService = createMockBaseChainService(ChainType.Aztec);

  return {
    ...baseService,
    getNodeInfo: vi.fn().mockResolvedValue({
      version: '0.1.0',
      chainId: 1337,
      protocolVersion: 1,
    }),
    getSyncStatus: vi.fn().mockResolvedValue({
      synced: true,
      syncedToBlock: 12345,
      latestBlock: 12345,
    }),
    simulateTransaction: vi.fn().mockResolvedValue({
      gasUsed: 100000,
      success: true,
    }),
    deployContract: vi.fn().mockResolvedValue({
      address: '0xazteccontractaddress',
      deploymentTx: '0xdeploymenttxhash',
    }),
    getNullifierMembershipWitness: vi.fn().mockResolvedValue({}),
  };
}

/**
 * Create a mock WalletRegistry for testing
 */
export function createMockWalletRegistry() {
  const wallets = new Map<string, unknown>();

  return {
    register: vi.fn((walletId: string, wallet: unknown) => {
      wallets.set(walletId, wallet);
    }),
    get: vi.fn((walletId: string) => wallets.get(walletId)),
    has: vi.fn((walletId: string) => wallets.has(walletId)),
    getAll: vi.fn(() => Array.from(wallets.values())),
    getByChainType: vi.fn((chainType: ChainType) => {
      return Array.from(wallets.values()).filter((wallet) => {
        const w = wallet as { chains?: ChainType[] };
        return w.chains?.includes(chainType);
      });
    }),
    clear: vi.fn(() => wallets.clear()),
    dispose: vi.fn(),
  };
}

/**
 * Create a mock ProviderRegistry for testing
 */
export function createMockProviderRegistry() {
  const providers = new Map<string, unknown>();

  return {
    register: vi.fn((id: string, provider: unknown) => {
      providers.set(id, provider);
    }),
    getProvider: vi.fn((id: string) => providers.get(id)),
    hasProvider: vi.fn((id: string) => providers.has(id)),
    getAllProviders: vi.fn(() => Array.from(providers.values())),
    removeProvider: vi.fn((id: string) => providers.delete(id)),
    clear: vi.fn(() => providers.clear()),
    dispose: vi.fn(),
  };
}
