[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EVMTransactionParams

# Interface: EVMTransactionParams

EVM (Ethereum Virtual Machine) transaction parameters.

Supports EIP-1559 (London fork) transactions.
All numeric values should be provided as strings to handle large numbers safely.

## Remarks

- For simple ETH transfers, only `to` and `value` are required
- For contract interactions, include `data` with the encoded function call
- Gas parameters are optional - the service will estimate if not provided

## Example

```typescript
// Simple ETH transfer
const transferParams: EVMTransactionParams = {
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  value: '1000000000000000000' // 1 ETH in wei
};

// ERC20 token transfer
const tokenTransferParams: EVMTransactionParams = {
  to: '0xTokenContractAddress',
  data: '0xa9059cbb...', // transfer(address,uint256) encoded
  gas: '65000' // Manual gas limit
};

// EIP-1559 transaction with priority fee
const eip1559Params: EVMTransactionParams = {
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  value: '1000000000000000000',
  maxFeePerGas: '30000000000', // 30 gwei
  maxPriorityFeePerGas: '2000000000' // 2 gwei tip
};
```

## Extends

- [`BaseTransactionParams`](../../../internal/types/typedocExports/interfaces/BaseTransactionParams.md)

## Properties

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

### data?

> `optional` **data**: `string`

Transaction data for contract interactions.
Hex-encoded function call or deployment bytecode.

***

### from?

> `optional` **from**: `string`

From address (optional, defaults to current connected account).
Must match the connected wallet's address if provided.

***

### gas?

> `optional` **gas**: `string`

Gas limit override (as string).
If not provided, will be estimated automatically with a safety buffer.

***

### maxFeePerGas?

> `optional` **maxFeePerGas**: `string`

Maximum fee per gas for EIP-1559 transactions (as string in wei).
Total fee = (base fee + priority fee) * gas used, capped at this value.

***

### maxPriorityFeePerGas?

> `optional` **maxPriorityFeePerGas**: `string`

Maximum priority fee (tip) per gas for EIP-1559 transactions (as string in wei).
This is paid to miners/validators as an incentive.

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

***

### nonce?

> `optional` **nonce**: `number`

Transaction nonce override.
Useful for replacing stuck transactions or ensuring order.

***

### to

> **to**: `string`

Target address for the transaction.
Must be a valid Ethereum address (0x-prefixed, 40 hex characters).

***

### value?

> `optional` **value**: `string`

Value to send in wei (as string to handle large numbers).
Use web3 utilities to convert from ether: web3.utils.toWei('1', 'ether')
