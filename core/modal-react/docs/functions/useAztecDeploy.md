[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useAztecDeploy

# Function: useAztecDeploy()

> **useAztecDeploy**(): [`UseAztecDeployReturn`](../interfaces/UseAztecDeployReturn.md)

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:188](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L188)

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
import { useAztecDeploy } from '@walletmesh/modal-react';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

function DeployToken() {
  const { deploy, isDeploying, stage, deployedAddress } = useAztecDeploy();

  const handleDeploy = async () => {
    // No need for type conversion - hook handles compatibility
    const result = await deploy(
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
  };

  return (
    <div>
      <button onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? `${stage}...` : 'Deploy Token'}
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
