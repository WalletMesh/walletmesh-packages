[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCVersion

# Function: isJSONRPCVersion()

> **isJSONRPCVersion**(`value`): `value is "2.0"`

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

## Defined in

[packages/jsonrpc/src/utils.ts:48](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/utils.ts#L48)
