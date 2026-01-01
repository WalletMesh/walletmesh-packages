[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectionInfo

# Interface: ConnectionInfo

Defined in: core/modal-core/dist/types.d.ts:1091

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

Defined in: core/modal-core/dist/types.d.ts:1113

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

Defined in: core/modal-core/dist/types.d.ts:1104

Connected chain information

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

#### Remarks

Contains full chain details including chainId, chainType, name, and other metadata

#### Example

```ts
{ chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum Mainnet', required: true }
```

***

### isConnected

> **isConnected**: `boolean`

Defined in: core/modal-core/dist/types.d.ts:1120

Whether a wallet is connected

#### Remarks

Simple boolean flag for connection state.
True when actively connected, false otherwise.

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/types.d.ts:1097

ID of the connected wallet

#### Remarks

Unique identifier for the wallet type (e.g., "metamask", "rainbow")

#### Example

```ts
"metamask"
```
