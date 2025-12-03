[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isConnected

# Function: isConnected()

> **isConnected**(`status`): `boolean`

Check if the connection status indicates the wallet is connected

## Parameters

### status

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

The connection status to check

## Returns

`boolean`

True if the wallet is connected and ready for use

## Example

```typescript
if (isConnected(status)) {
  // Safe to make wallet requests
  const balance = await wallet.getBalance();
}
```
