[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchRecommendation

# Interface: ChainSwitchRecommendation

Recommendation for chain switching

## Example

```ts
const recommendation: ChainSwitchRecommendation = {
  shouldSwitch: true,
  confidence: 'high'
};
```

## Properties

### confidence?

> `optional` **confidence**: `"low"` \| `"medium"` \| `"high"`

Confidence level

***

### shouldSwitch?

> `optional` **shouldSwitch**: `boolean`

Should switch
