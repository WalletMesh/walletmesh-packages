[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ModalController

# Interface: ModalController

Interface for modal controller

## Remarks

Primary interface for controlling the wallet connection modal.
Provides methods for opening/closing the modal, connecting to wallets,
and subscribing to modal events.

## Example

```typescript
// Create a modal controller
const modal = createModal({
  wallets: [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'https://example.com/metamask-icon.png',
      chains: [ChainType.Evm]
    }
  ]
});

// Open the modal
modal.open();

// Check connection state
const state = modal.getState();
if (state.connection.status === 'connected') {
  console.log('Wallet connected!');
}
```
 ModalController

## Methods

### cleanup()

> **cleanup**(): `void`

Clean up resources

#### Returns

`void`

#### Remarks

Cleans up all resources including event listeners, subscriptions, and DOM elements.
Call this when the modal is no longer needed to prevent memory leaks.

***

### close()

> **close**(): `void`

Close the modal

#### Returns

`void`

#### Remarks

Closes the modal UI without affecting the connection state.

***

### connect()

> **connect**(`walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionResult`](ConnectionResult.md)\>

Connect to a wallet

#### Parameters

##### walletId?

`string`

ID of the wallet to connect to. If not provided, opens modal for wallet selection

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionResult`](ConnectionResult.md)\>

A promise that resolves with the connection result

#### Throws

If the connection fails

***

### disconnect()

> **disconnect**(`walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from the current wallet

#### Parameters

##### walletId?

`string`

Optional wallet ID to disconnect. If not provided, disconnects current wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when disconnection is complete

***

### getAvailableWallets()

> **getAvailableWallets**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletInfo`](WalletInfo.md) & `object`[]\>

Get available wallets with their availability status

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletInfo`](WalletInfo.md) & `object`[]\>

Promise resolving to wallets with availability status

#### Remarks

This method checks which wallets are actually available/installed in the user's browser.

***

### getState()

> **getState**(): [`HeadlessModalState`](HeadlessModalState.md)

Get current modal state

#### Returns

[`HeadlessModalState`](HeadlessModalState.md)

The current state of the modal

***

### goBack()

> **goBack**(): `void`

Navigate back to the previous view

#### Returns

`void`

#### Remarks

Goes back to the previous view in the navigation stack. If no previous view exists, defaults to wallet selection.

***

### open()

> **open**(`options?`): `void`

Open the modal

#### Parameters

##### options?

Optional parameters including targetChainType for filtering wallets

###### targetChainType?

[`ChainType`](../enumerations/ChainType.md)

#### Returns

`void`

#### Remarks

Opens the modal UI, showing the wallet selection screen or the last view.
If targetChainType is provided, only wallets supporting that chain type will be shown.

***

### reset()

> **reset**(): `void`

Reset the modal state

#### Returns

`void`

***

### selectWallet()

> **selectWallet**(`walletId`): `void`

Select a wallet for connection

#### Parameters

##### walletId

`string`

ID of the wallet to select

#### Returns

`void`

***

### setView()

> **setView**(`view`): `void`

Set the current modal view

#### Parameters

##### view

The view to display ('walletSelection', 'connecting', 'connected', 'error')

`"connecting"` | `"connected"` | `"error"` | `"walletSelection"`

#### Returns

`void`

#### Remarks

This allows programmatic navigation between modal views. Useful for custom flows.

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Subscribe to modal state changes

#### Parameters

##### callback

(`state`) => `void`

Function to call when state changes

#### Returns

A function that can be called to unsubscribe

> (): `void`

##### Returns

`void`
