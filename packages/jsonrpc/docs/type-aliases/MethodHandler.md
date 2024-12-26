[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / MethodHandler

# Type Alias: MethodHandler()\<T, M, C\>

> **MethodHandler**\<`T`, `M`, `C`\>: (`context`, `params`) => `Promise`\<`T`\[`M`\]\[`"result"`\]\> \| `T`\[`M`\]\[`"result"`\]

Function type for handling JSON-RPC method calls.
Method handlers receive a context object and typed parameters,
and return a promise or direct value of the specified result type.

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](JSONRPCMethodMap.md)

The RPC method map defining available methods

• **M** *extends* keyof `T`

The specific method being handled

• **C** *extends* [`JSONRPCContext`](JSONRPCContext.md)

The context type for method handlers

## Parameters

### context

`C`

### params

`T`\[`M`\]\[`"params"`\]

## Returns

`Promise`\<`T`\[`M`\]\[`"result"`\]\> \| `T`\[`M`\]\[`"result"`\]

## Example

```typescript
// Simple handler
const addHandler: MethodHandler<MethodMap, 'add', Context> =
  (context, { a, b }) => a + b;

// Async handler with context
const getUserHandler: MethodHandler<MethodMap, 'getUser', Context> =
  async (context, { id }) => {
    if (!context.isAuthorized) {
      throw new JSONRPCError(-32600, 'Unauthorized');
    }
    return await db.users.findById(id);
  };
```

## Defined in

[packages/jsonrpc/src/node.ts:79](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/node.ts#L79)
