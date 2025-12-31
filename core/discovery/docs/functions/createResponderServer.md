[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createResponderServer

# Function: createResponderServer()

> **createResponderServer**(`params`): [`DiscoveryResponder`](../classes/DiscoveryResponder.md)

Defined in: [core/discovery/src/responder/api.ts:19](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/responder/api.ts#L19)

Construct a responder instance without starting it. Use this when you need
to coordinate responder lifecycle manually or hook into additional events
before listening begins.

## Parameters

### params

[`ResponderServerParams`](../interfaces/ResponderServerParams.md)

## Returns

[`DiscoveryResponder`](../classes/DiscoveryResponder.md)
