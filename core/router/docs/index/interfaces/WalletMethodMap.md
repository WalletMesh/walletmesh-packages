[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletMethodMap

# Interface: WalletMethodMap

Defined in: [core/router/src/types.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L26)

Method map for wallet JSON-RPC communication.
Extends the base JSONRPCMethodMap to include wallet-specific methods and
allows for dynamic method names with unknown parameters and return types.

## Example

```typescript
// Ethereum wallet methods
type EthereumMethods = {
  eth_accounts: { params: undefined; result: string[] };
  eth_sendTransaction: {
    params: [{ to: string; value: string; data?: string }];
    result: string
  };
} & WalletMethodMap;
```

## Extends

- `JSONRPCMethodMap`

## Indexable

\[`method`: `string`\]: `object`

## Properties

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Defined in: [core/router/src/types.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L27)

#### result

> **result**: `string`[]
