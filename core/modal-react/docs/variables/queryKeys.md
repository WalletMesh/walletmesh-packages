[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / queryKeys

# Variable: queryKeys

> `const` **queryKeys**: `object`

Defined in: core/modal-core/dist/services/query/queryKeys.d.ts:45

Query key factory for WalletMesh queries

Provides a hierarchical system of query keys that enables:
- Granular cache invalidation (invalidate all or specific queries)
- Type-safe key generation
- Consistent key structure across the application
- Efficient query matching and filtering

## Type Declaration

### all

> `readonly` **all**: readonly \[`"walletmesh"`\]

Root key for all WalletMesh queries
Use this to invalidate the entire cache

### balance

> `readonly` **balance**: `object`

Balance-related query keys

Handles both native currency and token balance queries.
Organized by chain and address for efficient invalidation.

#### balance.all()

> `readonly` **all**: () => readonly \[`"walletmesh"`, `"balance"`\]

All balance queries
Use to invalidate all balance data

##### Returns

readonly \[`"walletmesh"`, `"balance"`\]

#### balance.byAddress()

> `readonly` **byAddress**: (`address`) => readonly \[`"walletmesh"`, `"balance"`, `"address"`, `string`\]

All balances for a specific address
Useful for invalidating all balances when switching accounts

##### Parameters

###### address

`string`

The wallet address

##### Returns

readonly \[`"walletmesh"`, `"balance"`, `"address"`, `string`\]

Query key for all balances of an address

#### balance.byChain()

> `readonly` **byChain**: (`chainId`) => readonly \[`"walletmesh"`, `"balance"`, `"chain"`, `string`\]

All balances for a specific chain
Useful for invalidating all balances when switching chains

##### Parameters

###### chainId

`string`

The blockchain identifier

##### Returns

readonly \[`"walletmesh"`, `"balance"`, `"chain"`, `string`\]

Query key for all balances on a chain

#### balance.native()

> `readonly` **native**: (`chainId`, `address`) => readonly \[`"walletmesh"`, `"balance"`, `"native"`, `string`, `string`\]

Native currency balance queries

##### Parameters

###### chainId

`string`

The blockchain identifier

###### address

`string`

The wallet address

##### Returns

readonly \[`"walletmesh"`, `"balance"`, `"native"`, `string`, `string`\]

Query key for native balance

##### Example

```typescript
const key = queryKeys.balance.native('1', '0x123...');
// Use in query
useQuery({
  queryKey: key,
  queryFn: () => fetchNativeBalance(...)
});
```

#### balance.token()

> `readonly` **token**: (`chainId`, `address`, `tokenAddress`) => readonly \[`"walletmesh"`, `"balance"`, `"token"`, `string`, `string`, `string`\]

Token balance queries

##### Parameters

###### chainId

`string`

The blockchain identifier

###### address

`string`

The wallet address

###### tokenAddress

`string`

The token contract address

##### Returns

readonly \[`"walletmesh"`, `"balance"`, `"token"`, `string`, `string`, `string`\]

Query key for token balance

##### Example

```typescript
const key = queryKeys.balance.token('1', '0x123...', '0xUSDC...');
// Use in query
useQuery({
  queryKey: key,
  queryFn: () => fetchTokenBalance(...)
});
```

### chain

> `readonly` **chain**: `object`

Chain-related query keys

Handles chain information, gas prices, and network status.

#### chain.all()

> `readonly` **all**: () => readonly \[`"walletmesh"`, `"chain"`\]

All chain queries

##### Returns

readonly \[`"walletmesh"`, `"chain"`\]

#### chain.gasPrice()

> `readonly` **gasPrice**: (`chainId`) => readonly \[`"walletmesh"`, `"chain"`, `"gasPrice"`, `string`\]

Gas price queries

##### Parameters

###### chainId

`string`

The blockchain identifier

##### Returns

readonly \[`"walletmesh"`, `"chain"`, `"gasPrice"`, `string`\]

Query key for gas prices

#### chain.info()

> `readonly` **info**: (`chainId`) => readonly \[`"walletmesh"`, `"chain"`, `"info"`, `string`\]

Chain information

##### Parameters

###### chainId

`string`

The blockchain identifier

##### Returns

readonly \[`"walletmesh"`, `"chain"`, `"info"`, `string`\]

Query key for chain info

#### chain.status()

> `readonly` **status**: (`chainId`) => readonly \[`"walletmesh"`, `"chain"`, `"status"`, `string`\]

Network status

##### Parameters

###### chainId

`string`

The blockchain identifier

##### Returns

readonly \[`"walletmesh"`, `"chain"`, `"status"`, `string`\]

Query key for network status

### contract

> `readonly` **contract**: `object`

Contract-related query keys

Handles contract reads, ABI queries, and metadata lookups.
Supports filtering by chain, address, and method signature.

#### contract.abi()

> `readonly` **abi**: (`chainId`, `address`) => readonly \[`"walletmesh"`, `"contract"`, `"abi"`, `string`, `string`\]

Contract ABI queries

##### Parameters

###### chainId

`string`

The blockchain identifier

###### address

`string`

The contract address

##### Returns

readonly \[`"walletmesh"`, `"contract"`, `"abi"`, `string`, `string`\]

Query key for contract ABI

##### Example

```typescript
const key = queryKeys.contract.abi('1', '0xUSDC...');
// Use for caching contract ABIs
useQuery({
  queryKey: key,
  queryFn: () => fetchContractABI(chainId, address)
});
```

#### contract.all()

> `readonly` **all**: () => readonly \[`"walletmesh"`, `"contract"`\]

All contract queries
Use to invalidate all contract data

##### Returns

readonly \[`"walletmesh"`, `"contract"`\]

#### contract.byAddress()

> `readonly` **byAddress**: (`chainId`, `address`) => readonly \[`"walletmesh"`, `"contract"`, `"address"`, `string`, `string`\]

All queries for a specific contract
Useful for invalidating all data related to a contract

##### Parameters

###### chainId

`string`

The blockchain identifier

###### address

`string`

The contract address

##### Returns

readonly \[`"walletmesh"`, `"contract"`, `"address"`, `string`, `string`\]

Query key for all contract queries

#### contract.byChain()

> `readonly` **byChain**: (`chainId`) => readonly \[`"walletmesh"`, `"contract"`, `"chain"`, `string`\]

All contract queries for a specific chain
Useful for invalidating all contracts when switching chains

##### Parameters

###### chainId

`string`

The blockchain identifier

##### Returns

readonly \[`"walletmesh"`, `"contract"`, `"chain"`, `string`\]

Query key for all contracts on a chain

#### contract.metadata()

> `readonly` **metadata**: (`chainId`, `address`) => readonly \[`"walletmesh"`, `"contract"`, `"metadata"`, `string`, `string`\]

Contract metadata queries
For caching token metadata like name, symbol, decimals

##### Parameters

###### chainId

`string`

The blockchain identifier

###### address

`string`

The contract address

##### Returns

readonly \[`"walletmesh"`, `"contract"`, `"metadata"`, `string`, `string`\]

Query key for contract metadata

#### contract.read()

> `readonly` **read**: (`chainId`, `address`, `methodSig`, `params?`) => readonly \[`"walletmesh"`, `"contract"`, `"read"`, `string`, `string`, `string`, `...unknown[]`\]

Contract read operation queries

##### Parameters

###### chainId

`string`

The blockchain identifier

###### address

`string`

The contract address

###### methodSig

`string`

The method signature (e.g., 'balanceOf(address)')

###### params?

readonly `unknown`[]

Optional method parameters

##### Returns

readonly \[`"walletmesh"`, `"contract"`, `"read"`, `string`, `string`, `string`, `...unknown[]`\]

Query key for contract read

##### Example

```typescript
const key = queryKeys.contract.read('1', '0xUSDC...', 'balanceOf(address)', ['0x123...']);
// Use for caching contract method calls
useQuery({
  queryKey: key,
  queryFn: () => readContractMethod(...)
});
```

### ens

> `readonly` **ens**: `object`

ENS (Ethereum Name Service) related queries

#### ens.all()

> `readonly` **all**: () => readonly \[`"walletmesh"`, `"ens"`\]

All ENS queries

##### Returns

readonly \[`"walletmesh"`, `"ens"`\]

#### ens.avatar()

> `readonly` **avatar**: (`nameOrAddress`) => readonly \[`"walletmesh"`, `"ens"`, `"avatar"`, `string`\]

ENS avatar lookup

##### Parameters

###### nameOrAddress

`string`

ENS name or address

##### Returns

readonly \[`"walletmesh"`, `"ens"`, `"avatar"`, `string`\]

Query key for ENS avatar

#### ens.name()

> `readonly` **name**: (`address`) => readonly \[`"walletmesh"`, `"ens"`, `"name"`, `string`\]

ENS name lookup

##### Parameters

###### address

`string`

The Ethereum address

##### Returns

readonly \[`"walletmesh"`, `"ens"`, `"name"`, `string`\]

Query key for ENS name

### transaction

> `readonly` **transaction**: `object`

Transaction-related query keys

Handles transaction details, history, and status queries.
Supports filtering by address, chain, and transaction ID.

#### transaction.all()

> `readonly` **all**: () => readonly \[`"walletmesh"`, `"transaction"`\]

All transaction queries
Use to invalidate all transaction data

##### Returns

readonly \[`"walletmesh"`, `"transaction"`\]

#### transaction.detail()

> `readonly` **detail**: (`txId`) => readonly \[`"walletmesh"`, `"transaction"`, `"detail"`, `string`\]

Single transaction details

##### Parameters

###### txId

`string`

The transaction hash or ID

##### Returns

readonly \[`"walletmesh"`, `"transaction"`, `"detail"`, `string`\]

Query key for transaction details

##### Example

```typescript
const key = queryKeys.transaction.detail('0xabc...');
// Use for tracking transaction status
useQuery({
  queryKey: key,
  queryFn: () => fetchTransactionStatus(txId)
});
```

#### transaction.history()

> `readonly` **history**: (`address`, `chainId?`) => readonly `unknown`[]

Transaction history queries

##### Parameters

###### address

`string`

The wallet address

###### chainId?

`string`

Optional chain filter

##### Returns

readonly `unknown`[]

Query key for transaction history

##### Example

```typescript
// All transactions for an address
const key = queryKeys.transaction.history('0x123...');

// Transactions on specific chain
const key = queryKeys.transaction.history('0x123...', '1');
```

#### transaction.pending()

> `readonly` **pending**: (`address?`) => readonly `unknown`[]

Pending transactions

##### Parameters

###### address?

`string`

Optional address filter

##### Returns

readonly `unknown`[]

Query key for pending transactions

### wallet

> `readonly` **wallet**: `object`

Wallet-related query keys

Handles wallet discovery, capabilities, and metadata queries.

#### wallet.all()

> `readonly` **all**: () => readonly \[`"walletmesh"`, `"wallet"`\]

All wallet queries

##### Returns

readonly \[`"walletmesh"`, `"wallet"`\]

#### wallet.available()

> `readonly` **available**: () => readonly \[`"walletmesh"`, `"wallet"`, `"available"`\]

Available wallets discovery

##### Returns

readonly \[`"walletmesh"`, `"wallet"`, `"available"`\]

Query key for wallet discovery

#### wallet.capabilities()

> `readonly` **capabilities**: (`walletId`) => readonly \[`"walletmesh"`, `"wallet"`, `"capabilities"`, `string`\]

Wallet capabilities and features

##### Parameters

###### walletId

`string`

The wallet identifier

##### Returns

readonly \[`"walletmesh"`, `"wallet"`, `"capabilities"`, `string`\]

Query key for wallet capabilities

#### wallet.metadata()

> `readonly` **metadata**: (`walletId`) => readonly \[`"walletmesh"`, `"wallet"`, `"metadata"`, `string`\]

Wallet metadata

##### Parameters

###### walletId

`string`

The wallet identifier

##### Returns

readonly \[`"walletmesh"`, `"wallet"`, `"metadata"`, `string`\]

Query key for wallet metadata

## Remarks

The key structure follows a hierarchical pattern:
- Root: ['walletmesh'] - invalidates everything
- Domain: ['walletmesh', 'balance'] - invalidates all balance queries
- Specific: ['walletmesh', 'balance', 'native', chainId, address] - invalidates specific query

## Example

```typescript
import { queryKeys } from '@walletmesh/modal-core';

// Get specific query key
const key = queryKeys.balance.native('1', '0x123...');
// Returns: ['walletmesh', 'balance', 'native', '1', '0x123...']

// Invalidate all balance queries
queryClient.invalidateQueries({
  queryKey: queryKeys.balance.all()
});

// Invalidate all queries
queryClient.invalidateQueries({
  queryKey: queryKeys.all
});
```
