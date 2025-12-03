[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ChainConfig

# Interface: ChainConfig

Configuration for a supported blockchain network.

## Extends

- `Omit`\<[`SupportedChain`](../../../../@walletmesh/modal-core/type-aliases/SupportedChain.md), `"chainType"` \| `"chainId"` \| `"name"` \| `"required"`\>

## Properties

### chainId

> **chainId**: `string`

Unique identifier for the chain (e.g., '1' for Ethereum mainnet).

***

### chainType

> **chainType**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Type of blockchain (e.g., 'evm', 'solana', 'aztec').

***

### dappRpcConfig?

> `optional` **dappRpcConfig**: `object`

Configuration for dApp RPC endpoint behavior.

#### headers?

> `optional` **headers**: `Record`\<`string`, `string`\>

Custom headers to include in RPC requests

#### loadBalance?

> `optional` **loadBalance**: `boolean`

Whether to use round-robin load balancing across endpoints (default: true)

#### retries?

> `optional` **retries**: `number`

Number of retry attempts on failure (default: 3)

#### timeout?

> `optional` **timeout**: `number`

Timeout for RPC requests in milliseconds (default: 30000)

***

### dappRpcUrls?

> `optional` **dappRpcUrls**: `string`[]

dApp RPC endpoints for blockchain communication.
These endpoints are used by the dApp to read blockchain data,
separate from the wallet's RPC endpoints used for transaction submission.

#### Example

```typescript
dappRpcUrls: [
  'https://your-primary-node.com/rpc',
  'https://your-backup-node.com/rpc'
]
```

***

### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### Inherited from

`Omit.group`

***

### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain.

#### Overrides

`Omit.icon`

***

### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### Inherited from

`Omit.interfaces`

***

### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### Inherited from

`Omit.label`

***

### name

> **name**: `string`

Human-readable name of the chain.

***

### required

> **required**: `boolean`

Whether this chain is required for the dApp to function.
