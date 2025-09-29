[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TokenInfo

# Interface: TokenInfo

Defined in: [core/modal-react/src/hooks/useBalance.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useBalance.ts#L39)

Token information for balance queries

## Properties

### address

> **address**: `string`

Defined in: [core/modal-react/src/hooks/useBalance.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useBalance.ts#L41)

Token contract address (checksummed for EVM)

***

### decimals?

> `optional` **decimals**: `number`

Defined in: [core/modal-react/src/hooks/useBalance.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useBalance.ts#L47)

Token decimals (optional, will be fetched if not provided)

***

### name?

> `optional` **name**: `string`

Defined in: [core/modal-react/src/hooks/useBalance.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useBalance.ts#L45)

Token name (optional, for display purposes)

***

### symbol?

> `optional` **symbol**: `string`

Defined in: [core/modal-react/src/hooks/useBalance.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useBalance.ts#L43)

Token symbol (optional, will be fetched if not provided)
