/**
 * EVM Discovery Module
 *
 * Provides discovery services for EVM wallets using
 * EIP-6963 and EIP-1193 standards.
 *
 * @module client/discovery/evm
 */

export { EVMDiscoveryService } from './EvmDiscoveryService.js';
export type {
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  EIP1193Provider,
  DiscoveredEVMWallet,
  EVMDiscoveryConfig,
  EVMDiscoveryResults,
} from './types.js';
