[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AztecTransactionParams

# Interface: AztecTransactionParams

Aztec transaction parameters.

Aztec is a privacy-focused Layer 2 solution for Ethereum.
Transactions interact with noir contracts and can optionally use gasless execution.

## Remarks

- Contract addresses must be valid Aztec contract addresses
- Function names must match the contract's ABI
- Arguments are passed as an array and must match function signature
- Supports both native fee payment and gasless transactions

## Example

```typescript
// Simple contract call with native fee payment
const aztecParams: AztecTransactionParams = {
  contractAddress: '0x1234...abcd',
  functionName: 'transfer',
  args: [
    recipientAddress,
    amount,
    nonce
  ]
};

// Gasless transaction with fee payer
const gaslessParams: AztecTransactionParams = {
  contractAddress: '0x1234...abcd',
  functionName: 'privateTransfer',
  args: [recipient, amount],
  fee: {
    paymentMethod: 'gasless',
    payer: '0xFeePayerAddress'
  }
};
```

## Extends

- [`BaseTransactionParams`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md)

## Properties

### args

> **args**: `unknown`[]

Arguments to pass to the function.
Order and types must match the function signature.

***

### autoSwitchChain?

> `optional` **autoSwitchChain**: `boolean`

Whether to automatically switch chains if the wallet is on a different chain.
When true, the service will attempt to switch to the target chainId before sending.
Defaults to false if not specified.

#### Inherited from

[`BaseTransactionParams`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md).[`autoSwitchChain`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md#autoswitchchain)

***

### chainId?

> `optional` **chainId**: `string`

Target chain ID for the transaction.
If specified and different from current chain, may trigger chain switch.

#### Inherited from

[`BaseTransactionParams`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md).[`chainId`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md#chainid)

***

### contractAddress

> **contractAddress**: `string`

Target Aztec contract address.
Must be a deployed contract on the Aztec network.

***

### fee?

> `optional` **fee**: `object`

Optional fee payment configuration.
Allows for gasless transactions where another party pays fees.

#### payer?

> `optional` **payer**: `string`

Address of the fee payer for gasless transactions.
Required when paymentMethod is 'gasless'.

#### paymentMethod

> **paymentMethod**: `"native"` \| `"gasless"`

Fee payment method.
- `native`: Sender pays fees (default)
- `gasless`: Another party pays fees

***

### functionName

> **functionName**: `string`

Name of the contract function to call.
Must match a function in the contract's ABI.

***

### metadata?

> `optional` **metadata**: `object`

Transaction metadata for tracking and UI purposes.
This data is stored with the transaction but not sent on-chain.

#### action?

> `optional` **action**: `string`

Categorization tag for the transaction (e.g., 'swap', 'transfer', 'nft-mint')

#### data?

> `optional` **data**: `Record`\<`string`, `unknown`\>

Custom application-specific data associated with this transaction

#### description?

> `optional` **description**: `string`

Human-readable description of the transaction purpose

#### Inherited from

[`BaseTransactionParams`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md).[`metadata`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md#metadata)
