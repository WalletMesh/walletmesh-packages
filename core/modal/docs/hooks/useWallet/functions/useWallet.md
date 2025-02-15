[**@walletmesh/modal v0.0.6**](../../../README.md)

***

[@walletmesh/modal](../../../modules.md) / [hooks/useWallet](../README.md) / useWallet

# Function: useWallet()

> **useWallet**(`options`): `object`

Defined in: [core/modal/src/hooks/useWallet.ts:243](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/hooks/useWallet.ts#L243)

React hook for managing wallet connections and state.

Provides functionality for:
- Connecting/disconnecting wallets
- Managing connection state
- Handling wallet modal visibility
- Session persistence and restoration

## Parameters

### options

[`UseWalletOptions`](../interfaces/UseWalletOptions.md)

Configuration options for the hook

## Returns

`object`

Object containing wallet state and control functions

### connectionStatus

> **connectionStatus**: [`ConnectionStatus`](../../../index/enumerations/ConnectionStatus.md) = `walletState.status`

### connectedWallet

> **connectedWallet**: `null` \| [`ConnectedWallet`](../../../index/interfaces/ConnectedWallet.md) = `walletState.wallet`

### connectWallet()

> **connectWallet**: (`wallet`) => `Promise`\<`void`\>

#### Parameters

##### wallet

[`WalletInfo`](../../../index/interfaces/WalletInfo.md)

#### Returns

`Promise`\<`void`\>

### disconnectWallet()

> **disconnectWallet**: (`options`) => `Promise`\<`void`\>

#### Parameters

##### options

[`DisconnectOptions`](../interfaces/DisconnectOptions.md) = `...`

#### Returns

`Promise`\<`void`\>

### isModalOpen

> **isModalOpen**: `boolean`

### openModal()

> **openModal**: () => `void`

#### Returns

`void`

### closeModal()

> **closeModal**: () => `void`

#### Returns

`void`

## Example

```tsx
function WalletComponent() {
  const {
    connectionStatus,
    connectedWallet,
    connectWallet,
    disconnectWallet,
    isModalOpen,
    openModal,
    closeModal
  } = useWalletLogic({
    dappInfo: {
      name: 'My dApp',
      icon: 'https://mydapp.com/icon.png'
    }
  });

  if (connectionStatus === ConnectionStatus.Connected) {
    return (
      <div>
        Connected to {connectedWallet?.info.name}
        <button onClick={() => disconnectWallet()}>Disconnect</button>
      </div>
    );
  }

  return <button onClick={openModal}>Connect Wallet</button>;
}
```

## Remarks

This hook manages its own state using useReducer and handles all the complexity
of wallet connections, including:
- Automatic session restoration
- Connection status management
- Error handling
- Modal state management
- Cleanup on unmount
