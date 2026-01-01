[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ThemeDetection

# Interface: ThemeDetection

Theme detection utilities interface

## Methods

### getStoredTheme()

> **getStoredTheme**(`storageKey?`): `null` \| [`ThemeMode`](../type-aliases/ThemeMode.md)

#### Parameters

##### storageKey?

`string`

#### Returns

`null` \| [`ThemeMode`](../type-aliases/ThemeMode.md)

***

### getSystemTheme()

> **getSystemTheme**(): `"light"` \| `"dark"`

#### Returns

`"light"` \| `"dark"`

***

### onSystemThemeChange()

> **onSystemThemeChange**(`callback`): () => `void`

#### Parameters

##### callback

(`theme`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### removeStoredTheme()

> **removeStoredTheme**(`storageKey?`): `void`

#### Parameters

##### storageKey?

`string`

#### Returns

`void`

***

### storeTheme()

> **storeTheme**(`mode`, `storageKey?`): `void`

#### Parameters

##### mode

[`ThemeMode`](../type-aliases/ThemeMode.md)

##### storageKey?

`string`

#### Returns

`void`
