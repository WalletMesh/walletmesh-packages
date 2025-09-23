[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\> = `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

Defined in: [core/router/src/types.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L244)

**`Internal`**

Helper type to map an array of method calls to their corresponding result types

## Type Parameters

### T

`T` *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]
