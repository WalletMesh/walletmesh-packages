[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isConnecting

# Function: isConnecting()

> **isConnecting**(`status`): `boolean`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:58

Check if the connection status indicates a connection attempt is in progress

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if currently connecting or reconnecting to a wallet

## Remarks

This includes both initial connection attempts and reconnection attempts

## Example

```typescript
if (isConnecting(status)) {
  // Show loading spinner
  showConnectionSpinner();
}
```
