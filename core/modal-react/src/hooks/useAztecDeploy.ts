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
import { useCallback, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

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
  /** Callback when deployment succeeds */
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
  /** Deploy a contract with the given artifact and arguments */
  deploy: (
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
 * import { useAztecDeploy } from '@walletmesh/modal-react';
 * import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
 *
 * function DeployToken() {
 *   const { deploy, isDeploying, stage, deployedAddress } = useAztecDeploy();
 *
 *   const handleDeploy = async () => {
 *     // No need for type conversion - hook handles compatibility
 *     const result = await deploy(
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
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleDeploy} disabled={isDeploying}>
 *         {isDeploying ? `${stage}...` : 'Deploy Token'}
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
  const [isDeploying, setIsDeploying] = useState(false);
  const [stage, setStage] = useState<AztecDeploymentStage>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<AztecAddress | string | null>(null);
  const [lastDeployment, setLastDeployment] = useState<DeploymentResult | null>(null);

  const reset = useCallback(() => {
    setIsDeploying(false);
    setStage('idle');
    setError(null);
  }, []);

  const deploy = useCallback(
    async (
      artifact: ContractArtifact,
      args: unknown[],
      options: DeploymentOptions = {},
    ): Promise<DeploymentResult> => {
      if (!isReady || !aztecWallet || !address) {
        const error = ErrorFactory.connectionFailed('Aztec wallet is not ready or no address available');
        setError(error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }

      setIsDeploying(true);
      setStage('preparing');
      setError(null);
      options.onProgress?.('preparing');

      if (options.onStart) {
        options.onStart();
      }

      try {
        // Prepare deployment
        setStage('computing');
        if (options.onProgress) {
          options.onProgress('computing');
        }

        // Deploy the contract
        setStage('proving');
        if (options.onProgress) {
          options.onProgress('proving');
        }

        // Ensure artifact has the required notes property for compatibility
        const compatibleArtifact = normalizeArtifact(artifact);

        await ensureContractClassRegistered(aztecWallet, compatibleArtifact);

        const deploySentTx = await aztecWallet.deployContract(
          compatibleArtifact as Parameters<typeof aztecWallet.deployContract>[0],
          args,
        );

        setStage('sending');
        if (options.onProgress) {
          options.onProgress('sending');
        }

        const txHash = deploySentTx.txHash || 'deployment';

        // Wait for deployment to complete
        setStage('confirming');
        if (options.onProgress) {
          options.onProgress('confirming');
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

        setDeployedAddress(contractAddress);
        setLastDeployment(result);
        setStage('success');
        setIsDeploying(false);

        if (options.onSuccess) {
          options.onSuccess(contractAddress);
        }

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
          }
        );

        setError(enhancedError);
        setStage('error');
        setIsDeploying(false);

        if (options.onError) {
          options.onError(enhancedError);
        }

        throw enhancedError;
      }
    },
    [aztecWallet, isReady, address],
  );

  return {
    deploy,
    isDeploying,
    stage,
    error,
    deployedAddress,
    lastDeployment,
    reset,
  };
}
export { DEPLOYMENT_STAGE_LABELS, getDeploymentStageLabel } from '@walletmesh/modal-core/providers/aztec';

