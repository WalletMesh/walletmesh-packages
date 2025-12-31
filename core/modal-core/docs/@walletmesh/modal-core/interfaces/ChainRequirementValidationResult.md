[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainRequirementValidationResult

# Interface: ChainRequirementValidationResult

Result of chain requirement validation

## Example

```ts
const result: ChainRequirementValidationResult = {
  isValid: false,
  missingRequirements: ['RPC URLs', 'Block explorer']
};
```

## Properties

### chainId

> **chainId**: `string`

The chain ID being validated

***

### error?

> `optional` **error**: `Error`

Optional error information

***

### isValid

> **isValid**: `boolean`

Whether requirements are met

***

### missingRequirements

> **missingRequirements**: `string`[]

Missing requirements

***

### requirements

> **requirements**: `string`[]

The requirements being checked
