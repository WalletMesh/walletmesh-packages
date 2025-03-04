[**@walletmesh/modal v0.0.7**](../../../README.md)

***

[@walletmesh/modal](../../../modules.md) / [hooks/useWallet](../README.md) / useWallet

# Function: useWallet()

> **useWallet**(`options`): `object`

Defined in: [core/modal/src/hooks/useWallet.ts:243](https://github.com/WalletMesh/walletmesh-packages/blob/354613910502fa145d032d1381943edf2007083d/core/modal/src/hooks/useWallet.ts#L243)

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

### isSelectModalOpen

> **isSelectModalOpen**: `boolean`

### openSelectModal()

> **openSelectModal**: () => `void`

#### Returns

`void`

### closeSelectModal()

> **closeSelectModal**: () => `void`

#### Returns

`void`

### isConnectedModalOpen

> **isConnectedModalOpen**: `boolean`

### openConnectedModal()

> **openConnectedModal**: () => `void`

#### Returns

`void`

### closeConnectedModal()

> **closeConnectedModal**: () => `void`

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
    isSelectModalOpen,
    openSelectModal,
    closeSelectModal
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

  return <button onClick={openSelectModal}>Connect Wallet</button>;
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
