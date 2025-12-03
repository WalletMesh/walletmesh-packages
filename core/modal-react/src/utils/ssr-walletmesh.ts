/**
 * SSR utilities leveraging modal-core SSR functionality
 *
 * This module integrates with @walletmesh/modal-core's comprehensive SSR system
 * to provide server-side rendering support for React applications.
 */

import { ChainType, isServer as coreIsServer, createWalletMesh, ssrState } from '@walletmesh/modal-core';
import * as React from 'react';

// Import the client type that createWalletMesh returns
type WalletMeshClient = ReturnType<typeof import('@walletmesh/modal-core').createWalletMesh>;

import type { WalletMeshConfig } from '../types.js';

/**
 * Re-export modal-core's isServer function for consistency
 */
export const isServer = coreIsServer;

/**
 * Check if code is running in browser environment
 */
export const isBrowser = () => !isServer();

/**
 * Create a WalletMesh instance that automatically handles SSR/browser environments
 *
 * This function leverages modal-core's built-in SSR detection and provides
 * the appropriate client implementation for the current environment.
 *
 * @param config - WalletMesh configuration
 * @param options - Additional creation options including SSR overrides
 * @returns WalletMesh client appropriate for the current environment
 *
 * @example
 * ```typescript
 * // Automatic SSR detection
 * const client = createSSRWalletMesh(config);
 *
 * // Force SSR mode
 * const ssrClient = createSSRWalletMesh(config, { ssr: true });
 *
 * // Force browser mode (testing)
 * const browserClient = createSSRWalletMesh(config, { ssr: false });
 * ```
 */
export function createSSRWalletMesh(
  config: WalletMeshConfig,
  options?: {
    /** Override SSR detection for testing */
    forceSSR?: boolean;
    ssr?: boolean;
  },
): WalletMeshClient {
  // Convert React config to core config format
  const clientConfig = {
    appName: config.appName,
    ...(config.appDescription && { appDescription: config.appDescription }),
    ...(config.appUrl && { appUrl: config.appUrl }),
    ...(config.appIcon && { appIcon: config.appIcon }),
    ...(config.projectId && { projectId: config.projectId }),
    ...(config.debug !== undefined && { debug: config.debug }),
    // Convert SupportedChain array to ChainConfig format that WalletMeshConfig expects
    ...(config.chains &&
      config.chains.length > 0 && {
        chains: config.chains.map((supportedChain) => {
          const chain = supportedChain as {
            chainId?: string;
            chainType?: string;
            name?: string;
            label?: string;
            required?: boolean;
            icon?: string;
            interfaces?: string[];
            group?: string;
          };
          // Infer chainType from chainId if not provided
          let chainType: ChainType = chain.chainType as ChainType;
          if (!chainType && chain.chainId) {
            if (chain.chainId.startsWith('eip155:')) chainType = ChainType.Evm;
            else if (chain.chainId.startsWith('solana:')) chainType = ChainType.Solana;
            else if (chain.chainId.startsWith('aztec:')) chainType = ChainType.Aztec;
            else chainType = ChainType.Evm; // default fallback
          }

          return {
            chainId: chain.chainId || '',
            chainType: chainType || ChainType.Evm,
            name: chain.name || chain.label || chain.chainId || 'Unknown Chain',
            required: chain.required || false,
            // Only include optional properties if they exist
            ...(chain.icon && { icon: chain.icon }),
            ...(chain.label && { label: chain.label }),
            ...(chain.interfaces && { interfaces: chain.interfaces }),
            ...(chain.group && { group: chain.group }),
          };
        }),
      }),
    // Convert wallet array to wallet config
    ...(config.wallets && {
      wallets: {
        include: config.wallets
          .map((w) => {
            if (typeof w === 'string') return w;
            // Check if it's an instance (has id property) or a class (has getWalletInfo)
            if (typeof w === 'object' && w !== null && 'id' in w) {
              return (w as { id: string }).id;
            }
            if (typeof w === 'function' && 'getWalletInfo' in w) {
              const walletInfo = (w as { getWalletInfo(): { id: string } }).getWalletInfo();
              return walletInfo.id;
            }
            return '';
          })
          .filter((id) => id !== ''),
      },
    }),
  };

  const createOptions = {
    // Use forceSSR override if provided, otherwise let core decide
    ...(options?.forceSSR !== undefined && { ssr: options.forceSSR }),
    ...(options?.ssr !== undefined && { ssr: options.ssr }),
  };

  return createWalletMesh(clientConfig, createOptions);
}

/**
 * Serialize WalletMesh state for SSR hydration
 *
 * Converts the WalletMesh state into a JSON-serializable format that can be
 * safely transmitted from server to client. This function removes non-serializable
 * elements like functions, providers, and circular references.
 *
 * Key features:
 * - Removes function references (actions, providers)
 * - Preserves wallet connection state
 * - Maintains session information
 * - Strips circular references
 * - Handles undefined values properly
 *
 * @param state - The WalletMesh state to serialize
 * @returns A JSON-serializable representation of the state
 *
 * @example
 * ```typescript
 * // On the server (Next.js getServerSideProps)
 * export async function getServerSideProps() {
 *   const client = createUniversalWalletMesh(config);
 *   const state = client.getState();
 *
 *   return {
 *     props: {
 *       walletMeshState: serializeState(state)
 *     }
 *   };
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Next.js App Router (RSC)
 * async function WalletData() {
 *   const client = createUniversalWalletMesh(config);
 *   const state = client.getState();
 *   const serialized = serializeState(state);
 *
 *   return <ClientComponent initialState={serialized} />;
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export const serializeState = ssrState.serialize;

/**
 * Deserialize WalletMesh state from SSR hydration
 *
 * Reconstructs the WalletMesh state from its serialized format. This function
 * is used on the client-side to restore state that was rendered on the server,
 * preventing hydration mismatches.
 *
 * Key features:
 * - Restores wallet connection information
 * - Reconstructs session state
 * - Maintains view and UI state
 * - Ensures type safety
 * - Handles missing or malformed data gracefully
 *
 * @param serialized - The serialized state from the server
 * @returns The reconstructed WalletMesh state
 *
 * @example
 * ```typescript
 * // On the client (React component)
 * function MyApp({ walletMeshState }) {
 *   const [state, setState] = useState(() =>
 *     deserializeState(walletMeshState)
 *   );
 *
 *   return (
 *     <WalletMeshProvider initialState={state}>
 *       <App />
 *     </WalletMeshProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Next.js client component with SSR
 * 'use client';
 *
 * export function ClientWallet({ initialState }: { initialState: string }) {
 *   const hydrated = useMemo(() => {
 *     return deserializeState(initialState);
 *   }, [initialState]);
 *
 *   return (
 *     <WalletMeshProvider initialState={hydrated}>
 *       <ConnectButton />
 *     </WalletMeshProvider>
 *   );
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export const deserializeState = ssrState.deserialize;

/**
 * Extract safe state for SSR
 *
 * Extracts only the serializable portions of the WalletMesh state.
 * This is useful when you need partial state hydration or want to
 * inspect what data will be available after serialization.
 *
 * @param state - The full WalletMesh state
 * @returns Only the serializable portions of the state
 *
 * @internal
 */
export const extractSafeState = ssrState.extractSafeState;

/**
 * Hook for detecting when component has mounted on client-side
 *
 * Useful for conditionally rendering browser-only content while maintaining
 * SSR compatibility.
 *
 * @returns true if component has mounted on client, false during SSR or before mount
 *
 * @example
 * ```typescript
 * function BrowserOnlyComponent() {
 *   const hasMounted = useHasMounted();
 *
 *   if (!hasMounted) {
 *     return <div>Loading...</div>; // SSR fallback
 *   }
 *
 *   return <div>Client-side content</div>;
 * }
 * ```
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}

/**
 * Hook that provides a value only on the client-side
 *
 * Returns undefined during SSR and the provided value after client hydration.
 *
 * @param clientValue - Value to return on client-side
 * @returns undefined during SSR, clientValue after hydration
 *
 * @example
 * ```typescript
 * function WindowDimensionsComponent() {
 *   const windowSize = useClientOnly(() => ({
 *     width: window.innerWidth,
 *     height: window.innerHeight
 *   }));
 *
 *   if (!windowSize) {
 *     return <div>Loading dimensions...</div>;
 *   }
 *
 *   return <div>{windowSize.width} x {windowSize.height}</div>;
 * }
 * ```
 */
export function useClientOnly<T>(clientValue: () => T): T | undefined {
  const hasMounted = useHasMounted();

  return React.useMemo(() => {
    return hasMounted ? clientValue() : undefined;
  }, [hasMounted, clientValue]);
}

/**
 * Safe wrapper for browser APIs that may not be available during SSR
 *
 * @param fn - Function that uses browser APIs
 * @param fallback - Fallback value for SSR
 * @returns Result of fn() on client, fallback on server
 *
 * @example
 * ```typescript
 * const currentUrl = safeBrowserAPI(
 *   () => window.location.href,
 *   'https://example.com'
 * );
 * ```
 */
export function safeBrowserAPI<T>(fn: () => T, fallback: T): T {
  if (isServer()) {
    return fallback;
  }

  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Re-export utilities that replace basic SSR utils
 */
