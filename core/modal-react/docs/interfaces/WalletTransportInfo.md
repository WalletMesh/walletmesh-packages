[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletTransportInfo

# Interface: WalletTransportInfo

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L36)

Wallet transport information

## Properties

### error

> **error**: `null` \| `Error`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L48)

Connection error if any

***

### isAvailable

> **isAvailable**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:40](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L40)

Whether transport is available

***

### isConnecting

> **isConnecting**: `boolean`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:42](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L42)

Whether currently connecting

***

### sessionId

> **sessionId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:44](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L44)

Current session ID

***

### transport

> **transport**: `null` \| [`WalletTransport`](WalletTransport.md)

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:38](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L38)

The wallet transport instance

***

### walletId

> **walletId**: `null` \| `string`

Defined in: [core/modal-react/src/hooks/useWalletTransport.ts:46](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/modal-react/src/hooks/useWalletTransport.ts#L46)

Wallet ID providing this transport
