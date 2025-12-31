[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCID

# Function: isJSONRPCID()

> **isJSONRPCID**(`value`): `value is JSONRPCID`

Defined in: [core/jsonrpc/src/utils.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/utils.ts#L27)

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
