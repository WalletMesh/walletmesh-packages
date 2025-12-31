[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / UseNemiAccountReturn

# Interface: UseNemiAccountReturn

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L23)

Return type for useNemiAccount hook

## Properties

### account

> **account**: `unknown`

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L28)

The nemi SDK-compatible Account instance
null if not connected or still loading

***

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L38)

Error that occurred during account creation

***

### isConnected

> **isConnected**: `boolean`

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L48)

Whether connected to a wallet

***

### isLoading

> **isLoading**: `boolean`

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:33](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L33)

Whether the account is currently being created

***

### isReady

> **isReady**: `boolean`

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L43)

Whether an account is available and ready to use

***

### refresh()

> **refresh**: () => `Promise`\<`void`\>

Defined in: [core/modal-react/src/hooks/useNemiAccount.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useNemiAccount.ts#L53)

Manually refresh the account (e.g., after chain switch)

#### Returns

`Promise`\<`void`\>
