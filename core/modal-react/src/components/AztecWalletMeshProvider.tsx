/**
 * Aztec-specific WalletMesh Provider
 *
 * A specialized provider component that wraps WalletMeshProvider with
 * Aztec-specific defaults and configuration. Simplifies integration for
 * Aztec dApps by automatically setting up discovery, chain configuration,
 * and wallet filtering.
 *
 * @module components/AztecWalletMeshProvider
 * @packageDocumentation
 */

import type { WalletInfo, WalletMeshConfig } from '@walletmesh/modal-core';
import { WalletMeshProvider } from '../WalletMeshProvider.js';
import { createAztecConfig } from '../chains/aztec/config.js';
import type { AztecProvingOverlayConfig, WalletMeshProviderProps } from '../types.js';

/**
 * Configuration options specific to Aztec dApps
 */
export interface AztecProviderConfig {
  /** Application name displayed to users */
  appName: string;
  /** Optional application description */
  appDescription?: string;
  /** Application URL (defaults to current origin) */
  appUrl?: string;
  /** Application icon URL */
  appIcon?: string;
  /** Extended dApp metadata for identification and display */
  appMetadata?: {
    /** Explicit origin URL (auto-detected from window.location.origin if not provided) */
    origin?: string;
    /** dApp name (can override appName) */
    name?: string;
    /** dApp description (can override appDescription) */
    description?: string;
    /** dApp icon URL for wallet display */
    icon?: string;
    /** dApp homepage URL */
    url?: string;
    /** Additional metadata fields for future extensions */
    [key: string]: unknown;
  };
  /**
   * Aztec chains to support (defaults to aztecSandbox for development)
   *
   * Configure which Aztec networks your dApp can connect to. The user will be
   * prompted to switch chains if they're on an unsupported network.
   *
   * @default [{ chainId: 'aztec:31337', label: 'Aztec Sandbox' }]
   *
   * @example
   * ```ts
   * // Development setup (single sandbox)
   * chains: [
   *   { chainId: 'aztec:31337', label: 'Aztec Sandbox' }
   * ]
   *
   * // Production setup (mainnet required, testnet optional)
   * chains: [
   *   { chainId: 'aztec:1', required: true, label: 'Aztec Mainnet' },
   *   { chainId: 'aztec:17000', required: false, label: 'Aztec Testnet' }
   * ]
   *
   * // Multi-environment setup
   * chains: [
   *   { chainId: 'aztec:1', label: 'Aztec Mainnet' },
   *   { chainId: 'aztec:17000', label: 'Aztec Testnet' },
   *   { chainId: 'aztec:31337', label: 'Local Sandbox' }
   * ]
   * ```
   */
  chains?: Array<{
    /** Aztec chain identifier (e.g., 'aztec:1' for mainnet, 'aztec:31337' for sandbox) */
    chainId: string;
    /** Whether this chain is required for the dApp to function */
    required?: boolean;
    /** Human-readable name for this chain */
    label?: string;
  }>;
  /** Whether to enable debug mode (defaults to true in development) */
  debug?: boolean;
  /** Discovery timeout in milliseconds (defaults to 5000) */
  discoveryTimeout?: number;
  /** Custom wallets to include (e.g., test wallets) */
  wallets?: WalletInfo[];
  /** Custom wallet filter function */
  walletFilter?: (wallet: WalletInfo) => boolean;
  /**
   * Required permissions for the dApp
   *
   * List of Aztec methods your dApp needs to call. Common permissions include:
   * - 'aztec_getAddress' - Get user's address
   * - 'aztec_getCompleteAddress' - Get complete address with public keys
   * - 'aztec_sendTx' - Send transactions
   * - 'aztec_simulateTx' - Simulate transactions
   * - 'aztec_getChainId' - Get chain information
   * - 'aztec_deployContract' - Deploy contracts
   *
   * @example
   * ```ts
   * // Basic permissions for most dApps
   * permissions: [
   *   'aztec_getAddress',
   *   'aztec_sendTx',
   *   'aztec_simulateTx',
   *   'aztec_getChainId'
   * ]
   *
   * // Extended permissions for contract deployment
   * permissions: [
   *   'aztec_getAddress',
   *   'aztec_getCompleteAddress',
   *   'aztec_sendTx',
   *   'aztec_simulateTx',
   *   'aztec_deployContract',
   *   'aztec_registerContract',
   *   'aztec_getContracts'
   * ]
   * ```
   */
  permissions?: string[];

  /**
   * Configuration for the Aztec proving overlay.
   *
   * Controls the overlay that appears when generating zero-knowledge proofs.
   * Set to false to disable the overlay, or provide an object to customize it.
   *
   * @example
   * ```ts
   * // Customize overlay text
   * aztecProvingOverlay: {
   *   headline: 'Generating zero-knowledge proof…',
   *   description: 'This can take up to a couple of minutes. Please keep this tab open.'
   * }
   *
   * // Disable the overlay
   * aztecProvingOverlay: false
   * ```
   */
  aztecProvingOverlay?: boolean | AztecProvingOverlayConfig;

  /**
   * Optional overrides for wallet discovery behaviour.
   *
   * Use this to disable automatic discovery or tweak retry timing.
   * When omitted, sensible Aztec defaults are applied.
   */
  discovery?: WalletMeshConfig['discovery'];
}

/**
 * Props for AztecWalletMeshProvider
 */
export interface AztecWalletMeshProviderProps extends Omit<WalletMeshProviderProps, 'config'> {
  /** Aztec-specific configuration */
  config: AztecProviderConfig;
}

/**
 * Aztec-specialized WalletMesh provider component.
 *
 * Provides a simplified configuration interface for Aztec dApps by:
 * - Auto-configuring discovery for Aztec wallets
 * - Setting sensible defaults for timeouts and retries
 * - Filtering to show only Aztec-compatible wallets
 * - Providing Aztec-specific chain configurations
 *
 * @example
 * ```tsx
 * import { AztecWalletMeshProvider } from '@walletmesh/modal-react';
 *
 * function App() {
 *   return (
 *     <AztecWalletMeshProvider
 *       config={{
 *         appName: 'My Aztec DApp',
 *         appDescription: 'A zero-knowledge application'
 *       }}
 *     >
 *       <MyDApp />
 *     </AztecWalletMeshProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom chain configuration
 * <AztecWalletMeshProvider
 *   config={{
 *     appName: 'Production Aztec DApp',
 *     chains: [
 *       { chainId: 'aztec:mainnet', required: true, label: 'Aztec Mainnet' }
 *     ],
 *     debug: false
 *   }}
 * >
 *   <MyDApp />
 * </AztecWalletMeshProvider>
 * ```
 *
 * @public
 */
export function AztecWalletMeshProvider({ config, children, ...restProps }: AztecWalletMeshProviderProps) {
  // Create full WalletMesh configuration from Aztec-specific config
  const walletMeshConfig = createAztecConfig(config);

  return (
    <WalletMeshProvider config={walletMeshConfig as any} {...restProps}>
      {children}
    </WalletMeshProvider>
  );
}
