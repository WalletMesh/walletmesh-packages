[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionData

# Interface: SessionData

Defined in: [core/router/src/types.ts:213](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L213)

Session data structure representing an active wallet connection.
Contains metadata about the session including its unique identifier,
the origin that initiated the connection, and approved permissions.

## Properties

### createdAt

> **createdAt**: `number`

Defined in: [core/router/src/types.ts:221](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L221)

Timestamp when the session was created (milliseconds since epoch)

***

### id

> **id**: `string`

Defined in: [core/router/src/types.ts:215](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L215)

Unique session identifier

***

### origin

> **origin**: `string`

Defined in: [core/router/src/types.ts:217](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L217)

Origin of the session request (e.g., "https://app.example.com")

***

### permissions?

> `optional` **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

Defined in: [core/router/src/types.ts:219](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L219)

Approved permissions for this session (persisted across page refreshes)
