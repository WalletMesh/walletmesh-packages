[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ReactWalletMeshState

# Interface: ReactWalletMeshState

Defined in: [core/modal-react/src/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L34)

Headless WalletMesh state interface
Pure business logic state without UI concerns

## Properties

### accounts?

> `optional` **accounts**: `string`[]

Defined in: [core/modal-react/src/types.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L58)

***

### address?

> `optional` **address**: `string`

Defined in: [core/modal-react/src/types.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L57)

***

### availableWallets

> **availableWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L46)

***

### connectedWallets

> **connectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L38)

***

### connectionProgress?

> `optional` **connectionProgress**: `object`

Defined in: [core/modal-react/src/types.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L61)

#### message

> **message**: `string`

#### percentage?

> `optional` **percentage**: `number`

***

### connectionStatus

> **connectionStatus**: [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal-react/src/types.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L36)

***

### currentChain

> **currentChain**: `null` \| \{ `chainId`: `string`; `chainType`: [`ChainType`](../enumerations/ChainType.md); `group?`: `string`; `icon?`: `string`; `interfaces?`: `string`[]; `label?`: `string`; `name`: `string`; `required`: `boolean`; \}

Defined in: [core/modal-react/src/types.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L53)

***

### currentView

> **currentView**: `"walletSelection"` \| `"connecting"` \| `"connected"` \| `"error"` \| `"switchingChain"`

Defined in: [core/modal-react/src/types.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L43)

***

### detectedWallets

> **detectedWallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L47)

***

### error

> **error**: `null` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

Defined in: [core/modal-react/src/types.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L50)

***

### isModalOpen

> **isModalOpen**: `boolean`

Defined in: [core/modal-react/src/types.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L42)

***

### provider

> **provider**: `unknown`

Defined in: [core/modal-react/src/types.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L39)

***

### selectedWallet

> **selectedWallet**: `null` \| [`WalletInfo`](WalletInfo.md)

Defined in: [core/modal-react/src/types.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L37)

***

### supportedChains

> **supportedChains**: `object`[]

Defined in: [core/modal-react/src/types.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/types.ts#L54)

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`
