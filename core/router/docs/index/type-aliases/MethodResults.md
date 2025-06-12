[**@walletmesh/router v0.5.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\> = `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

Defined in: [core/router/src/types.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/types.ts#L244)

**`Internal`**

Helper type to map an array of method calls to their corresponding result types

## Type Parameters

### T

`T` *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]
