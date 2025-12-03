/**
 * Internal implementation details
 * @internal
 */

// import * as AdapterImpl from './adapters/index.js'; // Adapters removed during refactoring
import * as CoreErrors from './core/errors/index.js';
// Import and re-export specific items to avoid naming collisions
import * as CoreEvents from './core/events/index.js';
import * as FactoryImpl from './factories/index.js';
import * as ModalImpl from './modal/index.js';
import * as ProviderImpl from './providers/index.js';
import * as RegistryImpl from './registries/index.js';
import * as TransportImpl from './transports/index.js';
import * as WalletImpl from './wallets/index.js';

// Re-export everything from those modules
export { CoreEvents, CoreErrors };
export { ModalImpl };
export { ProviderImpl };
export { TransportImpl };
// export { AdapterImpl }; // Adapters removed during refactoring
export { FactoryImpl };
export { WalletImpl };
export { RegistryImpl };

// Event system exports - simplified EventTarget-based approach

// Re-export from core/events but use namespaced imports to avoid naming collisions
export {
  ModalEventType,
  type OpeningEvent,
  type OpenedEvent,
  type ClosingEvent,
  type ClosedEvent,
  type ViewChangingEvent,
  type ViewChangedEvent,
  type ModalErrorEvent,
} from './core/events/modalEvents.js';

// Re-export from modal but avoid the naming collision
export {
  ModalController,
  type ModalControllerOptions,
} from './modal/index.js';

// Export from factories - Service Factory Pattern
export {
  createModalController,
  createConnector,
  createTransport,
} from './factories/index.js';
export * from './transports/index.js';

// Provider exports
export {
  BaseWalletProvider,
  EvmProvider,
  NativeEvmProvider,
  SolanaProvider,
  NativeSolanaProvider,
  // Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
  type WalletProviderContext,
} from './providers/index.js';

// Wallet exports
export {
  AbstractWalletAdapter,
  EvmAdapter,
  SolanaAdapter,
  DebugWallet,
  MockTransport,
} from './wallets/index.js';

// Registry exports
export {
  ProviderRegistry,
  WalletRegistry,
  registerBuiltinProviders,
  ensureBuiltinProviders,
  type ProviderLoader,
  type ProviderEntry,
} from './registries/index.js';
