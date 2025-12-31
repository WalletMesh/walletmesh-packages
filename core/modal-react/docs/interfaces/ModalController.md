[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ModalController

# Interface: ModalController

Defined in: core/modal-core/dist/types.d.ts:446

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

Defined in: core/modal-core/dist/types.d.ts:535

Clean up resources

#### Returns

`void`

#### Remarks

Cleans up all resources including event listeners, subscriptions, and DOM elements.
Call this when the modal is no longer needed to prevent memory leaks.

***

### close()

> **close**(): `void`

Defined in: core/modal-core/dist/types.d.ts:464

Close the modal

#### Returns

`void`

#### Remarks

Closes the modal UI without affecting the connection state.

***

### connect()

> **connect**(`walletId?`): `Promise`\<[`ConnectionResult`](ConnectionResult.md)\>

Defined in: core/modal-core/dist/types.d.ts:485

Connect to a wallet

#### Parameters

##### walletId?

`string`

ID of the wallet to connect to. If not provided, opens modal for wallet selection

#### Returns

`Promise`\<[`ConnectionResult`](ConnectionResult.md)\>

A promise that resolves with the connection result

#### Throws

If the connection fails

***

### disconnect()

> **disconnect**(`walletId?`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/types.d.ts:492

Disconnect from the current wallet

#### Parameters

##### walletId?

`string`

Optional wallet ID to disconnect. If not provided, disconnects current wallet

#### Returns

`Promise`\<`void`\>

A promise that resolves when disconnection is complete

***

### getAvailableWallets()

> **getAvailableWallets**(): `Promise`\<[`WalletInfo`](WalletInfo.md) & `object`[]\>

Defined in: core/modal-core/dist/types.d.ts:525

Get available wallets with their availability status

#### Returns

`Promise`\<[`WalletInfo`](WalletInfo.md) & `object`[]\>

Promise resolving to wallets with availability status

#### Remarks

This method checks which wallets are actually available/installed in the user's browser.

***

### getState()

> **getState**(): `HeadlessModalState`

Defined in: core/modal-core/dist/types.d.ts:470

Get current modal state

#### Returns

`HeadlessModalState`

The current state of the modal

***

### goBack()

> **goBack**(): `void`

Defined in: core/modal-core/dist/types.d.ts:517

Navigate back to the previous view

#### Returns

`void`

#### Remarks

Goes back to the previous view in the navigation stack. If no previous view exists, defaults to wallet selection.

***

### open()

> **open**(`options?`): `void`

Defined in: core/modal-core/dist/types.d.ts:455

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

Defined in: core/modal-core/dist/types.d.ts:502

Reset the modal state

#### Returns

`void`

***

### selectWallet()

> **selectWallet**(`walletId`): `void`

Defined in: core/modal-core/dist/types.d.ts:498

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

Defined in: core/modal-core/dist/types.d.ts:510

Set the current modal view

#### Parameters

##### view

The view to display ('walletSelection', 'connecting', 'connected', 'error')

`"walletSelection"` | `"connecting"` | `"connected"` | `"error"`

#### Returns

`void`

#### Remarks

This allows programmatic navigation between modal views. Useful for custom flows.

***

### subscribe()

> **subscribe**(`callback`): () => `void`

Defined in: core/modal-core/dist/types.d.ts:477

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
