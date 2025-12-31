[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isError

# Function: isError()

> **isError**(`status`): `boolean`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:87

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
