[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / CreateSandboxedIconOptions

# Interface: CreateSandboxedIconOptions

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:28

Options for creating a sandboxed icon

## Properties

### disabled?

> `optional` **disabled**: `boolean`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:44

Whether the icon should appear disabled/greyed out

***

### disabledStyle?

> `optional` **disabledStyle**: `DisabledIconStyle`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:46

Custom styling for disabled state

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:34

Fallback icon data URI to use if CSP blocks the main icon

***

### iconDataUri

> **iconDataUri**: `string`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:30

Icon data URI

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:38

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

***

### size?

> `optional` **size**: `number`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:32

Size of the icon in pixels (default: 24)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:36

Timeout in ms to detect CSP violations (default: 3000)
