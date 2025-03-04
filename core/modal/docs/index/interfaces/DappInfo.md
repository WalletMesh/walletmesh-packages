[**@walletmesh/modal v0.0.7**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / DappInfo

# Interface: DappInfo

Defined in: [core/modal/src/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L32)

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

Defined in: [core/modal/src/types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L33)

Display name shown in wallet interfaces

***

### description

> **description**: `string`

Defined in: [core/modal/src/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L34)

Brief description of dApp functionality

***

### origin

> **origin**: `string`

Defined in: [core/modal/src/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L35)

Origin URL for security validation

***

### iconDataUri?

> `optional` **iconDataUri**: `string`

Defined in: [core/modal/src/types.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L36)

***

### rpcUrl?

> `optional` **rpcUrl**: `string`

Defined in: [core/modal/src/types.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/types.ts#L37)

Optional RPC endpoint for chain communication
