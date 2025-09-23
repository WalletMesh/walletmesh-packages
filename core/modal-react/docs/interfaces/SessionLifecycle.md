[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionLifecycle

# Interface: SessionLifecycle

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:125

Session lifecycle tracking

## Properties

### activeTime

> **activeTime**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:137

Total time spent active (milliseconds)

***

### createdAt

> **createdAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:127

When the session was created

***

### expiresAt?

> `optional` **expiresAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:133

When the session expires (optional)

***

### lastAccessedAt

> **lastAccessedAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:131

When the session was last accessed

***

### lastActiveAt

> **lastActiveAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:129

When the session was last active

***

### operationCount

> **operationCount**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:135

Number of operations performed in this session
