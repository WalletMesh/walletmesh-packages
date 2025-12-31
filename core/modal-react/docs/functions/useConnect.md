[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useConnect

# Function: useConnect()

> **useConnect**(): [`UseConnectReturn`](../interfaces/UseConnectReturn.md)

Defined in: [core/modal-react/src/hooks/useConnect.ts:317](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/hooks/useConnect.ts#L317)

Consolidated hook for managing wallet connections and disconnections

Provides methods to connect to wallets with automatic modal handling,
disconnect wallets safely, track connection state, and manage errors.

## Returns

[`UseConnectReturn`](../interfaces/UseConnectReturn.md)

Connection and disconnection methods and state

## Since

2.0.0

## See

 - [useAccount](useAccount.md) - For accessing connection state
 - [useSwitchChain](useSwitchChain.md) - For changing chains after connection
 - [useTransaction](useTransaction.md) - For sending transactions

## Remarks

This hook consolidates connection and disconnection functionality.
The connect method handles both direct wallet connections (when walletId
is provided) and modal-based connections (when walletId is omitted).
The disconnect method provides safe disconnection with validation.

Connection flow:
1. Validate connection parameters
2. Open modal or connect directly
3. Establish wallet connection
4. Initialize session
5. Return connection result

Disconnection flow:
1. Validate disconnection safety
2. Check for active transactions
3. Perform disconnection
4. Clean up session data
5. Update UI state

## Examples

```tsx
function WalletButton() {
  const {
    connect,
    disconnect,
    isConnecting,
    isDisconnecting,
    connectedWallets,
    error
  } = useConnect();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (connectedWallets.length > 0) {
    return (
      <button
        onClick={() => disconnect()}
        disabled={isDisconnecting}
      >
        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect()}
      disabled={isConnecting}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

```tsx
// Direct wallet connection without modal
function QuickConnect() {
  const { connect, disconnect, error, reset } = useConnect();

  const connectMetaMask = async () => {
    try {
      await connect('metamask', { showModal: false });
    } catch (err) {
      // Handle error
    }
  };

  return (
    <div>
      <button onClick={connectMetaMask}>
        Quick Connect MetaMask
      </button>
      <button onClick={() => disconnect()}>
        Disconnect
      </button>
      {error && (
        <div>
          {error.message}
          <button onClick={reset}>Try Again</button>
        </div>
      )}
    </div>
  );
}
```

```tsx
// Manage multiple wallets
function MultiWalletManager() {
  const { connectedWallets, disconnect, disconnectAll } = useConnect();

  return (
    <div>
      <h3>Connected Wallets ({connectedWallets.length})</h3>
      {connectedWallets.map(wallet => (
        <div key={wallet.id}>
          <span>{wallet.name}</span>
          <button onClick={() => disconnect(wallet.id)}>
            Disconnect
          </button>
        </div>
      ))}
      {connectedWallets.length > 1 && (
        <button onClick={() => disconnectAll()}>
          Disconnect All
        </button>
      )}
    </div>
  );
}
```
