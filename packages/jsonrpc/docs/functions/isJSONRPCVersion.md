[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCVersion

# Function: isJSONRPCVersion()

> **isJSONRPCVersion**(`value`): `value is "2.0"`

Type guard for validating JSON-RPC protocol version.
Checks if a value is the string '2.0' as required by the JSON-RPC 2.0 spec.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is "2.0"`

True if the value is '2.0'

## Example

```typescript
if (!isJSONRPCVersion(message.jsonrpc)) {
  throw new JSONRPCError(-32600, 'Invalid JSON-RPC version');
}
```

## Defined in

[packages/jsonrpc/src/utils.ts:82](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/utils.ts#L82)
