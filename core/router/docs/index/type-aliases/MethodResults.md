[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\>: `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

**`Internal`**

Helper type to map an array of method calls to their corresponding result types

## Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

## Defined in

[packages/router/src/types.ts:271](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L271)
