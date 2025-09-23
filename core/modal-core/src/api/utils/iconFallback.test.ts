import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  type CreateFallbackOptions,
  type FallbackIconConfig,
  applyFallbackToElement,
  createFallbackConfig,
  createFallbackConfigs,
} from './iconFallback.js';

describe('iconFallback', () => {
  describe('createFallbackConfig', () => {
    it('should create basic fallback config with required options', () => {
      const options: CreateFallbackOptions = {
        size: 32,
        alt: 'MetaMask',
      };

      const config = createFallbackConfig(options);

      expect(config.content).toBe('M');
      expect(config.styles.width).toBe('32px');
      expect(config.styles.height).toBe('32px');
      expect(config.styles.fontSize).toBe('12.8px'); // 32 * 0.4
      expect(config.className).toBe('icon-fallback');
    });

    it('should extract first letter from alt text', () => {
      const config = createFallbackConfig({
        size: 24,
        alt: 'WalletConnect',
      });

      expect(config.content).toBe('W');
    });

    it('should fallback to src first letter when alt is not provided', () => {
      const config = createFallbackConfig({
        size: 24,
        src: 'https://example.com/phantom.png',
      });

      expect(config.content).toBe('H'); // First letter of 'https'
    });

    it('should use question mark when neither alt nor src are provided', () => {
      const config = createFallbackConfig({
        size: 24,
      });

      expect(config.content).toBe('?');
    });

    it('should handle empty strings gracefully', () => {
      const config = createFallbackConfig({
        size: 24,
        alt: '',
        src: '',
      });

      expect(config.content).toBe('?');
    });

    it('should calculate responsive font size correctly', () => {
      const smallConfig = createFallbackConfig({ size: 16 });
      const largeConfig = createFallbackConfig({ size: 64 });

      expect(smallConfig.styles.fontSize).toBe('10px'); // Math.max(10, 16 * 0.4)
      expect(largeConfig.styles.fontSize).toBe('25.6px'); // 64 * 0.4
    });

    it('should apply disabled styling', () => {
      const config = createFallbackConfig({
        size: 32,
        disabled: true,
      });

      expect(config.styles.background).toBe('#f8f8f8');
      expect(config.styles.color).toBe('#999');
      expect(config.attributes['aria-disabled']).toBe('true');
    });

    it('should apply normal styling when not disabled', () => {
      const config = createFallbackConfig({
        size: 32,
        disabled: false,
      });

      expect(config.styles.background).toBe('#f0f0f0');
      expect(config.styles.color).toBe('#666');
      expect(config.attributes).not.toHaveProperty('aria-disabled');
    });

    it('should include accessibility attributes when alt is provided', () => {
      const config = createFallbackConfig({
        size: 32,
        alt: 'MetaMask',
        errorType: 'csp',
      });

      expect(config.attributes['title']).toBe('MetaMask (icon blocked by security policy)');
      expect(config.attributes['aria-label']).toBe('MetaMask (icon blocked by security policy)');
    });

    it('should handle different error types in accessibility text', () => {
      const cspConfig = createFallbackConfig({
        size: 32,
        alt: 'Test',
        errorType: 'csp',
      });

      const validationConfig = createFallbackConfig({
        size: 32,
        alt: 'Test',
        errorType: 'validation',
      });

      const networkConfig = createFallbackConfig({
        size: 32,
        alt: 'Test',
        errorType: 'network',
      });

      const unknownConfig = createFallbackConfig({
        size: 32,
        alt: 'Test',
        errorType: 'unknown',
      });

      expect(cspConfig.attributes['title']).toBe('Test (icon blocked by security policy)');
      expect(validationConfig.attributes['title']).toBe('Test (icon failed validation)');
      expect(networkConfig.attributes['title']).toBe('Test (icon failed to load)');
      expect(unknownConfig.attributes['title']).toBe('Test (icon failed to load)');
    });

    it('should include debugging data attributes', () => {
      const config = createFallbackConfig({
        size: 32,
        alt: 'MetaMask',
        errorType: 'network',
      });

      expect(config.attributes['data-fallback-type']).toBe('network');
      expect(config.attributes['data-fallback-content']).toBe('M');
    });

    it('should apply style overrides', () => {
      const config = createFallbackConfig({
        size: 32,
        styleOverrides: {
          background: 'red',
          border: '2px solid blue',
          fontSize: '20px',
        },
      });

      expect(config.styles.background).toBe('red');
      expect(config.styles.border).toBe('2px solid blue');
      expect(config.styles.fontSize).toBe('20px');
    });

    it('should preserve base styles when no overrides conflict', () => {
      const config = createFallbackConfig({
        size: 32,
        styleOverrides: {
          border: '1px solid black',
        },
      });

      expect(config.styles.width).toBe('32px');
      expect(config.styles.height).toBe('32px');
      expect(config.styles.borderRadius).toBe('50%');
      expect(config.styles.border).toBe('1px solid black');
    });

    it('should handle unicode characters in alt text', () => {
      const config = createFallbackConfig({
        size: 32,
        alt: '中文钱包',
      });

      expect(config.content).toBe('中');
    });

    it('should handle special characters in alt text', () => {
      const configs = [
        createFallbackConfig({ size: 32, alt: '@wallet' }),
        createFallbackConfig({ size: 32, alt: '#crypto' }),
        createFallbackConfig({ size: 32, alt: '$finance' }),
        createFallbackConfig({ size: 32, alt: '&connect' }),
      ];

      expect(configs[0].content).toBe('@');
      expect(configs[1].content).toBe('#');
      expect(configs[2].content).toBe('$');
      expect(configs[3].content).toBe('&');
    });

    it('should use default error type when not specified', () => {
      const config = createFallbackConfig({
        size: 32,
        alt: 'Test',
        // errorType not specified
      });

      expect(config.attributes['data-fallback-type']).toBe('unknown');
      expect(config.attributes['title']).toBe('Test (icon failed to load)');
    });
  });

  describe('createFallbackConfigs', () => {
    it('should create multiple fallback configs', () => {
      const options: CreateFallbackOptions[] = [
        { size: 16, alt: 'MetaMask' },
        { size: 24, alt: 'WalletConnect' },
        { size: 32, alt: 'Coinbase' },
      ];

      const configs = createFallbackConfigs(options);

      expect(configs).toHaveLength(3);
      expect(configs[0].content).toBe('M');
      expect(configs[1].content).toBe('W');
      expect(configs[2].content).toBe('C');
      expect(configs[0].styles.width).toBe('16px');
      expect(configs[1].styles.width).toBe('24px');
      expect(configs[2].styles.width).toBe('32px');
    });

    it('should handle empty array', () => {
      const configs = createFallbackConfigs([]);

      expect(configs).toHaveLength(0);
    });

    it('should preserve order of input options', () => {
      const options: CreateFallbackOptions[] = [
        { size: 32, alt: 'First' },
        { size: 32, alt: 'Second' },
        { size: 32, alt: 'Third' },
      ];

      const configs = createFallbackConfigs(options);

      expect(configs[0].content).toBe('F');
      expect(configs[1].content).toBe('S');
      expect(configs[2].content).toBe('T');
    });

    it('should handle different configurations per item', () => {
      const options: CreateFallbackOptions[] = [
        { size: 16, alt: 'Normal', disabled: false },
        { size: 24, alt: 'Disabled', disabled: true },
        { size: 32, alt: 'Error', errorType: 'csp' },
      ];

      const configs = createFallbackConfigs(options);

      expect(configs[0].styles.color).toBe('#666');
      expect(configs[1].styles.color).toBe('#999');
      expect(configs[2].attributes['data-fallback-type']).toBe('csp');
    });
  });

  describe('applyFallbackToElement', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('div');
    });

    afterEach(() => {
      element.remove();
    });

    it('should apply all styles to element', () => {
      const config: FallbackIconConfig = {
        styles: {
          width: '32px',
          height: '32px',
          background: 'red',
          color: 'white',
        },
        content: 'M',
        attributes: {},
        className: 'test-fallback',
      };

      applyFallbackToElement(element, config);

      expect(element.style.width).toBe('32px');
      expect(element.style.height).toBe('32px');
      expect(element.style.background).toBe('red');
      expect(element.style.color).toBe('white');
    });

    it('should set text content', () => {
      const config: FallbackIconConfig = {
        styles: {},
        content: 'W',
        attributes: {},
      };

      applyFallbackToElement(element, config);

      expect(element.textContent).toBe('W');
    });

    it('should set all attributes', () => {
      const config: FallbackIconConfig = {
        styles: {},
        content: 'M',
        attributes: {
          title: 'MetaMask',
          'aria-label': 'MetaMask icon',
          'data-wallet': 'metamask',
        },
      };

      applyFallbackToElement(element, config);

      expect(element.getAttribute('title')).toBe('MetaMask');
      expect(element.getAttribute('aria-label')).toBe('MetaMask icon');
      expect(element.getAttribute('data-wallet')).toBe('metamask');
    });

    it('should add CSS class when provided', () => {
      const config: FallbackIconConfig = {
        styles: {},
        content: 'M',
        attributes: {},
        className: 'fallback-icon',
      };

      applyFallbackToElement(element, config);

      expect(element.classList.contains('fallback-icon')).toBe(true);
    });

    it('should not add CSS class when not provided', () => {
      const config: FallbackIconConfig = {
        styles: {},
        content: 'M',
        attributes: {},
        // className not provided
      };

      applyFallbackToElement(element, config);

      expect(element.className).toBe('');
    });

    it('should handle complete fallback configuration', () => {
      const config = createFallbackConfig({
        size: 48,
        alt: 'Complete Test',
        errorType: 'validation',
        disabled: true,
        styleOverrides: { border: '2px dashed red' },
      });

      applyFallbackToElement(element, config);

      expect(element.style.width).toBe('48px');
      expect(element.style.height).toBe('48px');
      expect(element.style.border).toBe('2px dashed red');
      expect(element.textContent).toBe('C');
      expect(element.getAttribute('title')).toBe('Complete Test (icon failed validation)');
      expect(element.getAttribute('aria-disabled')).toBe('true');
      expect(element.classList.contains('icon-fallback')).toBe(true);
    });

    it('should preserve existing CSS classes when adding new one', () => {
      element.className = 'existing-class another-class';

      const config: FallbackIconConfig = {
        styles: {},
        content: 'M',
        attributes: {},
        className: 'fallback-icon',
      };

      applyFallbackToElement(element, config);

      expect(element.classList.contains('existing-class')).toBe(true);
      expect(element.classList.contains('another-class')).toBe(true);
      expect(element.classList.contains('fallback-icon')).toBe(true);
    });

    it('should override existing attributes', () => {
      element.setAttribute('title', 'Original Title');
      element.setAttribute('data-test', 'original');

      const config: FallbackIconConfig = {
        styles: {},
        content: 'M',
        attributes: {
          title: 'New Title',
          'data-test': 'updated',
          'aria-label': 'New Label',
        },
      };

      applyFallbackToElement(element, config);

      expect(element.getAttribute('title')).toBe('New Title');
      expect(element.getAttribute('data-test')).toBe('updated');
      expect(element.getAttribute('aria-label')).toBe('New Label');
    });

    it('should handle empty configuration gracefully', () => {
      const config: FallbackIconConfig = {
        styles: {},
        content: '',
        attributes: {},
      };

      expect(() => {
        applyFallbackToElement(element, config);
      }).not.toThrow();

      expect(element.textContent).toBe('');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle very small icon sizes', () => {
      const config = createFallbackConfig({ size: 1 });

      expect(config.styles.width).toBe('1px');
      expect(config.styles.height).toBe('1px');
      expect(config.styles.fontSize).toBe('10px'); // Minimum font size
    });

    it('should handle very large icon sizes', () => {
      const config = createFallbackConfig({ size: 1000 });

      expect(config.styles.width).toBe('1000px');
      expect(config.styles.height).toBe('1000px');
      expect(config.styles.fontSize).toBe('400px'); // 1000 * 0.4
    });

    it('should handle zero size gracefully', () => {
      const config = createFallbackConfig({ size: 0 });

      expect(config.styles.width).toBe('0px');
      expect(config.styles.height).toBe('0px');
      expect(config.styles.fontSize).toBe('10px'); // Minimum font size
    });

    it('should handle negative size by converting to string', () => {
      const config = createFallbackConfig({ size: -10 });

      expect(config.styles.width).toBe('-10px');
      expect(config.styles.height).toBe('-10px');
      expect(config.styles.fontSize).toBe('10px'); // Math.max(10, -4) = 10
    });

    it('should handle fractional sizes', () => {
      const config = createFallbackConfig({ size: 24.5 });

      expect(config.styles.width).toBe('24.5px');
      expect(config.styles.height).toBe('24.5px');
      expect(config.styles.fontSize).toBe('10px'); // Math.max(10, 24.5 * 0.4) = 10
    });

    it('should handle null and undefined values in style overrides', () => {
      const config = createFallbackConfig({
        size: 32,
        styleOverrides: {
          background: undefined as string,
          color: null as string,
          border: '1px solid black',
        },
      });

      expect(config.styles.background).toBeUndefined();
      expect(config.styles.color).toBeNull();
      expect(config.styles.border).toBe('1px solid black');
    });

    it('should handle whitespace-only alt text', () => {
      const config = createFallbackConfig({
        size: 32,
        alt: '   ',
      });

      expect(config.content).toBe(' '); // First character of whitespace
    });

    it('should handle special HTML characters in content', () => {
      const config = createFallbackConfig({
        size: 32,
        alt: '<script>alert("test")</script>',
      });

      expect(config.content).toBe('<');
      expect(config.attributes['data-fallback-content']).toBe('<');
    });

    it('should handle multiple CSS classes in className', () => {
      const config: FallbackIconConfig = {
        styles: {},
        content: 'M',
        attributes: {},
        className: 'class1 class2 class3',
      };

      const element = document.createElement('div');
      applyFallbackToElement(element, config);

      // classList.add() with multiple classes should only add the first one
      expect(element.classList.contains('class1')).toBe(true);
      // The string 'class1 class2 class3' is treated as a single class name
      expect(element.className).toBe('class1 class2 class3');
    });
  });
});
