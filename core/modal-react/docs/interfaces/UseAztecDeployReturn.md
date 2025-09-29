[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecDeployReturn

# Interface: UseAztecDeployReturn

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L67)

Deployment hook return type

## Properties

### deploy()

> **deploy**: (`artifact`, `args`, `options?`) => `Promise`\<[`DeploymentResult`](DeploymentResult.md)\>

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L69)

Deploy a contract with the given artifact and arguments

#### Parameters

##### artifact

[`ContractArtifact`](../type-aliases/ContractArtifact.md)

##### args

`unknown`[]

##### options?

[`DeploymentOptions`](DeploymentOptions.md)

#### Returns

`Promise`\<[`DeploymentResult`](DeploymentResult.md)\>

***

### deployedAddress

> **deployedAddress**: `null` \| `string` \| `AztecAddress`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L81)

Last deployed contract address

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L79)

Any error that occurred during deployment

***

### isDeploying

> **isDeploying**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:75](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L75)

Whether a deployment is currently in progress

***

### lastDeployment

> **lastDeployment**: `null` \| [`DeploymentResult`](DeploymentResult.md)

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L83)

Last deployment result

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:85](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L85)

Reset the deployment state

#### Returns

`void`

***

### stage

> **stage**: `"error"` \| `"proving"` \| `"idle"` \| `"preparing"` \| `"confirming"` \| `"success"` \| `"computing"` \| `"sending"`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:77](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L77)

Current deployment stage
