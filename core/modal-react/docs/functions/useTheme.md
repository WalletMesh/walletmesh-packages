[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / useTheme

# Function: useTheme()

> **useTheme**(): [`UseThemeReturn`](../interfaces/UseThemeReturn.md)

Defined in: [core/modal-react/src/hooks/useTheme.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/7ea57a3bfc126e9ab8f0494eeebeb35f3de2db32/core/modal-react/src/hooks/useTheme.ts#L110)

Hook for accessing theme state and controls

Provides access to current theme, theme configuration, and theme controls.
Automatically handles system preference detection and persistence.

## Returns

[`UseThemeReturn`](../interfaces/UseThemeReturn.md)

Theme state and controls

## Examples

```tsx
import { useTheme } from '@walletmesh/modal-react';

function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={toggleTheme}>
        Toggle Theme
      </button>
      <button onClick={() => setTheme('system')}>
        Use System Theme
      </button>
    </div>
  );
}
```

```tsx
import { useTheme } from '@walletmesh/modal-react';

function ThemedButton({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, themeConfig } = useTheme();

  const buttonStyle = {
    backgroundColor: themeConfig.colors.primary,
    color: themeConfig.colors.textOnPrimary,
    border: `1px solid ${themeConfig.colors.border}`,
    borderRadius: themeConfig.borderRadius.md,
    padding: `${themeConfig.spacing.sm} ${themeConfig.spacing.md}`,
  };

  return (
    <button style={buttonStyle}>
      {children}
    </button>
  );
}
```

```tsx
import { useTheme } from '@walletmesh/modal-react';

function ConditionalIcon() {
  const { resolvedTheme } = useTheme();

  return (
    <div>
      {resolvedTheme === 'dark' ? (
        <MoonIcon />
      ) : (
        <SunIcon />
      )}
    </div>
  );
}
```

```tsx
import { useTheme } from '@walletmesh/modal-react';

function SSRSafeComponent() {
  const { isMounted, resolvedTheme } = useTheme();

  if (!isMounted) {
    // Render SSR-safe content
    return <div>Loading theme...</div>;
  }

  return (
    <div data-theme={resolvedTheme}>
      Theme-dependent content
    </div>
  );
}
```

## Throws

If used outside of ThemeProvider or WalletMeshProvider with theme support
