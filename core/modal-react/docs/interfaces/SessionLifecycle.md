[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionLifecycle

# Interface: SessionLifecycle

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:232

Session lifecycle tracking

## Properties

### activeTime

> **activeTime**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:244

Total time spent active (milliseconds)

***

### createdAt

> **createdAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:234

When the session was created

***

### expiresAt?

> `optional` **expiresAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:240

When the session expires (optional)

***

### lastAccessedAt

> **lastAccessedAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:238

When the session was last accessed

***

### lastActiveAt

> **lastActiveAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:236

When the session was last active

***

### operationCount

> **operationCount**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:242

Number of operations performed in this session
