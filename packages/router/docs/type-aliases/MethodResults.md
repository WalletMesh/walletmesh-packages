[**@walletmesh/router v0.2.3**](../README.md)

***

[@walletmesh/router](../globals.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\>: `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

## Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

## Defined in

[packages/router/src/types.ts:260](https://github.com/WalletMesh/wm-core/blob/e72722b1a4b35e9157ba50814c4113f8e285d423/packages/router/src/types.ts#L260)
