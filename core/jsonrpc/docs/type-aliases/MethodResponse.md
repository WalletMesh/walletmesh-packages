[**@walletmesh/jsonrpc v0.2.2**](../README.md)

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

[packages/jsonrpc/src/types.ts:674](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L674)
