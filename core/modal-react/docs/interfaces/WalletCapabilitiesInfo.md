[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletCapabilitiesInfo

# Interface: WalletCapabilitiesInfo

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:20](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L20)

Wallet capabilities information

## Properties

### capabilities

> **capabilities**: `null` \| [`WalletCapabilities`](WalletCapabilities.md)

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L22)

The wallet capabilities

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L26)

Error loading capabilities

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L24)

Whether capabilities are being loaded

***

### refresh()

> **refresh**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L34)

Refresh capabilities

#### Returns

`Promise`\<`void`\>

***

### supportsChain()

> **supportsChain**: (`type`) => `boolean`

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L28)

Check if a chain type is supported

#### Parameters

##### type

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`boolean`

***

### supportsChainId()

> **supportsChainId**: (`chainId`) => `boolean`

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L32)

Check if a chain is supported by chain ID

#### Parameters

##### chainId

`string`

#### Returns

`boolean`

***

### supportsMethod()

> **supportsMethod**: (`method`) => `boolean`

Defined in: [core/modal-react/src/hooks/useWalletCapabilities.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useWalletCapabilities.ts#L30)

Check if a method is supported

#### Parameters

##### method

`string`

#### Returns

`boolean`
