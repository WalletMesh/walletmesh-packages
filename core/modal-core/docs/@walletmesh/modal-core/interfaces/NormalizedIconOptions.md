[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / NormalizedIconOptions

# Interface: NormalizedIconOptions

Normalized options for icon creation

## Extends

- [`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md)

## Properties

### disabled?

> `optional` **disabled**: `boolean`

Whether the icon should appear disabled/greyed out

#### Inherited from

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`disabled`](CreateSandboxedIconOptions.md#disabled)

***

### disabledStyle?

> `optional` **disabledStyle**: [`DisabledIconStyle`](DisabledIconStyle.md)

Custom styling for disabled state

#### Inherited from

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`disabledStyle`](CreateSandboxedIconOptions.md#disabledstyle)

***

### fallbackIcon?

> `optional` **fallbackIcon**: `string`

Fallback icon data URI to use if CSP blocks the main icon

#### Inherited from

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`fallbackIcon`](CreateSandboxedIconOptions.md#fallbackicon)

***

### iconDataUri

> **iconDataUri**: `string`

Icon data URI

#### Inherited from

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`iconDataUri`](CreateSandboxedIconOptions.md#icondatauri)

***

### onCspError()?

> `optional` **onCspError**: (`error`) => `void`

Callback when CSP error is detected

#### Parameters

##### error

`Error` | \{ `category`: `string`; `code`: `string`; `message`: `string`; \}

#### Returns

`void`

#### Inherited from

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`onCspError`](CreateSandboxedIconOptions.md#oncsperror)

***

### size

> **size**: `number`

Resolved size

#### Overrides

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`size`](CreateSandboxedIconOptions.md#size)

***

### timeout

> **timeout**: `number`

Resolved timeout

#### Overrides

[`CreateSandboxedIconOptions`](CreateSandboxedIconOptions.md).[`timeout`](CreateSandboxedIconOptions.md#timeout)
