[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isConnected

# Function: isConnected()

> **isConnected**(`status`): `boolean`

Defined in: core/modal-core/dist/api/types/connectionStatus.d.ts:43

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
