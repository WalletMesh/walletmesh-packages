import { describe, expect, it, vi } from 'vitest';
import {
  type CreateIconContainerOptions,
  createIconAccessibilityAttributes,
  createIconContainerConfig,
  getIconContainerStyles,
  normalizeIconOptions,
} from './iconContainer.js';

describe('iconContainer', () => {
  describe('createIconContainerConfig', () => {
    it('should create basic container config with required options', () => {
      const options: CreateIconContainerOptions = {
        size: 32,
      };

      const config = createIconContainerConfig(options);

      expect(config.containerStyles.width).toBe('32px');
      expect(config.containerStyles.height).toBe('32px');
      expect(config.containerStyles.display).toBe('inline-block');
      expect(config.containerStyles.position).toBe('relative');
      expect(config.containerStyles.cursor).toBe('default');
      expect(config.attributes['data-testid']).toBe('sandboxed-icon-container');
      expect(config.attributes['data-size']).toBe('32');
    });

    it('should apply disabled styling', () => {
      const config = createIconContainerConfig({
        size: 32,
        disabled: true,
      });

      expect(config.containerStyles.cursor).toBe('not-allowed');
      expect(config.attributes['data-disabled']).toBe('true');
      expect(config.attributes['aria-disabled']).toBe('true');
    });

    it('should apply clickable styling', () => {
      const config = createIconContainerConfig({
        size: 32,
        clickable: true,
      });

      expect(config.containerStyles.cursor).toBe('pointer');
    });

    it('should prioritize disabled over clickable for cursor', () => {
      const config = createIconContainerConfig({
        size: 32,
        disabled: true,
        clickable: true,
      });

      expect(config.containerStyles.cursor).toBe('not-allowed');
    });

    it('should create loading configuration', () => {
      const config = createIconContainerConfig({
        size: 32,
        loading: true,
      });

      expect(config.loading.styles.position).toBe('absolute');
      expect(config.loading.styles.width).toBe('100%');
      expect(config.loading.styles.height).toBe('100%');
      expect(config.loading.content).toBe('⟳');
      expect(config.loading.attributes['data-testid']).toBe('icon-loading');
      expect(config.loading.attributes['aria-hidden']).toBe('true');
      expect(config.attributes['data-loading']).toBe('true');
    });

    it('should use custom loading content', () => {
      const config = createIconContainerConfig({
        size: 32,
        loadingContent: '⌛',
      });

      expect(config.loading.content).toBe('⌛');
    });

    it('should calculate responsive loading font size', () => {
      const smallConfig = createIconContainerConfig({ size: 16 });
      const largeConfig = createIconContainerConfig({ size: 64 });

      expect(smallConfig.loading.styles.fontSize).toBe('8px'); // Math.max(8, 16 * 0.3)
      expect(largeConfig.loading.styles.fontSize).toBe('19.2px'); // 64 * 0.3
    });

    it('should apply style overrides', () => {
      const config = createIconContainerConfig({
        size: 32,
        styleOverrides: {
          border: '2px solid red',
          borderRadius: '4px',
          cursor: 'help',
        },
      });

      expect(config.containerStyles.border).toBe('2px solid red');
      expect(config.containerStyles.borderRadius).toBe('4px');
      expect(config.containerStyles.cursor).toBe('help');
    });

    it('should include className when provided', () => {
      const config = createIconContainerConfig({
        size: 32,
        className: 'custom-icon-container',
      });

      expect(config.className).toBe('custom-icon-container');
    });

    it('should not include className when not provided', () => {
      const config = createIconContainerConfig({
        size: 32,
      });

      expect(config).not.toHaveProperty('className');
    });

    it('should include all data attributes', () => {
      const config = createIconContainerConfig({
        size: 48,
        disabled: false,
        loading: false,
      });

      expect(config.attributes['data-testid']).toBe('sandboxed-icon-container');
      expect(config.attributes['data-size']).toBe('48');
      expect(config.attributes['data-disabled']).toBe('false');
      expect(config.attributes['data-loading']).toBe('false');
    });

    it('should create loading overlay with proper positioning', () => {
      const config = createIconContainerConfig({
        size: 32,
        loading: true,
      });

      const loadingStyles = config.loading.styles;
      expect(loadingStyles.position).toBe('absolute');
      expect(loadingStyles.top).toBe('0');
      expect(loadingStyles.left).toBe('0');
      expect(loadingStyles.width).toBe('100%');
      expect(loadingStyles.height).toBe('100%');
      expect(loadingStyles.pointerEvents).toBe('none');
    });

    it('should create loading overlay with proper styling', () => {
      const config = createIconContainerConfig({
        size: 32,
      });

      const loadingStyles = config.loading.styles;
      expect(loadingStyles.display).toBe('flex');
      expect(loadingStyles.alignItems).toBe('center');
      expect(loadingStyles.justifyContent).toBe('center');
      expect(loadingStyles.backgroundColor).toBe('rgba(240, 240, 240, 0.8)');
      expect(loadingStyles.borderRadius).toBe('50%');
      expect(loadingStyles.userSelect).toBe('none');
    });

    it('should handle all option combinations', () => {
      const config = createIconContainerConfig({
        size: 24,
        disabled: true,
        clickable: true,
        loading: true,
        className: 'test-class',
        loadingContent: '🔄',
        styleOverrides: { padding: '2px' },
      });

      expect(config.containerStyles.width).toBe('24px');
      expect(config.containerStyles.cursor).toBe('not-allowed');
      expect(config.containerStyles.padding).toBe('2px');
      expect(config.className).toBe('test-class');
      expect(config.loading.content).toBe('🔄');
      expect(config.attributes['data-disabled']).toBe('true');
      expect(config.attributes['data-loading']).toBe('true');
      expect(config.attributes['aria-disabled']).toBe('true');
    });
  });

  describe('normalizeIconOptions', () => {
    it('should apply default values for missing options', () => {
      const options = {
        iconDataUri: 'data:image/svg+xml;base64,PHN2Zy...',
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized.iconDataUri).toBe('data:image/svg+xml;base64,PHN2Zy...');
      expect(normalized.size).toBe(24);
      expect(normalized.timeout).toBe(3000);
    });

    it('should preserve provided values', () => {
      const options = {
        iconDataUri: 'data:image/png;base64,iVBORw0KGgo...',
        size: 48,
        timeout: 5000,
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized.iconDataUri).toBe('data:image/png;base64,iVBORw0KGgo...');
      expect(normalized.size).toBe(48);
      expect(normalized.timeout).toBe(5000);
    });

    it('should include optional properties when provided', () => {
      const onCspError = vi.fn();
      const options = {
        iconDataUri: 'data:image/svg+xml;base64,PHN2Zy...',
        fallbackIcon: {
          src: 'fallback.svg',
          alt: 'Fallback',
        },
        onCspError,
        disabled: true,
        disabledStyle: { opacity: 0.5 },
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized.fallbackIcon).toEqual({
        src: 'fallback.svg',
        alt: 'Fallback',
      });
      expect(normalized.onCspError).toBe(onCspError);
      expect(normalized.disabled).toBe(true);
      expect(normalized.disabledStyle).toEqual({ opacity: 0.5 });
    });

    it('should omit undefined optional properties', () => {
      const options = {
        iconDataUri: 'data:image/svg+xml;base64,PHN2Zy...',
        fallbackIcon: undefined,
        onCspError: undefined,
        disabled: undefined,
        disabledStyle: undefined,
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized).not.toHaveProperty('fallbackIcon');
      expect(normalized).not.toHaveProperty('onCspError');
      expect(normalized).not.toHaveProperty('disabled');
      expect(normalized).not.toHaveProperty('disabledStyle');
    });

    it('should handle zero values correctly', () => {
      const options = {
        iconDataUri: 'data:image/svg+xml;base64,PHN2Zy...',
        size: 0,
        timeout: 0,
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized.size).toBe(0);
      expect(normalized.timeout).toBe(0);
    });

    it('should handle false boolean values correctly', () => {
      const options = {
        iconDataUri: 'data:image/svg+xml;base64,PHN2Zy...',
        disabled: false,
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized.disabled).toBe(false);
    });
  });

  describe('createIconAccessibilityAttributes', () => {
    it('should create basic accessibility attributes with alt text', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'MetaMask icon',
      });

      expect(attributes['aria-label']).toBe('MetaMask icon');
    });

    it('should add disabled state to aria-label', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'MetaMask icon',
        disabled: true,
      });

      expect(attributes['aria-label']).toBe('MetaMask icon (disabled)');
      expect(attributes['aria-disabled']).toBe('true');
    });

    it('should add loading state to aria-label', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'MetaMask icon',
        loading: true,
      });

      expect(attributes['aria-label']).toBe('MetaMask icon (loading)');
    });

    it('should prioritize disabled over loading in aria-label', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'MetaMask icon',
        disabled: true,
        loading: true,
      });

      expect(attributes['aria-label']).toBe('MetaMask icon (disabled)');
      expect(attributes['aria-disabled']).toBe('true');
    });

    it('should add button role and tabindex for clickable icons', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'MetaMask icon',
        clickable: true,
      });

      expect(attributes['role']).toBe('button');
      expect(attributes['tabIndex']).toBe('0');
    });

    it('should not add button role when disabled even if clickable', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'MetaMask icon',
        clickable: true,
        disabled: true,
      });

      expect(attributes).not.toHaveProperty('role');
      expect(attributes).not.toHaveProperty('tabIndex');
      expect(attributes['aria-disabled']).toBe('true');
    });

    it('should handle no alt text', () => {
      const attributes = createIconAccessibilityAttributes({
        disabled: true,
        clickable: true,
      });

      expect(attributes).not.toHaveProperty('aria-label');
      expect(attributes['aria-disabled']).toBe('true');
      expect(attributes).not.toHaveProperty('role');
      expect(attributes).not.toHaveProperty('tabIndex');
    });

    it('should handle empty options', () => {
      const attributes = createIconAccessibilityAttributes({});

      expect(Object.keys(attributes)).toHaveLength(0);
    });

    it('should handle all states together', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: 'Test icon',
        disabled: false,
        clickable: true,
        loading: false,
      });

      expect(attributes['aria-label']).toBe('Test icon');
      expect(attributes['role']).toBe('button');
      expect(attributes['tabIndex']).toBe('0');
      expect(attributes).not.toHaveProperty('aria-disabled');
    });
  });

  describe('getIconContainerStyles', () => {
    it('should get basic container styles', () => {
      const styles = getIconContainerStyles({
        size: 32,
      });

      expect(styles.width).toBe('32px');
      expect(styles.height).toBe('32px');
      expect(styles.display).toBe('inline-block');
      expect(styles.position).toBe('relative');
      expect(styles.cursor).toBe('default');
    });

    it('should apply disabled styling', () => {
      const styles = getIconContainerStyles({
        size: 32,
        disabled: true,
      });

      expect(styles.cursor).toBe('not-allowed');
    });

    it('should apply clickable styling', () => {
      const styles = getIconContainerStyles({
        size: 32,
        clickable: true,
      });

      expect(styles.cursor).toBe('pointer');
    });

    it('should add hover effects for clickable non-disabled icons', () => {
      const styles = getIconContainerStyles({
        size: 32,
        clickable: true,
        hover: true,
      });

      expect(styles.opacity).toBe('0.8');
      expect(styles.transform).toBe('scale(1.05)');
      expect(styles.transition).toBe('opacity 0.2s ease, transform 0.2s ease');
    });

    it('should not add hover effects when disabled', () => {
      const styles = getIconContainerStyles({
        size: 32,
        clickable: true,
        disabled: true,
        hover: true,
      });

      expect(styles).not.toHaveProperty('opacity');
      expect(styles).not.toHaveProperty('transform');
      expect(styles).not.toHaveProperty('transition');
    });

    it('should not add hover effects when not clickable', () => {
      const styles = getIconContainerStyles({
        size: 32,
        clickable: false,
        hover: true,
      });

      expect(styles).not.toHaveProperty('opacity');
      expect(styles).not.toHaveProperty('transform');
      expect(styles).not.toHaveProperty('transition');
    });

    it('should apply style overrides', () => {
      const styles = getIconContainerStyles({
        size: 32,
        styleOverrides: {
          border: '2px solid blue',
          backgroundColor: 'red',
          cursor: 'help',
        },
      });

      expect(styles.border).toBe('2px solid blue');
      expect(styles.backgroundColor).toBe('red');
      expect(styles.cursor).toBe('help');
    });

    it('should preserve base styles when overrides do not conflict', () => {
      const styles = getIconContainerStyles({
        size: 32,
        styleOverrides: {
          border: '1px solid black',
        },
      });

      expect(styles.width).toBe('32px');
      expect(styles.height).toBe('32px');
      expect(styles.display).toBe('inline-block');
      expect(styles.border).toBe('1px solid black');
    });

    it('should handle all state combinations', () => {
      const styles = getIconContainerStyles({
        size: 48,
        disabled: false,
        clickable: true,
        hover: true,
        styleOverrides: {
          padding: '4px',
        },
      });

      expect(styles.width).toBe('48px');
      expect(styles.cursor).toBe('pointer');
      expect(styles.opacity).toBe('0.8');
      expect(styles.transform).toBe('scale(1.05)');
      expect(styles.padding).toBe('4px');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very small sizes', () => {
      const config = createIconContainerConfig({ size: 1 });

      expect(config.containerStyles.width).toBe('1px');
      expect(config.containerStyles.height).toBe('1px');
      expect(config.loading.styles.fontSize).toBe('8px'); // Math.max(8, 1 * 0.3)
    });

    it('should handle very large sizes', () => {
      const config = createIconContainerConfig({ size: 1000 });

      expect(config.containerStyles.width).toBe('1000px');
      expect(config.containerStyles.height).toBe('1000px');
      expect(config.loading.styles.fontSize).toBe('300px'); // 1000 * 0.3
    });

    it('should handle zero size', () => {
      const config = createIconContainerConfig({ size: 0 });

      expect(config.containerStyles.width).toBe('0px');
      expect(config.containerStyles.height).toBe('0px');
      expect(config.loading.styles.fontSize).toBe('8px'); // Math.max(8, 0)
    });

    it('should handle negative size', () => {
      const config = createIconContainerConfig({ size: -10 });

      expect(config.containerStyles.width).toBe('-10px');
      expect(config.containerStyles.height).toBe('-10px');
      expect(config.loading.styles.fontSize).toBe('8px'); // Math.max(8, -3)
    });

    it('should handle fractional sizes', () => {
      const config = createIconContainerConfig({ size: 24.5 });

      expect(config.containerStyles.width).toBe('24.5px');
      expect(config.containerStyles.height).toBe('24.5px');
      expect(config.loading.styles.fontSize).toBe('8px'); // Math.max(8, 24.5 * 0.3) = 8
    });

    it('should handle empty style overrides', () => {
      const config = createIconContainerConfig({
        size: 32,
        styleOverrides: {},
      });

      expect(config.containerStyles.width).toBe('32px');
      expect(config.containerStyles.height).toBe('32px');
    });

    it('should handle null and undefined values in style overrides', () => {
      const config = createIconContainerConfig({
        size: 32,
        styleOverrides: {
          border: undefined as string,
          backgroundColor: null as string,
          padding: '4px',
        },
      });

      expect(config.containerStyles.border).toBeUndefined();
      expect(config.containerStyles.backgroundColor).toBeNull();
      expect(config.containerStyles.padding).toBe('4px');
    });

    it('should handle special characters in loading content', () => {
      const config = createIconContainerConfig({
        size: 32,
        loadingContent: '<>&"\'',
      });

      expect(config.loading.content).toBe('<>&"\'');
    });

    it('should handle unicode characters in loading content', () => {
      const config = createIconContainerConfig({
        size: 32,
        loadingContent: '🔄⚡🌟',
      });

      expect(config.loading.content).toBe('🔄⚡🌟');
    });

    it('should handle empty loading content', () => {
      const config = createIconContainerConfig({
        size: 32,
        loadingContent: '',
      });

      expect(config.loading.content).toBe('');
    });

    it('should handle empty className', () => {
      const config = createIconContainerConfig({
        size: 32,
        className: '',
      });

      expect(config.className).toBe('');
    });

    it('should handle className with spaces', () => {
      const config = createIconContainerConfig({
        size: 32,
        className: 'class1 class2 class3',
      });

      expect(config.className).toBe('class1 class2 class3');
    });

    it('should handle normalizeIconOptions with extreme values', () => {
      const options = {
        iconDataUri: '',
        size: Number.MAX_SAFE_INTEGER,
        timeout: Number.MAX_SAFE_INTEGER,
      };

      const normalized = normalizeIconOptions(options);

      expect(normalized.iconDataUri).toBe('');
      expect(normalized.size).toBe(Number.MAX_SAFE_INTEGER);
      expect(normalized.timeout).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle accessibility attributes with special characters', () => {
      const attributes = createIconAccessibilityAttributes({
        alt: '<script>alert("test")</script>',
        disabled: true,
      });

      expect(attributes['aria-label']).toBe('<script>alert("test")</script> (disabled)');
    });

    it('should handle hover styles with conflicting style overrides', () => {
      const styles = getIconContainerStyles({
        size: 32,
        clickable: true,
        hover: true,
        styleOverrides: {
          opacity: '1.0',
          transform: 'rotate(45deg)',
          transition: 'color 1s ease',
        },
      });

      // Style overrides should take precedence over hover styles
      expect(styles.opacity).toBe('1.0');
      expect(styles.transform).toBe('rotate(45deg)');
      expect(styles.transition).toBe('color 1s ease');
    });
  });
});
