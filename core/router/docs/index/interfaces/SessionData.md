[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionData

# Interface: SessionData

Defined in: [core/router/src/types.ts:240](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L240)

Session data structure representing an active wallet connection.
Contains metadata about the session including its unique identifier
and the origin that initiated the connection.

## Properties

### id

> **id**: `string`

Defined in: [core/router/src/types.ts:242](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L242)

Unique session identifier

***

### origin

> **origin**: `string`

Defined in: [core/router/src/types.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L244)

Origin of the session request (e.g., "https://app.example.com")
