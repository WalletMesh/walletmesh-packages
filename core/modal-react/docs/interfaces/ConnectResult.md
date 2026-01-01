[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ConnectResult

# Interface: ConnectResult

Defined in: [core/modal-react/src/hooks/useConnect.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L123)

React-specific connection result interface
Extends the core ConnectionResult with React-specific properties like walletId

## Properties

### address

> **address**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:129](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L129)

Primary address

***

### addresses

> **addresses**: `string`[]

Defined in: [core/modal-react/src/hooks/useConnect.ts:131](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L131)

All addresses

***

### chain

> **chain**: [`ChainConfig`](ChainConfig.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:127](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L127)

Connected chain

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:133](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L133)

Chain type

***

### walletId

> **walletId**: `string`

Defined in: [core/modal-react/src/hooks/useConnect.ts:125](https://github.com/WalletMesh/walletmesh-packages/blob/b1906ca43b241d63a6a2297002a6ed6bc2fa74f7/core/modal-react/src/hooks/useConnect.ts#L125)

Connected wallet ID
