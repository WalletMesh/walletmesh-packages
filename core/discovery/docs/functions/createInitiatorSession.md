[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createInitiatorSession

# Function: createInitiatorSession()

> **createInitiatorSession**(`params`): [`DiscoveryInitiator`](../classes/DiscoveryInitiator.md)

Defined in: [core/discovery/src/initiator/api.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/api.ts#L21)

Create a reusable discovery session handle that exposes the same methods as
[DiscoveryInitiator](../classes/DiscoveryInitiator.md). Prefer this helper when you want to keep a
session instance around and manually control its lifecycle.

## Parameters

### params

[`InitiatorSessionParams`](../interfaces/InitiatorSessionParams.md)

## Returns

[`DiscoveryInitiator`](../classes/DiscoveryInitiator.md)
