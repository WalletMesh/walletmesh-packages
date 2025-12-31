[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecDeploy

# Function: useAztecDeploy()

> **useAztecDeploy**(): [`UseAztecDeployReturn`](../interfaces/UseAztecDeployReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:254](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecDeploy.ts#L254)

Hook for deploying Aztec contracts

This hook provides a streamlined interface for contract deployment with
automatic state management, progress tracking, and error handling.

## Returns

[`UseAztecDeployReturn`](../interfaces/UseAztecDeployReturn.md)

Contract deployment utilities

## Since

1.0.0

## Remarks

The hook automatically handles:
- Artifact compatibility (adds missing properties like 'notes')
- Deployment state management
- Address computation
- Proving and sending transactions
- Error handling with detailed messages
- Success/failure callbacks

## Examples

```tsx
// Async mode (non-blocking) - returns txStatusId immediately
import { useAztecDeploy } from '@walletmesh/modal-react';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function DeployTokenAsync() {
  const { deploy, txStatusId, deployedAddress } = useAztecDeploy();

  const handleDeploy = async () => {
    // Returns txStatusId immediately, deployment runs in background
    const statusId = await deploy(
      TokenContractArtifact,
      [ownerAddress, 'MyToken', 'MTK', 18],
      {
        onStart: () => console.log('Deployment initiated'),
        onError: (error) => console.error('Deployment failed:', error),
      }
    );
    console.log('Track deployment with statusId:', statusId);
    // Listen to aztec_transactionStatus events for progress updates
  };

  return (
    <div>
      <button onClick={handleDeploy}>Deploy Token (Async)</button>
      {txStatusId && <p>Tracking: {txStatusId}</p>}
      {deployedAddress && <p>Deployed at: {deployedAddress.toString()}</p>}
    </div>
  );
}
```

```tsx
// Sync mode (blocking) - waits for completion with overlay
import { useAztecDeploy } from '@walletmesh/modal-react';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function DeployTokenSync() {
  const { deploySync, isDeploying, stage, deployedAddress } = useAztecDeploy();

  const handleDeploy = async () => {
    // Blocks until deployment completes, shows transaction overlay
    const result = await deploySync(
      TokenContractArtifact,
      [ownerAddress, 'MyToken', 'MTK', 18],
      {
        onSuccess: (address) => {
          console.log('Token deployed at:', address);
        },
        onError: (error) => {
          console.error('Deployment failed:', error);
        },
      }
    );
    console.log('Full result:', result);
  };

  return (
    <div>
      <button onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? `${stage}...` : 'Deploy Token (Sync)'}
      </button>
      {deployedAddress && (
        <p>Deployed at: {deployedAddress.toString()}</p>
      )}
    </div>
  );
}
```

```tsx
// With progress tracking
function DeploymentWithProgress() {
  const { deploy, stage } = useAztecDeploy();
  const [progress, setProgress] = useState('');

  const handleDeploy = async () => {
    await deploy(
      ContractArtifact,
      [param1, param2],
      {
        onProgress: (stage) => {
          setProgress(`Deployment stage: ${stage}`);
        },
      }
    );
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'preparing': return '📝 Preparing deployment...';
      case 'computing': return '🔢 Computing contract address...';
      case 'proving': return '🔐 Generating proof...';
      case 'sending': return '📤 Sending transaction...';
      case 'confirming': return '⏳ Waiting for confirmation...';
      case 'success': return '✅ Deployment complete!';
      case 'error': return '❌ Deployment failed';
      default: return 'Ready to deploy';
    }
  };

  return (
    <div>
      <p>{getStageMessage()}</p>
      <p>{progress}</p>
      <button onClick={handleDeploy}>Deploy Contract</button>
    </div>
  );
}
```
