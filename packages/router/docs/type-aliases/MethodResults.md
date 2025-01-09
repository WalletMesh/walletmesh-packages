[**@walletmesh/router v0.2.4**](../README.md)

***

[@walletmesh/router](../globals.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\>: `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

## Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

## Defined in

[packages/router/src/types.ts:260](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L260)
