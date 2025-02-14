[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletClient

# Interface: WalletClient

Defined in: [core/modal/src/lib/client/types.ts:107](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L107)

Defines the core interface for interacting with wallets.

Implementations of this interface provide methods for:
- Wallet connection and disconnection
- Session management
- State queries
- Error handling

## Example

```typescript
class MyWalletClient implements WalletClient {
  async initialize() {
    // Restore previous session if available
    return this.attemptRestore();
  }

  async connectWallet(walletInfo, transport, adapter) {
    // Establish new wallet connection
    return this.connect(walletInfo);
  }

  // ... other method implementations
}
```

## Methods

### getDappInfo()

> **getDappInfo**(): `Readonly`\<[`DappInfo`](../../../../index/interfaces/DappInfo.md)\>

Defined in: [core/modal/src/lib/client/types.ts:108](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L108)

#### Returns

`Readonly`\<[`DappInfo`](../../../../index/interfaces/DappInfo.md)\>

***

### initialize()

> **initialize**(): `Promise`\<`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L109)

#### Returns

`Promise`\<`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

***

### connectWallet()

> **connectWallet**(`walletInfo`, `transport`, `adapter`, `options`?): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/types.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L110)

#### Parameters

##### walletInfo

[`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

##### transport

[`Transport`](../../../transports/types/interfaces/Transport.md)

##### adapter

[`Adapter`](../../../adapters/types/interfaces/Adapter.md)

##### options?

###### persist

`boolean`

#### Returns

`Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

***

### disconnectWallet()

> **disconnectWallet**(`walletId`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/types.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L116)

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`void`\>

***

### getProvider()

> **getProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/types.ts:117](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L117)

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`unknown`\>

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/types.ts:118](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L118)

#### Returns

[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)[]

***

### getConnectedWallet()

> **getConnectedWallet**(): `null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L119)

#### Returns

`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

***

### handleError()

> **handleError**(`error`): `void`

Defined in: [core/modal/src/lib/client/types.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L120)

#### Parameters

##### error

[`WalletError`](../classes/WalletError.md)

#### Returns

`void`
