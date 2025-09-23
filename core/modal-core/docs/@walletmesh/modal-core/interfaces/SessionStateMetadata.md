[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionStateMetadata

# Interface: SessionStateMetadata

Session metadata and context information for session state

## Properties

### chainSwitches?

> `optional` **chainSwitches**: [`ChainSwitchRecord`](ChainSwitchRecord.md)[]

Chain switch history for this session

***

### connection

> **connection**: `object`

Connection context

#### initiatedBy

> **initiatedBy**: `"user"` \| `"auto"` \| `"dapp"`

How the connection was initiated

#### ipAddress?

> `optional` **ipAddress**: `string`

IP address (if available and permitted)

#### method

> **method**: `"extension"` \| `"injected"` \| `"manual"` \| `"deeplink"` \| `"qr"`

Method used for connection

#### userAgent?

> `optional` **userAgent**: `string`

User agent at connection time

***

### dapp

> **dapp**: `object`

dApp information at connection time

#### domain?

> `optional` **domain**: `string`

#### icon?

> `optional` **icon**: `string`

#### name

> **name**: `string`

#### url?

> `optional` **url**: `string`

***

### wallet

> **wallet**: `object`

Wallet information

#### icon

> **icon**: `string`

#### installUrl?

> `optional` **installUrl**: `string`

#### name

> **name**: `string`

#### version?

> `optional` **version**: `string`
