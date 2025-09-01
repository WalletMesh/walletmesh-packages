[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ResponderPlatform

# Interface: ResponderPlatform

Defined in: [core/types.ts:910](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L910)

Platform-specific requirements and compatibility information.

Defines the operating systems, browsers, devices, and other platform-specific
requirements for a wallet responder. Helps ensure compatibility before
attempting connections.

## Examples

```typescript
const extensionPlatform: ResponderPlatform = {
  browsers: ['chrome', 'firefox', 'edge'],
  os: ['windows', 'macos', 'linux'],
  requirements: {
    minBrowserVersion: {
      chrome: 90,
      firefox: 85,
      edge: 90
    },
    permissions: ['storage', 'tabs']
  }
};
```

```typescript
const mobilePlatform: ResponderPlatform = {
  os: ['ios', 'android'],
  devices: ['phone', 'tablet'],
  requirements: {
    minOSVersion: {
      ios: '14.0',
      android: '10.0'
    },
    features: ['biometric-auth', 'secure-enclave']
  }
};
```

## Since

0.1.0

## See

[BaseResponderInfo](BaseResponderInfo.md) for platform usage

## Properties

### browsers?

> `optional` **browsers**: `string`[]

Defined in: [core/types.ts:912](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L912)

***

### devices?

> `optional` **devices**: `string`[]

Defined in: [core/types.ts:913](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L913)

***

### os?

> `optional` **os**: `string`[]

Defined in: [core/types.ts:911](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L911)

***

### requirements?

> `optional` **requirements**: `Record`\<`string`, `unknown`\>

Defined in: [core/types.ts:914](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L914)
