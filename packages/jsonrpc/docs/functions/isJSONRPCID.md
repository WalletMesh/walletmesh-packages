[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCID

# Function: isJSONRPCID()

> **isJSONRPCID**(`value`): `value is JSONRPCID`

Type guard to check if a value is a valid JSON-RPC ID.
Valid IDs can be strings, numbers, or undefined.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is JSONRPCID`

True if the value is a valid JSON-RPC ID, false otherwise

## Example

```typescript
isJSONRPCID("123");     // true
isJSONRPCID(456);       // true
isJSONRPCID(undefined); // true
isJSONRPCID(null);      // false
isJSONRPCID({});        // false
```

## Defined in

[packages/jsonrpc/src/utils.ts:27](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/utils.ts#L27)
