[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecDeployReturn

# Interface: UseAztecDeployReturn

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:86](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L86)

Deployment hook return type

## Properties

### deploy()

> **deploy**: (`artifact`, `args`, `options?`) => `Promise`\<`string`\>

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L92)

Deploy a contract asynchronously (non-blocking)
Returns txStatusId immediately for background tracking
Transaction status notifications can be monitored via aztec_transactionStatus events

#### Parameters

##### artifact

`AztecContractArtifact`

##### args

`unknown`[]

##### options?

[`DeploymentOptions`](DeploymentOptions.md)

#### Returns

`Promise`\<`string`\>

***

### deployedAddress

> **deployedAddress**: `null` \| `string` \| `AztecAddress`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:112](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L112)

Last deployed contract address

***

### deploySync()

> **deploySync**: (`artifact`, `args`, `options?`) => `Promise`\<[`DeploymentResult`](DeploymentResult.md)\>

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:98](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L98)

Deploy a contract synchronously (blocking)
Waits for deployment to complete and displays transaction overlay
Returns full deployment result with address, contract instance, and receipt

#### Parameters

##### artifact

`AztecContractArtifact`

##### args

`unknown`[]

##### options?

[`DeploymentOptions`](DeploymentOptions.md)

#### Returns

`Promise`\<[`DeploymentResult`](DeploymentResult.md)\>

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:108](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L108)

Any error that occurred during deployment

***

### isDeploying

> **isDeploying**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L104)

Whether a deployment is currently in progress

***

### lastDeployment

> **lastDeployment**: `null` \| [`DeploymentResult`](DeploymentResult.md)

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L114)

Last deployment result

***

### reset()

> **reset**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L116)

Reset the deployment state

#### Returns

`void`

***

### stage

> **stage**: `AztecDeploymentStage`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L106)

Current deployment stage

***

### txStatusId

> **txStatusId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useAztecDeploy.ts#L110)

Transaction status ID for tracking the current/last deployment
