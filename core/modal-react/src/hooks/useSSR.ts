/**
 * Server-side rendering support hook for WalletMesh React integration
 *
 * Provides a single hook for detecting SSR environment and hydration state.
 * Other SSR utilities are available as internal helpers.
 *
 * @module hooks/useSSR
 */

import { useEffect, useState } from 'react';
// Use TS path to ensure correct resolution in tests/build
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
    // Schedule via requestAnimationFrame when available
    // Fallback to microtask if rAF is not available
    let cancelled = false;
    const raf = (globalThis as any).requestAnimationFrame as undefined | ((cb: FrameRequestCallback) => number);
    let rafId: number | undefined;
    if (typeof raf === 'function') {
      rafId = raf(() => {
        if (!cancelled) setIsHydrated(true);
      });
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) setIsHydrated(true);
      });
    }
    return () => {
      cancelled = true;
      const caf = (globalThis as any).cancelAnimationFrame as undefined | ((id: number) => void);
      if (rafId !== undefined && typeof caf === 'function') caf(rafId);
    };
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
