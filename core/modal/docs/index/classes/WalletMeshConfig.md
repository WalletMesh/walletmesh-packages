[**@walletmesh/modal v0.0.6**](../../README.md)

***

[@walletmesh/modal](../../modules.md) / [index](../README.md) / WalletMeshConfig

# Class: WalletMeshConfig

Defined in: [core/modal/src/lib/config/ModalConfig.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L103)

Builder for creating WalletMesh configurations with validation.

Provides a fluent API for configuring WalletMesh components with:
- Wallet list management
- DApp information setup
- Chain support configuration
- Operation timeout settings
- Built-in validation
- Default configurations

Key features:
- Validates all configuration at build time
- Enforces security best practices
- Provides sensible defaults
- Supports incremental configuration
- Type-safe builder pattern

## Example

```typescript
const config = WalletMeshConfig.create()
  .clearWallets() // Clear default wallets
  .addWallet({
    id: "my_wallet",
    name: "My Wallet",
    icon: "data:image/svg+xml,...", // Must be data URI
    connector: {
      type: ConnectorType.WalletMeshAztec,
      options: { chainId: "aztec:testnet" }
    },
    transport: {
      type: TransportType.PostMessage,
      options: { origin: "https://wallet.example.com" }
    }
  })
  .setSupportedChains(["aztec:testnet", "aztec:mainnet"])
  .setDappInfo({
    name: "My DApp",
    description: "A decentralized application",
    origin: "https://mydapp.com"
  })
  .setTimeout({
    connectionTimeout: 30000, // 30s for initial connection
    operationTimeout: 10000   // 10s for other operations
  })
  .build();
```

## Methods

### create()

> `static` **create**(): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:144](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L144)

Creates a new WalletMeshConfig builder instance.

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

A builder instance initialized with default settings

#### Remarks

Default configuration includes:
- Built-in wallet list
- Standard operation timeouts
- No chain restrictions
- No dApp information

#### Example

```typescript
// Basic usage
const config = WalletMeshConfig.create()
  .setDappInfo({ name: 'My dApp' })
  .build();

// Custom initialization
const config = WalletMeshConfig.create()
  .clearWallets()
  .addWallets(customWallets)
  .build();
```

***

### clearWallets()

> **clearWallets**(): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:152](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L152)

Remove all wallets from the configuration

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

***

### addWallet()

> **addWallet**(`wallet`): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:180](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L180)

Add a wallet to the configuration

#### Parameters

##### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

Wallet configuration to add

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

#### Throws

If the wallet icon is not a valid data URI

#### Example

```typescript
config.addWallet({
  id: "aztec_web",
  name: "Aztec Web Wallet",
  url: "https://wallet.aztec.network",
  transport: {
    type: TransportType.PostMessage,
    options: { origin: "https://wallet.aztec.network" }
  },
  connector: {
    type: ConnectorType.WalletMeshAztec,
    options: { chainId: "aztec:mainnet" }
  }
});
```

***

### addWallets()

> **addWallets**(`wallets`): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L192)

Add multiple wallets to the configuration

#### Parameters

##### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Array of wallet configurations

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

#### Throws

If any wallet icon is not a valid data URI

***

### removeWallet()

> **removeWallet**(`walletId`): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:205](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L205)

Remove a wallet from the configuration

#### Parameters

##### walletId

`string`

ID of the wallet to remove

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

***

### setSupportedChains()

> **setSupportedChains**(`chains`): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:223](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L223)

Set the list of supported blockchain networks

#### Parameters

##### chains

`string`[]

Array of chain identifiers

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

#### Example

```typescript
config.setSupportedChains([
  "aztec:testnet",
  "aztec:mainnet"
]);
```

***

### setTimeout()

> **setTimeout**(`config`): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:243](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L243)

Set timeouts for wallet operations

#### Parameters

##### config

[`TimeoutConfig`](../../lib/utils/timeout/interfaces/TimeoutConfig.md)

Timeout configuration

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

#### Example

```typescript
config.setTimeout({
  connectionTimeout: 30000, // 30s for initial connection
  operationTimeout: 10000   // 10s for other operations
});
```

***

### setDappInfo()

> **setDappInfo**(`info`): [`WalletMeshConfig`](WalletMeshConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:268](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L268)

Set information about the DApp

#### Parameters

##### info

[`DappInfo`](../interfaces/DappInfo.md)

DApp configuration

#### Returns

[`WalletMeshConfig`](WalletMeshConfig.md)

Builder instance for chaining

#### Throws

If the DApp icon is not a valid data URI

#### Example

```typescript
config.setDappInfo({
  name: "My DApp",
  description: "A decentralized application",
  origin: "https://mydapp.com",
  icon: "data:image/svg+xml,...", // Optional, must be data URI
  rpcUrl: "https://rpc.example.com" // Optional
});
```

***

### build()

> **build**(): [`WalletMeshProviderConfig`](../interfaces/WalletMeshProviderConfig.md)

Defined in: [core/modal/src/lib/config/ModalConfig.ts:360](https://github.com/WalletMesh/walletmesh-packages/blob/fe58e55749d5c9ff8ebea6f952abd3ab0cbc9512/core/modal/src/lib/config/ModalConfig.ts#L360)

Build the final configuration

#### Returns

[`WalletMeshProviderConfig`](../interfaces/WalletMeshProviderConfig.md)

Configuration for WalletProvider

#### Throws

If DApp information has not been set

#### Example

```typescript
const config = WalletMeshConfig.create()
  .addWallet(...)
  .setDappInfo(...)
  .build();

return (
  <WalletProvider config={config}>
    <App />
  </WalletProvider>
);
```
