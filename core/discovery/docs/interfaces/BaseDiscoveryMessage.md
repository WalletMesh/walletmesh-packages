[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / BaseDiscoveryMessage

# Interface: BaseDiscoveryMessage

Defined in: [core/discovery/src/types/core.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L24)

Base interface for all discovery protocol messages.

All protocol messages extend this interface to ensure consistent
structure and enable protocol version compatibility checks.

## Since

0.1.0

## Extended by

- [`DiscoveryRequestEvent`](DiscoveryRequestEvent.md)
- [`DiscoveryResponseEvent`](DiscoveryResponseEvent.md)
- [`DiscoveryCompleteEvent`](DiscoveryCompleteEvent.md)
- [`DiscoveryErrorEvent`](DiscoveryErrorEvent.md)

## Properties

### sessionId

> **sessionId**: `string`

Defined in: [core/discovery/src/types/core.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L27)

***

### type

> **type**: `string`

Defined in: [core/discovery/src/types/core.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L25)

***

### version

> **version**: `"0.1.0"`

Defined in: [core/discovery/src/types/core.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/types/core.ts#L26)
