[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BaseWalletProvider

# Abstract Class: BaseWalletProvider

Base Wallet Provider - Foundation for blockchain API implementations

PURPOSE: Providers are API LAYER components that implement blockchain-specific
standards and operations. They provide the programming interface that dApps
use to interact with blockchains (send transactions, sign messages, query balances, etc.)

ARCHITECTURAL SEPARATION:
- Providers: Handle blockchain API (this class)
- Adapters: Handle wallet connection (create providers after connection)

KEY CONCEPTS:
- Providers implement blockchain standards (EIP-1193 for EVM, Solana Wallet Standard, etc.)
- They translate dApp requests into blockchain-specific JSON-RPC calls
- They use the transport provided by adapters, but don't know connection details
- Multiple wallets can use the same provider implementation (code reuse)

## Example

```typescript
// Implementing a blockchain provider (API layer)
class MyEvmProvider extends BaseWalletProvider {
  // Provider receives transport from adapter
  constructor(
    chainType: ChainType,
    transport: JSONRPCTransport,  // Established by adapter
    chainId: string,
    logger: Logger
  ) {
    super(chainType, transport, chainId, logger);
  }

  // Implement blockchain-specific operations
  async sendTransaction(tx: EvmTransaction): Promise<string> {
    return this.jsonrpcNode.callMethod('eth_sendTransaction', [tx]);
  }

  async signMessage(account: string, message: string): Promise<string> {
    return this.jsonrpcNode.callMethod('eth_signMessage', [account, message]);
  }
}
```

## Remarks

- Providers know blockchain protocols, not wallet connection details
- They receive transport from adapters and use it for communication
- This separation enables standard compliance and code reuse

## See

ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details

## Extended by

- [`EvmProvider`](EvmProvider.md)

## Implements

- [`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md)

## Constructors

### Constructor

> **new BaseWalletProvider**(`chainType`, `transport`, `initialChainId`, `logger`): `BaseWalletProvider`

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

`BaseWalletProvider`

## Properties

### context

> `protected` **context**: [`WalletProviderContext`](../interfaces/WalletProviderContext.md)

***

### jsonrpcNode

> `protected` `readonly` **jsonrpcNode**: `JSONRPCNode`\<[`WalletMethodMap`](../interfaces/WalletMethodMap.md), [`WalletEventMap`](../../../internal/types/typedocExports/interfaces/WalletEventMap.md), [`WalletProviderContext`](../interfaces/WalletProviderContext.md)\>

***

### logger

> `protected` **logger**: [`Logger`](Logger.md)

## Methods

### disconnect()

> **disconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

#### Implementation of

[`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md).[`disconnect`](../interfaces/IBaseWalletProvider.md#disconnect)

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

[`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md).[`getAccounts`](../interfaces/IBaseWalletProvider.md#getaccounts)

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

[`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md).[`getChainId`](../interfaces/IBaseWalletProvider.md#getchainid)

***

### getContext()

> `protected` **getContext**(): [`WalletProviderContext`](../interfaces/WalletProviderContext.md)

Get the current provider context

#### Returns

[`WalletProviderContext`](../interfaces/WalletProviderContext.md)

Current context object

***

### handleDisconnect()

> `abstract` `protected` **handleDisconnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Handle disconnection - must be implemented by subclasses

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnection is complete

#### Throws

If disconnection fails

***

### handleGetAccounts()

> `abstract` `protected` **handleGetAccounts**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Handle getting accounts - must be implemented by subclasses

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to array of account addresses

#### Throws

If request fails

***

### handleGetChainId()

> `abstract` `protected` **handleGetChainId**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Handle getting chain ID - must be implemented by subclasses

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Promise resolving to chain ID string

#### Throws

If request fails

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

[`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md).[`off`](../interfaces/IBaseWalletProvider.md#off)

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

[`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md).[`on`](../interfaces/IBaseWalletProvider.md#on)

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

[`IBaseWalletProvider`](../interfaces/IBaseWalletProvider.md).[`removeAllListeners`](../interfaces/IBaseWalletProvider.md#removealllisteners)

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
