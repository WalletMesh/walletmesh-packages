[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / ExecuteResult

# Type Alias: ExecuteResult\<T\>

> **ExecuteResult**\<`T`\> = `T` *extends* readonly \[\] ? `never` : `T` *extends* readonly \[[`MethodCall`](../interfaces/MethodCall.md)\<infer M\>\] ? [`MethodResult`](MethodResult.md)\<`M`\> : [`MethodResults`](MethodResults.md)\<`T`\>

Defined in: [core/router/src/operation.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/operation.ts#L26)

Helper type for operation execution result.
Returns a single result for one call, or a tuple of results for multiple calls.

## Type Parameters

### T

`T` *extends* readonly [`MethodCall`](../interfaces/MethodCall.md)[]

Tuple of MethodCall types
