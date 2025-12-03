[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isInactiveState

# Function: isInactiveState()

> **isInactiveState**(`status`): `boolean`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:134

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
