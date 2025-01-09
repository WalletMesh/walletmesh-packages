[**@walletmesh/router v0.2.6**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / WmCallType

# Interface: WmCallType\<M\>

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

• **M** *extends* keyof [`RouterMethodMap`](RouterMethodMap.md)

The specific method being called from RouterMethodMap

## Properties

### params

> **params**: `object`

#### call

> **call**: [`MethodCall`](MethodCall.md)\<`M`\>

#### chainId

> **chainId**: `string`

#### sessionId

> **sessionId**: `string`

#### Defined in

[packages/router/src/types.ts:392](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L392)

***

### result

> **result**: [`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>

#### Defined in

[packages/router/src/types.ts:397](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L397)
