[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isDisconnected

# Function: isDisconnected()

> **isDisconnected**(`status`): `boolean`

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
