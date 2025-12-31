[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isValidConnectionStatus

# Function: isValidConnectionStatus()

> **isValidConnectionStatus**(`value`): `value is ConnectionStatus`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:166

Type guard to check if a string is a valid ConnectionStatus

## Parameters

### value

`string`

The string value to check

## Returns

`value is ConnectionStatus`

True if the value is a valid ConnectionStatus enum value

## Example

```typescript
const statusFromApi = "connected";

if (isValidConnectionStatus(statusFromApi)) {
  // TypeScript knows statusFromApi is ConnectionStatus
  handleStatus(statusFromApi);
} else {
  console.error('Invalid status:', statusFromApi);
}
```
