import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from '../useTheme.js';

// Mock all the dependencies that useTheme might need
vi.mock('../../utils/ssr-walletmesh.js', () => ({
  isServer: () => false,
  isBrowser: () => true,
  safeBrowserAPI: vi.fn((fn, fallback) => {
    try {
      return fn();
    } catch {
      return fallback;
    }
  }),
}));

vi.mock('../../utils/logger.js', () => ({
  createComponentLogger: () => ({
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('../useSSR.js', () => ({
  useSSR: () => ({
    isServer: false,
    isBrowser: true,
    isMounted: true,
    isHydrated: true,
  }),
}));

// Mock theme utilities from modal-core
vi.mock('@walletmesh/modal-core', () => ({
  getSystemTheme: () => 'light',
  getStoredTheme: () => null,
  storeTheme: vi.fn(),
  onSystemThemeChange: vi.fn(() => () => {}),
  resolveTheme: (theme: string, systemTheme: string) => (theme === 'system' ? systemTheme : theme),
  toggleTheme: (current: string, _system: string) => (current === 'light' ? 'dark' : 'light'),
  themeConfigToCSSVariables: vi.fn(() => ({})),
  applyCSSVariables: vi.fn(),
  applyThemeClass: vi.fn(),
  disableTransitions: vi.fn(),
  DEFAULT_THEME_STORAGE_KEY: 'walletmesh-theme',
  DEFAULT_CSS_PREFIX: 'wm',
  getAztecProvingState: vi.fn(() => ({ entries: {} })),
  getActiveAztecProvingEntries: vi.fn(() => []),
  provingActions: {
    handleNotification: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// Mock theme definitions
vi.mock('../../theme/definitions.js', () => ({
  getThemeByMode: () => ({
    mode: 'light',
    colors: { primary: '#000' },
    shadows: {},
    animation: { duration: {}, easing: {} },
    typography: { fontFamily: {}, fontSize: {}, fontWeight: {}, lineHeight: {} },
    spacing: {},
    borderRadius: {},
  }),
  mergeThemeConfig: (base: unknown, custom: unknown) => ({
    ...(base as Record<string, unknown>),
    ...(custom as Record<string, unknown>),
  }),
}));

// Create a simple mock context
const mockThemeContext = {
  theme: 'light' as const,
  resolvedTheme: 'light' as const,
  systemTheme: 'light' as const,
  themeConfig: {
    mode: 'light' as const,
    colors: { primary: '#000' },
    shadows: {},
    animation: { duration: {}, easing: {} },
    typography: { fontFamily: {}, fontSize: {}, fontWeight: {}, lineHeight: {} },
    spacing: {},
    borderRadius: {},
  },
  setTheme: vi.fn(),
  toggleTheme: vi.fn(),
  isMounted: true,
  refreshSystemTheme: vi.fn(),
};

// Mock the theme context with a proper provider
vi.mock('../../theme/ThemeContext.js', () => {
  const React = require('react');
  return {
    useThemeContext: () => mockThemeContext,
    ThemeProvider: ({ children }: { children: ReactNode }) => {
      return React.createElement('div', { 'data-testid': 'theme-provider' }, children);
    },
    useHasThemeProvider: () => true,
    withTheme: (Component: React.ComponentType) => Component,
    DefaultThemeProvider: ({ children }: { children: ReactNode }) => {
      return React.createElement('div', { 'data-testid': 'default-theme-provider' }, children);
    },
  };
});

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return theme context values', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current).toEqual(mockThemeContext);
  });

  it('should return current theme mode', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('light');
  });

  it('should return resolved theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.resolvedTheme).toBe('light');
  });

  it('should return system theme', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.systemTheme).toBe('light');
  });

  it('should return theme configuration', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.themeConfig).toEqual(mockThemeContext.themeConfig);
  });

  it('should return mounted state', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.isMounted).toBe(true);
  });

  it('should return theme control functions', () => {
    const { result } = renderHook(() => useTheme());

    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.toggleTheme).toBe('function');
    expect(typeof result.current.refreshSystemTheme).toBe('function');
  });

  it('should provide stable function references', () => {
    const { result, rerender } = renderHook(() => useTheme());

    const firstRender = result.current;
    rerender();
    const secondRender = result.current;

    // Functions should be the same reference due to mocking
    expect(firstRender.setTheme).toBe(secondRender.setTheme);
    expect(firstRender.toggleTheme).toBe(secondRender.toggleTheme);
    expect(firstRender.refreshSystemTheme).toBe(secondRender.refreshSystemTheme);
  });

  it('should have correct types for theme properties', () => {
    const { result } = renderHook(() => useTheme());

    // Theme modes should be valid strings
    expect(['light', 'dark', 'system']).toContain(result.current.theme);
    expect(['light', 'dark']).toContain(result.current.resolvedTheme);
    expect(['light', 'dark']).toContain(result.current.systemTheme);

    // Functions should be callable
    expect(typeof result.current.setTheme).toBe('function');
    expect(typeof result.current.toggleTheme).toBe('function');
    expect(typeof result.current.refreshSystemTheme).toBe('function');

    // Boolean values
    expect(typeof result.current.isMounted).toBe('boolean');

    // Theme config should be an object
    expect(typeof result.current.themeConfig).toBe('object');
    expect(result.current.themeConfig).toHaveProperty('mode');
    expect(result.current.themeConfig).toHaveProperty('colors');
  });
});
