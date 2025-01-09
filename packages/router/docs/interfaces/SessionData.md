[**@walletmesh/router v0.2.4**](../README.md)

***

[@walletmesh/router](../globals.md) / SessionData

# Interface: SessionData

Session data structure representing an active wallet connection.
Contains metadata about the session including its unique identifier
and the origin that initiated the connection.

## Properties

### id

> **id**: `string`

Unique session identifier

#### Defined in

[packages/router/src/types.ts:242](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L242)

***

### origin

> **origin**: `string`

Origin of the session request (e.g., "https://app.example.com")

#### Defined in

[packages/router/src/types.ts:244](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L244)
