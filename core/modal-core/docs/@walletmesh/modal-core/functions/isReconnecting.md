[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isReconnecting

# Function: isReconnecting()

> **isReconnecting**(`status`): `boolean`

Check if the connection status indicates reconnection is in progress

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if currently attempting to reconnect

## Remarks

Reconnection typically happens after a temporary connection loss

## Example

```typescript
if (isReconnecting(status)) {
  // Show reconnecting message
  showMessage('Reconnecting to wallet...');
}
```
