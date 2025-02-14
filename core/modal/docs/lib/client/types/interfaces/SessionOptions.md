[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / SessionOptions

# Interface: SessionOptions

Defined in: [core/modal/src/lib/client/types.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/types.ts#L136)

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

Defined in: [core/modal/src/lib/client/types.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/client/types.ts#L138)

Custom key for storing sessions in localStorage.
  Defaults to 'walletmesh_wallet_session' if not specified.
