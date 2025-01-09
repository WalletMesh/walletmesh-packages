[**@walletmesh/router v0.2.5**](../README.md)

***

[@walletmesh/router](../globals.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\>: `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

## Type Parameters

• **T** *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

## Defined in

[packages/router/src/types.ts:260](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L260)
