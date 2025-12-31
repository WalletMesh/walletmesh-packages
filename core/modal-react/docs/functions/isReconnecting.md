[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isReconnecting

# Function: isReconnecting()

> **isReconnecting**(`status`): `boolean`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:102

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
