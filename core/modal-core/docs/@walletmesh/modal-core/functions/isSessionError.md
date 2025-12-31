[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isSessionError

# Function: isSessionError()

> **isSessionError**(`error`): `boolean`

Check if an error is a session-related error

Detects errors related to invalid, expired, or terminated wallet sessions.
Checks for the standard JSON-RPC error code (-32001) and common session
error message patterns.

## Parameters

### error

`unknown`

The error to check (can be any type)

## Returns

`boolean`

True if the error is session-related, false otherwise

## Example

```typescript
try {
  await provider.call('eth_accounts');
} catch (error) {
  if (isSessionError(error)) {
    console.log('Session expired, need to reconnect');
    await disconnect();
  }
}
```

## Since

3.0.0
