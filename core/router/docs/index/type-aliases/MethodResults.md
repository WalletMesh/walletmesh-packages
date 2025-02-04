[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\>: `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

Defined in: [core/router/src/types.ts:271](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L271)

**`Internal`**

Helper type to map an array of method calls to their corresponding result types

## Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]
