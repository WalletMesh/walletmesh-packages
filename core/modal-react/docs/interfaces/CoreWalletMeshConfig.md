[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / CoreWalletMeshConfig

# Interface: CoreWalletMeshConfig

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:398

Configuration options for initializing a WalletMesh client.

## Example

```typescript
const config: WalletMeshConfig = {
  appName: 'My DApp',
  appDescription: 'A decentralized application',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png',
  projectId: 'your-walletconnect-project-id',
  chains: [
    { chainId: '1', chainType: 'evm', name: 'Ethereum' }
  ],
  wallets: {
    order: ['metamask', 'walletconnect'],
    exclude: ['phantom']
  }
};
```

## Properties

### appDescription?

> `optional` **appDescription**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:408

Optional description of your application.
Provides context to users when connecting wallets.

***

### appIcon?

> `optional` **appIcon**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:418

Icon URL for your application.
Should be a square image (recommended 256x256 or larger).

***

### appMetadata?

> `optional` **appMetadata**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:423

Extended dApp metadata for identification and display.
Provides comprehensive identity information that flows through the entire system.

#### Index Signature

\[`key`: `string`\]: `unknown`

Additional metadata fields for future extensions

#### description?

> `optional` **description**: `string`

dApp description (can override appDescription)

#### icon?

> `optional` **icon**: `string`

dApp icon URL for wallet display

#### name?

> `optional` **name**: `string`

dApp name (can override appName)

#### origin?

> `optional` **origin**: `string`

Explicit origin URL (auto-detected from window.location.origin if not provided)

#### url?

> `optional` **url**: `string`

dApp homepage URL

***

### appName

> **appName**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:403

The name of your application.
This is displayed in wallet connection prompts.

***

### appUrl?

> `optional` **appUrl**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:413

URL of your application.
Used by wallets for verification and display.

***

### chains?

> `optional` **chains**: `object`[]

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:447

Supported blockchain networks.
Defines which chains your app supports using SupportedChain objects.

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

***

### debug?

> `optional` **debug**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:458

Enable debug mode for additional logging.

#### Default

```ts
false
```

***

### discovery?

> `optional` **discovery**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:481

Discovery configuration for wallet detection.
Configures how the client discovers available wallets.

#### capabilities?

> `optional` **capabilities**: `object`

Capability requirements for wallet matching

##### capabilities.features?

> `optional` **features**: `string`[]

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

***

### handleRehydration?

> `optional` **handleRehydration**: `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:464

Whether the client should handle session rehydration automatically.
Set to false if your framework (e.g., React) handles this separately.

#### Default

```ts
true
```

***

### logger?

> `optional` **logger**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:515

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

***

### projectId?

> `optional` **projectId**: `string`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:442

WalletConnect project ID.
Required for WalletConnect integration.
Get one at https://cloud.walletconnect.com

***

### supportedInterfaces?

> `optional` **supportedInterfaces**: `object`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:469

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

***

### wallets?

> `optional` **wallets**: [`WalletInfo`](WalletInfo.md)[] \| [`WalletConfig`](WalletConfig.md)

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:453

Wallet preferences and filtering options.
Controls which wallets are displayed and in what order.
Can also be an array of WalletInfo objects for direct wallet specification.
