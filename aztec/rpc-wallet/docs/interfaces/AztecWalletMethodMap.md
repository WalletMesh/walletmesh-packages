[**@walletmesh/aztec-rpc-wallet v0.5.6**](../README.md)

***

[@walletmesh/aztec-rpc-wallet](../globals.md) / AztecWalletMethodMap

# Interface: AztecWalletMethodMap

Defined in: [aztec/rpc-wallet/src/types.ts:313](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L313)

Defines the complete map of all JSON-RPC methods supported by the Aztec RPC Wallet.
This interface extends the base WalletMethodMap from `@walletmesh/router`
and specifies the parameter (`params`) and return (`result`) types for each Aztec-specific method.

This map is crucial for:
- Type safety in both client-side calls and wallet-side handlers.
- Guiding the implementation of serializers and deserializers.
- Documentation generation, as it serves as a single source of truth for method signatures.

Methods are loosely grouped by functionality (Chain/Node, Account, Sender, etc.).
"wm_" prefixed methods are typically WalletMesh-specific extensions or conveniences.

## See

 - [AztecDappWallet](../classes/AztecDappWallet.md) for the client-side implementation that calls these methods.
 - createAztecHandlers for the wallet-side implementation that handles these methods.

## Extends

- `WalletMethodMap`

## Indexable

\[`method`: `string`\]: `object`

## Properties

### aztec\_createAuthWit

> **aztec\_createAuthWit**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:397](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L397)

Creates an AuthWitness (authorization witness) for a given message hash or intent.
Used for delegating actions.

#### params

> **params**: \[`Fr` \| `Buffer`\<`ArrayBufferLike`\> \| [`IntentAction`](https://docs.aztec.network/reference/aztec.js/interfaces/IntentAction) \| [`IntentInnerHash`](https://docs.aztec.network/reference/aztec.js/interfaces/IntentInnerHash)\]

#### result

> **result**: `AuthWitness`

#### Param

A tuple containing the intent to authorize.

#### Param

intent - The message hash (Fr or `Buffer`), [IntentInnerHash](https://docs.aztec.network/reference/aztec.js/interfaces/IntentInnerHash), or [IntentAction](https://docs.aztec.network/reference/aztec.js/interfaces/IntentAction) to authorize.

#### Returns

result - The created AuthWitness.

***

### aztec\_getAddress

> **aztec\_getAddress**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:381](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L381)

Retrieves the primary AztecAddress of the wallet's account.

#### params

> **params**: \[\]

#### result

> **result**: `AztecAddress`

#### Param

No parameters.

#### Returns

result - The wallet's AztecAddress.

***

### aztec\_getBlock

> **aztec\_getBlock**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:331](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L331)

Retrieves a specific L2 block by its number.

#### params

> **params**: \[`number`\]

#### result

> **result**: `L2Block`

#### Param

A tuple containing the block number.

#### Param

blockNumber - The number of the block to retrieve.

#### Returns

result - The L2Block data, or null/undefined if not found (behavior depends on PXE).

***

### aztec\_getBlockNumber

> **aztec\_getBlockNumber**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:337](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L337)

Retrieves the current (latest) L2 block number.

#### params

> **params**: \[\]

#### result

> **result**: `number`

#### Param

No parameters.

#### Returns

result - The current block number.

***

### aztec\_getChainId

> **aztec\_getChainId**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:343](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L343)

Retrieves the chain ID of the connected Aztec network.

#### params

> **params**: \[\]

#### result

> **result**: `Fr`

#### Param

No parameters.

#### Returns

result - The chain ID as an Fr.

***

### aztec\_getCompleteAddress

> **aztec\_getCompleteAddress**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:387](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L387)

Retrieves the CompleteAddress of the wallet's account, including public keys.

#### params

> **params**: \[\]

#### result

> **result**: `CompleteAddress`

#### Param

No parameters.

#### Returns

result - The wallet's CompleteAddress.

***

### aztec\_getContractClassMetadata

> **aztec\_getContractClassMetadata**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:454](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L454)

Retrieves ContractClassMetadata for a specific contract class.

#### params

> **params**: \[`Fr`, `undefined` \| `boolean`\]

#### result

> **result**: `ContractClassMetadata`

#### Param

A tuple containing the class ID and an optional flag.

#### Param

classId - The Fr ID of the contract class.

#### Param

includeArtifact - Optional: Boolean indicating whether to include the full ContractArtifact.

#### Returns

result - The ContractClassMetadata.

***

### aztec\_getContractMetadata

> **aztec\_getContractMetadata**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:443](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L443)

Retrieves ContractMetadata for a specific deployed contract.

#### params

> **params**: \[`AztecAddress`\]

#### result

> **result**: `ContractMetadata`

#### Param

A tuple containing the contract's address.

#### Param

contractAddress - The AztecAddress of the contract.

#### Returns

result - The ContractMetadata for the specified contract.

***

### aztec\_getContracts

> **aztec\_getContracts**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:436](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L436)

Retrieves a list of all AztecAddresses of contracts known to the PXE/wallet.

#### params

> **params**: \[\]

#### result

> **result**: `AztecAddress`[]

#### Param

No parameters.

#### Returns

result - An array of contract AztecAddresses.

***

### aztec\_getCurrentBaseFees

> **aztec\_getCurrentBaseFees**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:373](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L373)

Retrieves the current base gas fees on the network.

#### params

> **params**: \[\]

#### result

> **result**: `GasFees`

#### Param

No parameters.

#### Returns

result - A GasFees object.

***

### aztec\_getNodeInfo

> **aztec\_getNodeInfo**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:355](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L355)

Retrieves comprehensive information about the connected Aztec node.

#### params

> **params**: \[\]

#### result

> **result**: `NodeInfo`

#### Param

No parameters.

#### Returns

result - A NodeInfo object.

***

### aztec\_getPrivateEvents

> **aztec\_getPrivateEvents**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:586](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L586)

Retrieves private (encrypted) events from the blockchain.

#### params

> **params**: \[`AztecAddress`, `EventMetadataDefinition`, `number`, `number`, `AztecAddress`[]\]

#### result

> **result**: `unknown`[]

#### Param

A tuple containing the query parameters.

#### Param

contractAddress - AztecAddress of the emitting contract.

#### Param

eventMetadata - EventMetadataDefinition for the event.

#### Param

fromBlock - Starting block number.

#### Param

numBlocks - Number of blocks to scan.

#### Param

recipients - Array of recipient AztecAddresses.

#### Returns

result - An array of decoded private event data (type `unknown[]`, actual type depends on `eventMetadata`).

***

### aztec\_getProvenBlockNumber

> **aztec\_getProvenBlockNumber**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:361](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L361)

Retrieves the latest L2 block number that has been proven.

#### params

> **params**: \[\]

#### result

> **result**: `number`

#### Param

No parameters.

#### Returns

result - The latest proven block number.

***

### aztec\_getPublicEvents

> **aztec\_getPublicEvents**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:604](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L604)

Retrieves public (unencrypted) events from the blockchain.

#### params

> **params**: \[`EventMetadataDefinition`, `number`, `number`\]

#### result

> **result**: `unknown`[]

#### Param

A tuple containing the query parameters.

#### Param

eventMetadata - EventMetadataDefinition for the event.

#### Param

fromBlock - Starting block number.

#### Param

limit - Maximum number of events to return.

#### Returns

result - An array of decoded public event data (type `unknown[]`, actual type depends on `eventMetadata`).

***

### aztec\_getPXEInfo

> **aztec\_getPXEInfo**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:367](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L367)

Retrieves information about the PXE service, including capabilities and version.

#### params

> **params**: \[\]

#### result

> **result**: `PXEInfo`

#### Param

No parameters.

#### Returns

result - A PXEInfo object.

***

### aztec\_getSenders

> **aztec\_getSenders**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:418](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L418)

Retrieves a list of all currently authorized sender AztecAddresses.

#### params

> **params**: \[\]

#### result

> **result**: `AztecAddress`[]

#### Param

No parameters.

#### Returns

result - An array of authorized AztecAddresses.

***

### aztec\_getTxReceipt

> **aztec\_getTxReceipt**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:508](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L508)

Retrieves the TxReceipt for a transaction.

#### params

> **params**: \[`TxHash`\]

#### result

> **result**: `TxReceipt`

#### Param

A tuple containing the transaction hash.

#### Param

txHash - The TxHash of the transaction.

#### Returns

result - The TxReceipt.

***

### aztec\_getVersion

> **aztec\_getVersion**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:349](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L349)

Retrieves the version of the connected PXE (Private Execution Environment) or node.

#### params

> **params**: \[\]

#### result

> **result**: `Fr`

#### Param

No parameters.

#### Returns

result - The version as an Fr.

***

### aztec\_profileTx

> **aztec\_profileTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:543](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L543)

Profiles a TxExecutionRequest for performance analysis.

#### params

> **params**: \[`TxExecutionRequest`, (`"gates"` \| `"execution-steps"` \| `"full"`)?, `boolean`?, `AztecAddress`?\]

#### result

> **result**: `TxProfileResult`

#### Param

A tuple containing the profiling parameters.

#### Param

txRequest - The TxExecutionRequest to profile.

#### Param

profileMode - Optional: Profiling mode ('gates', 'execution-steps', 'full'). Defaults to 'gates'.

#### Param

skipProofGeneration - Optional: Flag to skip proof generation. Defaults to `false`.

#### Param

msgSender - Optional: AztecAddress for profiling context.

#### Returns

result - The TxProfileResult.

***

### aztec\_proveTx

> **aztec\_proveTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:488](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L488)

Generates proofs for a transaction execution request.

#### params

> **params**: \[`TxExecutionRequest`, `PrivateExecutionResult`?\]

#### result

> **result**: `TxProvingResult`

#### Param

A tuple containing the request and optional private execution result.

#### Param

txRequest - The TxExecutionRequest to prove.

#### Param

privateExecutionResult - Optional: PrivateExecutionResult from a prior private simulation.

#### Returns

result - The TxProvingResult, including the proven transaction.

***

### aztec\_registerContract

> **aztec\_registerContract**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:465](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L465)

Registers a deployed contract instance with the wallet.

#### params

> **params**: \[`ContractInstanceWithAddress`, `undefined` \| `ContractArtifact`\]

#### result

> **result**: `boolean`

#### Param

A tuple containing the instance and optional artifact.

#### Param

instance - The ContractInstanceWithAddress to register.

#### Param

artifact - Optional: The ContractArtifact for the instance.

#### Returns

result - `true` if registration was successful.

***

### aztec\_registerContractClass

> **aztec\_registerContractClass**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:475](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L475)

Registers a contract class (bytecode and ABI) with the wallet.

#### params

> **params**: \[`ContractArtifact`\]

#### result

> **result**: `boolean`

#### Param

A tuple containing the artifact.

#### Param

artifact - The ContractArtifact to register.

#### Returns

result - `true` if registration was successful.

***

### aztec\_registerSender

> **aztec\_registerSender**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:409](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L409)

Registers a new authorized sender AztecAddress.

#### params

> **params**: \[`AztecAddress`\]

#### result

> **result**: `AztecAddress`

#### Param

A tuple containing the sender's address.

#### Param

senderAddress - The AztecAddress to authorize.

#### Returns

result - The registered AztecAddress.

***

### aztec\_removeSender

> **aztec\_removeSender**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:425](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L425)

Removes an AztecAddress from the list of authorized senders.

#### params

> **params**: \[`AztecAddress`\]

#### result

> **result**: `boolean`

#### Param

A tuple containing the sender's address.

#### Param

senderAddress - The AztecAddress to de-authorize.

#### Returns

result - `true` if removal was successful.

***

### aztec\_sendTx

> **aztec\_sendTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:498](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L498)

Sends a proven Tx (transaction) to the network.

#### params

> **params**: \[`Tx`\]

#### result

> **result**: `TxHash`

#### Param

A tuple containing the proven transaction.

#### Param

tx - The proven Tx object to send.

#### Returns

result - The TxHash of the sent transaction.

***

### aztec\_simulateTx

> **aztec\_simulateTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:523](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L523)

Simulates a TxExecutionRequest without sending it to the network.

#### params

> **params**: \[`TxExecutionRequest`, `boolean`?, `boolean`?, `boolean`?, `SimulationOverrides`?, `AztecAddress`[]?\]

#### result

> **result**: `TxSimulationResult`

#### Param

A tuple containing the simulation parameters.

#### Param

txRequest - The TxExecutionRequest to simulate.

#### Param

simulatePublic - Optional: Whether to simulate public parts. Defaults to `false`.

#### Param

skipTxValidation - Optional: Flag to skip validation. Defaults to `false`.

#### Param

skipFeeEnforcement - Optional: Flag to skip fee enforcement. Defaults to `false`.

#### Param

overrides - Optional: SimulationOverrides for simulation context (includes msgSender).

#### Param

scopes - Optional: Array of AztecAddress scopes for the simulation.

#### Returns

result - The TxSimulationResult.

***

### aztec\_simulateUtility

> **aztec\_simulateUtility**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:563](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L563)

Simulates a utility (view) function call.

#### params

> **params**: \[`string`, `unknown`[], `AztecAddress`, `AuthWitness`[]?, `AztecAddress`?, `AztecAddress`[]?\]

#### result

> **result**: `UtilitySimulationResult`

#### Param

A tuple containing the utility call parameters.

#### Param

functionName - Name of the utility function.

#### Param

args - Arguments for the function.

#### Param

to - AztecAddress of the contract/account.

#### Param

authWits - Optional: Array of AuthWitness.

#### Param

from - Optional: Sender AztecAddress.

#### Param

scopes - Optional: Array of AztecAddress scopes for the simulation.

#### Returns

result - The UtilitySimulationResult.

***

### aztec\_wmBatchExecute

> **aztec\_wmBatchExecute**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:645](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L645)

WalletMesh specific: Executes multiple contract interactions as a single atomic batch.

Uses Aztec's native BatchCall to create one transaction with one proof for all operations.
All operations succeed together or all fail together (atomic execution).

The wallet receives the complete batch upfront, allowing it to display all operations
to the user for approval before execution. This provides better security UX compared
to approving operations one-by-one.

#### params

> **params**: \[`ExecutionPayload`[], [`AztecSendOptions`](AztecSendOptions.md)\]

#### result

> **result**: `object`

##### result.receipt

> **receipt**: `TxReceipt`

##### result.txHash

> **txHash**: `TxHash`

#### Param

Tuple containing array of execution payloads and optional send options

#### Param

executionPayloads - Array of ExecutionPayload objects to batch

#### Param

sendOptions - Optional [AztecSendOptions](AztecSendOptions.md) for fee configuration

#### Returns

result - Object containing transaction hash and receipt

***

### aztec\_wmDeployContract

> **aztec\_wmDeployContract**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:662](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L662)

WalletMesh specific: Deploys a new contract using its artifact and constructor arguments.
The wallet handles address computation, proving, and sending the deployment transaction.

#### params

> **params**: \[\{ `args`: `unknown`[]; `artifact`: `ContractArtifact`; `constructorName?`: `string`; \}\]

#### result

> **result**: `object`

##### result.contractAddress

> **contractAddress**: `AztecAddress`

##### result.txHash

> **txHash**: `TxHash`

#### Param

A tuple containing the deployment parameters.

#### Param

deploymentParams - Object containing `artifact` (ContractArtifact), `args` (array),
                           and optional `constructorName` (string).

#### Returns

result - An object with `txHash` (TxHash) and `contractAddress` (AztecAddress).

***

### aztec\_wmExecuteTx

> **aztec\_wmExecuteTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:623](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L623)

WalletMesh specific: Executes a contract function interaction using a pre-constructed ExecutionPayload.
The wallet handles simulation, proving, and sending.

#### params

> **params**: \[`ExecutionPayload`, [`AztecSendOptions`](AztecSendOptions.md)\]

#### result

> **result**: `object`

##### result.txHash

> **txHash**: `TxHash`

#### Param

A tuple containing the execution payload and optional send options.

#### Param

executionPayload - The ExecutionPayload to execute.

#### Param

sendOptions - Optional [AztecSendOptions](AztecSendOptions.md) for fee and transaction configuration.

#### Returns

result - An object containing the blockchain transaction hash.

***

### aztec\_wmSimulateTx

> **aztec\_wmSimulateTx**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:688](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L688)

WalletMesh specific: Simulates a contract function interaction using a pre-constructed ExecutionPayload.

This method automatically detects whether the function is a utility (view/pure) function or a
state-changing transaction, and performs the appropriate simulation. The result is wrapped in a
UnifiedSimulationResult that provides both a convenient decoded result and access to the
original simulation output.

#### params

> **params**: \[`ExecutionPayload`\]

#### result

> **result**: `UnifiedSimulationResult`

#### Param

A tuple containing the execution payload.

#### Param

executionPayload - The ExecutionPayload to simulate.

#### Returns

result - A UnifiedSimulationResult containing the decoded result and original simulation data.

***

### wm\_getSupportedMethods

> **wm\_getSupportedMethods**: `object`

Defined in: [aztec/rpc-wallet/src/types.ts:322](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/rpc-wallet/src/types.ts#L322)

Retrieves a list of all JSON-RPC methods supported by this wallet implementation.
Allows clients to discover the capabilities of the wallet.

#### params

> **params**: \[\]

#### result

> **result**: `string`[]

#### Param

No parameters.

#### Returns

result - An array of strings, where each string is a supported method name.

#### Overrides

`WalletMethodMap.wm_getSupportedMethods`
