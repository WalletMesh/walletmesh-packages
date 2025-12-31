[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EventSubscriptionOptions

# Interface: EventSubscriptionOptions

Event subscription options

Advanced options for fine-grained control over event subscriptions.
Enables filtering, transformation, and prioritization of event handlers.

## Example

```typescript
// Subscribe only to MetaMask events
const options: EventSubscriptionOptions = {
  walletId: 'metamask',
  priority: 10, // Higher priority than default
  filter: (event) => event.accounts?.length > 0,
  transform: (event) => ({ ...event, normalized: true })
};

eventSystem.on('connection:established', handler, options);
```

## Properties

### chain?

> `optional` **chain**: `object`

Only receive events from specific chain

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

***

### filter()?

> `optional` **filter**: (`event`) => `boolean`

Filter events based on custom criteria

#### Parameters

##### event

`unknown`

#### Returns

`boolean`

***

### once?

> `optional` **once**: `boolean`

Subscribe only once

***

### priority?

> `optional` **priority**: `number`

Priority for event handling (higher = earlier)

***

### transform()?

> `optional` **transform**: (`event`) => `unknown`

Transform event data before calling handler

#### Parameters

##### event

`unknown`

#### Returns

`unknown`

***

### walletId?

> `optional` **walletId**: `string`

Only receive events from specific wallet
