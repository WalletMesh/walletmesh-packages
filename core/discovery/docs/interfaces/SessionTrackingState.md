[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SessionTrackingState

# Interface: SessionTrackingState

Defined in: [core/discovery/src/types/security.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L92)

Session tracking state for managing active discovery sessions.

Maintains the internal state needed for session validation, rate limiting,
and cleanup. Used by responders to prevent session replay attacks and
enforce rate limits.

## Since

0.1.0

## Properties

### lastCleanup

> **lastCleanup**: `number`

Defined in: [core/discovery/src/types/security.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L96)

***

### requestCounts

> **requestCounts**: `Map`\<`string`, `object`[]\>

Defined in: [core/discovery/src/types/security.ts:95](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L95)

***

### sessionTimestamps

> **sessionTimestamps**: `Map`\<`string`, `Map`\<`string`, `number`\>\>

Defined in: [core/discovery/src/types/security.ts:94](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L94)

***

### usedSessions

> **usedSessions**: `Map`\<`string`, `Set`\<`string`\>\>

Defined in: [core/discovery/src/types/security.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L93)
