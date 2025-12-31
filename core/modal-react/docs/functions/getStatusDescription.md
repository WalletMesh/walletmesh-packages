[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / getStatusDescription

# Function: getStatusDescription()

> **getStatusDescription**(`status`): `string`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:148

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
