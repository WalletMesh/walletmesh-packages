[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionInfo

# Interface: ConnectionInfo

Interface for connection information

## Remarks

Contains information about the current wallet connection state.
Used by framework integrations to expose connection details.
This interface provides a simplified view of the connection state
suitable for UI components and application logic.

## Examples

```typescript
const connectionInfo: ConnectionInfo = {
  walletId: 'metamask',
  chainId: 1,
  accounts: ['0x1234...', '0x5678...'],
  isConnected: true
};
```

```typescript
// Using connection info in a component
function WalletStatus({ connection }: { connection: ConnectionInfo }) {
  if (!connection.isConnected) {
    return <div>Not connected</div>;
  }

  return (
    <div>
      Connected to {connection.walletId}
      Chain: {connection.chainId}
      Account: {connection.accounts[0]}
    </div>
  );
}
```

## Properties

### accounts

> **accounts**: `string`[]

List of connected accounts

#### Remarks

Array of account addresses/public keys.
Usually contains one account, but some wallets support multiple.
The first account is typically the primary/active account.

#### Example

```ts
["0x742d35Cc6634C0532925a3b844Bc9e7595f15E90"]
```

***

### chain

> **chain**: `object`

Connected chain information

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### Remarks

Contains full chain details including chainId, chainType, name, and other metadata

#### Example

```ts
{ chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum Mainnet', required: true }
```

***

### isConnected

> **isConnected**: `boolean`

Whether a wallet is connected

#### Remarks

Simple boolean flag for connection state.
True when actively connected, false otherwise.

***

### walletId

> **walletId**: `string`

ID of the connected wallet

#### Remarks

Unique identifier for the wallet type (e.g., "metamask", "rainbow")

#### Example

```ts
"metamask"
```
