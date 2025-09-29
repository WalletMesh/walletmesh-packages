import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock modal-core
vi.mock('@walletmesh/modal-core', async () => {
  const actual = await vi.importActual('@walletmesh/modal-core');
  return {
    ...actual,
    isBrowser: () => typeof window !== 'undefined',
    createDebugLogger: vi.fn().mockImplementation(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setLevel: vi.fn(),
      dispose: vi.fn(),
    })),
    modalLogger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn((message: string, error: unknown) => console.warn(message, error)),
      error: vi.fn((message: string, error: unknown) => console.error(message, error)),
      setLevel: vi.fn(),
      dispose: vi.fn(),
    },
  };
});

// Mock the logger utils before imports
vi.mock('../../utils/logger.js', () => ({
  getReactLogger: () => ({
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }),
}));

import {
  DEFAULT_CSS_PREFIX,
  DEFAULT_THEME_STORAGE_KEY,
  applyCSSVariables,
  applyThemeClass,
  disableTransitions,
  getNextTheme,
  getStoredTheme,
  getSystemTheme,
  initializeTheme,
  isValidThemeMode,
  onSystemThemeChange,
  removeCSSVariables,
  removeStoredTheme,
  resolveTheme,
  storeTheme,
  themeConfigToCSSVariables,
  toggleTheme,
} from '@walletmesh/modal-core';
// import { lightTheme, darkTheme } from '../definitions.js'; // unused
import type { ThemeConfig, ThemeMode } from '../types.js';

describe('Theme Utils', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock document
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: vi.fn(),
          removeProperty: vi.fn(),
        },
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
        setAttribute: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(document, 'head', {
      value: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        contains: vi.fn().mockReturnValue(true),
      },
      writable: true,
    });

    // Mock document.createElement
    Object.defineProperty(document, 'createElement', {
      value: vi.fn().mockReturnValue({
        textContent: '',
      }),
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getSystemTheme', () => {
    it('should return light for SSR', () => {
      // Mock SSR environment
      vi.doMock('@walletmesh/modal-core', () => ({
        isBrowser: () => false,
      }));

      expect(getSystemTheme()).toBe('light');
    });

    it('should return dark when system prefers dark', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
      }));

      expect(getSystemTheme()).toBe('dark');
    });

    it('should return light when system prefers light', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
      }));

      expect(getSystemTheme()).toBe('light');
    });
  });

  describe('getStoredTheme', () => {
    it('should return null for SSR', () => {
      vi.doMock('@walletmesh/modal-core', () => ({
        isBrowser: () => false,
      }));

      expect(getStoredTheme()).toBeNull();
    });

    it('should return stored theme mode', () => {
      const getItem = vi.fn().mockReturnValue('dark');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem },
      });

      expect(getStoredTheme()).toBe('dark');
      expect(getItem).toHaveBeenCalledWith(DEFAULT_THEME_STORAGE_KEY);
    });

    it('should return null for invalid stored theme', () => {
      const getItem = vi.fn().mockReturnValue('invalid');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem },
      });

      expect(getStoredTheme()).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });
      Object.defineProperty(window, 'localStorage', {
        value: { getItem },
      });

      expect(getStoredTheme()).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ModalCore]',
        'Failed to read theme from localStorage',
        expect.objectContaining({
          message: 'localStorage error',
        }),
      );
      consoleSpy.mockRestore();
    });

    it('should use custom storage key', () => {
      const getItem = vi.fn().mockReturnValue('light');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem },
      });

      getStoredTheme('custom-key');
      expect(getItem).toHaveBeenCalledWith('custom-key');
    });
  });

  describe('storeTheme', () => {
    it('should store theme in localStorage', () => {
      const setItem = vi.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { setItem },
      });

      storeTheme('dark');
      expect(setItem).toHaveBeenCalledWith(DEFAULT_THEME_STORAGE_KEY, 'dark');
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });
      Object.defineProperty(window, 'localStorage', {
        value: { setItem },
      });

      expect(() => storeTheme('dark')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ModalCore]',
        'Failed to store theme in localStorage',
        expect.objectContaining({
          message: 'localStorage error',
        }),
      );
      consoleSpy.mockRestore();
    });

    it('should use custom storage key', () => {
      const setItem = vi.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { setItem },
      });

      storeTheme('light', 'custom-key');
      expect(setItem).toHaveBeenCalledWith('custom-key', 'light');
    });
  });

  describe('removeStoredTheme', () => {
    it('should remove theme from localStorage', () => {
      const removeItem = vi.fn();
      Object.defineProperty(window, 'localStorage', {
        value: { removeItem },
      });

      removeStoredTheme();
      expect(removeItem).toHaveBeenCalledWith(DEFAULT_THEME_STORAGE_KEY);
    });

    it('should handle localStorage errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const removeItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error');
      });
      Object.defineProperty(window, 'localStorage', {
        value: { removeItem },
      });

      expect(() => removeStoredTheme()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ModalCore]',
        'Failed to remove theme from localStorage',
        expect.objectContaining({
          message: 'localStorage error',
        }),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('onSystemThemeChange', () => {
    it('should return no-op function for SSR', () => {
      vi.doMock('@walletmesh/modal-core', () => ({
        isBrowser: () => false,
      }));

      const callback = vi.fn();
      const cleanup = onSystemThemeChange(callback);
      expect(typeof cleanup).toBe('function');
      cleanup(); // Should not throw
    });

    it('should add event listener for modern browsers', () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();
      window.matchMedia = vi.fn().mockReturnValue({
        addEventListener,
        removeEventListener,
      });

      const callback = vi.fn();
      const cleanup = onSystemThemeChange(callback);

      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      cleanup();
      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should use legacy listeners for older browsers', () => {
      const addListener = vi.fn();
      const removeListener = vi.fn();
      window.matchMedia = vi.fn().mockReturnValue({
        addListener,
        removeListener,
      });

      const callback = vi.fn();
      const cleanup = onSystemThemeChange(callback);

      expect(addListener).toHaveBeenCalledWith(expect.any(Function));

      cleanup();
      expect(removeListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should call callback with correct theme', () => {
      const addEventListener = vi.fn();
      window.matchMedia = vi.fn().mockReturnValue({
        addEventListener,
      });

      const callback = vi.fn();
      onSystemThemeChange(callback);

      const eventHandler = addEventListener.mock.calls[0]?.[1];
      eventHandler({ matches: true });
      expect(callback).toHaveBeenCalledWith('dark');

      eventHandler({ matches: false });
      expect(callback).toHaveBeenCalledWith('light');
    });
  });

  describe('resolveTheme', () => {
    it('should return actual theme for non-system modes', () => {
      expect(resolveTheme('light', 'dark')).toBe('light');
      expect(resolveTheme('dark', 'light')).toBe('dark');
    });

    it('should return system theme for system mode', () => {
      expect(resolveTheme('system', 'dark')).toBe('dark');
      expect(resolveTheme('system', 'light')).toBe('light');
    });

    it('should use getSystemTheme as default', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(resolveTheme('system')).toBe('dark');
    });
  });

  describe('themeConfigToCSSVariables', () => {
    it('should convert theme config to CSS variables', () => {
      const config = {
        mode: 'light',
        colors: {
          primary: '#4f46e5',
          background: '#ffffff',
        },
        shadows: {
          md: '0 4px 6px rgba(0,0,0,0.1)',
        },
        animation: {
          duration: {
            normal: '200ms',
          },
          easing: {
            ease: 'ease',
          },
        },
        typography: {
          fontFamily: {
            sans: 'Arial',
          },
          fontSize: {
            base: '16px',
          },
          fontWeight: {
            medium: '500',
          },
          lineHeight: {
            normal: '1.5',
          },
        },
        spacing: {
          md: '16px',
        },
        borderRadius: {
          md: '8px',
        },
      } as ThemeConfig;

      const variables = themeConfigToCSSVariables(config);

      expect(variables).toEqual({
        '--wm-color-primary': '#4f46e5',
        '--wm-color-background': '#ffffff',
        '--wm-shadow-md': '0 4px 6px rgba(0,0,0,0.1)',
        '--wm-duration-normal': '200ms',
        '--wm-easing-ease': 'ease',
        '--wm-font-sans': 'Arial',
        '--wm-text-base': '16px',
        '--wm-weight-medium': '500',
        '--wm-leading-normal': '1.5',
        '--wm-space-md': '16px',
        '--wm-radius-md': '8px',
      });
    });

    it('should use custom prefix', () => {
      const config = {
        mode: 'light',
        colors: { primary: '#000' },
        shadows: {},
        animation: { duration: {}, easing: {} },
        typography: { fontFamily: {}, fontSize: {}, fontWeight: {}, lineHeight: {} },
        spacing: {},
        borderRadius: {},
      } as ThemeConfig;

      const variables = themeConfigToCSSVariables(config, 'custom');
      expect(Object.keys(variables)[0]).toBe('--custom-color-primary');
    });

    it('should handle camelCase to kebab-case conversion', () => {
      const config = {
        mode: 'light',
        colors: { primaryHover: '#000' },
        shadows: {},
        animation: { duration: {}, easing: {} },
        typography: { fontFamily: {}, fontSize: {}, fontWeight: {}, lineHeight: {} },
        spacing: {},
        borderRadius: {},
      } as ThemeConfig;

      const variables = themeConfigToCSSVariables(config);
      expect(variables['--wm-color-primary-hover']).toBe('#000');
    });
  });

  describe('applyCSSVariables', () => {
    it('should apply CSS variables to document root', () => {
      const setProperty = vi.fn();
      Object.defineProperty(document, 'documentElement', {
        value: { style: { setProperty } },
      });

      const variables = {
        '--wm-color-primary': '#4f46e5',
        '--wm-color-background': '#ffffff',
      };

      applyCSSVariables(variables);

      expect(setProperty).toHaveBeenCalledWith('--wm-color-primary', '#4f46e5');
      expect(setProperty).toHaveBeenCalledWith('--wm-color-background', '#ffffff');
    });

    it('should apply CSS variables to custom element', () => {
      const setProperty = vi.fn();
      const customElement = { style: { setProperty } } as unknown as HTMLElement;

      const variables = { '--custom-var': 'value' };
      applyCSSVariables(variables, customElement);

      expect(setProperty).toHaveBeenCalledWith('--custom-var', 'value');
    });
  });

  describe('removeCSSVariables', () => {
    it('should remove CSS variables from document root', () => {
      const removeProperty = vi.fn();
      Object.defineProperty(document, 'documentElement', {
        value: { style: { removeProperty } },
      });

      const variableNames = ['--wm-color-primary', '--wm-color-background'];
      removeCSSVariables(variableNames);

      expect(removeProperty).toHaveBeenCalledWith('--wm-color-primary');
      expect(removeProperty).toHaveBeenCalledWith('--wm-color-background');
    });

    it('should remove CSS variables from custom element', () => {
      const removeProperty = vi.fn();
      const customElement = { style: { removeProperty } } as unknown as HTMLElement;

      const variableNames = ['--custom-var'];
      removeCSSVariables(variableNames, customElement);

      expect(removeProperty).toHaveBeenCalledWith('--custom-var');
    });
  });

  describe('applyThemeClass', () => {
    it('should apply theme class and data attribute', () => {
      const classList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const setAttribute = vi.fn();

      Object.defineProperty(document, 'documentElement', {
        value: { classList, setAttribute },
      });

      applyThemeClass('dark');

      expect(classList.remove).toHaveBeenCalledWith('wm-theme-light', 'wm-theme-dark');
      expect(classList.add).toHaveBeenCalledWith('wm-theme-dark');
      expect(setAttribute).toHaveBeenCalledWith('data-wm-theme', 'dark');
    });

    it('should use custom prefix', () => {
      const classList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const setAttribute = vi.fn();

      Object.defineProperty(document, 'documentElement', {
        value: { classList, setAttribute },
      });

      applyThemeClass('light', 'custom');

      expect(classList.remove).toHaveBeenCalledWith('custom-theme-light', 'custom-theme-dark');
      expect(classList.add).toHaveBeenCalledWith('custom-theme-light');
      expect(setAttribute).toHaveBeenCalledWith('data-custom-theme', 'light');
    });

    it('should apply to custom element', () => {
      const classList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const setAttribute = vi.fn();
      const customElement = { classList, setAttribute } as unknown as HTMLElement;

      applyThemeClass('dark', 'wm', customElement);

      expect(classList.add).toHaveBeenCalledWith('wm-theme-dark');
      expect(setAttribute).toHaveBeenCalledWith('data-wm-theme', 'dark');
    });
  });

  describe('disableTransitions', () => {
    it('should inject CSS to disable transitions', () => {
      const createElement = vi.fn().mockReturnValue({
        textContent: '',
      });
      const appendChild = vi.fn();

      Object.defineProperty(document, 'createElement', {
        value: createElement,
      });
      Object.defineProperty(document, 'head', {
        value: { appendChild },
      });

      disableTransitions(100);

      expect(createElement).toHaveBeenCalledWith('style');
      expect(appendChild).toHaveBeenCalled();
    });

    it('should return cleanup function', () => {
      const cleanup = disableTransitions(100);
      expect(typeof cleanup).toBe('function');

      // Should not throw when called
      cleanup();
    });

    it('should auto-cleanup after timeout', () => {
      disableTransitions(100);

      vi.advanceTimersByTime(100);

      // Should call removeChild after timeout
      expect(document.head.removeChild).toHaveBeenCalled();
    });
  });

  describe('getNextTheme', () => {
    it('should cycle through themes correctly', () => {
      expect(getNextTheme('light')).toBe('dark');
      expect(getNextTheme('dark')).toBe('system');
      expect(getNextTheme('system')).toBe('light');
    });

    it('should default to light for invalid themes', () => {
      expect(getNextTheme('invalid' as ThemeMode)).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle between light and dark', () => {
      expect(toggleTheme('light', 'light')).toBe('dark');
      expect(toggleTheme('dark', 'dark')).toBe('light');
    });

    it('should resolve system theme before toggling', () => {
      expect(toggleTheme('system', 'light')).toBe('dark');
      expect(toggleTheme('system', 'dark')).toBe('light');
    });
  });

  describe('isValidThemeMode', () => {
    it('should validate theme modes correctly', () => {
      expect(isValidThemeMode('light')).toBe(true);
      expect(isValidThemeMode('dark')).toBe(true);
      expect(isValidThemeMode('system')).toBe(true);
      expect(isValidThemeMode('invalid')).toBe(false);
      expect(isValidThemeMode('')).toBe(false);
    });
  });

  describe('initializeTheme', () => {
    beforeEach(() => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    });

    it('should return light for SSR', () => {
      vi.doMock('@walletmesh/modal-core', () => ({
        isBrowser: () => false,
      }));

      expect(initializeTheme()).toBe('light');
    });

    it('should initialize with stored theme', () => {
      const getItem = vi.fn().mockReturnValue('dark');
      Object.defineProperty(window, 'localStorage', {
        value: { getItem },
      });

      const result = initializeTheme();
      expect(result).toBe('dark');
    });

    it('should fall back to system theme', () => {
      const getItem = vi.fn().mockReturnValue(null);
      Object.defineProperty(window, 'localStorage', {
        value: { getItem },
      });
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });

      const result = initializeTheme();
      expect(result).toBe('dark');
    });

    it('should apply theme class', () => {
      const classList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      const setAttribute = vi.fn();

      Object.defineProperty(document, 'documentElement', {
        value: { classList, setAttribute },
      });

      initializeTheme();

      expect(classList.add).toHaveBeenCalled();
      expect(setAttribute).toHaveBeenCalled();
    });

    it('should disable transitions by default', () => {
      const createElement = vi.fn().mockReturnValue({
        textContent: '',
      });

      Object.defineProperty(document, 'createElement', {
        value: createElement,
      });

      initializeTheme();

      expect(createElement).toHaveBeenCalledWith('style');
    });

    it('should not disable transitions when disabled', () => {
      const createElement = vi.fn();

      Object.defineProperty(document, 'createElement', {
        value: createElement,
      });

      initializeTheme(DEFAULT_THEME_STORAGE_KEY, DEFAULT_CSS_PREFIX, false);

      expect(createElement).not.toHaveBeenCalled();
    });
  });
});
