[**@walletmesh/discovery v0.1.3**](../README.md)

***

[@walletmesh/discovery](../globals.md) / runDiscovery

# Function: runDiscovery()

> **runDiscovery**(`params`): `Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>

Defined in: [core/discovery/src/initiator/api.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/discovery/src/initiator/api.ts#L30)

Run a single discovery cycle and resolve with qualified responders. The
underlying session is disposed automatically once the promise settles.

## Parameters

### params

[`InitiatorSessionParams`](../interfaces/InitiatorSessionParams.md)

## Returns

`Promise`\<[`QualifiedResponder`](../interfaces/QualifiedResponder.md)[]\>
