[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isActiveState

# Function: isActiveState()

> **isActiveState**(`status`): `boolean`

Check if the connection status indicates the wallet is in an active/usable state

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if the wallet is in a state where operations can be performed

## Remarks

Currently only Connected status is considered active

## Example

```typescript
if (isActiveState(status)) {
  // Enable transaction buttons
  enableTransactionUI();
}
```
