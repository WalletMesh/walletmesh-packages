[**@walletmesh/router v0.1.2**](../README.md)

***

[@walletmesh/router](../globals.md) / WalletMethodMap

# Interface: WalletMethodMap

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

#### params

> **params**: `undefined`

#### result

> **result**: `object`

##### result.methods

> **methods**: `string`[]

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:22](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/router/src/jsonrpc-adapter.ts#L22)
