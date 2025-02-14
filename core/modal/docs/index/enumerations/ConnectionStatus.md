[**@walletmesh/modal v0.0.6**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / ConnectionStatus

# Enumeration: ConnectionStatus

Defined in: [core/modal/src/types.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L183)

Possible states for a wallet connection.

Represents all possible states in the wallet connection lifecycle,
used for UI updates and connection management.

## Remarks

State transitions:
- Idle → Connecting | Resuming
- Connecting → Connected | Idle
- Connected → Disconnecting
- Disconnecting → Idle
- Resuming → Connected | Idle

## Example

```typescript
// Check connection status
if (status === ConnectionStatus.Connected) {
  // Wallet is ready
}

// Update UI based on status
switch (status) {
  case ConnectionStatus.Connecting:
    return <Loading />;
  case ConnectionStatus.Connected:
    return <WalletInfo />;
  default:
    return <ConnectButton />;
}
```

## Enumeration Members

### Idle

> **Idle**: `"idle"`

Defined in: [core/modal/src/types.ts:185](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L185)

No active connection or connection attempt

***

### Connecting

> **Connecting**: `"connecting"`

Defined in: [core/modal/src/types.ts:187](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L187)

Connection attempt in progress

***

### Connected

> **Connected**: `"connected"`

Defined in: [core/modal/src/types.ts:189](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L189)

Successfully connected to wallet

***

### Disconnecting

> **Disconnecting**: `"disconnecting"`

Defined in: [core/modal/src/types.ts:191](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L191)

Disconnection in progress

***

### Resuming

> **Resuming**: `"resuming"`

Defined in: [core/modal/src/types.ts:193](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/types.ts#L193)

Attempting to restore previous session
