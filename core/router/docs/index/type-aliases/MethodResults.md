[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MethodResults

# Type Alias: MethodResults\<T\>

> **MethodResults**\<`T`\> = `{ readonly [K in keyof T]: T[K] extends MethodCall<infer M> ? MethodResult<M> : never }`

Defined in: [core/router/src/types.ts:248](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L248)

**`Internal`**

Helper type to map an array of method calls to their corresponding result types

## Type Parameters

### T

`T` *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]
