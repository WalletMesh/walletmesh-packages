[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / granularHooks

# Variable: granularHooks

> `const` **granularHooks**: `object`

Defined in: [core/modal-react/src/hooks/granular/index.ts:252](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/granular/index.ts#L252)

Export all hooks for convenience

## Type Declaration

### useActiveSession()

> **useActiveSession**: () => `null` \| [`SessionState`](../interfaces/SessionState.md)

Hook to get only the active session
Re-renders only when active session changes

#### Returns

`null` \| [`SessionState`](../interfaces/SessionState.md)

### useActiveWallet()

> **useActiveWallet**: () => `null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Hook to get only the active wallet
Re-renders only when active wallet changes

#### Returns

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

### useAddress()

> **useAddress**: () => `null` \| `string`

Hook to get only the address from active session
Re-renders only when address changes

#### Returns

`null` \| `string`

### useAddresses()

> **useAddresses**: () => `string`[]

Hook to get all addresses from active session
Re-renders only when addresses change

#### Returns

`string`[]

### useAvailableWallets()

> **useAvailableWallets**: () => [`WalletInfo`](../interfaces/WalletInfo.md)[]

Hook to get available wallets
Re-renders only when available wallets change

#### Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

### useChainId()

> **useChainId**: () => `null` \| `string`

Hook to get only the chain ID from active session
Re-renders only when chain changes

#### Returns

`null` \| `string`

### useChainType()

> **useChainType**: () => `null` \| [`ChainType`](../enumerations/ChainType.md)

Hook to get only the chain type from active session
Re-renders only when chain type changes

#### Returns

`null` \| [`ChainType`](../enumerations/ChainType.md)

### useConnectionError()

> **useConnectionError**: () => `undefined` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

Hook to get connection error
Re-renders only when connection error changes

#### Returns

`undefined` \| \{ `category`: `"wallet"` \| `"user"` \| `"network"` \| `"general"` \| `"validation"` \| `"sandbox"`; `cause?`: `unknown`; `classification?`: `"network"` \| `"permission"` \| `"provider"` \| `"temporary"` \| `"permanent"` \| `"unknown"`; `code`: `string`; `data?`: `Record`\<`string`, `unknown`\>; `maxRetries?`: `number`; `message`: `string`; `recoveryStrategy?`: `"none"` \| `"retry"` \| `"wait_and_retry"` \| `"manual_action"`; `retryDelay?`: `number`; \}

### useConnectionStatus()

> **useConnectionStatus**: () => `"connecting"` \| `"connected"` \| `"disconnected"`

Hook to get only the connection status
Re-renders only when connection status changes

#### Returns

`"connecting"` \| `"connected"` \| `"disconnected"`

### useFilteredWallets()

> **useFilteredWallets**: () => [`WalletInfo`](../interfaces/WalletInfo.md)[]

Hook to get filtered wallets (with filter applied)
Re-renders only when filtered wallets change

#### Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

### useGranularValues()

> **useGranularValues**: \<`T`\>(`selector`) => `T`

Hook composition helper for multiple granular values
Only re-renders when specific selected values change

#### Type Parameters

##### T

`T`

#### Parameters

##### selector

(`state`) => `T`

#### Returns

`T`

#### Example

```tsx
const { address, chainId, isConnected } = useGranularValues(
  state => ({
    address: getActiveSession(state)?.activeAccount?.address,
    chainId: getActiveSession(state)?.chain?.chainId,
    isConnected: getConnectionStatus(state) === 'connected'
  })
);
```

### useIsConnected()

> **useIsConnected**: () => `boolean`

Hook to check if connected (boolean only)
Re-renders only when connected state changes

#### Returns

`boolean`

### useIsConnecting()

> **useIsConnecting**: () => `boolean`

Hook to check if connecting (boolean only)
Re-renders only when connecting state changes

#### Returns

`boolean`

### useIsDiscovering()

> **useIsDiscovering**: () => `boolean`

Hook to check if discovering wallets
Re-renders only when discovery state changes

#### Returns

`boolean`

### useIsModalOpen()

> **useIsModalOpen**: () => `boolean`

Hook to check if modal is open
Re-renders only when modal open state changes

#### Returns

`boolean`

### useIsWalletAvailable()

> **useIsWalletAvailable**: (`walletId`) => `boolean`

Hook to check if a specific wallet is available
Re-renders only when that wallet's availability changes

#### Parameters

##### walletId

`string`

#### Returns

`boolean`

### useModalView()

> **useModalView**: () => [`ModalView`](../type-aliases/ModalView.md)

Hook to get current modal view
Re-renders only when view changes

#### Returns

[`ModalView`](../type-aliases/ModalView.md)

### useSelectedWallet()

> **useSelectedWallet**: () => `null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Hook to get only the selected wallet (before connection)
Re-renders only when selected wallet changes

#### Returns

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

### useTransactionStatus()

> **useTransactionStatus**: () => [`TransactionStatus`](../type-aliases/TransactionStatus.md)

Hook to get transaction status
Re-renders only when transaction status changes

#### Returns

[`TransactionStatus`](../type-aliases/TransactionStatus.md)

### useWalletIcon()

> **useWalletIcon**: () => `null` \| `string`

Hook to get wallet icon from active wallet
Re-renders only when wallet icon changes

#### Returns

`null` \| `string`

### useWalletName()

> **useWalletName**: () => `null` \| `string`

Hook to get wallet name from active wallet
Re-renders only when wallet name changes

#### Returns

`null` \| `string`
