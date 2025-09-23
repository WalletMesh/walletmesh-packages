[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionData

# Interface: SessionData

Defined in: [core/router/src/types.ts:213](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L213)

Session data structure representing an active wallet connection.
Contains metadata about the session including its unique identifier
and the origin that initiated the connection.

## Properties

### id

> **id**: `string`

Defined in: [core/router/src/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L215)

Unique session identifier

***

### origin

> **origin**: `string`

Defined in: [core/router/src/types.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L217)

Origin of the session request (e.g., "https://app.example.com")
