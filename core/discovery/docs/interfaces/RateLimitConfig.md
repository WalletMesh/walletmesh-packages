[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RateLimitConfig

# Interface: RateLimitConfig

Defined in: [core/discovery/src/types/security.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/security.ts#L60)

Rate limiting configuration for request throttling.

Prevents abuse and denial-of-service attacks by limiting the number
of requests from a single origin within a time window.

## Since

0.1.0

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [core/discovery/src/types/security.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/security.ts#L63)

***

### maxRequests

> **maxRequests**: `number`

Defined in: [core/discovery/src/types/security.ts:61](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/security.ts#L61)

***

### windowMs

> **windowMs**: `number`

Defined in: [core/discovery/src/types/security.ts:62](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/types/security.ts#L62)
