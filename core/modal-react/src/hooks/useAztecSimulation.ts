/**
 * Aztec simulation hook
 *
 * Provides a convenient way to simulate contract interactions with loading and
 * error state management.
 */

import { ErrorFactory } from '@walletmesh/modal-core';
import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec/lazy';
import { simulateInteraction } from '@walletmesh/modal-core/providers/aztec';
import { useCallback, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

export interface UseAztecSimulationOptions {
  onSuccess?: (result: unknown) => void;
  onError?: (error: Error) => void;
}

export interface UseAztecSimulationReturn {
  simulate: (interaction: ContractFunctionInteraction) => Promise<unknown>;
  isSimulating: boolean;
  error: Error | null;
  lastResult: unknown;
  reset: () => void;
}

export function useAztecSimulation(options: UseAztecSimulationOptions = {}): UseAztecSimulationReturn {
  const { aztecWallet } = useAztecWallet();
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<unknown>(null);

  const reset = useCallback(() => {
    setIsSimulating(false);
    setError(null);
    setLastResult(null);
  }, []);

  const simulate = useCallback(
    async (interaction: ContractFunctionInteraction) => {
      if (!aztecWallet) {
        const err = ErrorFactory.connectionFailed('Aztec wallet is not ready');
        setError(err);
        options.onError?.(err);
        throw err;
      }

      setIsSimulating(true);
      setError(null);

      try {
        const result = await simulateInteraction(aztecWallet, interaction);
        setLastResult(result);
        options.onSuccess?.(result);
        return result;
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
    lastResult,
    reset,
  };
}

export default useAztecSimulation;
