[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletMeshReactConfig

# Interface: WalletMeshReactConfig

Defined in: [core/modal-react/src/types.ts:269](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L269)

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

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:529

Optional description of your application.
Provides context to users when connecting wallets.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appDescription`](CoreWalletMeshConfig.md#appdescription)

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:539

Icon URL for your application.
Should be a square image (recommended 256x256 or larger).

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appIcon`](CoreWalletMeshConfig.md#appicon)

***

### appMetadata?

> `optional` **appMetadata**: [`DAppMetadata`](DAppMetadata.md)

Defined in: [core/modal-react/src/types.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L192)

dApp metadata for identification (auto-populated from appName/appDescription if not provided)

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`appMetadata`](WalletMeshConfig.md#appmetadata)

***

### appName

> **appName**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:524

The name of your application.
This is displayed in wallet connection prompts.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appName`](CoreWalletMeshConfig.md#appname)

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:534

URL of your application.
Used by wallets for verification and display.

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`appUrl`](CoreWalletMeshConfig.md#appurl)

***

### autoInjectModal?

> `optional` **autoInjectModal**: `boolean`

Defined in: [core/modal-react/src/types.ts:280](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L280)

Whether to automatically inject the modal component into the DOM.

When `true` (default), the WalletMeshModal component is automatically
rendered as a child of the provider. Set to `false` if you want to
render the modal manually or use a custom modal component.

#### Default Value

```ts
true
```

***

### autoInjectTransactionOverlays?

> `optional` **autoInjectTransactionOverlays**: `boolean`

Defined in: [core/modal-react/src/types.ts:389](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L389)

Whether to automatically inject transaction status overlays.

When `true` (default), the AztecTransactionStatusOverlay and
BackgroundTransactionIndicator components are automatically rendered
as children of the provider. These overlays provide visual feedback
during transaction execution:
- Sync transactions show a full-screen blocking overlay
- Async transactions show a non-blocking floating badge

Set to `false` if you want to render the overlays manually or use
custom transaction UI components.

#### Default Value

```ts
true
```

#### Since

3.1.0

***

### backgroundTransactionIndicator?

> `optional` **backgroundTransactionIndicator**: `object`

Defined in: [core/modal-react/src/types.ts:480](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L480)

Configuration for the background transaction indicator (non-blocking, for async transactions).

Shows a floating badge that allows users to continue working while
transactions process in the background. The badge displays the count
of active transactions and can be expanded to show details.

#### completedDuration?

> `optional` **completedDuration**: `number`

Duration in milliseconds to show completed transactions before auto-hiding.

##### Default Value

```ts
3000
```

#### enabled?

> `optional` **enabled**: `boolean`

Disable the indicator entirely while still allowing the full-screen overlay.

##### Default Value

```ts
true
```

#### position?

> `optional` **position**: `"top-left"` \| `"top-right"` \| `"bottom-left"` \| `"bottom-right"`

Position of the indicator on the screen.

##### Default Value

```ts
'bottom-right'
```

#### showCompleted?

> `optional` **showCompleted**: `boolean`

Show completed transactions briefly before hiding them.

##### Default Value

```ts
true
```

#### Example

```tsx
backgroundTransactionIndicator: {
  enabled: true, // default
  position: 'bottom-right', // default
  showCompleted: true, // default - briefly show completed transactions
  completedDuration: 3000 // default - 3 seconds
}
```

#### Since

3.1.0

***

### chains

> **chains**: `object`[]

Defined in: [core/modal-react/src/types.ts:183](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L183)

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

Defined in: [core/modal-react/src/types.ts:311](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L311)

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

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:579

Enable debug mode for additional logging.

#### Default

```ts
false
```

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`debug`](CoreWalletMeshConfig.md#debug)

***

### discovery?

> `optional` **discovery**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:602

Discovery configuration for wallet detection.
Configures how the client discovers available wallets.

#### capabilities?

> `optional` **capabilities**: `object`

Capability requirements for wallet matching

##### capabilities.chains?

> `optional` **chains**: `string`[]

##### capabilities.features?

> `optional` **features**: `string`[]

##### capabilities.interfaces?

> `optional` **interfaces**: `string`[]

##### capabilities.technologies?

> `optional` **technologies**: `object`[]

#### dappInfo?

> `optional` **dappInfo**: `object`

dApp information for wallet discovery

##### dappInfo.description?

> `optional` **description**: `string`

##### dappInfo.icon?

> `optional` **icon**: `string`

##### dappInfo.name

> **name**: `string`

##### dappInfo.url?

> `optional` **url**: `string`

#### enabled?

> `optional` **enabled**: `boolean`

Whether discovery is enabled

#### maxAttempts?

> `optional` **maxAttempts**: `number`

Maximum number of discovery attempts

#### retryInterval?

> `optional` **retryInterval**: `number`

Retry interval for periodic discovery

#### technologies?

> `optional` **technologies**: `object`[]

Technology requirements for discovery

#### timeout?

> `optional` **timeout**: `number`

Discovery timeout in milliseconds

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`discovery`](CoreWalletMeshConfig.md#discovery)

***

### handleRehydration?

> `optional` **handleRehydration**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:585

Whether the client should handle session rehydration automatically.
Set to false if your framework (e.g., React) handles this separately.

#### Default

```ts
true
```

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`handleRehydration`](CoreWalletMeshConfig.md#handlerehydration)

***

### logger?

> `optional` **logger**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:638

Logger configuration for debugging and monitoring.

#### debug?

> `optional` **debug**: `boolean`

Enable debug logging

#### level?

> `optional` **level**: `"error"` \| `"debug"` \| `"info"` \| `"warn"` \| `"silent"`

Log level

#### prefix?

> `optional` **prefix**: `string`

Log prefix

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`logger`](CoreWalletMeshConfig.md#logger)

***

### maxConnections?

> `optional` **maxConnections**: `number`

Defined in: [core/modal-react/src/types.ts:189](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L189)

Maximum number of simultaneous wallet connections

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`maxConnections`](WalletMeshConfig.md#maxconnections)

***

### permissions?

> `optional` **permissions**: `Record`\<`string`, `string`[]\>

Defined in: [core/modal-react/src/types.ts:371](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L371)

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

Defined in: [core/modal-react/src/types.ts:298](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L298)

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

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:563

WalletConnect project ID.
Required for WalletConnect integration.
Get one at https://cloud.walletconnect.com

#### Inherited from

[`CoreWalletMeshConfig`](CoreWalletMeshConfig.md).[`projectId`](CoreWalletMeshConfig.md#projectid)

***

### supportedInterfaces?

> `optional` **supportedInterfaces**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:590

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

Defined in: [core/modal-react/src/types.ts:321](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L321)

Theme configuration for modal styling and behavior.

Controls the appearance and theming behavior of the modal component,
including color schemes, persistence, and customization options.

#### See

[ThemeProviderConfig](ThemeProviderConfig.md) For detailed theme options

***

### transactionOverlay?

> `optional` **transactionOverlay**: `object`

Defined in: [core/modal-react/src/types.ts:413](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L413)

Configuration for the transaction status overlay (blocking, for sync transactions).

This overlay shows the full transaction lifecycle with stages:
idle → simulating → proving → sending → pending → confirming → confirmed/failed

The overlay automatically shows during sync transactions (executeSync) and
dismisses 2.5 seconds after displaying the success/failure state.

#### allowEscapeKeyClose?

> `optional` **allowEscapeKeyClose**: `boolean`

Allow ESC key to close overlay when all transactions are in terminal state (confirmed/failed).
By default, ESC can close the overlay once all transactions have completed.
Has no effect during active transactions.

##### Default Value

```ts
true
```

#### description?

> `optional` **description**: `string`

Custom description text to display instead of the default stage-based description.

#### disableFocusTrap?

> `optional` **disableFocusTrap**: `boolean`

Disable focus trapping within the overlay.
By default, focus is trapped within the overlay for accessibility.
Only disable this if you're implementing custom focus management.

##### Default Value

```ts
false
```

#### disableNavigationGuard?

> `optional` **disableNavigationGuard**: `boolean`

Disable the beforeunload navigation guard that warns users before closing the tab.
By default, the guard is enabled to prevent accidental tab closure during transactions.

##### Default Value

```ts
false
```

#### enabled?

> `optional` **enabled**: `boolean`

Disable the overlay entirely while still allowing background indicator.

##### Default Value

```ts
true
```

#### headline?

> `optional` **headline**: `string`

Custom headline text to display instead of the default stage-based headline.

#### showBackgroundTransactions?

> `optional` **showBackgroundTransactions**: `boolean`

Show background (async) transactions in addition to sync transactions.
By default, only the active sync transaction is shown in the full-screen overlay.

##### Default Value

```ts
false
```

#### Example

```tsx
transactionOverlay: {
  enabled: true, // default
  disableNavigationGuard: false, // default - warns before closing tab
  headline: 'Processing Your Transaction', // optional override
  description: 'Please wait...', // optional override
  showBackgroundTransactions: false // default - only show active (sync) transactions
}
```

#### Since

3.1.0

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[]

Defined in: [core/modal-react/src/types.ts:186](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/modal-react/src/types.ts#L186)

Wallet configurations - array of WalletInfo objects

#### Inherited from

[`WalletMeshConfig`](WalletMeshConfig.md).[`wallets`](WalletMeshConfig.md#wallets)
