[**@walletmesh/modal v0.0.6**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / DappInfo

# Interface: DappInfo

Defined in: [core/modal/src/types.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L33)

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

Defined in: [core/modal/src/types.ts:34](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L34)

Display name shown in wallet interfaces

***

### description

> **description**: `string`

Defined in: [core/modal/src/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L35)

Brief description of dApp functionality

***

### origin

> **origin**: `string`

Defined in: [core/modal/src/types.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L36)

Origin URL for security validation

***

### icon?

> `optional` **icon**: `string`

Defined in: [core/modal/src/types.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L37)

Optional data URI of dApp icon

***

### rpcUrl?

> `optional` **rpcUrl**: `string`

Defined in: [core/modal/src/types.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L38)

Optional RPC endpoint for chain communication
