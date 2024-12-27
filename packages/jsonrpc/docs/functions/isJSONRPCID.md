[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCID

# Function: isJSONRPCID()

> **isJSONRPCID**(`value`): `value is JSONRPCID`

Type guard for validating JSON-RPC message identifiers.
Checks if a value is a valid JSONRPCID (string, number, or undefined).

## Parameters

### value

`unknown`

The value to check

## Returns

`value is JSONRPCID`

True if the value is a valid JSON-RPC ID

## Example

```typescript
if (isJSONRPCID(message.id)) {
  // Handle valid ID
} else {
  throw new JSONRPCError(-32600, 'Invalid Request ID');
}
```

## Defined in

[packages/jsonrpc/src/utils.ts:64](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/utils.ts#L64)
