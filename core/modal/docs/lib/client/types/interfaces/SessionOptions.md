[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / SessionOptions

# Interface: SessionOptions

Defined in: [core/modal/src/lib/client/types.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L136)

Configuration options for session storage behavior.

## Example

```typescript
const options: SessionOptions = {
  storageKey: 'custom_wallet_sessions'
};
```

## Properties

### storageKey?

> `optional` **storageKey**: `string`

Defined in: [core/modal/src/lib/client/types.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/client/types.ts#L138)

Custom key for storing sessions in localStorage.
  Defaults to 'walletmesh_wallet_session' if not specified.
