[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getStatusDescription

# Function: getStatusDescription()

> **getStatusDescription**(`status`): `string`

Get a human-readable description of the connection status

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to describe

## Returns

`string`

A user-friendly description of the status

## Example

```typescript
const description = getStatusDescription(status);
// For ConnectionStatus.Connecting: "Connecting to wallet"
// For ConnectionStatus.Error: "Connection error occurred"
showStatusMessage(description);
```
