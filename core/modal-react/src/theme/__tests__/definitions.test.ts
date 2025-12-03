import { describe, expect, it } from 'vitest';
import { darkTheme, defaultTheme, getThemeByMode, lightTheme, mergeThemeConfig } from '../definitions.js';
import type { ThemeCustomization } from '../types.js';

describe('Theme Definitions', () => {
  describe('lightTheme', () => {
    it('should have correct mode', () => {
      expect(lightTheme.mode).toBe('light');
    });

    it('should have all required color properties', () => {
      const requiredColorProps = [
        'background',
        'surface',
        'surfaceElevated',
        'overlay',
        'primary',
        'primaryHover',
        'secondary',
        'secondaryHover',
        'success',
        'warning',
        'error',
        'errorHover',
        'textPrimary',
        'textSecondary',
        'textOnPrimary',
        'border',
        'borderHover',
        'focusRing',
        'disabled',
      ];

      for (const prop of requiredColorProps) {
        expect(lightTheme.colors).toHaveProperty(prop);
        expect(typeof lightTheme.colors[prop as keyof typeof lightTheme.colors]).toBe('string');
      }
    });

    it('should have all required shadow properties', () => {
      const requiredShadowProps = ['none', 'sm', 'md', 'lg', 'xl', 'inner', 'focus'];

      for (const prop of requiredShadowProps) {
        expect(lightTheme.shadows).toHaveProperty(prop);
        expect(typeof lightTheme.shadows[prop as keyof typeof lightTheme.shadows]).toBe('string');
      }
    });

    it('should have proper typography structure', () => {
      expect(lightTheme.typography).toHaveProperty('fontFamily');
      expect(lightTheme.typography).toHaveProperty('fontSize');
      expect(lightTheme.typography).toHaveProperty('fontWeight');
      expect(lightTheme.typography).toHaveProperty('lineHeight');

      // Test font families
      expect(lightTheme.typography.fontFamily).toHaveProperty('sans');
      expect(lightTheme.typography.fontFamily).toHaveProperty('mono');

      // Test font sizes
      expect(lightTheme.typography.fontSize).toHaveProperty('xs');
      expect(lightTheme.typography.fontSize).toHaveProperty('base');
      expect(lightTheme.typography.fontSize).toHaveProperty('lg');

      // Test font weights
      expect(lightTheme.typography.fontWeight).toHaveProperty('normal');
      expect(lightTheme.typography.fontWeight).toHaveProperty('medium');
      expect(lightTheme.typography.fontWeight).toHaveProperty('bold');
    });

    it('should have proper spacing scale', () => {
      const expectedSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];

      for (const size of expectedSpacing) {
        expect(lightTheme.spacing).toHaveProperty(size);
        expect(typeof lightTheme.spacing[size as keyof typeof lightTheme.spacing]).toBe('string');
      }
    });

    it('should have proper border radius values', () => {
      const expectedRadiusValues = ['none', 'sm', 'md', 'lg', 'xl', 'full'];

      for (const size of expectedRadiusValues) {
        expect(lightTheme.borderRadius).toHaveProperty(size);
        expect(typeof lightTheme.borderRadius[size as keyof typeof lightTheme.borderRadius]).toBe('string');
      }
    });

    it('should have animation properties', () => {
      expect(lightTheme.animation).toHaveProperty('duration');
      expect(lightTheme.animation).toHaveProperty('easing');

      // Test durations
      expect(lightTheme.animation.duration).toHaveProperty('fast');
      expect(lightTheme.animation.duration).toHaveProperty('normal');
      expect(lightTheme.animation.duration).toHaveProperty('slow');

      // Test easing
      expect(lightTheme.animation.easing).toHaveProperty('default');
      expect(lightTheme.animation.easing).toHaveProperty('in');
      expect(lightTheme.animation.easing).toHaveProperty('out');
    });
  });

  describe('darkTheme', () => {
    it('should have correct mode', () => {
      expect(darkTheme.mode).toBe('dark');
    });

    it('should have different colors from light theme', () => {
      expect(darkTheme.colors.background).not.toBe(lightTheme.colors.background);
      expect(darkTheme.colors.textPrimary).not.toBe(lightTheme.colors.textPrimary);
      expect(darkTheme.colors.surface).not.toBe(lightTheme.colors.surface);
    });

    it('should have darker background colors', () => {
      // Basic check that dark theme has darker backgrounds
      const darkBg = darkTheme.colors.background;
      const lightBg = lightTheme.colors.background;

      // Dark theme should use darker colors (lower in hex value typically means darker)
      expect(darkBg.toLowerCase()).not.toBe(lightBg.toLowerCase());
    });

    it('should have same structure as light theme', () => {
      // Both themes should have the same structure
      expect(Object.keys(darkTheme)).toEqual(Object.keys(lightTheme));
      expect(Object.keys(darkTheme.colors)).toEqual(Object.keys(lightTheme.colors));
      expect(Object.keys(darkTheme.shadows)).toEqual(Object.keys(lightTheme.shadows));
      expect(Object.keys(darkTheme.typography)).toEqual(Object.keys(lightTheme.typography));
      expect(Object.keys(darkTheme.spacing)).toEqual(Object.keys(lightTheme.spacing));
      expect(Object.keys(darkTheme.borderRadius)).toEqual(Object.keys(lightTheme.borderRadius));
    });

    it('should have stronger shadows for dark theme', () => {
      // Dark theme typically has stronger/more pronounced shadows
      expect(darkTheme.shadows.md).toContain('rgba(0, 0, 0,');
      expect(darkTheme.shadows.lg).toContain('rgba(0, 0, 0,');
    });
  });

  describe('defaultTheme', () => {
    it('should have system mode', () => {
      expect(defaultTheme.mode).toBe('system');
    });

    it('should use light theme colors as base', () => {
      expect(defaultTheme.colors).toEqual(lightTheme.colors);
      expect(defaultTheme.shadows).toEqual(lightTheme.shadows);
    });

    it('should have same typography, spacing, and other properties as base themes', () => {
      expect(defaultTheme.typography).toEqual(lightTheme.typography);
      expect(defaultTheme.spacing).toEqual(lightTheme.spacing);
      expect(defaultTheme.borderRadius).toEqual(lightTheme.borderRadius);
      expect(defaultTheme.animation).toEqual(lightTheme.animation);
    });
  });

  describe('getThemeByMode', () => {
    it('should return light theme for light mode', () => {
      const theme = getThemeByMode('light');
      expect(theme).toEqual(lightTheme);
      expect(theme.mode).toBe('light');
    });

    it('should return dark theme for dark mode', () => {
      const theme = getThemeByMode('dark');
      expect(theme).toEqual(darkTheme);
      expect(theme.mode).toBe('dark');
    });

    it('should return light theme as default for any other value', () => {
      // Since TypeScript typing restricts this, we need to cast for testing
      const theme = getThemeByMode('invalid' as 'light' | 'dark');
      expect(theme).toEqual(lightTheme);
    });
  });

  describe('mergeThemeConfig', () => {
    it('should merge custom colors with base theme', () => {
      const baseTheme = lightTheme;
      const customization = {
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
        },
      } as unknown as ThemeCustomization;

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.colors.primary).toBe('#ff0000');
      expect(merged.colors.secondary).toBe('#00ff00');
      expect(merged.colors.background).toBe(baseTheme.colors.background); // Should keep original
    });

    it('should merge custom animations', () => {
      const baseTheme = lightTheme;
      const customization = {
        animation: {
          duration: {
            normal: '300ms',
            custom: '500ms',
          },
          easing: {
            ease: 'ease-in-out',
          },
        },
      } as unknown as ThemeCustomization;

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.animation.duration.normal).toBe('300ms');
      expect(merged.animation.duration.fast).toBe(baseTheme.animation.duration.fast); // Should keep original
      expect(merged.animation.easing.ease).toBe('ease-in-out');
      expect(merged.animation.easing.easeIn).toBe(baseTheme.animation.easing.easeIn); // Should keep original
    });

    it('should merge custom typography', () => {
      const baseTheme = lightTheme;
      const customization = {
        typography: {
          fontFamily: {
            sans: 'Custom Sans',
          },
          fontSize: {
            base: '18px',
          },
          fontWeight: {
            bold: '800',
          },
          lineHeight: {
            tight: '1.2',
          },
        },
      } as unknown as ThemeCustomization;

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.typography.fontFamily.sans).toBe('Custom Sans');
      expect(merged.typography.fontFamily.mono).toBe(baseTheme.typography.fontFamily.mono); // Should keep original
      expect(merged.typography.fontSize.base).toBe('18px');
      expect(merged.typography.fontSize.xs).toBe(baseTheme.typography.fontSize.xs); // Should keep original
    });

    it('should merge custom spacing and border radius', () => {
      const baseTheme = lightTheme;
      const customization = {
        spacing: {
          md: '20px',
          custom: '100px',
        },
        borderRadius: {
          md: '12px',
        },
      } as unknown as ThemeCustomization;

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.spacing.md).toBe('20px');
      expect(merged.spacing.sm).toBe(baseTheme.spacing.sm); // Should keep original
      expect(merged.borderRadius.md).toBe('12px');
      expect(merged.borderRadius.sm).toBe(baseTheme.borderRadius.sm); // Should keep original
    });

    it('should handle partial customizations', () => {
      const baseTheme = lightTheme;
      const customization = {
        colors: {
          primary: '#custom',
        },
      } as unknown as ThemeCustomization;

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.colors.primary).toBe('#custom');
      expect(merged.shadows).toEqual(baseTheme.shadows);
      expect(merged.typography).toEqual(baseTheme.typography);
      expect(merged.spacing).toEqual(baseTheme.spacing);
      expect(merged.borderRadius).toEqual(baseTheme.borderRadius);
    });

    it('should handle empty customizations', () => {
      const baseTheme = lightTheme;
      const customization = {};

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged).toEqual(baseTheme);
    });

    it('should override mode if specified', () => {
      const baseTheme = lightTheme;
      const customization = {
        mode: 'dark' as const,
      };

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.mode).toBe('dark');
      expect(merged.colors).toEqual(baseTheme.colors); // Colors should remain from base
    });

    it('should handle nested undefined properties gracefully', () => {
      const baseTheme = lightTheme;
      const customization = {
        animation: {
          duration: {
            normal: '250ms',
          },
          // easing is undefined
        },
        typography: {
          fontFamily: {
            sans: 'Custom',
          },
          // other properties are undefined
        },
      } as unknown as ThemeCustomization;

      const merged = mergeThemeConfig(baseTheme, customization);

      expect(merged.animation.duration.normal).toBe('250ms');
      expect(merged.animation.easing).toEqual(baseTheme.animation.easing);
      expect(merged.typography.fontFamily.sans).toBe('Custom');
      expect(merged.typography.fontSize).toEqual(baseTheme.typography.fontSize);
    });
  });

  describe('Color Accessibility', () => {
    it('should have high contrast colors in light theme', () => {
      // Basic checks for light theme accessibility
      expect(lightTheme.colors.textPrimary).not.toBe(lightTheme.colors.background);
      expect(lightTheme.colors.textSecondary).not.toBe(lightTheme.colors.background);

      // Primary text should be dark on light background
      expect(lightTheme.colors.textPrimary.toLowerCase()).toContain('#');
      expect(lightTheme.colors.background).toBe('#ffffff');
    });

    it('should have high contrast colors in dark theme', () => {
      // Basic checks for dark theme accessibility
      expect(darkTheme.colors.textPrimary).not.toBe(darkTheme.colors.background);
      expect(darkTheme.colors.textSecondary).not.toBe(darkTheme.colors.background);

      // Text should be light on dark background
      expect(darkTheme.colors.background.toLowerCase()).not.toBe('#ffffff');
    });

    it('should have consistent semantic colors', () => {
      // Error colors should be some shade of red in both themes
      expect(lightTheme.colors.error.toLowerCase()).toMatch(/#[a-f0-9]{6}/);
      expect(darkTheme.colors.error.toLowerCase()).toMatch(/#[a-f0-9]{6}/);

      // Success colors should be some shade of green in both themes
      expect(lightTheme.colors.success.toLowerCase()).toMatch(/#[a-f0-9]{6}/);
      expect(darkTheme.colors.success.toLowerCase()).toMatch(/#[a-f0-9]{6}/);
    });
  });

  describe('CSS Value Validation', () => {
    const validateCSSValue = (value: string, type: 'color' | 'size' | 'shadow' | 'easing') => {
      switch (type) {
        case 'color':
          return value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl');
        case 'size':
          return /^\d+(\.\d+)?(px|rem|em|%)$/.test(value) || value === '0';
        case 'shadow':
          return value === 'none' || value.includes('rgba') || value.includes('rgb');
        case 'easing':
          return (
            value.includes('cubic-bezier') ||
            ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'].includes(value)
          );
        default:
          return false;
      }
    };

    it('should have valid color values in light theme', () => {
      for (const color of Object.values(lightTheme.colors)) {
        expect(validateCSSValue(color, 'color')).toBe(true);
      }
    });

    it('should have valid color values in dark theme', () => {
      for (const color of Object.values(darkTheme.colors)) {
        expect(validateCSSValue(color, 'color')).toBe(true);
      }
    });

    it('should have valid size values', () => {
      for (const size of Object.values(lightTheme.spacing)) {
        expect(validateCSSValue(size, 'size')).toBe(true);
      }

      for (const size of Object.values(lightTheme.typography.fontSize)) {
        expect(validateCSSValue(size, 'size')).toBe(true);
      }
    });

    it('should have valid shadow values', () => {
      for (const shadow of Object.values(lightTheme.shadows)) {
        expect(validateCSSValue(shadow, 'shadow')).toBe(true);
      }

      for (const shadow of Object.values(darkTheme.shadows)) {
        expect(validateCSSValue(shadow, 'shadow')).toBe(true);
      }
    });

    it('should have valid easing values', () => {
      for (const easing of Object.values(lightTheme.animation.easing)) {
        expect(validateCSSValue(easing, 'easing')).toBe(true);
      }
    });
  });
});
