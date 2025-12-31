[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isValidConnectionStatus

# Function: isValidConnectionStatus()

> **isValidConnectionStatus**(`value`): `value is ConnectionStatus`

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
