[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainValidationOptions

# Interface: ChainValidationOptions

Options for chain validation operations

## Example

```ts
const options: ChainValidationOptions = {
  errorMessage: 'Please switch to Ethereum Mainnet',
  timeout: 5000
};
```

## Properties

### errorMessage?

> `optional` **errorMessage**: `string`

Custom error message for validation failure

***

### timeout?

> `optional` **timeout**: `number`

Timeout for validation in milliseconds
