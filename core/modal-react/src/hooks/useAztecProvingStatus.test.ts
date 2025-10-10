import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import {
  getStoreInstance,
  provingActions,
  type WalletMeshState,
} from '@walletmesh/modal-core';
import type { StoreApi } from 'zustand';
import { useAztecProvingStatus } from './useAztecProvingStatus.js';

const store = getStoreInstance() as unknown as StoreApi<WalletMeshState>;

describe('useAztecProvingStatus', () => {
  beforeEach(() => {
    act(() => {
      provingActions.clearAll(store);
    });
  });

  it('returns idle state when no proving entries exist', () => {
    const { result } = renderHook(() => useAztecProvingStatus());
    expect(result.current.isProving).toBe(false);
    expect(result.current.activeCount).toBe(0);
    expect(result.current.currentEntry).toBeNull();
  });

  it('reflects active proving entries', () => {
    act(() => {
      provingActions.handleNotification(store, {
        provingId: 'proof-1',
        status: 'started',
        timestamp: 1000,
      });
    });

    const { result } = renderHook(() => useAztecProvingStatus());
    expect(result.current.isProving).toBe(true);
    expect(result.current.activeCount).toBe(1);
    expect(result.current.currentEntry?.provingId).toBe('proof-1');
    expect(result.current.shouldShowOverlay).toBe(true);
  });

  it('selects entries by identifier or transaction hash', () => {
    act(() => {
      provingActions.handleNotification(store, {
        provingId: 'proof-2',
        status: 'started',
        timestamp: 2000,
      });
      provingActions.handleNotification(store, {
        provingId: 'proof-2',
        status: 'completed',
        txHash: '0xabc123',
        timestamp: 3000,
      });
      provingActions.handleNotification(store, {
        provingId: 'proof-3',
        status: 'started',
        txHash: '0xdef456',
        timestamp: 4000,
      });
    });

    const byIdHook = renderHook(() => useAztecProvingStatus('proof-3'));
    expect(byIdHook.result.current.currentEntry?.provingId).toBe('proof-3');

    const byHashHook = renderHook(() => useAztecProvingStatus('0xdef456'));
    expect(byHashHook.result.current.currentEntry?.provingId).toBe('proof-3');
  });
});
