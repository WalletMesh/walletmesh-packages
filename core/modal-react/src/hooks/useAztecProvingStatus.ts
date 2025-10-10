import type { AztecProvingEntry } from '@walletmesh/modal-core';
import {
  getActiveAztecProvingEntries,
  getAztecProvingState,
  type WalletMeshState,
} from '@walletmesh/modal-core';
import { useMemo } from 'react';
import { useStore } from './internal/useStore.js';

interface ProvingSelection {
  state: ReturnType<typeof getAztecProvingState>;
  active: AztecProvingEntry[];
}

const selectProvingState = (state: WalletMeshState): ProvingSelection => ({
  state: getAztecProvingState(state),
  active: getActiveAztecProvingEntries(state),
});

/**
 * Return value for {@link useAztecProvingStatus}.
 */
export interface UseAztecProvingStatusResult {
  /** Whether any Aztec proofs are currently being generated. */
  isProving: boolean;
  /** Number of active proving lifecycles. */
  activeCount: number;
  /** All active proving entries. */
  activeEntries: AztecProvingEntry[];
  /** The entry matching the supplied identifier (or the first active entry when none is supplied). */
  currentEntry: AztecProvingEntry | null;
  /** Convenience helper matching identifiers or transaction hashes against tracked entries. */
  getEntry: (id: string) => AztecProvingEntry | null;
  /** Convenience flag for rendering overlays without additional logic. */
  shouldShowOverlay: boolean;
}

/**
 * React hook that surfaces the headless Aztec proving lifecycle state.
 *
 * @param identifier - Optional proving identifier or transaction hash to look up.
 * @returns Reactive proving lifecycle information.
 *
 * @public
 */
export function useAztecProvingStatus(identifier?: string): UseAztecProvingStatusResult {
  const { state, active } = useStore(selectProvingState);

  return useMemo(() => {
    const activeEntries = active;
    const isProving = activeEntries.length > 0;
    const activeMap = state.entries;

    const lookup = (id: string | undefined): AztecProvingEntry | null => {
      if (!id) {
        return null;
      }
      const byId = activeMap[id];
      if (byId) {
        return byId;
      }
      const matchingTxHash = activeEntries.find((entry) => entry.txHash && entry.txHash === id);
      return matchingTxHash ?? null;
    };

    const resolvedCurrent =
      lookup(identifier) ?? (isProving ? activeEntries[0] ?? null : null);

    return {
      isProving,
      activeCount: activeEntries.length,
      activeEntries,
      currentEntry: resolvedCurrent,
      getEntry: (id: string) => lookup(id),
      shouldShowOverlay: isProving,
    };
  }, [active, state.entries, identifier]);
}
