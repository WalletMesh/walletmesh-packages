[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isInactiveState

# Function: isInactiveState()

> **isInactiveState**(`status`): `boolean`

Check if the connection status indicates the wallet is in an inactive/unusable state

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if the wallet cannot perform operations

## Remarks

Includes both Disconnected and Error states

## Example

```typescript
if (isInactiveState(status)) {
  // Disable transaction UI
  disableTransactionUI();
  // Show appropriate message
  showInactiveMessage();
}
```
