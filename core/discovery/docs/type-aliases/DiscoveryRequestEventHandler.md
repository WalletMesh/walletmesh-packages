[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryRequestEventHandler

# Type Alias: DiscoveryRequestEventHandler()

> **DiscoveryRequestEventHandler** = (`event`) => `void`

Defined in: [core/types.ts:1629](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1629)

Event handler function types for discovery protocol events.

Type-safe event handlers for processing discovery protocol messages
with proper event payload typing.

## Parameters

### event

`CustomEvent`\<[`DiscoveryRequestEvent`](../interfaces/DiscoveryRequestEvent.md)\>

## Returns

`void`

## Example

```typescript
const requestHandler: CapabilityRequestHandler = (event) => {
  const request = event.detail;
  console.log('Received request from:', request.origin);
};

const responseHandler: CapabilityResponseHandler = (event) => {
  const response = event.detail;
  console.log('Responder responded:', response.name);
};
```

## Since

0.1.0

## See

 - [DiscoveryInitiator](../classes/DiscoveryInitiator.md) for response handling
 - [DiscoveryResponder](../classes/DiscoveryResponder.md) for request handling
