[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / SessionOptions

# Interface: SessionOptions

Defined in: [core/modal/src/lib/client/types.ts:253](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L253)

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

Defined in: [core/modal/src/lib/client/types.ts:255](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/lib/client/types.ts#L255)

Custom key for storing sessions in localStorage.
  Defaults to 'walletmesh_wallet_session' if not specified.
