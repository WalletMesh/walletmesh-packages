/**
 * Configuration and modal control hook for WalletMesh
 *
 * Provides access to configuration, modal controls, and discovery state
 * following wagmi patterns for a familiar developer experience.
 *
 * @module hooks/useConfig
 */

import {
  ChainType,
  ErrorFactory,
  type WalletMeshClient,
} from '@walletmesh/modal-core';
import type {
  DiscoveryRequestOptions,
  SupportedChain,
  WalletInfo,
} from '@walletmesh/modal-core';
import { useCallback, useMemo } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { useStore, useStoreActions, useStoreInstance } from './internal/useStore.js';

const getInvocationCaller = (): string => {
  const err = new Error();
  if (!err.stack) {
    return 'unknown';
  }
  const stackLines = err.stack.split('\n').map((line) => line.trim());
  const callerFrame = stackLines[2];
  return callerFrame || 'unknown';
};

function normalizeChainTypeInput(type: ChainType | string): ChainType | null {
  if (type === ChainType.Evm || type === 'evm') {
    return ChainType.Evm;
  }
  if (type === ChainType.Solana || type === 'solana') {
    return ChainType.Solana;
  }
  if (type === ChainType.Aztec || type === 'aztec') {
    return ChainType.Aztec;
  }
  return null;
}

function createDiscoveryRequest(
  options?: RefreshWalletsOptions,
): DiscoveryRequestOptions | undefined {
  if (!options) {
    return undefined;
  }

  const supportedChainTypes = new Set<ChainType>();
  const technologies: NonNullable<DiscoveryRequestOptions['technologies']> = [];

  // Add target chain type if specified
  if (options.targetChainType) {
    supportedChainTypes.add(options.targetChainType);
  }

  // Process technology-specific discovery requests
  if (options.technologies) {
    for (const technology of options.technologies) {
      technologies.push(technology);
      // Normalize and add to supported chain types
      const normalized = normalizeChainTypeInput(technology.type);
      if (normalized) {
        supportedChainTypes.add(normalized);
      }
    }
  }

  // Build discovery request object
  const discoveryRequest: DiscoveryRequestOptions = {};

  if (supportedChainTypes.size > 0) {
    discoveryRequest.supportedChainTypes = Array.from(supportedChainTypes);
  }

  // Add capabilities if specified
  if (options.capabilities) {
    const capabilities: DiscoveryRequestOptions['capabilities'] = {};

    if (options.capabilities.chains?.length) {
      capabilities.chains = options.capabilities.chains;
    }
    if (options.capabilities.features?.length) {
      capabilities.features = options.capabilities.features;
    }
    if (options.capabilities.interfaces?.length) {
      capabilities.interfaces = options.capabilities.interfaces;
    }

    if (Object.keys(capabilities).length > 0) {
      discoveryRequest.capabilities = capabilities;
    }
  }

  if (technologies.length > 0) {
    discoveryRequest.technologies = technologies;
  }

  return Object.keys(discoveryRequest).length > 0 ? discoveryRequest : undefined;
}

/**
 * Hook return type for configuration and modal control
 *
 * @public
 */
export interface RefreshWalletsOptions {
  /** Optional chain type focus for the upcoming discovery */
  targetChainType?: ChainType;
  /** Additional capability requirements to merge with provider defaults */
  capabilities?: {
    chains?: string[];
    features?: string[];
    interfaces?: string[];
  };
  /** Technology specific templates for discovery requests */
  technologies?: Array<{
    type: ChainType | 'evm' | 'solana' | 'aztec';
    interfaces?: string[];
    features?: string[];
  }>;
}

export interface UseConfigReturn {
  // Client
  /** WalletMesh client instance */
  client: WalletMeshClient | null;

  // Modal control
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Open the wallet selection modal */
  open: (options?: { targetChainType?: ChainType }) => void;
  /** Close the wallet selection modal */
  close: () => void;

  // Configuration
  /** Application name */
  appName: string;
  /** Application description */
  appDescription: string | undefined;
  /** Application URL */
  appUrl: string | undefined;
  /** Application icon URL */
  appIcon: string | undefined;
  /** Supported chains */
  chains: SupportedChain[];

  // Discovery state
  /** Available wallets detected */
  wallets: WalletInfo[];
  /** Whether wallet discovery is in progress */
  isDiscovering: boolean;
  /** Refresh available wallets */
  refreshWallets: (options?: RefreshWalletsOptions) => Promise<void>;

  // Wallet filtering
  /** Current wallet filter function */
  walletFilter: ((wallet: WalletInfo) => boolean) | null;
  /** Filtered wallets based on current filter */
  filteredWallets: WalletInfo[];
  /** Set a filter function to limit which wallets are shown */
  setWalletFilter: (filter: (wallet: WalletInfo) => boolean) => void;
  /** Clear the current wallet filter */
  clearWalletFilter: () => void;

  // Debug
  /** Whether debug mode is enabled */
  debug: boolean;
}

/**
 * Hook for accessing WalletMesh configuration and modal controls
 *
 * Provides configuration access and modal control interface
 * following wagmi's useConfig pattern.
 *
 * @returns Configuration and control methods
 *
 * @since 1.0.0
 *
 * @see {@link useAccount} - For account and connection state
 * @see {@link useConnect} - For connection operations
 *
 * @remarks
 * This is the primary hook for accessing WalletMesh configuration
 * and controlling the modal. It combines:
 * - Client instance access
 * - Modal open/close controls
 * - App configuration
 * - Wallet discovery state
 * - Debug mode status
 *
 * The modal will automatically handle wallet selection and connection
 * when opened.
 *
 * @example
 * ```tsx
 * function ConnectButton() {
 *   const { open, isOpen, wallets } = useConfig();
 *
 *   return (
 *     <div>
 *       <button onClick={open} disabled={isOpen}>
 *         Connect Wallet
 *       </button>
 *       <p>Available wallets: {wallets.length}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Access configuration
 * function AppInfo() {
 *   const { appName, chains, debug } = useConfig();
 *
 *   return (
 *     <div>
 *       <h1>{appName}</h1>
 *       <p>Supported chains: {chains.join(', ')}</p>
 *       {debug && <p>Debug mode enabled</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Wallet discovery management
 * function WalletDiscovery() {
 *   const { wallets, isDiscovering, refreshWallets } = useConfig();
 *
 *   return (
 *     <div>
 *       <h3>Available Wallets ({wallets.length})</h3>
 *       {isDiscovering && <p>Discovering...</p>}
 *
 *       {wallets.map(wallet => (
 *         <div key={wallet.id}>
 *           <img src={wallet.icon} alt={wallet.name} />
 *           <span>{wallet.name}</span>
 *         </div>
 *       ))}
 *
 *       <button onClick={refreshWallets}>
 *         Refresh Wallets
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useConfig(): UseConfigReturn {
  const { client, config } = useWalletMeshContext();
  const actions = useStoreActions();
  const store = useStoreInstance();

  // Subscribe to modal state and wallet filter
  // Note: walletFilter is a function and may not serialize properly with persist middleware
  const { isOpen, wallets, isDiscovering } = useStore((state) => {
    const stateData = {
      isOpen: state.ui.modalOpen,
      wallets: Object.values(state.entities?.wallets || {}),
      isDiscovering: state.ui.loading?.discovery || false,
    };
    console.log('[useConfig] Modal state update:', {
      ...stateData,
      walletIds: stateData.wallets.map(w => w.id),
      availableWalletIds: state.meta?.availableWalletIds || [],
    });
    return stateData;
  });

  // Subscribe to walletFilter separately to handle function storage properly
  const walletFilter = useStore((state) => state.ui.walletFilter || null);

  // Modal control methods
  const open = useCallback(
    (options?: { targetChainType?: ChainType }) => {
      if (!client) {
        throw ErrorFactory.configurationError(
          'WalletMesh client not available. Make sure useConfig is called within WalletMeshProvider.',
        );
      }
      client.openModal(options);
    },
    [client],
  );

  const close = useCallback(() => {
    console.log('[useConfig] close() called');
    if (!client) {
      throw ErrorFactory.configurationError(
        'Client not available. Make sure you are using this hook within WalletMeshProvider.',
      );
    }
    console.log('[useConfig] calling client.closeModal()');
    client.closeModal();
  }, [client]);

  // Refresh wallets method
  const refreshWallets = useCallback(
    async (overrides?: RefreshWalletsOptions) => {
      const caller = getInvocationCaller();
      console.debug('[useConfig] refreshWallets invoked', { caller });
      actions.ui.startDiscovery(store);

      if (!client) {
        actions.ui.addDiscoveryError(store, 'WalletMesh client unavailable');
        actions.ui.stopDiscovery(store);
        throw ErrorFactory.configurationError(
          'WalletMesh client not available. Make sure WalletMeshProvider has finished initializing.',
        );
      }

      try {
        const discoveryRequest = createDiscoveryRequest(overrides);
        const discoveryResults = await client.discoverWallets(discoveryRequest);

        // Reset available wallet list before applying new results
        store.setState((state) => {
          state.meta.availableWalletIds = [];
        });

        for (const result of discoveryResults) {
          if (!result.available) {
            continue;
          }

          const adapter = result.adapter;
          const walletInfo: WalletInfo = {
            id: adapter.id,
            name: adapter.metadata.name,
            chains: adapter.capabilities.chains.map((chain: any) => chain.type),
            ...(adapter.metadata.icon ? { icon: adapter.metadata.icon } : {}),
            ...(adapter.metadata.description ? { description: adapter.metadata.description } : {}),
            ...(result.version ? { version: result.version } : {}),
            ...(adapter.capabilities.features.size > 0
              ? { features: Array.from(adapter.capabilities.features) }
              : {}),
          };

          actions.connections.addDiscoveredWallet(store, walletInfo);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown discovery failure';
        actions.ui.addDiscoveryError(store, message);
      } finally {
        actions.ui.stopDiscovery(store);
      }
    },
    [actions, client, config.discovery, store],
  );

  // Extract chains from config - now SupportedChain objects instead of ChainType enums
  const chains: SupportedChain[] = useMemo(() => {
    if (!client) return [];
    try {
      // Get the current config from the client context
      // This should contain the SupportedChain[] passed to WalletMeshProvider
      const config = (
        client as { config?: { chains?: Array<{ chainId: string; name: string; chainType: string }> } }
      ).config; // Access internal config
      if (config?.chains) {
        // Transform back from internal format to SupportedChain format
        return config.chains.map((chain: { chainId: string; name: string; chainType: string }) => ({
          chainId: chain.chainId,
          chainType: chain.chainType as ChainType,
          name: chain.name,
          required: true, // Default since we don't store this in internal format
        }));
      }
      return [];
    } catch {
      return [];
    }
  }, [client]);

  // Get filtered wallets using store helper
  // Dependencies: walletFilter and wallets trigger recalculation when they change
  const filteredWallets = useMemo(() => {
    // Apply filter if set, otherwise return all wallets
    if (walletFilter) {
      return wallets.filter(walletFilter);
    }
    return wallets;
  }, [walletFilter, wallets]);

  // Set wallet filter function using store action
  const setWalletFilter = useCallback(
    (filter: (wallet: WalletInfo) => boolean) => {
      actions.ui.setWalletFilter(store, filter);
    },
    [actions, store],
  );

  // Clear wallet filter using store action
  const clearWalletFilter = useCallback(() => {
    // Note: clearWalletFilter is not available in the new uiActions
    store.setState((state) => {
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.walletFilter;
    });
  }, [store]);

  return {
    // Client
    client,

    // Modal control
    isOpen,
    open,
    close,

    // Configuration
    appName: config.appName,
    appDescription: config.appDescription || undefined,
    appUrl: config.appUrl || undefined,
    appIcon: config.appIcon || undefined,
    chains,

    // Discovery state
    wallets,
    isDiscovering,
    refreshWallets,

    // Wallet filtering
    walletFilter,
    filteredWallets,
    setWalletFilter,
    clearWalletFilter,

    // Debug
    debug: config.debug || false,
  };
}
