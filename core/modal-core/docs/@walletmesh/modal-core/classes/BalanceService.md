[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / BalanceService

# Class: BalanceService

Service for querying and managing blockchain balance information

BalanceService provides a unified interface for fetching both native currency
and token balances across different blockchain networks. It features:

- **Multi-chain support**: Works with EVM, Solana, Aztec, and other chains
- **Intelligent caching**: Reduces RPC calls with configurable cache strategies
- **Lazy loading**: Chain services are loaded only when needed
- **Type safety**: Full TypeScript support with proper typing
- **Error handling**: Comprehensive error handling with detailed messages

## Remarks

The service uses a chain service registry to delegate blockchain-specific
operations, ensuring proper separation of concerns and enabling easy
addition of new blockchain support.

## Example

```typescript
const balanceService = new BalanceService({
  logger: createLogger('BalanceService'),
  chainServiceRegistry: registry
});

// Configuration is handled automatically by QueryManager

// Get native balance
const ethBalance = await balanceService.getNativeBalance({
  provider,
  address: '0x...',
  chain: ethereumMainnet // SupportedChain object
});

// Get token balance
const usdcBalance = await balanceService.getTokenBalance({
  provider,
  address: '0x...',
  chain: ethereumMainnet // SupportedChain object,
  token: { address: '0x...', symbol: 'USDC', decimals: 6 }
});
```

## Constructors

### Constructor

> **new BalanceService**(`dependencies`): `BalanceService`

Creates a new BalanceService instance

#### Parameters

##### dependencies

[`BalanceServiceDependencies`](../interfaces/BalanceServiceDependencies.md)

Required service dependencies

#### Returns

`BalanceService`

#### Example

```typescript
const balanceService = new BalanceService({
  logger: createLogger('BalanceService'),
  chainServiceRegistry: new ChainServiceRegistry()
});
```

## Methods

### cleanup()

> **cleanup**(): `void`

Cleanup resources

This method is kept for compatibility but no longer needs to clean up internal cache.

#### Returns

`void`

#### Example

```typescript
// On component unmount or service disposal
balanceService.cleanup();
```

***

### getNativeBalance()

> **getNativeBalance**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BalanceInfo`](../interfaces/BalanceInfo.md)\>

Get native balance for an address

Fetches the native currency balance (ETH, SOL, etc.) for a given address on a specific chain.
Results are cached based on the configured cache settings. This method uses chain service
registry to delegate blockchain-specific operations.

#### Parameters

##### params

[`GetNativeBalanceParams`](../interfaces/GetNativeBalanceParams.md)

Parameters for getting native balance

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BalanceInfo`](../interfaces/BalanceInfo.md)\>

Promise resolving to balance information

#### Throws

Configuration error if chain service is not available

#### Throws

Configuration error if balance fetch fails

#### Example

```typescript
const balance = await balanceService.getNativeBalance({
  provider, // BlockchainProvider
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  chain: ethereumMainnet // SupportedChain object
});
console.log(`${balance.formatted} ${balance.symbol}`);
// Output: "1.234 ETH"
```

***

### getTokenBalance()

> **getTokenBalance**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BalanceInfo`](../interfaces/BalanceInfo.md)\>

Get token balance for an address

Fetches the balance of a specific token (ERC20, SPL, etc.) for a given address.
If token metadata is not provided, it will be fetched automatically.
Results are cached based on the configured cache settings.

#### Parameters

##### params

[`GetTokenBalanceParams`](../interfaces/GetTokenBalanceParams.md)

Parameters for getting token balance

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BalanceInfo`](../interfaces/BalanceInfo.md)\>

Promise resolving to balance information

#### Throws

Configuration error if chain service is not available

#### Throws

Configuration error if token balance fetch fails

#### Example

```typescript
const usdcBalance = await balanceService.getTokenBalance({
  provider, // BlockchainProvider
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
  chain: ethereumMainnet // SupportedChain object,
  token: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6
  }
});
console.log(`${usdcBalance.formatted} ${usdcBalance.symbol}`);
// Output: "1,000.50 USDC"
```
