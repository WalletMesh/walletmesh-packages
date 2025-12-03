[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isDisconnected

# Function: isDisconnected()

> **isDisconnected**(`status`): `boolean`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:72

Check if the connection status indicates the wallet is disconnected

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if the wallet is disconnected

## Example

```typescript
if (isDisconnected(status)) {
  // Show connect button
  showConnectButton();
}
```
