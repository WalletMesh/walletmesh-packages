[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / connectionSelectors

# Variable: connectionSelectors

> `const` **connectionSelectors**: `object`

Connection state selectors

## Type Declaration

### getConnectedWallet()

> **getConnectedWallet**: (`state`, `wallets`) => `null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Get connected wallet info

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

##### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

#### Returns

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

### isConnected()

> **isConnected**: (`state`) => `boolean`

Check if wallet is connected

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isConnecting()

> **isConnecting**: (`state`) => `boolean`

Check if wallet is connecting

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`

### isDisconnected()

> **isDisconnected**: (`state`) => `boolean`

Check if wallet is disconnected

#### Parameters

##### state

[`HeadlessModalState`](../interfaces/HeadlessModalState.md)

#### Returns

`boolean`
