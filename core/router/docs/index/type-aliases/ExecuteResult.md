[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ExecuteResult

# Type Alias: ExecuteResult\<T\>

> **ExecuteResult**\<`T`\> = `T` *extends* readonly \[\] ? `never` : `T` *extends* readonly \[[`MethodCall`](../interfaces/MethodCall.md)\<infer M\>\] ? [`MethodResult`](MethodResult.md)\<`M`\> : [`MethodResults`](MethodResults.md)\<`T`\>

Defined in: [core/router/src/operation.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/operation.ts#L26)

Helper type for operation execution result.
Returns a single result for one call, or a tuple of results for multiple calls.

## Type Parameters

### T

`T` *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

Tuple of MethodCall types
