[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DISCOVERY\_EVENTS

# Variable: DISCOVERY\_EVENTS

> `const` `readonly` **DISCOVERY\_EVENTS**: `object`

Defined in: [core/discovery/src/core/constants.ts:47](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/core/constants.ts#L47)

Event types for the Generic Cross-Blockchain Discovery Protocol.

Defines the standardized event types used throughout the capability-first
discovery process. These events enable secure cross-origin
communication between initiators and responders.

## Type Declaration

### COMPLETE

> `readonly` **COMPLETE**: `"discovery:wallet:complete"` = `'discovery:wallet:complete'`

Event type for discovery session completion.
Emitted when a discovery session transitions to COMPLETED state.

### ERROR

> `readonly` **ERROR**: `"discovery:wallet:error"` = `'discovery:wallet:error'`

Event type for discovery errors.
Emitted when a discovery session transitions to ERROR state.

### REQUEST

> `readonly` **REQUEST**: `"discovery:wallet:request"` = `'discovery:wallet:request'`

Event type for discovery requests.
Emitted by initiators to announce their requirements.

### RESPONSE

> `readonly` **RESPONSE**: `"discovery:wallet:response"` = `'discovery:wallet:response'`

Event type for discovery responses.
Emitted by qualified responders in response to discovery requests.

## Example

```typescript
// Listen for discovery responses
eventTarget.addEventListener(DISCOVERY_EVENTS.RESPONSE, handler);

// Dispatch discovery request
const event = new CustomEvent(DISCOVERY_EVENTS.REQUEST, {
  detail: capabilityRequest
});
eventTarget.dispatchEvent(event);
```

## Since

0.1.0
