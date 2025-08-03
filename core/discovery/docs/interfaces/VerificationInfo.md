[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / VerificationInfo

# Interface: VerificationInfo

Defined in: [core/types.ts:947](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L947)

Wallet verification and trust information.

Contains cryptographic proofs and certificates that establish the
authenticity and trustworthiness of a wallet responder. Used for
security-critical applications requiring verified wallets.

## Examples

```typescript
const verification: VerificationInfo = {
  certificate: 'MIIDXTCCAkWgAwIBAgIJAKl...',
  signature: '0x1234567890abcdef...',
  authority: 'DigiCert Code Signing CA',
  timestamp: 1640995200000
};
```

```typescript
const domainVerification: VerificationInfo = {
  certificate: 'SSL certificate data...',
  authority: 'Let\'s Encrypt',
  timestamp: Date.now()
};
```

## Since

0.1.0

## See

[BaseResponderInfo](BaseResponderInfo.md) for verification usage

## Properties

### authority?

> `optional` **authority**: `string`

Defined in: [core/types.ts:950](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L950)

***

### certificate?

> `optional` **certificate**: `string`

Defined in: [core/types.ts:948](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L948)

***

### signature?

> `optional` **signature**: `string`

Defined in: [core/types.ts:949](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L949)

***

### timestamp?

> `optional` **timestamp**: `number`

Defined in: [core/types.ts:951](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L951)
