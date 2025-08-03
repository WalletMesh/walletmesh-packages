[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / CapabilityRequirements

# Interface: CapabilityRequirements

Defined in: [core/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L100)

Capability requirements specification for responder discovery.

Capabilities represent the complete set of functionalities a wallet can provide,
organized into three distinct categories:

- **chains**: Blockchain networks the wallet supports (e.g., 'eip155:1' for Ethereum mainnet)
- **features**: Wallet-specific functionalities (e.g., 'hardware-wallet', 'batch-transactions')
- **interfaces**: API standards the wallet implements (e.g., 'eip-1193' for EVM wallets)

Together, these three categories form the wallet's complete capability profile.
All requirements must be fulfilled for a responder to qualify for connection.

## Examples

```typescript
const requirements: CapabilityRequirements = {
  chains: ['eip155:1'],                              // Must support Ethereum mainnet
  features: ['account-management'],                   // Must have account management
  interfaces: ['eip-1193']                           // Must implement EIP-1193 standard
};
```

```typescript
const requirements: CapabilityRequirements = {
  chains: ['eip155:1', 'eip155:137'],                // Ethereum AND Polygon
  features: ['transaction-signing', 'hardware-wallet'], // Transaction signing AND hardware security
  interfaces: ['eip-1193', 'eip-6963']               // Multiple interface standards
};
```

## Since

0.1.0

## See

 - [CapabilityPreferences](CapabilityPreferences.md) for optional preferences
 - [RESPONDER\_FEATURES](../variables/RESPONDER_FEATURES.md) in constants.ts for standard feature identifiers

## Properties

### chains

> **chains**: `string`[]

Defined in: [core/types.ts:106](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L106)

Blockchain networks that must be supported.
Uses CAIP-2 chain identifiers (e.g., 'eip155:1' for Ethereum mainnet).
ALL specified chains must be supported by the wallet.

***

### features

> **features**: `string`[]

Defined in: [core/types.ts:114](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L114)

Wallet features that must be available.
These represent specific functionalities beyond basic blockchain support,
such as hardware security, batch transactions, or gasless operations.
See RESPONDER_FEATURES for standard values.

***

### interfaces

> **interfaces**: `string`[]

Defined in: [core/types.ts:121](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L121)

API interfaces that must be implemented for wallet communication.
These define how dApps can interact with the wallet programmatically.
Examples: 'eip-1193' for Ethereum providers, 'solana-wallet-standard' for Solana.
