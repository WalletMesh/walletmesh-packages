[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WmCallType

# Interface: WmCallType\<M\>

Defined in: [core/router/src/types.ts:364](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L364)

Type definition for the wm_call method parameters and result.
This type enables type-safe method calls to wallets through the router.

## Example

```typescript
// Making a typed call to get an account balance
const result = await router.request<WmCallType<'eth_getBalance'>>('wm_call', {
  chainId: 'eip155:1',
  sessionId: 'session123',
  call: {
    method: 'eth_getBalance',
    params: ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e']
  }
});
// result is typed as string (hex value)
```

## Type Parameters

### M

`M` *extends* keyof [`RouterMethodMap`](RouterMethodMap.md)

The specific method being called from RouterMethodMap

## Properties

### params

> **params**: `object`

Defined in: [core/router/src/types.ts:365](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L365)

#### call

> **call**: [`MethodCall`](MethodCall.md)\<`M`\>

#### chainId

> **chainId**: `string`

#### sessionId

> **sessionId**: `string`

***

### result

> **result**: [`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>

Defined in: [core/router/src/types.ts:370](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L370)
