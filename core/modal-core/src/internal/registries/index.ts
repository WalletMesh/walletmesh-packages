/**
 * Registry implementations for providers and wallets
 *
 * @module internal/registries
 * @packageDocumentation
 */

// Provider registry exports
export { ProviderRegistry } from './providers/ProviderRegistry.js';
export type { ProviderLoader, ProviderEntry } from './providers/ProviderRegistry.js';
export { registerBuiltinProviders, ensureBuiltinProviders } from './providers/registerBuiltinProviders.js';

// Wallet registry exports
export { WalletRegistry } from './wallets/WalletRegistry.js';

// Service registry exports
export { ServiceRegistry } from './ServiceRegistry.js';
export type { ServicesConfig } from './ServiceRegistry.js';
