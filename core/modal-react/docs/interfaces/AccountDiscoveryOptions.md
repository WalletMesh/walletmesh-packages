[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AccountDiscoveryOptions

# Interface: AccountDiscoveryOptions

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:379

Account discovery options for multi-account wallets

## Properties

### derivationPathTemplate?

> `optional` **derivationPathTemplate**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:389

Derivation path template (for HD wallets)

***

### forceRefresh?

> `optional` **forceRefresh**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:387

Whether to force refresh even for known accounts

***

### gapLimit?

> `optional` **gapLimit**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:391

Gap limit for HD wallet discovery

***

### includeBalances?

> `optional` **includeBalances**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:385

Whether to include account balances

***

### limit?

> `optional` **limit**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:381

Maximum number of accounts to discover

***

### startIndex?

> `optional` **startIndex**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:383

Starting index for account discovery
