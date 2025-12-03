[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionEventMap

# Interface: SessionEventMap

Session event types

## Properties

### session:account-switched

> **session:account-switched**: `object`

#### selectionRecord

> **selectionRecord**: [`AccountSelectionRecord`](AccountSelectionRecord.md)

#### sessionId

> **sessionId**: `string`

***

### session:accounts-discovered

> **session:accounts-discovered**: `object`

#### accounts

> **accounts**: [`AccountInfo`](AccountInfo.md)[]

#### sessionId

> **sessionId**: `string`

***

### session:chain-switched

> **session:chain-switched**: `object`

#### sessionId

> **sessionId**: `string`

#### switchRecord

> **switchRecord**: [`ChainSwitchRecord`](ChainSwitchRecord.md)

***

### session:created

> **session:created**: `object`

#### session

> **session**: [`SessionState`](SessionState.md)

***

### session:ended

> **session:ended**: `object`

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

***

### session:error

> **session:error**: `object`

#### error

> **error**: `Error`

#### sessionId

> **sessionId**: `string`

***

### session:expired

> **session:expired**: `object`

#### expiresAt

> **expiresAt**: `number`

#### sessionId

> **sessionId**: `string`

***

### session:status-changed

> **session:status-changed**: `object`

#### previousStatus

> **previousStatus**: [`SessionStatus`](../type-aliases/SessionStatus.md)

#### sessionId

> **sessionId**: `string`

#### status

> **status**: [`SessionStatus`](../type-aliases/SessionStatus.md)

***

### session:updated

> **session:updated**: `object`

#### changes

> **changes**: `Partial`\<[`SessionState`](SessionState.md)\>

#### session

> **session**: [`SessionState`](SessionState.md)
