[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WmBulkCallType

# Interface: WmBulkCallType\<M\>

Defined in: [core/router/src/types.ts:427](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L427)

Type definition for the wm_bulkCall method parameters and result.
Enables type-safe execution of multiple method calls in sequence.
All calls must be permitted for the operation to succeed.

## Example

```typescript
// Making multiple typed calls in sequence
const results = await router.request<WmBulkCallType<'eth_getBalance'>>('wm_bulkCall', {
  chainId: 'eip155:1',
  sessionId: 'session123',
  calls: [
    {
      method: 'eth_getBalance',
      params: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']
    },
    {
      method: 'eth_getBalance',
      params: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44f']
    }
  ]
});
// results is typed as string[] (array of hex values)
```

## Type Parameters

• **M** *extends* keyof [`RouterMethodMap`](RouterMethodMap.md)

The specific method being called from RouterMethodMap

## Properties

### params

> **params**: `object`

Defined in: [core/router/src/types.ts:428](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L428)

#### calls

> **calls**: [`MethodCall`](MethodCall.md)\<`M`\>[]

#### chainId

> **chainId**: `string`

#### sessionId

> **sessionId**: `string`

***

### result

> **result**: [`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>[]

Defined in: [core/router/src/types.ts:433](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L433)
