[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createCapabilityMatcher

# Function: createCapabilityMatcher()

> **createCapabilityMatcher**(`responderInfo`): [`CapabilityMatcher`](../classes/CapabilityMatcher.md)

Defined in: [core/discovery/src/responder/factory.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/discovery/src/responder/factory.ts#L119)

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
  technologies: [{ type: 'evm', interfaces: ['eip-1193'] }], // technology config
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
