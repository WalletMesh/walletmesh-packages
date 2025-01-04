[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / wrapHandler

# Function: wrapHandler()

> **wrapHandler**\<`T`, `M`, `C`\>(`handler`): [`MethodHandler`](../type-aliases/MethodHandler.md)\<`T`, `M`, `C`\>

Wraps a handler function with standard error handling and response formatting.
Used by both JSONRPCNode and tests to ensure consistent error handling.

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

• **M** *extends* `string` \| `number` \| `symbol`

• **C** *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

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

## Defined in

[packages/jsonrpc/src/utils.ts:125](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/utils.ts#L125)
