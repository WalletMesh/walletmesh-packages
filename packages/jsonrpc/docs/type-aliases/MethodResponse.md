[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / MethodResponse

# Type Alias: MethodResponse\<T\>

> **MethodResponse**\<`T`\>: \{ `data`: `T`; `success`: `true`; \} \| \{ `error`: \{ `code`: `number`; `data`: `string` \| `Record`\<`string`, `unknown`\>; `message`: `string`; \}; `success`: `false`; \}

Represents the response from a method handler.
Uses a discriminated union to distinguish between success and error cases.
The success field acts as a type guard to narrow the response type.

## Type Parameters

• **T**

The type of the successful result data

## Example

```typescript
// Success case with primitive result
const success: MethodResponse<number> = {
  success: true,
  data: 42
};

// Success case with complex result
const userResponse: MethodResponse<User> = {
  success: true,
  data: {
    id: 123,
    name: 'Alice',
    roles: ['admin']
  }
};

// Error case with standard error code
const error: MethodResponse<number> = {
  success: false,
  error: {
    code: -32602,
    message: 'Invalid params',
    data: { field: 'age', reason: 'must be positive' }
  }
};

// Error case with custom error data
const customError: MethodResponse<User> = {
  success: false,
  error: {
    code: -32000,
    message: 'User not found',
    data: {
      id: 123,
      suggestions: ['124', '125', '126']
    }
  }
};
```

## Defined in

[packages/jsonrpc/src/types.ts:673](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L673)
