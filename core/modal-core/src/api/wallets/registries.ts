/**
 * Registry API exports
 *
 * @module api/registries
 * @packageDocumentation
 */

// Provider registry exports
export { ProviderRegistry } from '../../internal/registries/providers/ProviderRegistry.js';
export type { ProviderLoader, ProviderEntry } from '../../internal/registries/providers/ProviderRegistry.js';
export {
  registerBuiltinProviders,
  ensureBuiltinProviders,
} from '../../internal/registries/providers/registerBuiltinProviders.js';

// Wallet registry exports
export { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
