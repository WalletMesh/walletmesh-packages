/**
 * Theme context and provider for WalletMesh React
 *
 * Provides theme state management with SSR safety, system preference detection,
 * and automatic persistence. Handles theme switching with smooth transitions.
 *
 * @module theme/ThemeContext
 * @packageDocumentation
 */

import {
  DEFAULT_CSS_PREFIX,
  DEFAULT_THEME_STORAGE_KEY,
  ErrorFactory,
  applyCSSVariables,
  applyThemeClass,
  disableTransitions,
  getStoredTheme,
  getSystemTheme,
  onSystemThemeChange,
  resolveTheme,
  storeTheme,
  themeConfigToCSSVariables,
  toggleTheme,
} from '@walletmesh/modal-core';
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useSSR } from '../hooks/useSSR.js';
import { getThemeByMode, mergeThemeConfig } from './definitions.js';
import type { ThemeConfig, ThemeContextValue, ThemeMode, ThemeProviderConfig } from './types.js';

/**
 * Theme context - provides theme state and controls
 */
const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Props for ThemeProvider component
 */
export interface ThemeProviderProps extends ThemeProviderConfig {
  children: ReactNode;
}

/**
 * Theme provider component
 *
 * Manages theme state, system preference detection, and CSS variable application.
 * Provides theme context to all child components with SSR safety.
 */
export function ThemeProvider({
  children,
  mode = 'system',
  persist = true,
  customization = {},
  storageKey = DEFAULT_THEME_STORAGE_KEY,
  cssPrefix = DEFAULT_CSS_PREFIX,
  disableTransitionsOnChange = true,
}: ThemeProviderProps) {
  const { isMounted: hasMounted } = useSSR();

  // System theme detection
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() =>
    hasMounted ? getSystemTheme() : 'light',
  );

  // Current theme mode state
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (!hasMounted) {
      return mode; // Use prop default for SSR
    }

    if (persist) {
      const stored = getStoredTheme(storageKey);
      if (stored) {
        return stored;
      }
    }

    return mode;
  });

  // Resolved theme (never 'system')
  const resolvedTheme = useMemo<'light' | 'dark'>(
    () => resolveTheme(theme, systemTheme),
    [theme, systemTheme],
  );

  // Current theme configuration
  const themeConfig = useMemo<ThemeConfig>(() => {
    const baseTheme = getThemeByMode(resolvedTheme);
    return mergeThemeConfig(baseTheme, customization || {});
  }, [resolvedTheme, customization]);

  // Set theme with persistence and CSS application
  const setTheme = useCallback(
    (newMode: ThemeMode) => {
      if (disableTransitionsOnChange) {
        disableTransitions();
      }

      setThemeState(newMode);

      if (persist && hasMounted) {
        storeTheme(newMode, storageKey);
      }
    },
    [persist, hasMounted, storageKey, disableTransitionsOnChange],
  );

  // Toggle between light and dark
  const handleToggleTheme = useCallback(() => {
    const newTheme = toggleTheme(theme, systemTheme);
    setTheme(newTheme);
  }, [theme, systemTheme, setTheme]);

  // Force refresh of system theme
  const refreshSystemTheme = useCallback(() => {
    if (hasMounted) {
      setSystemTheme(getSystemTheme());
    }
  }, [hasMounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    // Update system theme on mount
    setSystemTheme(getSystemTheme());

    // Listen for changes
    return onSystemThemeChange((newSystemTheme: 'light' | 'dark') => {
      setSystemTheme(newSystemTheme);
    });
  }, [hasMounted]);

  // Apply theme styles when theme changes
  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    // Apply CSS variables
    const cssVariables = themeConfigToCSSVariables(themeConfig, cssPrefix);
    applyCSSVariables(cssVariables);

    // Apply theme class
    applyThemeClass(resolvedTheme, cssPrefix);
  }, [themeConfig, resolvedTheme, cssPrefix, hasMounted]);

  // Initialize theme on mount
  useEffect(() => {
    if (!hasMounted) {
      return;
    }

    // Apply initial theme without transitions
    if (disableTransitionsOnChange) {
      disableTransitions();
    }

    const cssVariables = themeConfigToCSSVariables(themeConfig, cssPrefix);
    applyCSSVariables(cssVariables);
    applyThemeClass(resolvedTheme, cssPrefix);
  }, [hasMounted, disableTransitionsOnChange, themeConfig, cssPrefix, resolvedTheme]); // Only run on mount

  // Context value
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      systemTheme,
      themeConfig,
      setTheme,
      toggleTheme: handleToggleTheme,
      isMounted: hasMounted,
      refreshSystemTheme,
    }),
    [
      theme,
      resolvedTheme,
      systemTheme,
      themeConfig,
      setTheme,
      handleToggleTheme,
      hasMounted,
      refreshSystemTheme,
    ],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 *
 * @throws {Error} If used outside of ThemeProvider
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw ErrorFactory.configurationError('useThemeContext must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to check if ThemeProvider is available
 */
export function useHasThemeProvider(): boolean {
  return useContext(ThemeContext) !== null;
}

/**
 * Higher-order component to provide theme context
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<P & ThemeProviderConfig> {
  return function WithThemeComponent(props: P & ThemeProviderConfig & { children?: ReactNode }) {
    const {
      children,
      mode,
      persist,
      customization,
      storageKey,
      cssPrefix,
      disableTransitionsOnChange,
      ...componentProps
    } = props;

    const themeProps: ThemeProviderProps = {
      children,
      ...(mode !== undefined && { mode }),
      ...(persist !== undefined && { persist }),
      ...(customization !== undefined && { customization }),
      ...(storageKey !== undefined && { storageKey }),
      ...(cssPrefix !== undefined && { cssPrefix }),
      ...(disableTransitionsOnChange !== undefined && { disableTransitionsOnChange }),
    };

    return (
      <ThemeProvider {...themeProps}>
        <Component {...(componentProps as P)} />
      </ThemeProvider>
    );
  };
}

/**
 * Default theme provider with sensible defaults
 */
export function DefaultThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider mode="system" persist={true} disableTransitionsOnChange={true}>
      {children}
    </ThemeProvider>
  );
}
