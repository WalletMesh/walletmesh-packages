[**@walletmesh/jsonrpc v0.4.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCID

# Function: isJSONRPCID()

> **isJSONRPCID**(`value`): `value is JSONRPCID`

Defined in: [core/jsonrpc/src/utils.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/utils.ts#L27)

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
