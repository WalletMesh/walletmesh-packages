[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createCapabilityMatcher

# Function: createCapabilityMatcher()

> **createCapabilityMatcher**(`responderInfo`): [`CapabilityMatcher`](../classes/CapabilityMatcher.md)

Defined in: [responder/factory.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/responder/factory.ts#L120)

Create a capability matcher for evaluating dApp capability requirements.

Factory function that creates a CapabilityMatcher instance for determining
if the responder can fulfill initiator capability requirements. Essential component
for privacy-preserving discovery responses.

## Parameters

### responderInfo

[`ResponderInfo`](../type-aliases/ResponderInfo.md)

Responder information including supported chains and features

## Returns

[`CapabilityMatcher`](../classes/CapabilityMatcher.md)

Configured CapabilityMatcher instance

## Throws

If wallet info validation fails

## Example

```typescript
const matcher = createCapabilityMatcher({
  uuid: 'wallet-id',
  rdns: 'com.mycompany.wallet',
  name: 'My Wallet',
  // ... other wallet info
  chains: [{ chainId: 'eip155:1' }], // chain config
  features: [{ id: 'account-management' }] // feature config
});

// Check if responder can fulfill a discovery request
const result = matcher.matchCapabilities(capabilityRequest);
if (result.canFulfill) {
  console.log('Responder qualifies for this initiator');
}
```

## Since

0.1.0

## See

[CapabilityMatcher](../classes/CapabilityMatcher.md) for the created instance
