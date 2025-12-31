[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / wrapHandler

# Function: wrapHandler()

> **wrapHandler**\<`T`, `M`, `C`\>(`handler`): [`MethodHandler`](../type-aliases/MethodHandler.md)\<`T`, `M`, `C`\>

Defined in: [core/jsonrpc/src/utils.ts:124](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/utils.ts#L124)

Wraps a handler function with standard error handling and response formatting.
Used by both JSONRPCNode and tests to ensure consistent error handling.

## Type Parameters

### T

`T` *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

### M

`M` *extends* `string` \| `number` \| `symbol`

### C

`C` *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

## Parameters

### handler

The original handler function

(`context`, `params`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\> | (`context`, `method`, `params`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\>

## Returns

[`MethodHandler`](../type-aliases/MethodHandler.md)\<`T`, `M`, `C`\>

A wrapped handler that returns MethodResponse

## Example

```typescript
const handler = (context, params) => params.a + params.b;
const wrapped = wrapHandler(handler, 'add');
```
