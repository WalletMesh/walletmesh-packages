[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / WalletMethodMap

# Interface: WalletMethodMap

Method map for the JSON-RPC client that includes all possible wallet methods.
Extends the base JSONRPCMethodMap to include wallet-specific methods and
allows for dynamic method names with unknown parameters and return types.

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

[packages/router/src/jsonrpc-adapter.ts:10](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/jsonrpc-adapter.ts#L10)
