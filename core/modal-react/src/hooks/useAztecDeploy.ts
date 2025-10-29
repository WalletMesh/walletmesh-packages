/**
 * Aztec contract deployment hook
 *
 * Provides a simplified interface for deploying Aztec contracts with
 * automatic state management and deployment tracking.
 *
 * @module hooks/useAztecDeploy
 * @packageDocumentation
 */

import type { AztecAddress } from '@aztec/aztec.js';
import { ErrorFactory } from '@walletmesh/modal-core';
import type { AztecContractArtifact, AztecDeploymentStage } from '@walletmesh/modal-core/providers/aztec';
import { ensureContractClassRegistered, normalizeArtifact } from '@walletmesh/modal-core/providers/aztec';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useStoreInstance } from './internal/useStore.js';
import { useAztecWallet } from './useAztecWallet.js';

/**
 * Helper type for deployment transaction tracking
 */
interface DeploymentTransaction {
  id: string;
  status: 'preparing' | 'computing' | 'proving' | 'sending' | 'confirming' | 'confirmed' | 'failed';
  contractAddress?: string;
  artifactName: string;
  timestamp: number;
}

/**
 * Generate a unique deployment transaction ID
 */
function generateDeploymentTxId(): string {
  return `deployment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Contract artifact type that handles different artifact formats
 * from various Aztec contract packages. Automatically adds missing properties
 * for compatibility.
 *
 * @public
 */
export type ContractArtifact = AztecContractArtifact;

/**
 * Deployment options
 *
 * @public
 */
export interface DeploymentOptions {
  /** Callback when deployment starts */
  onStart?: () => void;
  /**
   * Callback when deployment succeeds.
   *
   * IMPORTANT: For async deploy(), onSuccess fires when deployment is SUBMITTED (not confirmed).
   * For deploySync(), onSuccess fires when deployment is CONFIRMED and contract is accessible.
   *
   * If you need to know when the contract is confirmed with async deploy(), monitor
   * aztec_transactionStatus events or use deploySync() instead.
   */
  onSuccess?: (address: AztecAddress | string) => void;
  /** Callback when deployment fails */
  onError?: (error: Error) => void;
  /** Callback for deployment progress */
  onProgress?: (stage: AztecDeploymentStage) => void;
}

/**
 * Deployment result
 *
 * @public
 */
export interface DeploymentResult {
  /** Deployed contract address */
  address: AztecAddress | string;
  /** Contract instance */
  contract: unknown;
  /** Transaction receipt */
  receipt: unknown;
  /** Deployment transaction hash */
  txHash: string;
}

/**
 * Deployment hook return type
 *
 * @public
 */
export interface UseAztecDeployReturn {
  /**
   * Deploy a contract asynchronously (non-blocking)
   * Returns txStatusId immediately for background tracking
   * Transaction status notifications can be monitored via aztec_transactionStatus events
   */
  deploy: (artifact: ContractArtifact, args: unknown[], options?: DeploymentOptions) => Promise<string>; // Returns txStatusId
  /**
   * Deploy a contract synchronously (blocking)
   * Waits for deployment to complete and displays transaction overlay
   * Returns full deployment result with address, contract instance, and receipt
   */
  deploySync: (
    artifact: ContractArtifact,
    args: unknown[],
    options?: DeploymentOptions,
  ) => Promise<DeploymentResult>;
  /** Whether a deployment is currently in progress */
  isDeploying: boolean;
  /** Current deployment stage */
  stage: AztecDeploymentStage;
  /** Any error that occurred during deployment */
  error: Error | null;
  /** Transaction status ID for tracking the current/last deployment */
  txStatusId: string | null;
  /** Last deployed contract address */
  deployedAddress: AztecAddress | string | null;
  /** Last deployment result */
  lastDeployment: DeploymentResult | null;
  /** Reset the deployment state */
  reset: () => void;
}

/**
 * Hook for deploying Aztec contracts
 *
 * This hook provides a streamlined interface for contract deployment with
 * automatic state management, progress tracking, and error handling.
 *
 * @returns Contract deployment utilities
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook automatically handles:
 * - Artifact compatibility (adds missing properties like 'notes')
 * - Deployment state management
 * - Address computation
 * - Proving and sending transactions
 * - Error handling with detailed messages
 * - Success/failure callbacks
 *
 * @example
 * ```tsx
 * // Async mode (non-blocking) - returns txStatusId immediately
 * import { useAztecDeploy } from '@walletmesh/modal-react';
 * import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
 *
 * function DeployTokenAsync() {
 *   const { deploy, txStatusId, deployedAddress } = useAztecDeploy();
 *
 *   const handleDeploy = async () => {
 *     // Returns txStatusId immediately, deployment runs in background
 *     const statusId = await deploy(
 *       TokenContractArtifact,
 *       [ownerAddress, 'MyToken', 'MTK', 18],
 *       {
 *         onStart: () => console.log('Deployment initiated'),
 *         onError: (error) => console.error('Deployment failed:', error),
 *       }
 *     );
 *     console.log('Track deployment with statusId:', statusId);
 *     // Listen to aztec_transactionStatus events for progress updates
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDeploy}>Deploy Token (Async)</button>
 *       {txStatusId && <p>Tracking: {txStatusId}</p>}
 *       {deployedAddress && <p>Deployed at: {deployedAddress.toString()}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Sync mode (blocking) - waits for completion with overlay
 * import { useAztecDeploy } from '@walletmesh/modal-react';
 * import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
 *
 * function DeployTokenSync() {
 *   const { deploySync, isDeploying, stage, deployedAddress } = useAztecDeploy();
 *
 *   const handleDeploy = async () => {
 *     // Blocks until deployment completes, shows transaction overlay
 *     const result = await deploySync(
 *       TokenContractArtifact,
 *       [ownerAddress, 'MyToken', 'MTK', 18],
 *       {
 *         onSuccess: (address) => {
 *           console.log('Token deployed at:', address);
 *         },
 *         onError: (error) => {
 *           console.error('Deployment failed:', error);
 *         },
 *       }
 *     );
 *     console.log('Full result:', result);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDeploy} disabled={isDeploying}>
 *         {isDeploying ? `${stage}...` : 'Deploy Token (Sync)'}
 *       </button>
 *       {deployedAddress && (
 *         <p>Deployed at: {deployedAddress.toString()}</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With progress tracking
 * function DeploymentWithProgress() {
 *   const { deploy, stage } = useAztecDeploy();
 *   const [progress, setProgress] = useState('');
 *
 *   const handleDeploy = async () => {
 *     await deploy(
 *       ContractArtifact,
 *       [param1, param2],
 *       {
 *         onProgress: (stage) => {
 *           setProgress(`Deployment stage: ${stage}`);
 *         },
 *       }
 *     );
 *   };
 *
 *   const getStageMessage = () => {
 *     switch (stage) {
 *       case 'preparing': return '📝 Preparing deployment...';
 *       case 'computing': return '🔢 Computing contract address...';
 *       case 'proving': return '🔐 Generating proof...';
 *       case 'sending': return '📤 Sending transaction...';
 *       case 'confirming': return '⏳ Waiting for confirmation...';
 *       case 'success': return '✅ Deployment complete!';
 *       case 'error': return '❌ Deployment failed';
 *       default: return 'Ready to deploy';
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>{getStageMessage()}</p>
 *       <p>{progress}</p>
 *       <button onClick={handleDeploy}>Deploy Contract</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecDeploy(): UseAztecDeployReturn {
  const { aztecWallet, isReady, address } = useAztecWallet();
  const store = useStoreInstance();
  const [isDeploying, setIsDeploying] = useState(false);
  const [stage, setStage] = useState<AztecDeploymentStage>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [txStatusId, setTxStatusId] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<AztecAddress | string | null>(null);
  const [lastDeployment, setLastDeployment] = useState<DeploymentResult | null>(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Ref to track the current deployment transaction ID for store management
  const currentDeploymentTxIdRef = useRef<string | null>(null);

  // Helper functions to manage deployment transactions in the store
  const addDeploymentTransaction = useCallback(
    (txId: string, artifactName: string, contractAddress?: string) => {
      if (!store) return;

      const deploymentTx: DeploymentTransaction = {
        id: txId,
        status: 'preparing',
        artifactName,
        ...(contractAddress && { contractAddress }),
        timestamp: Date.now(),
      };

      store.setState((state) => ({
        ...state,
        entities: {
          ...state.entities,
          transactions: {
            ...state.entities.transactions,
            [txId]: deploymentTx as unknown,
          },
        },
      }));

      currentDeploymentTxIdRef.current = txId;
    },
    [store],
  );

  const updateDeploymentStatus = useCallback(
    (txId: string, status: DeploymentTransaction['status']) => {
      if (!store) return;

      store.setState((state) => {
        const existingTx = state.entities.transactions?.[txId];
        if (!existingTx) return state;

        return {
          ...state,
          entities: {
            ...state.entities,
            transactions: {
              ...state.entities.transactions,
              [txId]: {
                ...existingTx,
                status,
              },
            },
          },
        };
      });
    },
    [store],
  );

  const removeDeploymentTransaction = useCallback(
    (txId: string) => {
      if (!store) return;

      store.setState((state) => {
        const transactions = { ...state.entities.transactions };
        delete transactions[txId];

        return {
          ...state,
          entities: {
            ...state.entities,
            transactions,
          },
        };
      });

      if (currentDeploymentTxIdRef.current === txId) {
        currentDeploymentTxIdRef.current = null;
      }
    },
    [store],
  );

  // Cleanup on unmount
  useEffect(() => {
    // Ensure ref is set to true on every render
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      // Clean up any pending deployment transaction from the store
      if (currentDeploymentTxIdRef.current) {
        removeDeploymentTransaction(currentDeploymentTxIdRef.current);
      }
    };
  }, [removeDeploymentTransaction]);

  const reset = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsDeploying(false);
    setStage('idle');
    setError(null);
    setTxStatusId(null);
  }, []);

  /**
   * Async deployment (non-blocking) - returns txStatusId immediately
   */
  const deploy = useCallback(
    async (artifact: ContractArtifact, args: unknown[], options: DeploymentOptions = {}): Promise<string> => {
      if (!isReady || !aztecWallet || !address) {
        const error = ErrorFactory.connectionFailed('Aztec wallet is not ready or no address available');
        if (isMountedRef.current) {
          setError(error);
        }
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }

      // Check if wmDeployContract method is available
      if (!aztecWallet.wmDeployContract) {
        const error = ErrorFactory.configurationError(
          'wmDeployContract method not available on wallet. Use deploySync() for legacy wallets.',
        );

        if (isMountedRef.current) {
          setError(error);
          setStage('error');
          setIsDeploying(false);
        }

        if (options.onError) {
          options.onError(error);
        }

        throw error;
      }

      if (isMountedRef.current) {
        setIsDeploying(true);
        setStage('preparing');
        setError(null);
        options.onProgress?.('preparing');
      }

      if (options.onStart) {
        options.onStart();
      }

      try {
        // Ensure artifact has the required notes property for compatibility
        const compatibleArtifact = normalizeArtifact(artifact);

        await ensureContractClassRegistered(aztecWallet, compatibleArtifact);

        // Call wmDeployContract to get txStatusId immediately
        const result = await aztecWallet.wmDeployContract(
          compatibleArtifact as Parameters<typeof aztecWallet.wmDeployContract>[0],
          args,
        );

        if (!isMountedRef.current) {
          return result.txStatusId;
        }

        // Store txStatusId for tracking
        setTxStatusId(result.txStatusId);
        setDeployedAddress(result.contractAddress as AztecAddress);

        // IMPORTANT: onSuccess fires here when deployment is SUBMITTED, not CONFIRMED.
        // The contract address is computed but the deployment transaction is still processing.
        // Users who need confirmation should use deploySync() or monitor transaction status events.
        if (options.onSuccess) {
          options.onSuccess(result.contractAddress as AztecAddress);
        }

        // Deployment is now running in background
        // Transaction status notifications will be sent via aztec_transactionStatus events
        setStage('proving');
        setIsDeploying(false);

        return result.txStatusId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err : ErrorFactory.transactionFailed('Deployment failed');

        const enhancedError = Object.assign(
          ErrorFactory.transactionFailed(`Deployment failed: ${errorMessage.message}`),
          {
            originalError: err,
            artifactName: artifact.name,
            constructorArgs: args,
            cause: errorMessage,
          },
        );

        if (isMountedRef.current) {
          setError(enhancedError);
          setStage('error');
          setIsDeploying(false);
        }

        if (options.onError) {
          options.onError(enhancedError);
        }

        throw enhancedError;
      }
    },
    [aztecWallet, isReady, address],
  );

  /**
   * Sync deployment (blocking) - waits for completion
   */
  const deploySync = useCallback(
    async (
      artifact: ContractArtifact,
      args: unknown[],
      options: DeploymentOptions = {},
    ): Promise<DeploymentResult> => {
      if (!isReady || !aztecWallet || !address) {
        const error = ErrorFactory.connectionFailed('Aztec wallet is not ready or no address available');
        if (isMountedRef.current) {
          setError(error);
        }
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }

      // Generate unique transaction ID for store tracking
      const deploymentTxId = generateDeploymentTxId();

      if (isMountedRef.current) {
        setIsDeploying(true);
        setStage('preparing');
        setError(null);
        options.onProgress?.('preparing');
      }

      if (options.onStart) {
        options.onStart();
      }

      // Add deployment transaction to store for tracking
      addDeploymentTransaction(deploymentTxId, artifact.name);

      try {
        // Prepare deployment
        if (isMountedRef.current) {
          setStage('computing');
          updateDeploymentStatus(deploymentTxId, 'computing');
          if (options.onProgress) {
            options.onProgress('computing');
          }
        }

        // Deploy the contract
        if (isMountedRef.current) {
          setStage('proving');
          updateDeploymentStatus(deploymentTxId, 'proving');
          if (options.onProgress) {
            options.onProgress('proving');
          }
        }

        // Ensure artifact has the required notes property for compatibility
        const compatibleArtifact = normalizeArtifact(artifact);

        await ensureContractClassRegistered(aztecWallet, compatibleArtifact);

        const deploySentTx = await aztecWallet.deployContract(
          compatibleArtifact as Parameters<typeof aztecWallet.deployContract>[0],
          args,
        );

        if (isMountedRef.current) {
          setStage('sending');
          updateDeploymentStatus(deploymentTxId, 'sending');
          if (options.onProgress) {
            options.onProgress('sending');
          }
        }

        const txHash = deploySentTx.txHash || 'deployment';

        // Wait for deployment to complete
        if (isMountedRef.current) {
          setStage('confirming');
          updateDeploymentStatus(deploymentTxId, 'confirming');
          if (options.onProgress) {
            options.onProgress('confirming');
          }
        }

        const deployedContract = await deploySentTx.deployed();
        const contractAddress = deployedContract.address as AztecAddress;

        // Get the receipt
        const receipt = await deploySentTx.wait();

        const result: DeploymentResult = {
          address: contractAddress,
          contract: deployedContract,
          receipt,
          txHash,
        };

        console.log('[useAztecDeploy] Deployment successful:', {
          contractAddress: contractAddress.toString(),
          isMounted: isMountedRef.current,
          deploymentTxId,
        });

        if (isMountedRef.current) {
          console.log('[useAztecDeploy] Setting deployedAddress state:', contractAddress.toString());
          setDeployedAddress(contractAddress);
          setLastDeployment(result);
          setStage('success');
          updateDeploymentStatus(deploymentTxId, 'confirmed');
          setIsDeploying(false);
          console.log('[useAztecDeploy] State updates complete');
        }

        if (options.onSuccess) {
          options.onSuccess(contractAddress);
        }

        // Remove deployment transaction from store after successful completion
        // Use a small delay to ensure useAztecContract has time to detect the pending deployment
        setTimeout(() => {
          removeDeploymentTransaction(deploymentTxId);
        }, 1000);

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err : ErrorFactory.transactionFailed('Deployment failed');

        // Create enhanced error with full context
        const enhancedError = Object.assign(
          ErrorFactory.transactionFailed(`Deployment failed at stage '${stage}': ${errorMessage.message}`),
          {
            originalError: err,
            deploymentStage: stage,
            artifactName: artifact.name,
            constructorArgs: args,
            cause: errorMessage,
          },
        );

        if (isMountedRef.current) {
          setError(enhancedError);
          setStage('error');
          updateDeploymentStatus(deploymentTxId, 'failed');
          setIsDeploying(false);
        }

        if (options.onError) {
          options.onError(enhancedError);
        }

        // Remove deployment transaction from store on error
        removeDeploymentTransaction(deploymentTxId);

        throw enhancedError;
      }
    },
    [aztecWallet, isReady, address, addDeploymentTransaction, updateDeploymentStatus, removeDeploymentTransaction],
  );

  // Log state changes for debugging
  useEffect(() => {
    console.log('[useAztecDeploy] Hook state changed:', {
      deployedAddress: deployedAddress ? deployedAddress.toString() : 'null',
      isDeploying,
      stage,
      error: error?.message,
    });
  }, [deployedAddress, isDeploying, stage, error]);

  return {
    deploy,
    deploySync,
    isDeploying,
    stage,
    error,
    txStatusId,
    deployedAddress,
    lastDeployment,
    reset,
  };
}
export { DEPLOYMENT_STAGE_LABELS, getDeploymentStageLabel } from '@walletmesh/modal-core/providers/aztec';
