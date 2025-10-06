import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@walletmesh/modal-core/providers/aztec', async () => {
  const actual = await vi.importActual<typeof import('@walletmesh/modal-core/providers/aztec')>(
    '@walletmesh/modal-core/providers/aztec',
  );
  return {
    ...actual,
    simulateInteraction: vi.fn(),
  };
});

import { simulateInteraction } from '@walletmesh/modal-core/providers/aztec';
import { useAztecSimulation } from './useAztecSimulation.js';
import { useAztecWallet } from './useAztecWallet.js';

vi.mock('./useAztecWallet.js', () => ({
  useAztecWallet: vi.fn(),
}));

const mockUseAztecWallet = vi.mocked(useAztecWallet);
const mockSimulateInteraction = vi.mocked(simulateInteraction);

const mockWallet = {
  simulateTx: vi.fn(),
};

describe('useAztecSimulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAztecWallet.mockReturnValue({ aztecWallet: mockWallet } as any);
  });

  it('simulates interaction and stores result', async () => {
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;
    mockSimulateInteraction.mockResolvedValueOnce('result' as any);

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      const value = await result.current.simulate(interaction);
      expect(value).toBe('result');
    });

    expect(result.current.lastResult).toBe('result');
    expect(result.current.error).toBeNull();
  });

  it('propagates errors when wallet missing', async () => {
    mockUseAztecWallet.mockReturnValue({ aztecWallet: null } as any);
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      await expect(result.current.simulate(interaction)).rejects.toThrow('Aztec wallet is not ready');
    });

    expect(result.current.error).toBeTruthy();
  });
});
