[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / OriginValidator

# Class: OriginValidator

Defined in: [core/discovery/src/security.ts:31](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L31)

Origin validator implementing robust validation and anti-spoofing measures.

## Since

0.1.0

## Constructors

### Constructor

> **new OriginValidator**(`policy?`, `logger?`): `OriginValidator`

Defined in: [core/discovery/src/security.ts:37](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L37)

#### Parameters

##### policy?

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

##### logger?

[`Logger`](../interfaces/Logger.md) = `defaultLogger`

#### Returns

`OriginValidator`

## Methods

### updatePolicy()

> **updatePolicy**(`policy`): `void`

Defined in: [core/discovery/src/security.ts:96](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L96)

Update the security policy.

#### Parameters

##### policy

[`SecurityPolicy`](../interfaces/SecurityPolicy.md)

#### Returns

`void`

***

### validateEventOrigin()

> **validateEventOrigin**(`eventOrigin`, `claimedOrigin`): [`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Defined in: [core/discovery/src/security.ts:105](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L105)

Validate that event origin matches the claimed origin.

#### Parameters

##### eventOrigin

`string`

##### claimedOrigin

`string`

#### Returns

[`OriginValidationResult`](../interfaces/OriginValidationResult.md)

***

### validateOrigin()

> **validateOrigin**(`origin`): [`OriginValidationResult`](../interfaces/OriginValidationResult.md)

Defined in: [core/discovery/src/security.ts:51](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L51)

Validate an origin against the security policy.

#### Parameters

##### origin

`string`

#### Returns

[`OriginValidationResult`](../interfaces/OriginValidationResult.md)
