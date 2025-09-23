[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshReactConfig

# Interface: WalletMeshReactConfig

Defined in: [core/modal-react/src/types.ts:269](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L269)

React-specific configuration for WalletMesh.

Extends the base WalletMesh configuration with React-specific options for
modal rendering, theming, and DOM integration. This configuration supports
both simplified and advanced usage patterns.

## Configuration Formats

**Chains**: Must be explicitly declared using ChainConfig objects:
- Built-in chains: `[ethereumMainnet, polygonMainnet, solanaMainnet]`
- Custom chains: `[{ chainId: 'eip155:999999', required: false, label: 'My L2', interfaces: ['eip1193'], group: 'custom' }]`
- Mixed: `[ethereumMainnet, myCustomChain]`

**Wallets**: Specified as WalletInfo objects:
- Wallet info objects: `[{ id: 'metamask', name: 'MetaMask', icon: '...', chains: ['evm'] }]`
- From adapters: `[AztecExampleWalletAdapter.getWalletInfo()]`
- Mixed: `[metaMaskInfo, customWalletInfo]`

## React Integration

The React-specific options control how WalletMesh integrates with React:
- **Modal Management**: Control automatic modal injection and positioning
- **Theme System**: Deep integration with WalletMesh theme system
- **Portal Rendering**: Custom DOM targets for modal rendering
- **CSS Integration**: Custom class names for styling integration

## Examples

```tsx
// Simple configuration
const config: WalletMeshReactConfig = {
  appName: 'My DApp',
  chains: ['evm', 'solana'],
  wallets: ['metamask', 'phantom']
};
```

```tsx
// Advanced configuration with theming
const config: WalletMeshReactConfig = {
  appName: 'Advanced DApp',
  appDescription: 'A sophisticated decentralized application',
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' },
    { chainId: '137', chainType: 'evm', name: 'Polygon' }
  ],
  wallets: {
    include: ['metamask', 'walletconnect', 'coinbase'],
    order: ['metamask', 'coinbase', 'walletconnect'],
    filter: (adapter) => adapter.readyState === 'installed'
  },
  theme: {
    mode: 'dark',
    persist: true,
    customization: {
      colors: {
        primary: '#6366f1',
        background: '#0f172a'
      }
    }
  },
  autoInjectModal: true,
  debug: process.env['NODE_ENV'] === 'development'
};
```

## See

 - [WalletMeshConfig](WalletMeshConfig.md) For base configuration options
 - [ThemeProviderConfig](ThemeProviderConfig.md) For theme configuration details
 - [WalletMeshProvider](../functions/WalletMeshProvider.md) For the component that uses this configuration

## Since

1.0.0

## Extends

- [`WalletMeshConfig`](WalletMeshConfig.md)

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:386

Optional description of your application.
Provides context to users when connecting wallets.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appDescription`](CoreWalletMeshConfig.md#appdescription)

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:396

Icon URL for your application.
Should be a square image (recommended 256x256 or larger).

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appIcon`](CoreWalletMeshConfig.md#appicon)

***

### appMetadata?

> `optional` **appMetadata**: [`DAppMetadata`](DAppMetadata.md)

Defined in: [core/modal-react/src/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L192)

dApp metadata for identification (auto-populated from appName/appDescription if not provided)

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`appMetadata`](WalletMeshConfig.md#appmetadata)

***

### appName

> **appName**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:381

The name of your application.
This is displayed in wallet connection prompts.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appName`](CoreWalletMeshConfig.md#appname)

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:391

URL of your application.
Used by wallets for verification and display.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appUrl`](CoreWalletMeshConfig.md#appurl)

***

### autoInjectModal?

> `optional` **autoInjectModal**: `boolean`

Defined in: [core/modal-react/src/types.ts:280](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L280)

Whether to automatically inject the modal component into the DOM.

When `true` (default), the WalletMeshModal component is automatically
rendered as a child of the provider. Set to `false` if you want to
render the modal manually or use a custom modal component.

#### Default Value

```ts
true
```

***

### chains

> **chains**: `object`[]

Defined in: [core/modal-react/src/types.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L183)

Explicitly supported chains (required - no automatic chain selection)

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`chains`](WalletMeshConfig.md#chains)

***

### className?

> `optional` **className**: `string`

Defined in: [core/modal-react/src/types.ts:311](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L311)

Additional CSS class names to apply to the modal component.

These classes are added to the modal's root element and can be used
for custom styling or integration with CSS frameworks.

#### Example

```tsx
className: 'my-wallet-modal custom-modal-styles'
```

***

### debug?

> `optional` **debug**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:436

Enable debug mode for additional logging.

#### Default

```ts
false
```

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`debug`](CoreWalletMeshConfig.md#debug)

***

### discovery?

> `optional` **discovery**: [`DiscoveryConfig`](DiscoveryConfig.md)

Defined in: [core/modal-react/src/types.ts:347](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L347)

Discovery protocol configuration for automatic wallet detection.

Enables the WalletMesh discovery protocol to automatically detect
wallets that are available in the user's environment. This includes
support for cross-origin wallet announcements and capability matching.

#### Example

```tsx
discovery: {
  enabled: true,
  protocols: ['walletmesh', 'eip6963'],
  timeout: 5000,
  autoScan: true,
  capabilities: {
    chains: ['aztec:sandbox'],
    features: ['sign-transaction', 'sign-message']
  }
}
```

#### See

[DiscoveryConfig](DiscoveryConfig.md) For detailed discovery options

#### Since

1.1.0

***

### handleRehydration?

> `optional` **handleRehydration**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:442

Whether the client should handle session rehydration automatically.
Set to false if your framework (e.g., React) handles this separately.

#### Default

```ts
true
```

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`handleRehydration`](CoreWalletMeshConfig.md#handlerehydration)

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: [core/modal-react/src/types.ts:189](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L189)

Maximum number of simultaneous wallet connections

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`maxConnections`](WalletMeshConfig.md#maxconnections)

***

### permissions?

> `optional` **permissions**: `Record`\<`string`, `string`[]\>

Defined in: [core/modal-react/src/types.ts:371](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L371)

Chain-specific permissions configuration.

Defines the permissions that will be requested for each chain when
connecting wallets. This is used to configure which methods the dApp
is allowed to call on each chain.

#### Example

```tsx
permissions: {
  'aztec:31337': [
    'aztec_getAddress',
    'aztec_sendTx',
    'aztec_getChainId'
  ],
  'eip155:1': [
    'eth_accounts',
    'eth_sendTransaction'
  ]
}
```

***

### portalTarget?

> `optional` **portalTarget**: `string` \| `HTMLElement`

Defined in: [core/modal-react/src/types.ts:298](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L298)

Custom portal target for modal rendering.

By default, the modal renders into a portal attached to `document.body`.
You can specify a custom target as either a CSS selector string or
an HTMLElement reference.

#### Example

```tsx
// Using CSS selector
portalTarget: '#modal-root'

// Using element reference
portalTarget: document.getElementById('modal-container')
```

***

### projectId?

> `optional` **projectId**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:420

WalletConnect project ID.
Required for WalletConnect integration.
Get one at https://cloud.walletconnect.com

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`projectId`](CoreWalletMeshConfig.md#projectid)

***

### supportedInterfaces?

> `optional` **supportedInterfaces**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:447

Supported interfaces per technology for discovery.
Allows specifying which provider interfaces to use for each blockchain technology.

#### aztec?

> `optional` **aztec**: `string`[]

Aztec interfaces (e.g., ['aztec-wallet-api-v1', 'aztec-connect-v2'])

#### evm?

> `optional` **evm**: `string`[]

EVM interfaces (e.g., ['eip-1193', 'eip-6963'])

#### solana?

> `optional` **solana**: `string`[]

Solana interfaces (e.g., ['solana-standard-wallet'])

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`supportedInterfaces`](CoreWalletMeshConfig.md#supportedinterfaces)

***

### theme?

> `optional` **theme**: [`ThemeProviderConfig`](ThemeProviderConfig.md)

Defined in: [core/modal-react/src/types.ts:321](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L321)

Theme configuration for modal styling and behavior.

Controls the appearance and theming behavior of the modal component,
including color schemes, persistence, and customization options.

#### See

[ThemeProviderConfig](ThemeProviderConfig.md) For detailed theme options

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:186](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/types.ts#L186)

Wallet configurations - array of WalletInfo objects

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`wallets`](WalletMeshConfig.md#wallets)
