[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EvmProvider

# Class: EvmProvider

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

- [`EvmWalletProvider`](../interfaces/EvmWalletProvider.md)

## Constructors

### Constructor

> **new EvmProvider**(`chainType`, `transport`, `initialChainId`, `logger`): `EvmProvider`

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

[`Logger`](Logger.md)

Logger instance for debugging

#### Returns

`EvmProvider`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`constructor`](BaseWalletProvider.md#constructor)

## Properties

### context

> `protected` **context**: [`WalletProviderContext`](../interfaces/WalletProviderContext.md)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`context`](BaseWalletProvider.md#context)

***

### jsonrpcNode

> `protected` `readonly` **jsonrpcNode**: `JSONRPCNode`\<[`WalletMethodMap`](../interfaces/WalletMethodMap.md), [`WalletEventMap`](../../../internal/types/typedocExports/interfaces/WalletEventMap.md), [`WalletProviderContext`](../interfaces/WalletProviderContext.md)\>

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`jsonrpcNode`](BaseWalletProvider.md#jsonrpcnode)

***

### logger

> `protected` **logger**: [`Logger`](Logger.md)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`logger`](BaseWalletProvider.md#logger)

## Methods

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

#### Implementation of

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`disconnect`](../interfaces/EvmWalletProvider.md#disconnect)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`disconnect`](BaseWalletProvider.md#disconnect)

***

### emit()

> `protected` **emit**(`event`, `data`): `void`

Emit an event to listeners

#### Parameters

##### event

`string`

Event name

##### data

`unknown`

Event data

#### Returns

`void`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`emit`](BaseWalletProvider.md#emit)

***

### getAccounts()

> **getAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Get connected accounts

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to array of account addresses

#### Throws

If provider is not connected or request fails

#### Implementation of

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`getAccounts`](../interfaces/EvmWalletProvider.md#getaccounts)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`getAccounts`](BaseWalletProvider.md#getaccounts)

***

### getBalance()

> **getBalance**(`account`, `blockTag`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get account balance in wei

#### Parameters

##### account

`string`

Account address to get balance for

##### blockTag

`string` = `'latest'`

Block tag (latest, earliest, pending, or block number)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to balance in wei as string

#### Throws

If request fails

***

### getChainId()

> **getChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get current chain ID

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to chain ID string

#### Throws

If provider is not connected or request fails

#### Implementation of

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`getChainId`](../interfaces/EvmWalletProvider.md#getchainid)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`getChainId`](BaseWalletProvider.md#getchainid)

***

### getContext()

> `protected` **getContext**(): [`WalletProviderContext`](../interfaces/WalletProviderContext.md)

Get the current provider context

#### Returns

[`WalletProviderContext`](../interfaces/WalletProviderContext.md)

Current context object

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`getContext`](BaseWalletProvider.md#getcontext)

***

### handleDisconnect()

> `protected` **handleDisconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Handle disconnection by notifying the wallet

EVM wallets typically don't have a specific disconnect method,
so this primarily updates internal state and cleans up resources.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

#### Overrides

[`BaseWalletProvider`](BaseWalletProvider.md).[`handleDisconnect`](BaseWalletProvider.md#handledisconnect)

***

### handleGetAccounts()

> `protected` **handleGetAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Handle getting accounts via eth_accounts method

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to array of account addresses

#### Throws

If request fails

#### Overrides

[`BaseWalletProvider`](BaseWalletProvider.md).[`handleGetAccounts`](BaseWalletProvider.md#handlegetaccounts)

***

### handleGetChainId()

> `protected` **handleGetChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Handle getting chain ID via eth_chainId method

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to chain ID string

#### Throws

If request fails

#### Overrides

[`BaseWalletProvider`](BaseWalletProvider.md).[`handleGetChainId`](BaseWalletProvider.md#handlegetchainid)

***

### off()

> **off**(`event`, `listener`): `void`

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

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`off`](../interfaces/EvmWalletProvider.md#off)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`off`](BaseWalletProvider.md#off)

***

### on()

> **on**(`event`, `listener`): `void`

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

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`on`](../interfaces/EvmWalletProvider.md#on)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`on`](BaseWalletProvider.md#on)

***

### removeAllListeners()

> **removeAllListeners**(`event?`): `void`

Remove all event listeners

#### Parameters

##### event?

`string`

Optional event name to remove all listeners for.
               If not provided, removes all listeners for all events.

#### Returns

`void`

#### Implementation of

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`removeAllListeners`](../interfaces/EvmWalletProvider.md#removealllisteners)

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`removeAllListeners`](BaseWalletProvider.md#removealllisteners)

***

### request()

> **request**\<`T`\>(`args`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

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

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

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

[`EvmWalletProvider`](../interfaces/EvmWalletProvider.md).[`request`](../interfaces/EvmWalletProvider.md#request)

***

### requestAccounts()

> **requestAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Request account access from the wallet (EIP-1102)

This method prompts the user to connect their wallet and grant access
to their accounts. It automatically updates the provider's connected state.

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to array of account addresses

#### Throws

If user rejects request or wallet is not available

***

### sendTransaction()

> **sendTransaction**(`transaction`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Send a transaction to the blockchain

#### Parameters

##### transaction

[`EvmTransaction`](../interfaces/EvmTransaction.md)

Transaction object to send

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to transaction hash

#### Throws

If transaction fails or user rejects

***

### signMessage()

> **signMessage**(`account`, `message`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Sign a message with the user's private key

#### Parameters

##### account

`string`

Account address to sign with

##### message

`string`

Message to sign

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to signature string

#### Throws

If signing fails or user rejects

***

### switchChain()

> **switchChain**(`chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Switch to a different EVM chain

#### Parameters

##### chainId

`string`

Chain ID to switch to (e.g., '0x1' for Ethereum)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when chain switch is complete

#### Throws

If chain switch fails or chain is not supported

***

### updateContext()

> `protected` **updateContext**(`updates`): `void`

Update the provider context

#### Parameters

##### updates

`Partial`\<[`WalletProviderContext`](../interfaces/WalletProviderContext.md)\>

Partial context updates

#### Returns

`void`

#### Inherited from

[`BaseWalletProvider`](BaseWalletProvider.md).[`updateContext`](BaseWalletProvider.md#updatecontext)
