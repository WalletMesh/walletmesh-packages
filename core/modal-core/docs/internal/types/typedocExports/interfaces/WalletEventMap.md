[**@walletmesh/modal-core v0.0.2**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / WalletEventMap

# Interface: WalletEventMap

Event map defining wallet JSON-RPC events for type-safe communication

## Indexable

\[`event`: `string`\]: `unknown`

## Properties

### accountsChanged

> **accountsChanged**: `string`[]

***

### chainChanged

> **chainChanged**: `string`

***

### connect

> **connect**: `object`

#### accounts

> **accounts**: `string`[]

#### chainId

> **chainId**: `string`

***

### disconnect

> **disconnect**: `object`

#### code

> **code**: `number`

#### message

> **message**: `string`

***

### message

> **message**: `object`

#### data

> **data**: `unknown`

#### type

> **type**: `string`
