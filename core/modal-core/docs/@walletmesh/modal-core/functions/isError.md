[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isError

# Function: isError()

> **isError**(`status`): `boolean`

Check if the connection status indicates an error state

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if the connection is in an error state

## Example

```typescript
if (isError(status)) {
  // Show error message and retry button
  showErrorMessage('Connection failed');
  showRetryButton();
}
```
