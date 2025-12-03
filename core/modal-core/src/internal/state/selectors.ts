/**
 * Internal state selectors for modal components
 * @internal
 */

import type { WalletMeshState } from '../../state/store.js';

/**
 * Type for a state selector function
 */
type StateSelector<T> = (state: WalletMeshState) => T;

/**
 * Create type-safe selectors for the store
 * @internal
 */
export const createSelectors = () => ({
  ui: uiSelectors,
  connection: connectionSelectors,
});

/**
 * UI state selectors
 * @internal
 */
export const uiSelectors = {
  isOpen: ((state) => state?.ui?.modalOpen ?? false) as StateSelector<boolean>,
  currentView: ((state) => state?.ui?.currentView ?? 'walletSelection') as StateSelector<string>,
  isLoading: ((state) => state?.ui?.loading?.modal ?? false) as StateSelector<boolean>,
  error: ((state) => state?.ui?.errors?.['ui'] ?? undefined) as StateSelector<unknown>,
  ui: ((state) => ({
    isOpen: state?.ui?.modalOpen ?? false,
    currentView: state?.ui?.currentView ?? 'walletSelection',
    isLoading: state?.ui?.loading?.modal ?? false,
    error: state?.ui?.errors?.['ui'] ?? undefined,
  })) as StateSelector<{
    isOpen: boolean;
    currentView: string;
    isLoading: boolean;
    error?: unknown;
  }>,
};

/**
 * Connection state selectors
 * @internal
 */
export const connectionSelectors = {
  status: ((state) => {
    const activeSessionId = state?.active?.sessionId;
    if (!activeSessionId) return 'disconnected';
    const activeSession = state?.entities?.sessions?.[activeSessionId];
    if (!activeSession) return 'disconnected';
    return activeSession.status;
  }) as StateSelector<string>,
  walletId: ((state) => {
    const activeSessionId = state?.active?.sessionId;
    if (!activeSessionId) return null;
    const activeSession = state?.entities?.sessions?.[activeSessionId];
    return activeSession?.walletId ?? null;
  }) as StateSelector<string | null>,
  address: ((state) => {
    const activeSessionId = state?.active?.sessionId;
    if (!activeSessionId) return null;
    const activeSession = state?.entities?.sessions?.[activeSessionId];
    return activeSession?.activeAccount?.address ?? null;
  }) as StateSelector<string | null>,
  chainId: ((state) => {
    const activeSessionId = state?.active?.sessionId;
    if (!activeSessionId) return null;
    const activeSession = state?.entities?.sessions?.[activeSessionId];
    return activeSession?.chain?.chainId ?? null;
  }) as StateSelector<string | null>,
  connection: ((state) => {
    const activeSessionId = state?.active?.sessionId;
    const activeSession = activeSessionId ? state?.entities?.sessions?.[activeSessionId] : null;
    const isConnected = activeSession?.status === 'connected';
    return {
      status: activeSession?.status ?? 'disconnected',
      walletId: activeSession?.walletId ?? null,
      address: isConnected ? (activeSession?.activeAccount?.address ?? null) : null,
      chainId: isConnected ? (activeSession?.chain?.chainId ?? null) : null,
    };
  }) as StateSelector<{
    status: string;
    walletId: string | null;
    address: string | null;
    chainId: string | null;
  }>,
};

export default createSelectors;
