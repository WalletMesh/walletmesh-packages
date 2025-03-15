import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { lightTheme, darkTheme, getTheme } from './default-theme.js';
import {
  getSpacing,
  getColorWithOpacity,
  generateBoxShadow,
  generateTransition,
  type Theme,
} from './theme-utils.js';

describe('Theme Configuration', () => {
  describe('Light Theme', () => {
    it('should have all required theme properties', () => {
      expect(lightTheme).toBeDefined();
      expect(lightTheme.colors).toBeDefined();
      expect(lightTheme.typography).toBeDefined();
      expect(lightTheme.spacing).toBeDefined();
      expect(lightTheme.borderRadius).toBeDefined();
      expect(lightTheme.animation).toBeDefined();
    });

    it('should have correct color palette', () => {
      expect(lightTheme.colors.primary).toBe('#3B82F6');
      expect(lightTheme.colors.secondary).toBe('#10B981');
      expect(lightTheme.colors.background.primary).toBe('#FFFFFF');
      expect(lightTheme.colors.background.secondary).toBe('#F3F4F6');
      expect(lightTheme.colors.text.primary).toBe('#1F2937');
      expect(lightTheme.colors.text.secondary).toBe('#6B7280');
      expect(lightTheme.colors.text.accent).toBe('#3B82F6');
      expect(lightTheme.colors.border).toBe('#E5E7EB');
      expect(lightTheme.colors.state.success).toBe('#10B981');
      expect(lightTheme.colors.state.error).toBe('#EF4444');
      expect(lightTheme.colors.state.warning).toBe('#F59E0B');
      expect(lightTheme.colors.state.info).toBe('#3B82F6');
    });

    it('should have correct typography configuration', () => {
      expect(lightTheme.typography.fonts.primary).toContain('-apple-system');
      expect(lightTheme.typography.weights.regular).toBe(400);
      expect(lightTheme.typography.weights.medium).toBe(500);
      expect(lightTheme.typography.weights.bold).toBe(700);
      expect(lightTheme.typography.sizes.small).toBe('0.875rem');
      expect(lightTheme.typography.sizes.medium).toBe('1rem');
      expect(lightTheme.typography.sizes.large).toBe('1.125rem');
      expect(lightTheme.typography.sizes.xlarge).toBe('1.25rem');
    });

    it('should have correct spacing values', () => {
      expect(lightTheme.spacing.unit).toBe(4);
      expect(lightTheme.spacing.sizes.xxsmall).toBe(1);
      expect(lightTheme.spacing.sizes.xlarge).toBe(8);
      expect(lightTheme.spacing.sizes.xxlarge).toBe(12);
    });
  });

  describe('Dark Theme', () => {
    it('should inherit base properties from light theme', () => {
      expect(darkTheme.typography).toBe(lightTheme.typography);
      expect(darkTheme.spacing).toBe(lightTheme.spacing);
      expect(darkTheme.borderRadius).toBe(lightTheme.borderRadius);
      expect(darkTheme.animation).toBe(lightTheme.animation);
    });

    it('should have correct dark mode color palette', () => {
      expect(darkTheme.colors.primary).toBe('#60A5FA');
      expect(darkTheme.colors.secondary).toBe('#34D399');
      expect(darkTheme.colors.background.primary).toBe('#111827');
      expect(darkTheme.colors.background.secondary).toBe('#1F2937');
      expect(darkTheme.colors.text.primary).toBe('#F9FAFB');
      expect(darkTheme.colors.text.secondary).toBe('#9CA3AF');
      expect(darkTheme.colors.border).toBe('#374151');
    });
  });

  describe('getTheme', () => {
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
      // Mock matchMedia
      window.matchMedia = vi.fn();
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should return light theme when preference is light', () => {
      expect(getTheme('light')).toBe(lightTheme);
    });

    it('should return dark theme when preference is dark', () => {
      expect(getTheme('dark')).toBe(darkTheme);
    });

    it('should return dark theme when system preference is dark', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: true,
        media: query,
      }));

      expect(getTheme('system')).toBe(darkTheme);
    });

    it('should return light theme when system preference is light', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
      }));

      expect(getTheme('system')).toBe(lightTheme);
    });
  });
});

describe('Theme Utilities', () => {
  const mockTheme: Theme = {
    ...lightTheme,
    spacing: {
      unit: 8,
      sizes: {
        xxsmall: 1,
        xsmall: 2,
        small: 3,
        medium: 4,
        large: 6,
        xlarge: 8,
        xxlarge: 12,
      },
    },
  };

  describe('getSpacing', () => {
    it('should calculate spacing values correctly', () => {
      expect(getSpacing(mockTheme, 'small')).toBe('24px');
      expect(getSpacing(mockTheme, 'medium')).toBe('32px');
      expect(getSpacing(mockTheme, 'large')).toBe('48px');
    });
  });

  describe('getColorWithOpacity', () => {
    it('should convert hex colors to rgba with opacity', () => {
      expect(getColorWithOpacity('#FF0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
      expect(getColorWithOpacity('#00FF00', 0.8)).toBe('rgba(0, 255, 0, 0.8)');
      expect(getColorWithOpacity('#0000FF', 0.3)).toBe('rgba(0, 0, 255, 0.3)');
    });

    it('should handle different hex color formats', () => {
      const result = getColorWithOpacity('#123456', 0.7);
      expect(result).toBe('rgba(18, 52, 86, 0.7)');
    });
  });

  describe('generateBoxShadow', () => {
    it('should generate correct box shadow string', () => {
      const result = generateBoxShadow(2, 4, 6, 2, 'rgba(0, 0, 0, 0.1)');
      expect(result).toBe('2px 4px 6px 2px rgba(0, 0, 0, 0.1)');
    });

    it('should handle negative values', () => {
      const result = generateBoxShadow(-2, -4, 8, 0, '#000000');
      expect(result).toBe('-2px -4px 8px 0px #000000');
    });
  });

  describe('generateTransition', () => {
    it('should generate single property transition', () => {
      const result = generateTransition(['opacity'], '200ms', 'ease-in-out');
      expect(result).toBe('opacity 200ms ease-in-out');
    });

    it('should generate multiple property transitions', () => {
      const result = generateTransition(['opacity', 'transform'], '300ms', 'ease-in-out');
      expect(result).toBe('opacity 300ms ease-in-out, transform 300ms ease-in-out');
    });
  });
});
