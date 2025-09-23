[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainService

# Class: ChainService

Consolidated chain service for WalletMesh

Provides all chain-related business logic in a single service:
- Chain registration and lookup (registry functionality)
- Chain validation and compatibility checking (validator functionality)
- Chain switching and orchestration (switcher functionality)
- Chain ensurance and workflow management (service functionality)

## Example

```ts
// Create service
const chainService = new ChainService(dependencies, {
  chains: [ethereumChain, polygonChain],
  enableValidation: true,
  ensurance: { autoSwitch: true }
});

// Register a new chain
chainService.registerChain({
  chainId: '42161',
  chainType: ChainType.Evm,
  name: 'Arbitrum One',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://arb1.arbitrum.io/rpc']
});

// Validate current chain
const validation = chainService.validateChain({
  currentChainId: '1',
  requiredChainId: '137'
});

// Switch chains
const result = await chainService.switchChain({ chainId: '137' });
```

## Constructors

### Constructor

> **new ChainService**(`dependencies`, `config`): `ChainService`

#### Parameters

##### dependencies

[`ChainServiceDependencies`](../interfaces/ChainServiceDependencies.md)

##### config

[`ChainConfig`](../interfaces/ChainConfig.md) = `{}`

#### Returns

`ChainService`

## Methods

### checkChainCompatibility()

> **checkChainCompatibility**(`chainId`, `options`): [`ChainCompatibilityResult`](../interfaces/ChainCompatibilityResult.md)

Check chain compatibility with wallet

#### Parameters

##### chainId

`string`

The chain ID to check compatibility for

##### options

[`ChainCompatibilityOptions`](../interfaces/ChainCompatibilityOptions.md)

Compatibility check options

#### Returns

[`ChainCompatibilityResult`](../interfaces/ChainCompatibilityResult.md)

Compatibility result with alternatives if incompatible

#### Example

```ts
const result = chainService.checkChainCompatibility('aztec-mainnet', {
  wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
  includeTestnets: false
});

if (!result.isCompatible) {
  console.log(result.reason);
}
```

***

### clearChains()

> **clearChains**(): `void`

Clear all chains

#### Returns

`void`

#### Example

```ts
chainService.clearChains();
console.log(chainService.getAllChains().length); // 0
```

***

### ensureChain()

> **ensureChain**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainEnsuranceValidationResult`](../interfaces/ChainEnsuranceValidationResult.md)\>

Ensure user is on the correct chain

#### Parameters

##### params

[`EnsureChainParams`](../interfaces/EnsureChainParams.md)

Chain ensurance parameters

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainEnsuranceValidationResult`](../interfaces/ChainEnsuranceValidationResult.md)\>

Validation result with auto-switch if configured

#### Example

```ts
const result = await chainService.ensureChain({
  requiredChainId: '1',
  walletId: 'metamask',
  options: {
    errorMessage: 'This dApp requires Ethereum Mainnet'
  }
});

if (result.isCorrectChain) {
  console.log('Ready to interact with Ethereum');
}
```

***

### getAllChains()

> **getAllChains**(): [`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)[]

Get all registered chains

#### Returns

[`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)[]

Array of all registered chain configurations

#### Example

```ts
const allChains = chainService.getAllChains();
console.log(`${allChains.length} chains registered`);
```

***

### getChain()

> **getChain**(`chainId`): `undefined` \| [`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)

Get chain by ID

#### Parameters

##### chainId

`string`

The chain ID to look up (CAIP-2 format)

#### Returns

`undefined` \| [`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)

The chain configuration if found, undefined otherwise

#### Example

```ts
const ethereum = chainService.getChain('eip155:1');
const polygon = chainService.getChain('eip155:137');
const solana = chainService.getChain('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
```

***

### getChainsByType()

> **getChainsByType**(`chainType`): [`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)[]

Get chains by type

#### Parameters

##### chainType

[`ChainType`](../enumerations/ChainType.md)

The chain type to filter by

#### Returns

[`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)[]

Array of chains matching the specified type

#### Example

```ts
const evmChains = chainService.getChainsByType(ChainType.Evm);
const solanaChains = chainService.getChainsByType(ChainType.Solana);
```

***

### getChainStats()

> **getChainStats**(): `object`

Get chain statistics

#### Returns

`object`

Statistics about registered chains

##### byType

> **byType**: `Record`\<[`ChainType`](../enumerations/ChainType.md), `number`\>

##### total

> **total**: `number`

#### Example

```ts
const stats = chainService.getChainStats();
console.log(`Total chains: ${stats.total}`);
console.log(`EVM chains: ${stats.byType.evm}`);
console.log(`Solana chains: ${stats.byType.solana}`);
```

***

### getSupportedChainsForWallet()

> **getSupportedChainsForWallet**(`wallet`): [`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)[]

Get supported chains for wallet

#### Parameters

##### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

The wallet to get supported chains for

#### Returns

[`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)[]

Array of chains supported by the wallet

#### Example

```ts
const wallet = { id: 'metamask', name: 'MetaMask', chains: ['evm'] };
const supportedChains = chainService.getSupportedChainsForWallet(wallet);
// Returns all EVM chains
```

***

### getSupportedChainTypes()

> **getSupportedChainTypes**(): [`ChainType`](../enumerations/ChainType.md)[]

Get supported chain types

#### Returns

[`ChainType`](../enumerations/ChainType.md)[]

Array of chain types that have registered chains

#### Example

```ts
const supportedTypes = chainService.getSupportedChainTypes();
// ['evm', 'solana', 'aztec']
```

***

### hasChain()

> **hasChain**(`chainId`): `boolean`

Check if chain is registered

#### Parameters

##### chainId

`string`

The chain ID to check

#### Returns

`boolean`

True if chain is registered, false otherwise

#### Example

```ts
if (chainService.hasChain('1')) {
  console.log('Ethereum Mainnet is registered');
}
```

***

### isChainSwitchNeeded()

> **isChainSwitchNeeded**(`requiredChain`, `walletId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Check if chain switch is needed

#### Parameters

##### requiredChain

The required chain

###### chainId

`string` = `caip2Schema`

Chain identifier in CAIP-2 format

###### chainType

[`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

###### group?

`string` = `...`

Grouping identifier for multi-chain scenarios

###### icon?

`string` = `...`

Optional icon URL for the chain

###### interfaces?

`string`[] = `...`

List of required provider interfaces for this chain

###### label?

`string` = `...`

Display label for the chain (optional override of name)

###### name

`string` = `...`

Human-readable name of the chain

###### required

`boolean` = `...`

Whether this chain is required for the dApp to function

##### walletId?

`string`

Optional wallet ID to check

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

True if chain switch is needed, false if already on correct chain

#### Example

```ts
const needsSwitch = await chainService.isChainSwitchNeeded(requiredChain, 'metamask');
if (needsSwitch) {
  await chainService.switchChain({ chain: requiredChain });
}
```

***

### orchestrateChainSwitch()

> **orchestrateChainSwitch**(`args`, `options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SwitchChainResult`](../interfaces/SwitchChainResult.md)\>

Orchestrate chain switch with user confirmation

#### Parameters

##### args

[`SwitchChainArgs`](../../../internal/types/typedocExports/interfaces/SwitchChainArgs.md)

Chain switch arguments

##### options

[`ChainSwitchOrchestrationOptions`](../interfaces/ChainSwitchOrchestrationOptions.md) = `{}`

Orchestration options with callbacks

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SwitchChainResult`](../interfaces/SwitchChainResult.md)\>

Result of the orchestrated chain switch

#### Throws

If user cancels or chain not found

#### Example

```ts
const result = await chainService.orchestrateChainSwitch(
  { chainId: '137' },
  {
    onConfirm: async (data) => {
      return confirm(`Switch to ${data.targetChain.name}?`);
    },
    onSuccess: (data) => {
      toast.success(`Switched to ${data.newChain.name}`);
    },
    timeout: 30000
  }
);
```

***

### registerChain()

> **registerChain**(`chain`): `void`

Register a chain configuration

#### Parameters

##### chain

[`ServiceChainInfo`](../interfaces/ServiceChainInfo.md)

The chain configuration to register

#### Returns

`void`

#### Throws

If chain configuration is invalid

#### Example

```ts
chainService.registerChain({
  chainId: 'eip155:42161',
  chainType: ChainType.Evm,
  name: 'Arbitrum One',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://arb1.arbitrum.io/rpc'],
  blockExplorerUrls: ['https://arbiscan.io']
});
```

***

### switchChain()

> **switchChain**(`args`, `provider?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SwitchChainResult`](../interfaces/SwitchChainResult.md)\>

Switch to a different chain

#### Parameters

##### args

[`SwitchChainArgs`](../../../internal/types/typedocExports/interfaces/SwitchChainArgs.md)

Chain switch arguments

##### provider?

`unknown`

Optional blockchain provider to include in the result

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SwitchChainResult`](../interfaces/SwitchChainResult.md)\>

Result of the chain switch operation

#### Throws

If chain is not registered and no add data provided

#### Example

```ts
// Switch to existing chain
const result = await chainService.switchChain({ chainId: 'eip155:137' });

// Switch with provider
const result = await chainService.switchChain({ chainId: 'eip155:137' }, provider);

// Switch to new chain with add data
const result = await chainService.switchChain({
  chainId: 'eip155:42161',
  addChainData: {
    chainId: 'eip155:42161',
    chainName: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc']
  }
}, provider);
```

***

### unregisterChain()

> **unregisterChain**(`chainId`): `boolean`

Unregister a chain

#### Parameters

##### chainId

`string`

The chain ID to unregister

#### Returns

`boolean`

True if chain was unregistered, false if it wasn't found

#### Example

```ts
const removed = chainService.unregisterChain('11155111'); // Remove Sepolia
if (removed) {
  console.log('Chain unregistered successfully');
}
```

***

### validateChain()

> **validateChain**(`params`): [`ChainValidationResult`](../interfaces/ChainValidationResult.md)

Validate if current chain matches required chain

#### Parameters

##### params

[`ValidateChainParams`](../interfaces/ValidateChainParams.md)

Validation parameters

#### Returns

[`ChainValidationResult`](../interfaces/ChainValidationResult.md)

Validation result indicating if chains match

#### Example

```ts
const result = chainService.validateChain({
  currentChainId: '137',
  requiredChainId: '1',
  options: {
    errorMessage: 'Please switch to Ethereum Mainnet'
  }
});

if (!result.isValid) {
  console.error(result.error.message);
}
```

***

### validateChainRequirements()

> **validateChainRequirements**(`chainId`, `requirements`): [`ChainRequirementValidationResult`](../interfaces/ChainRequirementValidationResult.md)

Validate chain requirements

#### Parameters

##### chainId

`string`

The chain ID to validate

##### requirements

`string`[]

Array of required features

#### Returns

[`ChainRequirementValidationResult`](../interfaces/ChainRequirementValidationResult.md)

Validation result with missing requirements and alternatives

#### Example

```ts
const result = chainService.validateChainRequirements('42161', [
  'rpc_urls',
  'block_explorer',
  'currency_info'
]);

if (!result.isValid) {
  console.log('Missing:', result.missingRequirements);
}
```
