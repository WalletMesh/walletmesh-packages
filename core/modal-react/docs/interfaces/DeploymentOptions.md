[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DeploymentOptions

# Interface: DeploymentOptions

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L35)

Deployment options

## Properties

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L41)

Callback when deployment fails

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onProgress()?

> `optional` **onProgress**: (`stage`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L43)

Callback for deployment progress

#### Parameters

##### stage

`string`

#### Returns

`void`

***

### onStart()?

> `optional` **onStart**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L37)

Callback when deployment starts

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`address`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecDeploy.ts#L39)

Callback when deployment succeeds

#### Parameters

##### address

`string` | `AztecAddress`

#### Returns

`void`
