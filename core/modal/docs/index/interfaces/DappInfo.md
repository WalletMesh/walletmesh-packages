[**@walletmesh/modal v0.0.6**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / DappInfo

# Interface: DappInfo

Defined in: [core/modal/src/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/types.ts#L32)

Information about a DApp integrating with WalletMesh.

Contains required and optional fields that describe the dApp
to users and wallets. Used for display and security purposes.

## Remarks

Security considerations:
- origin must match the actual dApp origin for PostMessage security
- icon must be provided as a data URI to prevent XSS
- rpcUrl should use HTTPS

## Example

```typescript
const dappInfo: DappInfo = {
  name: "My DApp",
  description: "A decentralized application",
  origin: "https://mydapp.com",
  icon: "data:image/svg+xml,...",  // Must be data URI
  rpcUrl: "https://rpc.example.com"
};
```

## Properties

### name

> **name**: `string`

Defined in: [core/modal/src/types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/types.ts#L33)

Display name shown in wallet interfaces

***

### description

> **description**: `string`

Defined in: [core/modal/src/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/types.ts#L34)

Brief description of dApp functionality

***

### origin

> **origin**: `string`

Defined in: [core/modal/src/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/types.ts#L35)

Origin URL for security validation

***

### icon?

> `optional` **icon**: `string`

Defined in: [core/modal/src/types.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/types.ts#L36)

Optional data URI of dApp icon

***

### rpcUrl?

> `optional` **rpcUrl**: `string`

Defined in: [core/modal/src/types.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/types.ts#L37)

Optional RPC endpoint for chain communication
