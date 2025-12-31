[**@walletmesh/discovery v0.1.4**](../README.md)

***

[@walletmesh/discovery](../globals.md) / DiscoveryResponderOptions

# Interface: DiscoveryResponderOptions

Defined in: [core/discovery/src/responder.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L37)

Options for DiscoveryResponder configuration.

## Since

0.1.0

## Properties

### eventTarget?

> `optional` **eventTarget**: `EventTarget`

Defined in: [core/discovery/src/responder.ts:43](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L43)

Custom event target for testing

***

### logger?

> `optional` **logger**: [`Logger`](Logger.md)

Defined in: [core/discovery/src/responder.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L45)

Custom logger instance

***

### security?

> `optional` **security**: [`SecurityPolicy`](SecurityPolicy.md) \| `"development"` \| `"testing"` \| `"production"` \| `"strict"`

Defined in: [core/discovery/src/responder.ts:39](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L39)

Security policy preset name or custom policy

***

### sessionOptions?

> `optional` **sessionOptions**: [`SessionOptions`](SessionOptions.md)

Defined in: [core/discovery/src/responder.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/discovery/src/responder.ts#L41)

Session management options
