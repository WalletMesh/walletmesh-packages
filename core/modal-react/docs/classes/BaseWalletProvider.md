[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / BaseWalletProvider

# Abstract Class: BaseWalletProvider

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:91

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

- `BaseWalletProvider`

## Constructors

### Constructor

> **new BaseWalletProvider**(`chainType`, `transport`, `initialChainId`, `logger`): `BaseWalletProvider`

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

`BaseWalletProvider`

## Methods

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:146

Disconnect from wallet

#### Returns

`Promise`\<`void`\>

Promise that resolves when disconnection is complete

#### Implementation of

`IBaseWalletProvider.disconnect`

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

`IBaseWalletProvider.getAccounts`

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

`IBaseWalletProvider.getChainId`

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

`IBaseWalletProvider.off`

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

`IBaseWalletProvider.on`

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

`IBaseWalletProvider.removeAllListeners`
