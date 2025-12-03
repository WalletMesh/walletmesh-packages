/**
 * Aztec simulation hook
 *
 * Provides a convenient way to simulate contract interactions with loading and
 * error state management. Supports both utility (view/pure) functions and
 * state-changing transactions, automatically handling both types.
 */

import { ErrorFactory } from '@walletmesh/modal-core';
import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { simulateInteraction } from '@walletmesh/modal-core/providers/aztec';
import { useCallback, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

/**
 * Unified simulation result returned by wmSimulateTx.
 * Provides easy access to decoded values and metadata about the simulation type.
 *
 * @template TDecoded - The type of the decoded result value
 */
export interface UnifiedSimulationResult<TDecoded = unknown> {
  /** Indicates whether this was a 'transaction' or 'utility' function simulation */
  simulationType: 'transaction' | 'utility';
  /** The decoded return value from the simulation */
  decodedResult?: TDecoded;
  /** Performance and execution statistics */
  stats?: unknown;
  /** The original simulation result (TxSimulationResult or UtilitySimulationResult) */
  originalResult: unknown;
}

/**
 * Options for configuring the Aztec simulation hook
 *
 * @template TDecoded - The type of the decoded result value
 */
export interface UseAztecSimulationOptions<TDecoded = unknown> {
  /** Called when simulation succeeds */
  onSuccess?: (result: UnifiedSimulationResult<TDecoded>) => void;
  /** Called when simulation fails */
  onError?: (error: Error) => void;
}

/**
 * Return value from the useAztecSimulation hook
 *
 * @template TDecoded - The type of the decoded result value
 */
export interface UseAztecSimulationReturn<TDecoded = unknown> {
  /** Simulate a contract function interaction */
  simulate: (interaction: ContractFunctionInteraction) => Promise<UnifiedSimulationResult<TDecoded>>;
  /** Whether a simulation is currently in progress */
  isSimulating: boolean;
  /** Any error that occurred during simulation */
  error: Error | null;
  /** The result from the last simulation */
  result: UnifiedSimulationResult<TDecoded> | null;
  /** Reset all simulation state */
  reset: () => void;
}

/**
 * Hook for simulating Aztec contract interactions
 *
 * @template TDecoded - The type of the decoded result value
 * @param options - Configuration options
 * @returns Simulation functions and state
 *
 * @example
 * ```typescript
 * // With typed result
 * interface MyResult { balance: bigint }
 * const { simulate, result } = useAztecSimulation<MyResult>();
 *
 * // Check simulation type
 * if (result?.simulationType === 'utility') {
 *   console.log('Balance:', result.decodedResult?.balance);
 * }
 * ```
 */
export function useAztecSimulation<TDecoded = unknown>(
  options: UseAztecSimulationOptions<TDecoded> = {},
): UseAztecSimulationReturn<TDecoded> {
  const { aztecWallet } = useAztecWallet();
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<UnifiedSimulationResult<TDecoded> | null>(null);

  const reset = useCallback(() => {
    setIsSimulating(false);
    setError(null);
    setResult(null);
  }, []);

  const simulate = useCallback(
    async (interaction: ContractFunctionInteraction): Promise<UnifiedSimulationResult<TDecoded>> => {
      if (!aztecWallet) {
        const err = ErrorFactory.connectionFailed('Aztec wallet is not ready');
        setError(err);
        options.onError?.(err);
        throw err;
      }

      setIsSimulating(true);
      setError(null);

      try {
        const simulationResult = await simulateInteraction(aztecWallet, interaction);
        const typedResult = simulationResult as UnifiedSimulationResult<TDecoded>;

        setResult(typedResult);
        options.onSuccess?.(typedResult);

        return typedResult;
      } catch (err) {
        const simError = err instanceof Error ? err : ErrorFactory.transportError('Simulation failed');
        setError(simError);
        options.onError?.(simError);
        throw simError;
      } finally {
        setIsSimulating(false);
      }
    },
    [aztecWallet, options],
  );

  return {
    simulate,
    isSimulating,
    error,
    result,
    reset,
  };
}

export default useAztecSimulation;
