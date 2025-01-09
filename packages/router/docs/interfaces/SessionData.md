[**@walletmesh/router v0.2.5**](../README.md)

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

[packages/router/src/types.ts:242](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L242)

***

### origin

> **origin**: `string`

Origin of the session request (e.g., "https://app.example.com")

#### Defined in

[packages/router/src/types.ts:244](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L244)
