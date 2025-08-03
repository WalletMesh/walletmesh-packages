[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / TransportConfig

# Interface: TransportConfig

Defined in: [core/types.ts:308](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L308)

Transport configuration for wallet connections.

Specifies how dApps should connect to the wallet, including
transport type and necessary configuration parameters.

## Examples

```typescript
const extensionTransport: TransportConfig = {
  type: 'extension',
  extensionId: 'abcdefghijklmnop',
  walletAdapter: 'MetaMaskAdapter'
};
```

```typescript
const popupTransport: TransportConfig = {
  type: 'popup',
  popupUrl: 'https://wallet.example.com/connect',
  adapterConfig: {
    windowFeatures: 'width=400,height=600'
  }
};
```

## Since

0.2.0

## Properties

### adapterConfig?

> `optional` **adapterConfig**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:338](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L338)

Additional adapter-specific configuration

***

### extensionId?

> `optional` **extensionId**: `string`

Defined in: [core/types.ts:317](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L317)

Chrome extension ID (required for extension transport)

***

### popupUrl?

> `optional` **popupUrl**: `string`

Defined in: [core/types.ts:322](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L322)

Popup window URL (required for popup transport)

***

### type

> **type**: `"extension"` \| `"popup"` \| `"websocket"` \| `"injected"`

Defined in: [core/types.ts:312](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L312)

Type of transport to use for wallet connection

***

### walletAdapter?

> `optional` **walletAdapter**: `string`

Defined in: [core/types.ts:333](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L333)

Wallet adapter class name to use (e.g., 'MetaMaskAdapter', 'PhantomAdapter')
This helps dApps select the appropriate adapter implementation

***

### websocketUrl?

> `optional` **websocketUrl**: `string`

Defined in: [core/types.ts:327](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L327)

WebSocket endpoint URL (required for websocket transport)
