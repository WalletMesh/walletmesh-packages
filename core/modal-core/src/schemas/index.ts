/**
 * Runtime validation schemas using Zod
 *
 * This module exports comprehensive runtime validation schemas for all
 * public API inputs and internal state transitions in Modal Core.
 * All schemas provide type-safe validation with clear error messages.
 *
 * @example
 * ```typescript
 * import { walletInfoSchema, popupConfigSchema } from '@walletmesh/modal-core/schemas';
 *
 * // Validate wallet configuration
 * const wallet = walletInfoSchema.parse({
 *   id: 'metamask',
 *   name: 'MetaMask',
 *   icon: 'data:image/svg+xml,<svg>...</svg>',
 *   chains: ['evm']
 * });
 *
 * // Validate transport configuration
 * const config = popupConfigSchema.parse({
 *   url: 'https://wallet.example.com',
 *   width: 400,
 *   height: 600
 * });
 * ```
 *
 * @module schemas
 * @internal
 */

// Configuration schemas
export * from './configs.js';

// CAIP-2 schemas
export * from './caip2.js';

// Wallet schemas
export * from './wallet.js';

// Connection and state schemas
export * from './connection.js';

// Event schemas
export * from './events.js';

// Adapter schemas
export * from './adapters.js';

// Error schemas
export * from './errors.js';

// Client schemas (exclude ConnectOptions duplicate)
export {
  baseProviderSchema,
  walletClientConfigSchema,
  walletClientStateSchema,
  type BaseProvider,
  type WalletClientConfig,
  type WalletClientState,
  type ClientEvent,
  type WalletMeshLoggerConfig,
  type ProviderLoaderConfig,
  type DiscoveryConfig,
  type WalletFilterFunction,
  type WalletFilterConfig,
  type ExtendedWalletConfig,
  type WalletMeshClientConfig,
  // Note: ConnectOptions is exported from ./connectOptions.js to avoid conflict
} from './client.js';

// View system schemas
export * from './views.js';

// Logger schemas
export * from './logger.js';

// Chain schemas (canonical source for ChainSwitchParams)
export {
  nativeCurrencySchema,
  rpcEndpointSchema,
  blockExplorerSchema,
  evmChainConfigSchema,
  solanaChainConfigSchema,
  aztecChainConfigSchema,
  chainSwitchParamsSchema,
  type WellKnownChainId,
  type ModalChainConfig,
  type SupportedChain,
  type SupportedChainsConfig,
  type NativeCurrency,
  type RPCEndpoint,
  type BlockExplorer,
  type EVMChainConfig,
  type SolanaChainConfig,
  type AztecChainConfig,
  type FullChainConfig,
  type ChainMetadata,
  type ChainSwitchParams,
  type ChainValidationResult,
  type KnownChainId,
} from './chains.js';

// Modal factory schemas
export * from './modalFactory.js';

// Service schemas (exclude duplicates)
export {
  connectArgsSchema,
  connectionValidationSchema,
  connectionServiceConfigSchema,
  walletPreferenceSchema,
  walletPreferencesSchema,
  walletPreferenceServiceConfigSchema,
  type ConnectArgs,
  type ConnectionValidation,
  type ConnectionServiceConfig,
  type WalletPreference,
  type WalletPreferences,
  type WalletPreferenceServiceConfig,
  // Note: ConnectOptions, DisconnectOptions, and ConnectionProgress use canonical sources to resolve conflicts
} from './services.js';

// Transaction schemas
export * from './transactions.js';

// Balance schemas
export * from './balance.js';

// Connect options schemas (canonical source for ConnectOptions/DisconnectOptions/ConnectionProgress)
export {
  walletSelectionSchema,
  timeoutConfigSchema,
  retryConfigSchema,
  connectionProgressSchema,
  baseConnectOptionsSchema,
  advancedConnectOptionsSchema,
  reconnectOptionsSchema,
  disconnectOptionsSchema,
  multiWalletConnectSchema,
  connectionStateQuerySchema,
  type WalletSelection,
  type TimeoutConfig,
  type RetryConfig,
  type ConnectionProgress,
  type BaseConnectOptions,
  type AdvancedConnectOptions,
  type ReconnectOptions,
  type DisconnectOptions,
  type MultiWalletConnect,
  type ConnectionStateQuery,
} from './connectOptions.js';

// Modal UI schemas (canonical source for ModalView/ModalState)
export {
  modalThemeSchema,
  modalSizeSchema,
  modalPositionSchema,
  modalAnimationSchema,
  modalBackdropSchema,
  walletDisplayConfigSchema,
  qrCodeConfigSchema,
  modalSectionsSchema,
  modalViewSchema,
  modalStateSchema,
  type ModalTheme,
  type ModalSize,
  type ModalPosition,
  type ModalAnimation,
  type ModalBackdrop,
  type WalletDisplayConfig,
  type QRCodeConfig,
  type ModalSections,
  type ModalView,
  type ModalState,
} from './modal.js';

// Security schemas
export * from './security.js';

// Testing utilities (only export types, not functions)
export type {} from // Export any types from testUtils if needed
'./testUtils.js';
