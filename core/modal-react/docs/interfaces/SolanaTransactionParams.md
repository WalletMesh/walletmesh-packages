[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SolanaTransactionParams

# Interface: SolanaTransactionParams

Defined in: core/modal-core/dist/services/transaction/types.d.ts:195

Solana transaction parameters.

Solana transactions must be pre-built and serialized before sending.
The transaction should include all required signatures except for the wallet's signature.

## Remarks

- Transactions must be serialized to base64 format
- Use Solana web3.js or similar libraries to construct transactions
- The wallet will add its signature when sending
- Preflight simulation helps catch errors before submission

## Example

```typescript
// Using @solana/web3.js to build a transfer
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: new PublicKey('RecipientAddress...'),
    lamports: 1000000000 // 1 SOL
  })
);

// Serialize for sending
const serialized = transaction.serialize({
  requireAllSignatures: false
}).toString('base64');

const solanaParams: SolanaTransactionParams = {
  transaction: serialized,
  options: {
    skipPreflight: false, // Simulate first
    preflightCommitment: 'confirmed',
    maxRetries: 3
  }
};
```

## Extends

- `BaseTransactionParams`

## Properties

### autoSwitchChain?

> `optional` **autoSwitchChain**: `boolean`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:66

Whether to automatically switch chains if the wallet is on a different chain.
When true, the service will attempt to switch to the target chainId before sending.
Defaults to false if not specified.

#### Inherited from

`BaseTransactionParams.autoSwitchChain`

***

### chainId?

> `optional` **chainId**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:60

Target chain ID for the transaction.
If specified and different from current chain, may trigger chain switch.

#### Inherited from

`BaseTransactionParams.chainId`

***

### metadata?

> `optional` **metadata**: `object`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:71

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

`BaseTransactionParams.metadata`

***

### options?

> `optional` **options**: `object`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:205

Options for sending the transaction.
Controls simulation and retry behavior.

#### maxRetries?

> `optional` **maxRetries**: `number`

Maximum number of retry attempts if transaction fails.
Useful for handling temporary network issues.

#### preflightCommitment?

> `optional` **preflightCommitment**: `"confirmed"` \| `"processed"` \| `"finalized"`

Commitment level for preflight simulation.
- `processed`: Lowest latency, least reliable
- `confirmed`: Medium latency, more reliable (default)
- `finalized`: Highest latency, most reliable

#### skipPreflight?

> `optional` **skipPreflight**: `boolean`

Skip preflight transaction simulation.
When false (default), transaction is simulated before sending to catch errors early.

***

### transaction

> **transaction**: `string`

Defined in: core/modal-core/dist/services/transaction/types.d.ts:200

Serialized transaction in base64 format.
Must be a valid Solana transaction with all required fields except wallet signature.
