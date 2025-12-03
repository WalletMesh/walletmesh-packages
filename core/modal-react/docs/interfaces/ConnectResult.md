[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectResult

# Interface: ConnectResult

Defined in: [core/modal-react/src/hooks/useConnect.ts:121](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L121)

React-specific connection result interface
Extends the core ConnectionResult with React-specific properties like walletId

## Properties

### address

> **address**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:127](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L127)

Primary address

***

### addresses

> **addresses**: `string`[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:129](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L129)

All addresses

***

### chain

> **chain**: [`ChainConfig`](ChainConfig.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L125)

Connected chain

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L131)

Chain type

***

### walletId

> **walletId**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useConnect.ts#L123)

Connected wallet ID
