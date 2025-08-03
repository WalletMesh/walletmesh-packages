[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryErrorEvent

# Interface: DiscoveryErrorEvent

Defined in: [core/types.ts:1820](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1820)

Event emitted when a discovery session encounters an error.

This event is broadcast when a discovery session transitions to the ERROR state,
indicating that the discovery process has failed due to a security violation
or other error condition. The event provides error context for debugging.

## Example

```typescript
// Listen for error events
eventTarget.addEventListener(DISCOVERY_EVENTS.ERROR, (event) => {
  const errorEvent = event as CustomEvent<DiscoveryErrorEvent>;
  console.error(`Discovery session ${errorEvent.detail.sessionId} failed`);
  console.error(`Error: ${errorEvent.detail.errorMessage}`);
});
```

## Since

0.5.0

## Extends

- [`BaseDiscoveryMessage`](BaseDiscoveryMessage.md)

## Properties

### errorCategory

> **errorCategory**: [`ErrorCategory`](../type-aliases/ErrorCategory.md)

Defined in: [core/types.ts:1830](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1830)

Error category for handling

***

### errorCode

> **errorCode**: `number`

Defined in: [core/types.ts:1824](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1824)

Error code for categorization

***

### errorMessage

> **errorMessage**: `string`

Defined in: [core/types.ts:1827](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1827)

Human-readable error message

***

### sessionId

> **sessionId**: `string`

Defined in: [core/types.ts:32](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L32)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`sessionId`](BaseDiscoveryMessage.md#sessionid)

***

### type

> **type**: `"discovery:wallet:error"`

Defined in: [core/types.ts:1821](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1821)

#### Overrides

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`type`](BaseDiscoveryMessage.md#type)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/types.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L31)

#### Inherited from

[`BaseDiscoveryMessage`](BaseDiscoveryMessage.md).[`version`](BaseDiscoveryMessage.md#version)
