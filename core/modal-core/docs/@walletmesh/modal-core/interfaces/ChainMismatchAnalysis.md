[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainMismatchAnalysis

# Interface: ChainMismatchAnalysis

Analysis of chain mismatch scenarios

## Example

```ts
const analysis: ChainMismatchAnalysis = {
  mismatchType: 'chain_id',
  severity: 'high',
  recommendedAction: 'switch',
  context: { currentChain: '137', requiredChain: '1' }
};
```

## Properties

### context?

> `optional` **context**: `Record`\<`string`, `unknown`\>

Additional context

***

### mismatchType

> **mismatchType**: `"chain_id"` \| `"chain_type"` \| `"not_connected"`

Type of mismatch

***

### recommendedAction

> **recommendedAction**: `"connect"` \| `"switch"` \| `"ignore"`

Recommended action

***

### severity

> **severity**: `"low"` \| `"medium"` \| `"high"`

Severity level
