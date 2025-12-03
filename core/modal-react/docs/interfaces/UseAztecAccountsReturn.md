[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseAztecAccountsReturn

# Interface: UseAztecAccountsReturn

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L29)

Account management hook return type

## Properties

### accounts

> **accounts**: [`AztecAccountInfo`](AztecAccountInfo.md)[]

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L31)

List of all registered accounts

***

### activeAccount

> **activeAccount**: `null` \| [`AztecAccountInfo`](AztecAccountInfo.md)

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L33)

The currently active account

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L41)

Any error that occurred

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L39)

Whether accounts are loading

***

### refresh()

> **refresh**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L43)

Refresh the account list

#### Returns

`Promise`\<`void`\>

***

### signMessage()

> **signMessage**: (`message`) => `Promise`\<`string`\>

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L37)

Sign a message with the current account

#### Parameters

##### message

`string`

#### Returns

`Promise`\<`string`\>

***

### switchAccount()

> **switchAccount**: (`address`) => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useAztecAccounts.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/e38976d6233dc88d01687129bd58c6b4d8daf702/core/modal-react/src/hooks/useAztecAccounts.ts#L35)

Switch to a different account

#### Parameters

##### address

`unknown`

#### Returns

`Promise`\<`void`\>
