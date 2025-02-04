[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WalletMethodMap

# Interface: WalletMethodMap

Defined in: [core/router/src/jsonrpc-adapter.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L27)

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

Defined in: [core/router/src/jsonrpc-adapter.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/jsonrpc-adapter.ts#L28)

#### result

> **result**: `string`[]
