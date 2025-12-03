// biome-ignore lint/suspicious/noExplicitAny: Test file with mock objects
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@walletmesh/modal-core/providers/aztec', async () => {
  const actual = (await vi.importActual(
    '@walletmesh/modal-core/providers/aztec',
  )) as typeof import('@walletmesh/modal-core/providers/aztec');
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
    // biome-ignore lint/suspicious/noExplicitAny: Test mock return value
    mockUseAztecWallet.mockReturnValue({ aztecWallet: mockWallet } as any);
  });

  it('simulates interaction and stores result', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: Test mock object
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const simulationResult = {
      simulationType: 'transaction' as const,
      decodedResult: [1, 2, 3],
      stats: { executionTime: 100 },
      originalResult: {},
    };

    mockSimulateInteraction.mockResolvedValueOnce(simulationResult as any);

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      const value = await result.current.simulate(interaction);
      expect(value).toEqual(simulationResult);
    });

    expect(result.current.result).toEqual(simulationResult);
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

  it('handles utility function simulations', async () => {
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const utilityResult = {
      simulationType: 'utility' as const,
      decodedResult: { value: 42 },
      stats: { executionTime: 100 },
      originalResult: { result: { value: 42 }, stats: { executionTime: 100 } },
    };

    mockSimulateInteraction.mockResolvedValueOnce(utilityResult as any);

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      await result.current.simulate(interaction);
    });

    expect(result.current.result).toEqual(utilityResult);
    expect(result.current.result?.simulationType).toBe('utility');
    expect(result.current.result?.decodedResult).toEqual({ value: 42 });
  });

  it('handles transaction simulations', async () => {
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const transactionResult = {
      simulationType: 'transaction' as const,
      decodedResult: [1, 2, 3],
      stats: { executionTime: 500 },
      originalResult: {},
    };

    mockSimulateInteraction.mockResolvedValueOnce(transactionResult as any);

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      await result.current.simulate(interaction);
    });

    expect(result.current.result).toEqual(transactionResult);
    expect(result.current.result?.simulationType).toBe('transaction');
    expect(result.current.result?.decodedResult).toEqual([1, 2, 3]);
  });

  it('resets all state', async () => {
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const simulationResult = {
      simulationType: 'utility' as const,
      decodedResult: { value: 42 },
      originalResult: {},
    };

    mockSimulateInteraction.mockResolvedValueOnce(simulationResult as any);

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      await result.current.simulate(interaction);
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isSimulating).toBe(false);
  });

  it('calls onSuccess callback with result', async () => {
    const onSuccess = vi.fn();
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const simulationResult = {
      simulationType: 'transaction' as const,
      decodedResult: [1, 2, 3],
      originalResult: {},
    };

    mockSimulateInteraction.mockResolvedValueOnce(simulationResult as any);

    const { result } = renderHook(() => useAztecSimulation({ onSuccess }));

    await act(async () => {
      await result.current.simulate(interaction);
    });

    expect(onSuccess).toHaveBeenCalledWith(simulationResult);
  });

  it('handles results without optional fields', async () => {
    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const minimalResult = {
      simulationType: 'utility' as const,
      originalResult: {},
      // No decodedResult or stats
    };

    mockSimulateInteraction.mockResolvedValueOnce(minimalResult as any);

    const { result } = renderHook(() => useAztecSimulation());

    await act(async () => {
      await result.current.simulate(interaction);
    });

    expect(result.current.result).toEqual(minimalResult);
    expect(result.current.result?.simulationType).toBe('utility');
    expect(result.current.result?.decodedResult).toBeUndefined();
  });

  it('supports generic type parameter for decoded result', async () => {
    interface MyResult {
      balance: bigint;
      count: number;
    }

    const interaction = {
      id: 'test',
      request: vi.fn().mockResolvedValue({ type: 'request' }),
    } as any;

    const typedResult = {
      simulationType: 'utility' as const,
      decodedResult: { balance: BigInt(1000), count: 42 },
      originalResult: {},
    };

    mockSimulateInteraction.mockResolvedValueOnce(typedResult as any);

    const { result } = renderHook(() => useAztecSimulation<MyResult>());

    await act(async () => {
      await result.current.simulate(interaction);
    });

    expect(result.current.result?.decodedResult?.balance).toBe(BigInt(1000));
    expect(result.current.result?.decodedResult?.count).toBe(42);
  });
});
