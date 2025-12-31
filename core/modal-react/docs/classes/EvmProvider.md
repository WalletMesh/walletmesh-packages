[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / EvmProvider

# Class: EvmProvider

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:61

EVM Provider - API implementation for Ethereum and EVM-compatible chains

PURPOSE: This provider implements the blockchain API layer for EVM chains.
It provides the standard EIP-1193 interface that dApps use to interact with
Ethereum and compatible blockchains.

ARCHITECTURAL SEPARATION:
- Providers (this class): Implement blockchain operations and standards
- Adapters: Handle wallet connection and transport establishment
- Transport: The communication channel (provided by adapter)

KEY RESPONSIBILITIES:
- Implement EIP-1193 provider standard
- Handle blockchain method calls (sendTransaction, signMessage, etc.)
- Manage blockchain state (accounts, chain ID)
- Translate dApp requests to JSON-RPC calls

## Example

```typescript
// Provider is created by adapter with established transport
// (You typically don't create providers directly)
const provider = new EvmProvider(
  ChainType.Evm,
  transport,      // Transport established by adapter
  '0x1',          // Ethereum mainnet
  logger
);

// dApp uses provider for blockchain operations
const accounts = await provider.requestAccounts();
const txHash = await provider.sendTransaction({
  from: accounts[0],
  to: '0x742d35Cc6634C0532925a3b8D9C0AC79C0C44B03',
  value: '0x1000000000000000000' // 1 ETH in wei
});
```

## Remarks

- This provider can be reused by ANY wallet that supports EVM
- It doesn't know HOW to connect to wallets (that's the adapter's job)
- It only knows HOW to perform EVM blockchain operations

## See

 - EvmAdapter for the connection layer implementation
 - ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details

## Extends

- [`BaseWalletProvider`](BaseWalletProvider.md)

## Implements

- `EvmWalletProvider`

## Constructors

### Constructor

> **new EvmProvider**(`chainType`, `transport`, `initialChainId`, `logger`): `EvmProvider`

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:105

Create a new BaseWalletProvider

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The blockchain type this provider handles

##### transport

`JSONRPCTransport`

JSONRPCTransport for communication with the wallet

##### initialChainId

Initial chain ID (optional)

`undefined` | `string`

##### logger

[`Logger`](../interfaces/Logger.md)

Logger instance for debugging

#### Returns

`EvmProvider`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`constructor`](BaseWalletProvider.md#constructor)

## Methods

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:146

Disconnect from wallet

#### Returns

`Promise`\<`void`\>

Promise that resolves when disconnection is complete

#### Implementation of

`EvmWalletProvider.disconnect`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`disconnect`](BaseWalletProvider.md#disconnect)

***

### getAccounts()

> **getAccounts**(): `Promise`\<`string`[]\>

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:112

Get connected accounts

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of account addresses

#### Throws

If provider is not connected or request fails

#### Implementation of

`EvmWalletProvider.getAccounts`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`getAccounts`](BaseWalletProvider.md#getaccounts)

***

### getBalance()

> **getBalance**(`account`, `blockTag?`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:97

Get account balance in wei

#### Parameters

##### account

`string`

Account address to get balance for

##### blockTag?

`string`

Block tag (latest, earliest, pending, or block number)

#### Returns

`Promise`\<`string`\>

Promise resolving to balance in wei as string

#### Throws

If request fails

***

### getChainId()

> **getChainId**(): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:119

Get current chain ID

#### Returns

`Promise`\<`string`\>

Promise resolving to chain ID string

#### Throws

If provider is not connected or request fails

#### Implementation of

`EvmWalletProvider.getChainId`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`getChainId`](BaseWalletProvider.md#getchainid)

***

### off()

> **off**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:133

Remove event listener

#### Parameters

##### event

`string`

Event name to stop listening for

##### listener

(...`args`) => `void`

Callback function to remove

#### Returns

`void`

#### Implementation of

`EvmWalletProvider.off`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`off`](BaseWalletProvider.md#off)

***

### on()

> **on**(`event`, `listener`): `void`

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:126

Add event listener

#### Parameters

##### event

`string`

Event name to listen for

##### listener

(...`args`) => `void`

Callback function to call when event occurs

#### Returns

`void`

#### Implementation of

`EvmWalletProvider.on`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`on`](BaseWalletProvider.md#on)

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:140

Remove all event listeners

#### Parameters

##### event?

`string`

Optional event name to remove all listeners for.
               If not provided, removes all listeners for all events.

#### Returns

`void`

#### Implementation of

`EvmWalletProvider.removeAllListeners`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`removeAllListeners`](BaseWalletProvider.md#removealllisteners)

***

### request()

> **request**\<`T`\>(`args`): `Promise`\<`T`\>

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:127

EVM request method following EIP-1193 provider interface

This method implements the standard Ethereum provider request interface,
allowing EVM wallets to use their natural communication pattern.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### args

Request arguments with method and params

###### method

`string`

###### params?

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`T`\>

Promise resolving to method result

#### Throws

If request fails or wallet is not available

#### Example

```typescript
// Request accounts
const accounts = await provider.request({ method: 'eth_requestAccounts' });

// Send transaction
const txHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{ to: '0x...', value: '0x...' }]
});
```

#### Implementation of

`EvmWalletProvider.request`

***

### requestAccounts()

> **requestAccounts**(): `Promise`\<`string`[]\>

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:71

Request account access from the wallet (EIP-1102)

This method prompts the user to connect their wallet and grant access
to their accounts. It automatically updates the provider's connected state.

#### Returns

`Promise`\<`string`[]\>

Promise resolving to array of account addresses

#### Throws

If user rejects request or wallet is not available

***

### sendTransaction()

> **sendTransaction**(`transaction`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:79

Send a transaction to the blockchain

#### Parameters

##### transaction

`EvmTransaction`

Transaction object to send

#### Returns

`Promise`\<`string`\>

Promise resolving to transaction hash

#### Throws

If transaction fails or user rejects

***

### signMessage()

> **signMessage**(`account`, `message`): `Promise`\<`string`\>

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:88

Sign a message with the user's private key

#### Parameters

##### account

`string`

Account address to sign with

##### message

`string`

Message to sign

#### Returns

`Promise`\<`string`\>

Promise resolving to signature string

#### Throws

If signing fails or user rejects

***

### switchChain()

> **switchChain**(`chainId`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/providers/evm/EvmProvider.d.ts:105

Switch to a different EVM chain

#### Parameters

##### chainId

`string`

Chain ID to switch to (e.g., '0x1' for Ethereum)

#### Returns

`Promise`\<`void`\>

Promise that resolves when chain switch is complete

#### Throws

If chain switch fails or chain is not supported
