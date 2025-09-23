[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ThemeDetection

# Interface: ThemeDetection

Defined in: [core/modal-react/src/theme/types.ts:279](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L279)

Theme detection utilities

## Methods

### getStoredTheme()

> **getStoredTheme**(`storageKey`): `null` \| `ThemeMode`

Defined in: [core/modal-react/src/theme/types.ts:288](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L288)

Get stored theme preference

#### Parameters

##### storageKey

`string`

#### Returns

`null` \| `ThemeMode`

***

### getSystemTheme()

> **getSystemTheme**(): `"light"` \| `"dark"`

Defined in: [core/modal-react/src/theme/types.ts:283](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L283)

Detect system theme preference

#### Returns

`"light"` \| `"dark"`

***

### onSystemThemeChange()

> **onSystemThemeChange**(`callback`): () => `void`

Defined in: [core/modal-react/src/theme/types.ts:303](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L303)

Listen for system theme changes

#### Parameters

##### callback

(`theme`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### removeStoredTheme()

> **removeStoredTheme**(`storageKey`): `void`

Defined in: [core/modal-react/src/theme/types.ts:298](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L298)

Remove stored theme preference

#### Parameters

##### storageKey

`string`

#### Returns

`void`

***

### storeTheme()

> **storeTheme**(`mode`, `storageKey`): `void`

Defined in: [core/modal-react/src/theme/types.ts:293](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/theme/types.ts#L293)

Store theme preference

#### Parameters

##### mode

`ThemeMode`

##### storageKey

`string`

#### Returns

`void`
