/**
 * useAccount and Related Hooks Tests - Fresh Version
 */

import { renderHook } from '@testing-library/react';
import { ConnectionStatus } from '@walletmesh/modal-core';
import type React from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { assertHookState, createMockUseAccountReturn } from '../test-utils/reactMocks.js';
import { createTestWrapper } from '../test-utils/testHelpers.js';
import { useAccount } from './useAccount.js';

describe('useAccount', () => {
  let wrapper: (props: { children: ReactNode }) => React.ReactElement;

  beforeEach(() => {
    vi.clearAllMocks();
    const testSetup = createTestWrapper();
    wrapper = testSetup.wrapper;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return disconnected state when no session exists', () => {
      const { result } = renderHook(() => useAccount(), { wrapper });

      // Use assertHookState for cleaner assertions
      assertHookState(
        result.current,
        createMockUseAccountReturn({
          isConnected: false,
          isConnecting: false,
          isDisconnected: true,
          status: ConnectionStatus.Disconnected,
          address: null,
          addresses: [],
          chain: null,
          chainType: null,
          wallet: null,
          walletId: null,
          provider: null,
          error: null,
          availableWallets: [],
        }),
      );
    });
  });
});
