[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / createCapabilityRequirements

# Variable: createCapabilityRequirements

> `const` **createCapabilityRequirements**: `object`

Defined in: [core/discovery/src/initiator/factory.ts:283](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/initiator/factory.ts#L283)

Helper functions to create common capability requirements for different blockchain ecosystems.

Provides pre-configured capability requirements for popular blockchain networks
with sensible defaults while allowing customization. Simplifies the setup
process for common dApp scenarios.

## Type Declaration

## Blockchain

#### aztec()

> **aztec**(`options`): [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Create capability requirements for Aztec dApps.

Pre-configured for Aztec private smart contract interactions with
support for private transactions and zero-knowledge proofs.

##### Parameters

###### options

Optional customization of default requirements

###### features?

`string`[]

###### interfaces?

`string`[]

##### Returns

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Capability requirements for Aztec dApps

##### Examples

```typescript
const requirements = createCapabilityRequirements.aztec();
// Chains: ['aztec:mainnet']
// Features: ['private-transactions', 'transaction-signing']
// Interfaces: ['aztec-wallet-api-v1']
```

```typescript
const requirements = createCapabilityRequirements.aztec({
  features: ['private-transactions', 'transaction-signing', 'account-management']
});
```

##### Since

0.1.0

#### ethereum()

> **ethereum**(`options`): [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Create capability requirements for Ethereum dApps.

Pre-configured for standard Ethereum mainnet interactions with
EIP-1193 provider interface and basic account/transaction features.

##### Parameters

###### options

Optional customization of default requirements

###### features?

`string`[]

###### interfaces?

`string`[]

##### Returns

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Capability requirements for Ethereum dApps

##### Examples

```typescript
const requirements = createCapabilityRequirements.ethereum();
// Chains: ['eip155:1']
// Features: ['account-management', 'transaction-signing']
// Interfaces: ['eip-1193']
```

```typescript
const requirements = createCapabilityRequirements.ethereum({
  chains: ['eip155:1', 'eip155:5'], // Mainnet + Goerli
  features: ['account-management', 'transaction-signing', 'message-signing']
});
```

##### Since

0.1.0

#### multiChain()

> **multiChain**(`options`): [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Create capability requirements for multi-chain dApps.

Flexible factory for dApps that operate across multiple blockchain
networks. Requires explicit chain specification while providing
sensible defaults for features and interfaces.

##### Parameters

###### options

Multi-chain configuration with required chains

###### features?

`string`[]

###### interfaces?

`string`[]

##### Returns

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Capability requirements for multi-chain dApps

##### Examples

```typescript
const requirements = createCapabilityRequirements.multiChain({
  chains: ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
  features: ['account-management', 'transaction-signing', 'cross-chain-swaps'],
  interfaces: ['eip-1193', 'solana-wallet-standard']
});
```

```typescript
const requirements = createCapabilityRequirements.multiChain({
  chains: ['eip155:1', 'eip155:137', 'eip155:42161'],
  features: ['account-management', 'transaction-signing', 'batch-transactions']
  // Uses default interfaces: ['eip-1193', 'solana-wallet-standard']
});
```

##### Since

0.1.0

#### polygon()

> **polygon**(`options`): [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Create capability requirements for Polygon dApps.

Pre-configured for Polygon mainnet interactions with
EIP-1193 provider interface and basic account/transaction features.

##### Parameters

###### options

Optional customization of default requirements

###### features?

`string`[]

###### interfaces?

`string`[]

##### Returns

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Capability requirements for Polygon dApps

##### Example

```typescript
const requirements = createCapabilityRequirements.polygon();
// Chains: ['eip155:137']
// Features: ['account-management', 'transaction-signing']
// Interfaces: ['eip-1193']
```

##### Since

0.1.0

#### solana()

> **solana**(`options`): [`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Create capability requirements for Solana dApps.

Pre-configured for Solana mainnet interactions with solana-wallet-standard
interface and account-based transaction model.

##### Parameters

###### options

Optional customization of default requirements

###### features?

`string`[]

###### interfaces?

`string`[]

##### Returns

[`CapabilityRequirements`](../interfaces/CapabilityRequirements.md)

Capability requirements for Solana dApps

##### Examples

```typescript
const requirements = createCapabilityRequirements.solana();
// Chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']
// Features: ['account-management', 'transaction-signing']
// Interfaces: ['solana-wallet-standard']
```

```typescript
const requirements = createCapabilityRequirements.solana({
  chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'],
  features: ['account-management', 'transaction-signing', 'message-signing']
});
```

##### Since

0.1.0

## Examples

```typescript
const requirements = createCapabilityRequirements.ethereum();
// → {
//   chains: ['eip155:1'],
//   features: ['account-management', 'transaction-signing'],
//   interfaces: ['eip-1193']
// }
```

```typescript
const requirements = createCapabilityRequirements.multiChain({
  chains: ['eip155:1', 'eip155:137', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
  features: ['account-management', 'transaction-signing', 'cross-chain-swaps'],
  interfaces: ['eip-1193', 'solana-wallet-standard']
});
```

## Since

0.1.0

## See

[CapabilityRequirements](../interfaces/CapabilityRequirements.md) for the structure
