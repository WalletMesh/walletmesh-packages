[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / AllowAskDenyChainPermissions

# Type Alias: AllowAskDenyChainPermissions\<T\>

> **AllowAskDenyChainPermissions**\<`T`\> = `Map`\<[`ChainId`](../../index/type-aliases/ChainId.md), `Map`\<keyof `T`, [`AllowAskDenyState`](../enumerations/AllowAskDenyState.md)\>\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/permissions/allowAskDeny.ts#L65)

Nested map structure for storing permission states.
Maps chain IDs to their method permissions, where each method
has an associated AllowAskDenyState.

## Type Parameters

### T

`T` *extends* [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md)

Router method map type for type-safe method names

## Example

```typescript
const permissions = new Map([
  ['eip155:1', new Map([
    ['eth_sendTransaction', AllowAskDenyState.ASK],
    ['eth_accounts', AllowAskDenyState.ALLOW]
  ])]
]);
```
