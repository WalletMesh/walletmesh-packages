[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DeploymentOptions

# Interface: DeploymentOptions

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecDeploy.ts#L46)

Deployment options

## Properties

### onError()?

> `optional` **onError**: (`error`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecDeploy.ts#L60)

Callback when deployment fails

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onProgress()?

> `optional` **onProgress**: (`stage`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecDeploy.ts#L62)

Callback for deployment progress

#### Parameters

##### stage

`AztecDeploymentStage`

#### Returns

`void`

***

### onStart()?

> `optional` **onStart**: () => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecDeploy.ts#L48)

Callback when deployment starts

#### Returns

`void`

***

### onSuccess()?

> `optional` **onSuccess**: (`address`) => `void`

Defined in: [core/modal-react/src/hooks/useAztecDeploy.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useAztecDeploy.ts#L58)

Callback when deployment succeeds.

IMPORTANT: For async deploy(), onSuccess fires when deployment is SUBMITTED (not confirmed).
For deploySync(), onSuccess fires when deployment is CONFIRMED and contract is accessible.

If you need to know when the contract is confirmed with async deploy(), monitor
aztec_transactionStatus events or use deploySync() instead.

#### Parameters

##### address

`string` | `AztecAddress`

#### Returns

`void`
