/**
 * Aztec simulation hook
 *
 * Provides a convenient way to simulate contract interactions with loading and
 * error state management. Supports both utility (view/pure) functions and
 * state-changing transactions, automatically handling both types.
 */

import { ErrorFactory } from '@walletmesh/modal-core';
import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { simulateInteraction, simulateUtility as simulateUtilityFn } from '@walletmesh/modal-core/providers/aztec';
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
  /**
   * Simulate a utility (view) function call directly.
   * This is optimized for read-only operations and returns a smaller payload than simulate(),
   * making it suitable for Chrome extension messaging which has size limits.
   *
   * @param contractAddress - The address of the contract
   * @param functionName - The name of the utility function to call
   * @param args - Arguments for the function call
   * @returns The result of the utility function
   */
  simulateUtility: <T = unknown>(
    contractAddress: unknown,
    functionName: string,
    args?: unknown[],
  ) => Promise<T>;
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

  const simulateUtility = useCallback(
    async <T = unknown>(contractAddress: unknown, functionName: string, args: unknown[] = []): Promise<T> => {
      if (!aztecWallet) {
        const err = ErrorFactory.connectionFailed('Aztec wallet is not ready');
        setError(err);
        options.onError?.(err);
        throw err;
      }

      setIsSimulating(true);
      setError(null);

      try {
        const result = await simulateUtilityFn(aztecWallet, contractAddress, functionName, args);
        // UtilitySimulationResult has a 'values' array - extract the first value for convenience
        const values = (result as { values?: unknown[] })?.values;
        return (values?.[0] ?? result) as T;
      } catch (err) {
        const simError = err instanceof Error ? err : ErrorFactory.transportError('Utility simulation failed');
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
    simulateUtility,
    isSimulating,
    error,
    result,
    reset,
  };
}

export default useAztecSimulation;
