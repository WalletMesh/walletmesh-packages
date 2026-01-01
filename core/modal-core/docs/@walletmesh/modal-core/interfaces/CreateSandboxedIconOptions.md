[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CreateSandboxedIconOptions

# Interface: CreateSandboxedIconOptions

Options for creating a sandboxed icon

## Extended by

- [`NormalizedIconOptions`](NormalizedIconOptions.md)

## Properties

### disabled?

> `optional` **disabled**: `boolean`

Whether the icon should appear disabled/greyed out

***

### disabledStyle?

> `optional` **disabledStyle**: [`DisabledIconStyle`](DisabledIconStyle.md)

Custom styling for disabled state

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Fallback icon data URI to use if CSP blocks the main icon

***

### iconDataUri

> **iconDataUri**: `string`

Icon data URI

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

***

### size?

> `optional` **size**: `number`

Size of the icon in pixels (default: 24)

***

### timeout?

> `optional` **timeout**: `number`

Timeout in ms to detect CSP violations (default: 3000)
