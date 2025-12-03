[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / isConnectionResult

# Function: isConnectionResult()

> **isConnectionResult**(`value`): `value is ConnectionResult`

Defined in: core/modal-core/dist/api/types/guards.d.ts:98

Check if a value is a valid ConnectionResult

Validates a complete connection result object containing:
- address: Primary wallet address
- accounts: Array of all available addresses
- chainId: Current chain identifier (string or number)
- chainType: Type of blockchain (evm, solana, aztec)
- walletId: Identifier of connected wallet
- walletInfo: Complete wallet metadata

## Parameters

### value

`unknown`

The value to check

## Returns

`value is ConnectionResult`

True if value is a valid ConnectionResult

## Example

```typescript
// Validate connection response
const result = await wallet.connect();

if (isConnectionResult(result)) {
  // Safe to access all properties
  console.log(`Connected to ${result.walletInfo.name}`);
  console.log(`Address: ${result.address}`);
  console.log(`Chain: ${result.chainId}`);
} else {
  throw new Error('Invalid connection result');
}
```
