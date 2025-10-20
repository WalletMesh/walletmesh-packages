import { describe, expect, it } from 'vitest';
import type {
  ThemeAnimation,
  ThemeBorderRadius,
  ThemeCSSVariables,
  ThemeColors,
  ThemeConfig,
  ThemeContextValue,
  ThemeDetection,
  ThemeMode,
  ThemeProviderConfig,
  ThemeShadows,
  ThemeSpacing,
  ThemeTypography,
  UseThemeReturn,
} from '../types.js';

describe('Theme Types', () => {
  describe('ThemeMode', () => {
    it('should allow valid theme modes', () => {
      const validModes: ThemeMode[] = ['light', 'dark', 'system'];

      for (const mode of validModes) {
        expect(['light', 'dark', 'system']).toContain(mode);
      }
    });

    it('should be assignable to string', () => {
      const mode: ThemeMode = 'light';
      const str: string = mode;
      expect(str).toBe('light');
    });
  });

  describe('ThemeColors', () => {
    it('should have all required color properties', () => {
      const colors: ThemeColors = {
        // Core colors (required by modal-core)
        primary: '#4f46e5',
        primaryHover: '#4338ca',
        secondary: '#6b7280',
        background: '#ffffff',
        surface: '#f8fafc',
        surfaceHover: '#e5e7eb',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        error: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',

        // Extended surface colors
        surfaceElevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Extended content colors
        primaryActive: '#3730a3',
        secondaryHover: '#4b5563',
        accent: '#0ea5e9',
        accentHover: '#0284c7',

        // Extended semantic colors
        successHover: '#059669',
        warningHover: '#d97706',
        errorHover: '#dc2626',
        infoHover: '#2563eb',

        // Extended text colors
        textPrimary: '#1f2937',
        textMuted: '#9ca3af',
        textInverse: '#ffffff',
        textOnPrimary: '#ffffff',
        textOnSecondary: '#ffffff',

        // Extended border colors
        borderHover: '#d1d5db',
        borderFocus: '#4f46e5',
        borderError: '#ef4444',
        borderSuccess: '#10b981',

        // Interactive states
        focusRing: 'rgba(79, 70, 229, 0.2)',
        disabled: '#f3f4f6',
        disabledText: '#9ca3af',

        // Transaction overlay tokens
        overlayBg: 'rgba(0, 0, 0, 0.8)',
        overlayCardBg: '#ffffff',
        overlayCardBorder: '#e5e7eb',
        overlayTextPrimary: '#1f2937',
        overlayTextSecondary: '#6b7280',
        overlaySpinnerPrimary: '#4f46e5',
        overlayStageActive: 'rgba(79, 70, 229, 0.1)',
        overlayStageCompleted: 'rgba(16, 185, 129, 0.1)',
        overlayStageIcon: 'rgba(107, 114, 128, 0.1)',
      };

      // Verify all properties are strings
      for (const value of Object.values(colors)) {
        expect(typeof value).toBe('string');
      }

      // Verify specific required properties exist
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('textPrimary');
      expect(colors).toHaveProperty('border');
    });

    it('should allow partial color definitions', () => {
      const partialColors: Partial<ThemeColors> = {
        primary: '#custom-primary',
        background: '#custom-background',
      };

      expect(partialColors.primary).toBe('#custom-primary');
      expect(partialColors.background).toBe('#custom-background');
    });
  });

  describe('ThemeShadows', () => {
    it('should have all required shadow properties', () => {
      const shadows: ThemeShadows = {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 3px rgba(79, 70, 229, 0.1)',
      };

      for (const value of Object.values(shadows)) {
        expect(typeof value).toBe('string');
      }

      expect(shadows).toHaveProperty('none');
      expect(shadows).toHaveProperty('md');
      expect(shadows).toHaveProperty('focus');
    });
  });

  describe('ThemeAnimation', () => {
    it('should have duration and easing properties', () => {
      const animation: ThemeAnimation = {
        duration: {
          fast: '150ms',
          normal: '200ms',
          slow: '300ms',
        },
        easing: {
          default: 'cubic-bezier(0.4, 0, 0.2, 1)',
          in: 'cubic-bezier(0.4, 0, 1, 1)',
          out: 'cubic-bezier(0, 0, 0.2, 1)',
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
      };

      expect(animation).toHaveProperty('duration');
      expect(animation).toHaveProperty('easing');

      for (const value of Object.values(animation.duration)) {
        expect(typeof value).toBe('string');
      }

      for (const value of Object.values(animation.easing)) {
        expect(typeof value).toBe('string');
      }
    });
  });

  describe('ThemeTypography', () => {
    it('should have all typography properties', () => {
      const typography: ThemeTypography = {
        fontFamily: {
          sans: '-apple-system, BlinkMacSystemFont, sans-serif',
          mono: 'Monaco, Consolas, monospace',
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75',
        },
      };

      expect(typography).toHaveProperty('fontFamily');
      expect(typography).toHaveProperty('fontSize');
      expect(typography).toHaveProperty('fontWeight');
      expect(typography).toHaveProperty('lineHeight');

      // Verify all nested values are strings
      for (const value of Object.values(typography.fontFamily)) {
        expect(typeof value).toBe('string');
      }
    });
  });

  describe('ThemeSpacing', () => {
    it('should have spacing scale properties', () => {
      const spacing: ThemeSpacing = {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      };

      for (const value of Object.values(spacing)) {
        expect(typeof value).toBe('string');
      }

      expect(spacing).toHaveProperty('xs');
      expect(spacing).toHaveProperty('md');
      expect(spacing).toHaveProperty('xl');
    });
  });

  describe('ThemeBorderRadius', () => {
    it('should have border radius properties', () => {
      const borderRadius: ThemeBorderRadius = {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        full: '9999px',
      };

      for (const value of Object.values(borderRadius)) {
        expect(typeof value).toBe('string');
      }

      expect(borderRadius).toHaveProperty('none');
      expect(borderRadius).toHaveProperty('md');
      expect(borderRadius).toHaveProperty('full');
    });
  });

  describe('ThemeConfig', () => {
    it('should have all required configuration properties', () => {
      const config: ThemeConfig = {
        mode: 'light',
        colors: {
          // Core colors (required by modal-core)
          primary: '#000',
          primaryHover: '#000',
          secondary: '#000',
          background: '#fff',
          surface: '#fff',
          surfaceHover: '#eee',
          text: '#000',
          textSecondary: '#000',
          border: '#000',
          error: '#000',
          success: '#000',
          warning: '#000',
          info: '#000',
          // Extended colors
          surfaceElevated: '#fff',
          overlay: 'rgba(0,0,0,0.5)',
          primaryActive: '#000',
          secondaryHover: '#000',
          accent: '#000',
          accentHover: '#000',
          successHover: '#000',
          warningHover: '#000',
          errorHover: '#000',
          infoHover: '#000',
          textPrimary: '#000',
          textMuted: '#000',
          textInverse: '#000',
          textOnPrimary: '#000',
          textOnSecondary: '#000',
          borderHover: '#000',
          borderFocus: '#000',
          borderError: '#000',
          borderSuccess: '#000',
          focusRing: '#000',
          disabled: '#000',
          disabledText: '#000',
          // Transaction overlay tokens
          overlayBg: 'rgba(0, 0, 0, 0.8)',
          overlayCardBg: '#fff',
          overlayCardBorder: '#000',
          overlayTextPrimary: '#000',
          overlayTextSecondary: '#000',
          overlaySpinnerPrimary: '#000',
          overlayStageActive: 'rgba(0, 0, 0, 0.1)',
          overlayStageCompleted: 'rgba(0, 0, 0, 0.1)',
          overlayStageIcon: 'rgba(0, 0, 0, 0.1)',
        },
        shadows: {
          none: 'none',
          sm: '0 1px 2px rgba(0,0,0,0.1)',
          md: '0 4px 6px rgba(0,0,0,0.1)',
          lg: '0 10px 15px rgba(0,0,0,0.1)',
          xl: '0 20px 25px rgba(0,0,0,0.1)',
          inner: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          focus: '0 0 0 3px rgba(0,0,0,0.1)',
        },
        animation: {
          duration: { fast: '150ms', normal: '200ms', slow: '300ms' },
          easing: {
            default: 'ease',
            in: 'ease-in',
            out: 'ease-out',
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
          },
        },
        typography: {
          fontFamily: { sans: 'Arial', mono: 'Monaco' },
          fontSize: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
          fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
          lineHeight: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
        },
        spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px', '3xl': '64px' },
        borderRadius: { none: '0', sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
      };

      expect(config).toHaveProperty('mode');
      expect(config).toHaveProperty('colors');
      expect(config).toHaveProperty('shadows');
      expect(config).toHaveProperty('animation');
      expect(config).toHaveProperty('typography');
      expect(config).toHaveProperty('spacing');
      expect(config).toHaveProperty('borderRadius');

      expect(config.mode).toBe('light');
    });

    it('should allow partial configuration', () => {
      const partialConfig = {
        mode: 'dark',
        colors: {
          primary: '#custom',
        },
      } as Partial<ThemeConfig>;

      expect(partialConfig.mode).toBe('dark');
      expect(partialConfig.colors?.primary).toBe('#custom');
    });
  });

  describe('ThemeProviderConfig', () => {
    it('should have all provider configuration properties', () => {
      const config: ThemeProviderConfig = {
        mode: 'system',
        persist: true,
        customization: {
          colors: { primary: '#custom' },
        },
        storageKey: 'custom-theme',
        cssPrefix: 'my-app',
        disableTransitionsOnChange: false,
      };

      expect(config).toHaveProperty('mode');
      expect(config).toHaveProperty('persist');
      expect(config).toHaveProperty('customization');
      expect(config).toHaveProperty('storageKey');
      expect(config).toHaveProperty('cssPrefix');
      expect(config).toHaveProperty('disableTransitionsOnChange');
    });

    it('should allow minimal configuration', () => {
      const minimalConfig: ThemeProviderConfig = {};

      expect(typeof minimalConfig).toBe('object');
    });
  });

  describe('ThemeContextValue', () => {
    it('should have all context value properties', () => {
      const contextValue: ThemeContextValue = {
        theme: 'light',
        resolvedTheme: 'light',
        systemTheme: 'light',
        themeConfig: {} as ThemeConfig,
        setTheme: () => {},
        toggleTheme: () => {},
        isMounted: true,
        refreshSystemTheme: () => {},
      };

      expect(contextValue).toHaveProperty('theme');
      expect(contextValue).toHaveProperty('resolvedTheme');
      expect(contextValue).toHaveProperty('systemTheme');
      expect(contextValue).toHaveProperty('themeConfig');
      expect(contextValue).toHaveProperty('setTheme');
      expect(contextValue).toHaveProperty('toggleTheme');
      expect(contextValue).toHaveProperty('isMounted');
      expect(contextValue).toHaveProperty('refreshSystemTheme');

      expect(typeof contextValue.setTheme).toBe('function');
      expect(typeof contextValue.toggleTheme).toBe('function');
      expect(typeof contextValue.refreshSystemTheme).toBe('function');
    });
  });

  describe('UseThemeReturn', () => {
    it('should match ThemeContextValue', () => {
      const useThemeReturn: UseThemeReturn = {
        theme: 'dark',
        resolvedTheme: 'dark',
        systemTheme: 'light',
        themeConfig: {} as ThemeConfig,
        setTheme: () => {},
        toggleTheme: () => {},
        isMounted: true,
        refreshSystemTheme: () => {},
      };

      // UseThemeReturn should have the same properties as ThemeContextValue
      const contextValue: ThemeContextValue = useThemeReturn;
      expect(contextValue).toEqual(useThemeReturn);
    });
  });

  describe('ThemeCSSVariables', () => {
    it('should be a record of string to string', () => {
      const variables: ThemeCSSVariables = {
        '--wm-color-primary': '#4f46e5',
        '--wm-color-background': '#ffffff',
        '--wm-space-md': '16px',
        '--wm-radius-lg': '12px',
      };

      for (const [key, value] of Object.entries(variables)) {
        expect(typeof key).toBe('string');
        expect(typeof value).toBe('string');
        expect(key.startsWith('--')).toBe(true);
      }
    });

    it('should allow empty variables object', () => {
      const emptyVariables: ThemeCSSVariables = {};
      expect(Object.keys(emptyVariables)).toHaveLength(0);
    });
  });

  describe('ThemeDetection', () => {
    it('should have all detection function properties', () => {
      const detection: ThemeDetection = {
        getSystemTheme: () => 'light',
        getStoredTheme: () => null,
        storeTheme: () => {},
        removeStoredTheme: () => {},
        onSystemThemeChange: () => () => {},
      };

      expect(typeof detection.getSystemTheme).toBe('function');
      expect(typeof detection.getStoredTheme).toBe('function');
      expect(typeof detection.storeTheme).toBe('function');
      expect(typeof detection.removeStoredTheme).toBe('function');
      expect(typeof detection.onSystemThemeChange).toBe('function');

      // Test function return types
      expect(['light', 'dark']).toContain(detection.getSystemTheme());
      expect(typeof detection.onSystemThemeChange(() => {})).toBe('function');
    });
  });

  describe('Type Compatibility', () => {
    it('should allow theme mode assignment', () => {
      let mode: ThemeMode;

      mode = 'light';
      expect(mode).toBe('light');

      mode = 'dark';
      expect(mode).toBe('dark');

      mode = 'system';
      expect(mode).toBe('system');
    });

    it('should enforce string literal types for theme mode', () => {
      // This should compile without errors
      const validMode: ThemeMode = 'light';
      expect(validMode).toBe('light');

      // TypeScript should prevent invalid assignments (tested at compile time)
      // const invalidMode: ThemeMode = 'invalid'; // Would cause TypeScript error
    });

    it('should allow configuration merging', () => {
      const baseConfig: ThemeConfig = {} as ThemeConfig;
      const customization = {
        colors: { primary: '#custom' },
      } as Partial<ThemeConfig>;

      const merged: ThemeConfig = { ...baseConfig, ...customization };
      expect(merged.colors?.primary).toBe('#custom');
    });
  });

  describe('Index Signature Types', () => {
    it('should allow string index access for flexible properties', () => {
      const colors: ThemeColors = {
        // Core colors (required by modal-core)
        primary: '#000000',
        primaryHover: '#111111',
        secondary: '#333333',
        background: '#ffffff',
        surface: '#f8fafc',
        surfaceHover: '#e0e0e0',
        text: '#000000',
        textSecondary: '#666666',
        border: '#e0e0e0',
        error: '#ff0000',
        success: '#4caf50',
        warning: '#ff9800',
        info: '#2196f3',

        // Extended surface colors
        surfaceElevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Extended content colors
        primaryActive: '#222222',
        secondaryHover: '#444444',
        accent: '#0ea5e9',
        accentHover: '#0284c7',

        // Extended semantic colors
        successHover: '#45a049',
        warningHover: '#fb8c00',
        errorHover: '#ee0000',
        infoHover: '#1976d2',

        // Extended text colors
        textPrimary: '#000000',
        textMuted: '#999999',
        textInverse: '#ffffff',
        textOnPrimary: '#ffffff',
        textOnSecondary: '#ffffff',

        // Extended border colors
        borderHover: '#d0d0d0',
        borderFocus: '#000000',
        borderError: '#ff0000',
        borderSuccess: '#4caf50',

        // Interactive states
        focusRing: 'rgba(0, 0, 0, 0.2)',
        disabled: '#f5f5f5',
        disabledText: '#999999',

        // Transaction overlay tokens
        overlayBg: 'rgba(0, 0, 0, 0.8)',
        overlayCardBg: '#ffffff',
        overlayCardBorder: '#e0e0e0',
        overlayTextPrimary: '#000000',
        overlayTextSecondary: '#666666',
        overlaySpinnerPrimary: '#000000',
        overlayStageActive: 'rgba(0, 0, 0, 0.1)',
        overlayStageCompleted: 'rgba(0, 0, 0, 0.1)',
        overlayStageIcon: 'rgba(0, 0, 0, 0.1)',
      };
      const spacing: ThemeSpacing = {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      };

      // These should be accessible by string keys
      const primaryColor = colors['primary'];
      const mediumSpacing = spacing['md'];

      expect(typeof primaryColor).toBe('string');
      expect(typeof mediumSpacing).toBe('string');
    });

    it('should allow dynamic CSS variable names', () => {
      const variables: ThemeCSSVariables = {};

      // Should allow setting dynamic CSS variable names
      variables['--custom-color'] = '#123456';
      variables['--dynamic-spacing'] = '20px';

      expect(variables['--custom-color']).toBe('#123456');
      expect(variables['--dynamic-spacing']).toBe('20px');
    });
  });

  describe('Generic Type Constraints', () => {
    it('should work with generic functions', () => {
      function getThemeProperty<T extends keyof ThemeColors>(colors: ThemeColors, key: T): ThemeColors[T] {
        return colors[key];
      }

      const colors: ThemeColors = {
        // Core colors (required by modal-core)
        primary: '#000000',
        primaryHover: '#111111',
        secondary: '#333333',
        background: '#ffffff',
        surface: '#f8fafc',
        surfaceHover: '#e0e0e0',
        text: '#000000',
        textSecondary: '#666666',
        border: '#e0e0e0',
        error: '#ff0000',
        success: '#4caf50',
        warning: '#ff9800',
        info: '#2196f3',

        // Extended surface colors
        surfaceElevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)',

        // Extended content colors
        primaryActive: '#222222',
        secondaryHover: '#444444',
        accent: '#0ea5e9',
        accentHover: '#0284c7',

        // Extended semantic colors
        successHover: '#45a049',
        warningHover: '#fb8c00',
        errorHover: '#ee0000',
        infoHover: '#1976d2',

        // Extended text colors
        textPrimary: '#000000',
        textMuted: '#999999',
        textInverse: '#ffffff',
        textOnPrimary: '#ffffff',
        textOnSecondary: '#ffffff',

        // Extended border colors
        borderHover: '#d0d0d0',
        borderFocus: '#000000',
        borderError: '#ff0000',
        borderSuccess: '#4caf50',

        // Interactive states
        focusRing: 'rgba(0, 0, 0, 0.2)',
        disabled: '#f5f5f5',
        disabledText: '#999999',

        // Transaction overlay tokens
        overlayBg: 'rgba(0, 0, 0, 0.8)',
        overlayCardBg: '#ffffff',
        overlayCardBorder: '#e0e0e0',
        overlayTextPrimary: '#000000',
        overlayTextSecondary: '#666666',
        overlaySpinnerPrimary: '#000000',
        overlayStageActive: 'rgba(0, 0, 0, 0.1)',
        overlayStageCompleted: 'rgba(0, 0, 0, 0.1)',
        overlayStageIcon: 'rgba(0, 0, 0, 0.1)',
      };
      const primary = getThemeProperty(colors, 'primary');

      expect(typeof primary).toBe('string');
    });

    it('should support deep partial types', () => {
      type DeepPartial<T> = {
        [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
      };

      const partialConfig: DeepPartial<ThemeConfig> = {
        colors: {
          primary: '#custom',
        },
        animation: {
          duration: {
            normal: '250ms',
          },
        },
      };

      expect(partialConfig.colors?.primary).toBe('#custom');
      expect(partialConfig.animation?.duration?.normal).toBe('250ms');
    });
  });
});
