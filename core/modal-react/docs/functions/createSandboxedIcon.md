[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / createSandboxedIcon

# Function: createSandboxedIcon()

> **createSandboxedIcon**(`options`): `Promise`\<`HTMLIFrameElement`\>

Defined in: core/modal-core/dist/api/utils/iconSandbox.d.ts:79

Creates a sandboxed iframe for displaying an SVG icon safely

This function relies on Content Security Policy (CSP) for security rather than
pattern-based validation. If the CSP blocks the icon, it will automatically
fall back to the provided fallback icon or throw an error.

## Parameters

### options

[`CreateSandboxedIconOptions`](../interfaces/CreateSandboxedIconOptions.md)

Configuration options for the sandboxed icon

## Returns

`Promise`\<`HTMLIFrameElement`\>

Promise<HTMLIFrameElement> configured with security restrictions

## Throws

When icon validation fails or CSP blocks without fallback

## Example

```typescript
// Basic usage
const iframe = await createSandboxedIcon({
  iconDataUri: 'data:image/svg+xml,...',
  size: 24,
  fallbackIcon: 'data:image/svg+xml,...',
  onCspError: (error) => console.warn('Icon blocked by CSP:', error)
});

// Disabled/greyed out icon (e.g., for unsupported wallets)
const disabledIframe = await createSandboxedIcon({
  iconDataUri: 'data:image/svg+xml,...',
  size: 32,
  disabled: true, // Icon will appear greyed out
  disabledStyle: {
    grayscale: 100,    // Fully greyscale
    opacity: 0.5,      // Semi-transparent
    blur: 1           // Slight blur effect
  }
});
```
