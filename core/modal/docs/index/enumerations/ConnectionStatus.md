[**@walletmesh/modal v0.0.5**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / ConnectionStatus

# Enumeration: ConnectionStatus

Defined in: [core/modal/src/types.ts:175](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L175)

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

Defined in: [core/modal/src/types.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L177)

No active connection or connection attempt

***

### Connecting

> **Connecting**: `"connecting"`

Defined in: [core/modal/src/types.ts:179](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L179)

Connection attempt in progress

***

### Connected

> **Connected**: `"connected"`

Defined in: [core/modal/src/types.ts:181](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L181)

Successfully connected to wallet

***

### Disconnecting

> **Disconnecting**: `"disconnecting"`

Defined in: [core/modal/src/types.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L183)

Disconnection in progress

***

### Resuming

> **Resuming**: `"resuming"`

Defined in: [core/modal/src/types.ts:185](https://github.com/WalletMesh/walletmesh-packages/blob/8b444f40d3fbabab05c65771724d742ca4403f5d/core/modal/src/types.ts#L185)

Attempting to restore previous session
