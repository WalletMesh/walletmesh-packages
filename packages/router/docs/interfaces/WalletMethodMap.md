[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / WalletMethodMap

# Interface: WalletMethodMap

Method map for wallet JSON-RPC communication.
Extends the base JSONRPCMethodMap to include wallet-specific methods and
allows for dynamic method names with unknown parameters and return types.

**`Example`**

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

## Hierarchy

- `JSONRPCMethodMap`

  ↳ **`WalletMethodMap`**

## Indexable

▪ [method: `string`]: \{ `params?`: `JSONRPCParams` ; `result`: `unknown`  }

## Table of contents

### Properties

- [wm\_getSupportedMethods](WalletMethodMap.md#wm_getsupportedmethods)

## Properties

### wm\_getSupportedMethods

• **wm\_getSupportedMethods**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `params` | `undefined` |
| `result` | \{ `methods`: `string`[]  } |
| `result.methods` | `string`[] |

#### Defined in

[packages/router/src/jsonrpc-adapter.ts:22](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/jsonrpc-adapter.ts#L22)
