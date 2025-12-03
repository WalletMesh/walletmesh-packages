[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isConnecting

# Function: isConnecting()

> **isConnecting**(`status`): `boolean`

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
