[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryRequestEventHandler

# Type Alias: DiscoveryRequestEventHandler()

> **DiscoveryRequestEventHandler** = (`event`) => `void`

Defined in: [core/types.ts:1629](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1629)

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
