/**
 * Server-side rendering support hook for WalletMesh React integration
 *
 * Provides a single hook for detecting SSR environment and hydration state.
 * Other SSR utilities are available as internal helpers.
 *
 * @module hooks/useSSR
 */

import { useEffect, useState } from 'react';
import { isBrowser, isServer } from '../utils/ssr-walletmesh.js';

/**
 * SSR detection result
 */
export interface UseSSRReturn {
  /** Whether code is running on server */
  isServer: boolean;
  /** Whether code is running in browser */
  isBrowser: boolean;
  /** Whether component has mounted on client */
  isMounted: boolean;
  /** Whether hydration is complete */
  isHydrated: boolean;
}

/**
 * Hook for detecting SSR environment and hydration state
 *
 * Provides comprehensive SSR detection including mount and hydration status.
 * This is the primary SSR hook exposed by the library.
 *
 * @returns SSR detection state
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isServer, isMounted, isHydrated } = useSSR();
 *
 *   if (isServer) {
 *     return <div>Server render</div>;
 *   }
 *
 *   if (!isHydrated) {
 *     return <div>Hydrating...</div>;
 *   }
 *
 *   return <div>Client render with window access</div>;
 * }
 * ```
 */
export function useSSR(): UseSSRReturn {
  const [isMounted, setIsMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Small delay to ensure hydration is complete
    const timeout = setTimeout(() => setIsHydrated(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  return {
    isServer: isServer(),
    isBrowser: isBrowser(),
    isMounted,
    isHydrated,
  };
}

// Re-export utilities from ssr-walletmesh for convenience
export { isServer, isBrowser, safeBrowserAPI } from '../utils/ssr-walletmesh.js';
