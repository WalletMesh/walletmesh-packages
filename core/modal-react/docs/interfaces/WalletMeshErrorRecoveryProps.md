[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshErrorRecoveryProps

# Interface: WalletMeshErrorRecoveryProps

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:35](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L35)

Props for WalletMeshErrorRecovery component

## Properties

### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:58](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L58)

Chain type for chain-specific error handling

***

### customActions?

> `optional` **customActions**: [`ErrorAction`](ErrorAction.md)[]

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:61](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L61)

Custom recovery actions

***

### enableAutoRetry?

> `optional` **enableAutoRetry**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:64](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L64)

Enable automatic retry for retryable errors

***

### error

> **error**: \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \} \| `Error`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:37](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L37)

The error to display and recover from

***

### locale?

> `optional` **locale**: `"en"` \| `"es"` \| `"fr"` \| `"de"` \| `"ja"` \| `"zh"`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:55](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L55)

Locale for internationalization

***

### maxAutoRetries?

> `optional` **maxAutoRetries**: `number`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:67](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L67)

Maximum number of automatic retries

***

### onActionTaken()?

> `optional` **onActionTaken**: (`action`, `success`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:73](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L73)

Callback when action is taken

#### Parameters

##### action

`string`

##### success

`boolean`

#### Returns

`void`

***

### onDisconnect()?

> `optional` **onDisconnect**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:46](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L46)

Custom disconnect handler

#### Returns

`Promise`\<`void`\>

***

### onErrorTracked()?

> `optional` **onErrorTracked**: (`error`, `category`) => `void`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:70](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L70)

Callback when error is tracked

#### Parameters

##### error

\{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \} | `Error`

##### category

`string`

#### Returns

`void`

***

### onRetry()?

> `optional` **onRetry**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:43](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L43)

Custom retry handler

#### Returns

`Promise`\<`void`\>

***

### resetError()

> **resetError**: () => `void`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:40](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L40)

Function to reset/clear the error state

#### Returns

`void`

***

### showTechnicalDetails?

> `optional` **showTechnicalDetails**: `boolean`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:49](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L49)

Show technical error details

***

### theme?

> `optional` **theme**: `"light"` \| `"dark"` \| `"auto"`

Defined in: [core/modal-react/src/components/WalletMeshErrorRecovery.tsx:52](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/components/WalletMeshErrorRecovery.tsx#L52)

Theme mode
