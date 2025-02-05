[**@walletmesh/jsonrpc v0.4.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCVersion

# Function: isJSONRPCVersion()

> **isJSONRPCVersion**(`value`): `value is "2.0"`

Defined in: [core/jsonrpc/src/utils.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/utils.ts#L48)

Type guard to check if a value is a valid JSON-RPC version string.
The only valid version string is '2.0' as per the JSON-RPC 2.0 specification.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is "2.0"`

True if the value is '2.0', false otherwise

## Example

```typescript
isJSONRPCVersion("2.0");  // true
isJSONRPCVersion("1.0");  // false
isJSONRPCVersion(2);      // false
```
