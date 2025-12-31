[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletEventMap

# Interface: WalletEventMap

Core wallet events

Type-safe event map defining all possible events in the wallet lifecycle.
Each event includes relevant data and a timestamp for tracking.

## Example

```typescript
// Type-safe event subscription
eventSystem.on('connection:established', (event) => {
  // TypeScript knows event has walletId, connection, timestamp
  console.log(`Connected wallet ${event.walletId} at ${event.timestamp}`);
});

// Filtered subscription for specific wallet
eventSystem.on('accounts:changed', (event) => {
  updateAccountList(event.accounts);
}, { walletId: 'metamask' });
```

## Properties

### account:selected

> **account:selected**: `object`

#### account

> **account**: `string`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### accounts:changed

> **accounts:changed**: `object`

#### accounts

> **accounts**: `string`[]

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### active\_wallet:changed

> **active\_wallet:changed**: `object`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### chain:switch\_failed

> **chain:switch\_failed**: `object`

#### chain

> **chain**: `object`

##### chain.chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

##### chain.chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

##### chain.group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

##### chain.icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

##### chain.interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

##### chain.label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

##### chain.name

> **name**: `string`

Human-readable name of the chain

##### chain.required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### error

> **error**: `Error`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### chain:switched

> **chain:switched**: `object`

#### fromChain

> **fromChain**: `object`

##### fromChain.chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

##### fromChain.chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

##### fromChain.group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

##### fromChain.icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

##### fromChain.interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

##### fromChain.label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

##### fromChain.name

> **name**: `string`

Human-readable name of the chain

##### fromChain.required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### isNewChain

> **isNewChain**: `boolean`

#### sessionId

> **sessionId**: `string`

#### timestamp

> **timestamp**: `number`

#### toChain

> **toChain**: `object`

##### toChain.chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

##### toChain.chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

##### toChain.group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

##### toChain.icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

##### toChain.interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

##### toChain.label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

##### toChain.name

> **name**: `string`

Human-readable name of the chain

##### toChain.required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### walletId

> **walletId**: `string`

***

### chain:switching

> **chain:switching**: `object`

#### timestamp

> **timestamp**: `number`

#### toChain

> **toChain**: `object`

##### toChain.chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

##### toChain.chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

##### toChain.group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

##### toChain.icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

##### toChain.interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

##### toChain.label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

##### toChain.name

> **name**: `string`

Human-readable name of the chain

##### toChain.required

> **required**: `boolean`

Whether this chain is required for the dApp to function

#### walletId

> **walletId**: `string`

***

### client:destroyed

> **client:destroyed**: `object`

#### timestamp

> **timestamp**: `number`

***

### client:initialized

> **client:initialized**: `object`

#### timestamp

> **timestamp**: `number`

***

### connection:added

> **connection:added**: [`WalletConnection`](WalletConnection.md)

***

### connection:changed

> **connection:changed**: [`WalletConnection`](WalletConnection.md)

***

### connection:established

> **connection:established**: [`ConnectionEstablishedEvent`](ConnectionEstablishedEvent.md)

***

### connection:failed

> **connection:failed**: `object`

#### error

> **error**: `Error`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### connection:initiated

> **connection:initiated**: `object`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### connection:lost

> **connection:lost**: `object`

#### reason?

> `optional` **reason**: `string`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### connection:removed

> **connection:removed**: `object`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### connection:restored

> **connection:restored**: `object`

#### connection

> **connection**: [`WalletConnection`](WalletConnection.md)

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### discovery:event

> **discovery:event**: `object`

#### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

#### timestamp

> **timestamp**: `number`

#### type

> **type**: `"wallet_discovered"` \| `"wallet_available"` \| `"wallet_unavailable"`

#### walletInfo

> **walletInfo**: `unknown`

***

### error:connection

> **error:connection**: `object`

#### error

> **error**: `Error`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### error:global

> **error:global**: `object`

#### context

> **context**: `string`

#### error

> **error**: `Error`

#### timestamp

> **timestamp**: `number`

***

### error:wallet

> **error:wallet**: `object`

#### error

> **error**: `Error`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### modal:closed

> **modal:closed**: `object`

#### timestamp

> **timestamp**: `number`

***

### modal:opened

> **modal:opened**: `object`

#### timestamp

> **timestamp**: `number`

***

### provider:error

> **provider:error**: `object`

#### error

> **error**: `Error`

#### timestamp

> **timestamp**: `number`

#### walletId

> **walletId**: `string`

***

### view:changed

> **view:changed**: `object`

#### from

> **from**: `string`

#### timestamp

> **timestamp**: `number`

#### to

> **to**: `string`

***

### view:changing

> **view:changing**: `object`

#### from

> **from**: `string`

#### timestamp

> **timestamp**: `number`

#### to

> **to**: `string`
