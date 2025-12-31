[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveredWalletInfo

# Interface: DiscoveredWalletInfo

Interface for discovered wallet information

## Remarks

Contains metadata about a wallet that has been discovered through various discovery mechanisms
such as EIP-6963 wallet detection, browser extension discovery, or the WalletMesh discovery protocol.
This information is used by the wallet registry to create adapters on-demand when users select
discovered wallets for connection.

Discovered wallets are different from pre-configured wallets - they are dynamically found
at runtime and may have different capabilities or configurations based on how they were discovered.

## Examples

```typescript
// Wallet discovered via EIP-6963
const discoveredWallet: DiscoveredWalletInfo = {
  id: 'io.metamask',
  name: 'MetaMask',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0...',
  adapterType: 'evm',
  adapterConfig: {
    provider: window.ethereum,
    chainId: 1
  },
  discoveryMethod: 'eip6963',
  metadata: {
    version: '10.22.0',
    description: 'MetaMask browser extension'
  }
};
```

```typescript
// Wallet discovered via WalletConnect
const walletConnectWallet: DiscoveredWalletInfo = {
  id: 'rainbow-wallet',
  name: 'Rainbow',
  icon: 'https://rainbow.me/assets/icon-512.png',
  adapterType: 'evm',
  adapterConfig: {
    projectId: 'your-project-id',
    chainIds: [1, 137, 10]
  },
  discoveryMethod: 'walletconnect'
};
```

```typescript
// Accessing discovered wallets from registry
const registry = new WalletRegistry();
const discoveredWallets = registry.getAllDiscoveredWallets();

for (const wallet of discoveredWallets) {
  console.log(`Found wallet: ${wallet.name} (${wallet.discoveryMethod})`);
  if (wallet.adapterType === 'evm') {
    // Handle EVM wallet discovery
    await handleEvmWallet(wallet);
  }
}
```

## Properties

### adapterConfig

> **adapterConfig**: `unknown`

Configuration needed to create the adapter

#### Remarks

Adapter-specific configuration data required to instantiate the wallet adapter.
The structure varies based on the adapterType:
- EVM adapters: may include provider object, chain IDs, RPC URLs
- Solana adapters: may include connection configuration, commitment levels
- Aztec adapters: may include PXE configuration, encryption keys
- Discovery adapters: may include transport configuration, endpoint URLs

This configuration is passed to the adapter constructor when the user selects
this wallet for connection.

#### Examples

```typescript
// EVM adapter config
{
  provider: window.ethereum,
  preferredChains: [1, 137]
}
```

```typescript
// Solana adapter config
{
  network: 'mainnet-beta',
  commitment: 'confirmed'
}
```

***

### adapterType

> **adapterType**: `"evm"` \| `"solana"` \| `"aztec"` \| `"discovery"`

Type of adapter to create

#### Remarks

Specifies which adapter type should be used to connect to this wallet.
This determines the blockchain technology and communication protocol:
- 'evm': Ethereum Virtual Machine compatible wallets
- 'solana': Solana blockchain wallets
- 'aztec': Aztec privacy-focused wallets
- 'discovery': Wallets using the WalletMesh discovery protocol

#### Examples

```ts
'evm' // For MetaMask, Rainbow, Coinbase Wallet
```

```ts
'solana' // For Phantom, Solflare
```

```ts
'aztec' // For Aztec-compatible wallets
```

***

### discoveryMethod?

> `optional` **discoveryMethod**: `"walletconnect"` \| `"eip1193"` \| `"eip6963"` \| `"discovery-protocol"`

Discovery method used

#### Remarks

Indicates how this wallet was discovered, which can affect how it's handled
and what capabilities it might have:
- 'eip6963': Discovered via EIP-6963 wallet detection standard
- 'eip1193': Detected as an EIP-1193 provider (e.g., injected window.ethereum)
- 'walletconnect': Discovered through WalletConnect protocol
- 'discovery-protocol': Found via WalletMesh discovery protocol

This information can be used for analytics, debugging, or applying
discovery-method-specific behavior.

#### Examples

```ts
'eip6963' // Most modern browser extension wallets
```

```ts
'walletconnect' // Mobile wallets via WalletConnect
```

```ts
'discovery-protocol' // Cross-origin wallet discovery
```

***

### icon

> **icon**: `string`

Icon data URI or URL

#### Remarks

Visual representation of the wallet for UI display. Can be:
- Data URI (preferred for performance and reliability)
- HTTPS URL pointing to an icon
- Should be square format (1:1 aspect ratio) for consistent display
- Recommended minimum size: 64x64 pixels

#### Examples

```ts
"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0..."
```

```ts
"https://wallet.example.com/icon.png"
```

***

### id

> **id**: `string`

Unique wallet identifier

#### Remarks

A unique string that identifies this wallet instance. For browser extensions,
this is often the extension ID or a standard identifier like those defined in EIP-6963.
For web wallets, this might be a domain-based identifier or app-specific ID.

#### Examples

```ts
"io.metamask" // MetaMask extension
```

```ts
"com.coinbase.wallet" // Coinbase Wallet
```

```ts
"app.phantom" // Phantom wallet
```

***

### metadata?

> `optional` **metadata**: `Record`\<`string`, `unknown`\>

Additional metadata

#### Remarks

Optional metadata that provides additional context about the discovered wallet.
This can include:
- Wallet version information
- Supported features or capabilities
- Discovery-specific data (timestamps, source information)
- Custom properties provided by the wallet

The exact structure depends on the discovery method and wallet implementation.
This data is primarily used for debugging, analytics, or enhanced user experience.

#### Examples

```typescript
{
  version: '10.22.0',
  description: 'MetaMask browser extension',
  discoveredAt: '2025-01-15T10:30:00Z',
  supportedFeatures: ['eth_signTypedData_v4', 'wallet_switchEthereumChain']
}
```

```typescript
{
  walletConnectVersion: '2.0',
  sessionTopic: 'abc123...',
  peerMetadata: {
    name: 'Rainbow',
    description: 'Rainbow Wallet Mobile'
  }
}
```

***

### name

> **name**: `string`

Display name for the wallet

#### Remarks

Human-readable name of the wallet as it should appear in the UI.
This is typically the official wallet name that users will recognize.

#### Examples

```ts
"MetaMask"
```

```ts
"Rainbow Wallet"
```

```ts
"Phantom"
```

***

### responderId?

> `optional` **responderId**: `string`

Original responder identifier provided by discovery transport.
Kept for correlation with discovery protocol events.
