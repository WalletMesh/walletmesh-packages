[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / UIState

# Interface: UIState

UI state interface

## Properties

### connectionProgress?

> `optional` **connectionProgress**: `number`

Connection progress percentage (0-100)

***

### currentView

> **currentView**: `"connecting"` \| `"connected"` \| `"error"` \| `"wallet-selection"` \| `"account-details"`

Current modal view

***

### errorMessage?

> `optional` **errorMessage**: `string`

Error message

***

### isLoading

> **isLoading**: `boolean`

Whether UI is loading

***

### isModalOpen

> **isModalOpen**: `boolean`

Whether modal is open

***

### loadingMessage?

> `optional` **loadingMessage**: `string`

Loading message

***

### selectedWallet?

> `optional` **selectedWallet**: [`WalletInfo`](WalletInfo.md)

Selected wallet for connection
