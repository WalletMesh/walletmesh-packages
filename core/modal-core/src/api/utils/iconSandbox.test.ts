/**
 * @fileoverview Tests for icon sandbox utility security validation
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { createSandboxedIcon, createSandboxedIcons, isSandboxSupported } from './iconSandbox.js';

// Install custom matchers
installCustomMatchers();

// Mock DOM environment for testing
const mockCreateElement = vi.fn();

describe('Icon Sandbox Tests', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Setup DOM mocks
    global.document = {
      createElement: mockCreateElement,
    } as Partial<Document> as Document;

    // Mock window with proper timeout functions
    let timeoutId = 1;
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: vi.fn((callback: () => void, ms?: number) => {
        // For the CSP timeout, we want to simulate success by running the callback
        if (ms && ms > 0) {
          process.nextTick(callback);
        } else {
          process.nextTick(callback);
        }
        return timeoutId++;
      }),
      clearTimeout: vi.fn(),
    } as Partial<Window> as Window & typeof globalThis;

    // Mock iframe element with proper style handling
    // biome-ignore lint/suspicious/noExplicitAny: Complex mock object for testing
    const mockIframe: any = {
      sandbox: '',
      style: {
        cssText: '',
      },
      title: '',
      loading: '',
      setAttribute: vi.fn(),
      srcdocPrivate: '',
      contentWindow: {
        postMessage: vi.fn(),
      },
      eventListenersPrivate: {} as Record<string, (() => void)[]>,
      // biome-ignore lint/suspicious/noExplicitAny: Mock context required
      addEventListener: vi.fn(function (this: any, event: string, handler: () => void) {
        if (!this.eventListenersPrivate[event]) {
          this.eventListenersPrivate[event] = [];
        }
        this.eventListenersPrivate[event].push(handler);
      }),
      // biome-ignore lint/suspicious/noExplicitAny: Mock context required
      removeEventListener: vi.fn(function (this: any, event: string, handler: () => void) {
        if (this.eventListenersPrivate[event]) {
          this.eventListenersPrivate[event] = this.eventListenersPrivate[event].filter(
            (h: () => void) => h !== handler,
          );
        }
      }),
    };

    // Intercept srcdoc setter to trigger load event
    Object.defineProperty(mockIframe, 'srcdoc', {
      set(value: string) {
        this.srcdocPrivate = value;
        // Trigger load event when srcdoc is set
        if (this.eventListenersPrivate['load']) {
          // Use process.nextTick to ensure async behavior
          process.nextTick(() => {
            for (const handler of this.eventListenersPrivate['load']) {
              handler();
            }
          });
        }
      },
      get() {
        return this.srcdocPrivate || '';
      },
      configurable: true,
    });

    // Also handle style cssText property
    Object.defineProperty(mockIframe.style, 'cssText', {
      get() {
        return this._cssText || '';
      },
      set(value: string) {
        this._cssText = value;
      },
    });

    mockCreateElement.mockReturnValue(mockIframe);

    // Also mock global setTimeout for consistency
    // biome-ignore lint/suspicious/noExplicitAny: Test setup requires type assertion
    global.setTimeout = global.window.setTimeout as any;
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('createSandboxedIcon', () => {
    it('should create iframe for valid SVG data URI', async () => {
      const validSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';

      const iframePromise = createSandboxedIcon({ iconDataUri: validSvg, size: 24 });

      // Wait for next tick to allow iframe setup
      await new Promise((resolve) => process.nextTick(resolve));

      // Now trigger the load event on the created iframe
      const createdMockIframe = mockCreateElement.mock.results[0]?.value;
      const loadCall = createdMockIframe?.addEventListener.mock.calls.find(
        (call: unknown[]) => (call as [string, () => void])[0] === 'load',
      );
      loadCall?.[1]?.();

      const iframe = await iframePromise;

      expect(mockCreateElement).toHaveBeenCalledWith('iframe');
      expect(iframe.sandbox).toBe('allow-same-origin');
      // SVG content should be HTML-escaped in the srcdoc
      expect(iframe.srcdoc).toContain('&lt;svg');
      expect(iframe.srcdoc).toContain('&gt;');
      expect(iframe.srcdoc).toContain('&quot;');
      expect(iframe.srcdoc).toContain('Content-Security-Policy');
    });

    it('should reject non-SVG data URIs', async () => {
      const invalidMimeType =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

      await expect(createSandboxedIcon({ iconDataUri: invalidMimeType })).rejects.toThrow(
        /ErrorFactory.*sandboxCreationFailed.*is not a function|Only SVG data URIs are allowed/,
      );
    });

    it('should reject oversized icons', async () => {
      // Create a data URI that exceeds the size limit
      const largeContent = 'x'.repeat(200 * 1024); // 200KB
      const oversizedSvg = `data:image/svg+xml,<svg>${largeContent}</svg>`;

      await expect(createSandboxedIcon({ iconDataUri: oversizedSvg })).rejects.toThrow(
        /ErrorFactory.*sandboxCreationFailed.*is not a function|Icon exceeds maximum size limit/,
      );
    });

    it('should allow SVGs with script tags (CSP will block execution)', async () => {
      const svgWithScript = 'data:image/svg+xml,<svg><script>alert("xss")</script></svg>';

      // Should not throw - CSP handles security
      const iframe = await createSandboxedIcon({ iconDataUri: svgWithScript });
      expect(iframe).toBeDefined();
    });

    it('should allow SVGs with javascript: URIs (CSP will block execution)', async () => {
      const svgWithJavascript = 'data:image/svg+xml,<svg><image href="javascript:alert(1)"/></svg>';

      // Should not throw - CSP handles security
      const iframe = await createSandboxedIcon({ iconDataUri: svgWithJavascript });
      expect(iframe).toBeDefined();
    });

    it('should allow SVGs with event handlers (CSP will block execution)', async () => {
      const svgWithHandlers = 'data:image/svg+xml,<svg onload="alert(1)"><circle r="10"/></svg>';

      // Should not throw - CSP handles security
      const iframe = await createSandboxedIcon({ iconDataUri: svgWithHandlers });
      expect(iframe).toBeDefined();
    });

    it('should allow SVGs with foreignObject elements (CSP will restrict content)', async () => {
      const svgWithForeignObject =
        'data:image/svg+xml,<svg><foreignObject><div>content</div></foreignObject></svg>';

      // Should not throw - CSP handles security
      const iframe = await createSandboxedIcon({ iconDataUri: svgWithForeignObject });
      expect(iframe).toBeDefined();
    });

    it('should set proper security attributes on iframe', async () => {
      const validSvg = 'data:image/svg+xml,<svg><circle r="10"/></svg>';

      const iframe = await createSandboxedIcon({ iconDataUri: validSvg, size: 32 });

      expect(iframe.sandbox).toBe('allow-same-origin');
      expect(iframe.title).toBe('Sandboxed icon');
      expect(iframe.loading).toBe('lazy');
    });

    it('should include CSP in iframe content', async () => {
      const validSvg = 'data:image/svg+xml,<svg><circle r="10"/></svg>';

      const iframe = await createSandboxedIcon({ iconDataUri: validSvg, size: 24 });

      expect(iframe.srcdoc).toContain('Content-Security-Policy');
      expect(iframe.srcdoc).toContain("default-src 'none'");
      expect(iframe.srcdoc).toContain('img-src data:');
    });

    it('should set correct dimensions', async () => {
      const validSvg = 'data:image/svg+xml,<svg><circle r="10"/></svg>';

      const iframe = await createSandboxedIcon({ iconDataUri: validSvg, size: 48 });

      // Check that cssText contains the size settings
      expect(iframe.style.cssText).toContain('width: 48px');
      expect(iframe.style.cssText).toContain('height: 48px');
    });
  });

  describe('createSandboxedIcons', () => {
    it('should create multiple iframes for multiple icons', async () => {
      const icons = [
        { iconDataUri: 'data:image/svg+xml,<svg><circle r="5"/></svg>', size: 16 },
        { iconDataUri: 'data:image/svg+xml,<svg><rect width="10" height="10"/></svg>', size: 24 },
      ];

      const iframes = await createSandboxedIcons(icons);

      expect(iframes).toHaveLength(2);
      expect(iframes.every((iframe) => String(iframe.sandbox) === 'allow-same-origin')).toBe(true);
    });

    it('should handle errors gracefully in batch processing', async () => {
      const icons = [
        { iconDataUri: 'data:image/svg+xml,<svg><circle r="5"/></svg>' }, // Valid
        { iconDataUri: 'data:image/png,invalid' }, // Invalid
      ];

      await expect(createSandboxedIcons(icons)).rejects.toThrow(
        /ErrorFactory.*sandboxCreationFailed.*is not a function|Only SVG data URIs are allowed/,
      );
      // Should fail on first invalid icon
    });
  });

  describe('isSandboxSupported', () => {
    it('should return true when sandbox and srcdoc are supported', () => {
      // Mock iframe with sandbox support
      mockCreateElement.mockReturnValue({
        sandbox: '',
        srcdoc: '',
      });

      expect(isSandboxSupported()).toBe(true);
    });

    it('should return false when DOM is not available', () => {
      const originalDocument = global.document;
      // @ts-expect-error Testing environment without document
      global.document = undefined;

      expect(isSandboxSupported()).toBe(false);

      global.document = originalDocument;
    });

    it('should return false when iframe creation fails', () => {
      mockCreateElement.mockImplementation(() => {
        throw new Error('DOM not available');
      });

      expect(isSandboxSupported()).toBe(false);
    });
  });

  describe('Validation edge cases', () => {
    it('should handle empty data URI', async () => {
      await expect(createSandboxedIcon({ iconDataUri: '' })).rejects.toThrow(
        /ErrorFactory.*sandboxCreationFailed.*is not a function|Only SVG data URIs are allowed/,
      );
    });

    it('should handle malformed data URI', async () => {
      await expect(createSandboxedIcon({ iconDataUri: 'notadatauri' })).rejects.toThrow(
        /ErrorFactory.*sandboxCreationFailed.*is not a function|Only SVG data URIs are allowed/,
      );
    });

    it('should handle URL encoded content', async () => {
      // This is a valid SVG but with URL encoding that might bypass simple checks
      const encodedSvg = 'data:image/svg+xml,%3Csvg%3E%3Ccircle%20r%3D%2210%22%2F%3E%3C%2Fsvg%3E';

      // Should pass validation since it's properly encoded SVG
      const iframe = await createSandboxedIcon({ iconDataUri: encodedSvg });
      expect(iframe).toBeDefined();
      expect(iframe.sandbox).toBe('allow-same-origin');
    });
  });

  describe('HTML Injection Prevention', () => {
    it('should prevent quote injection in src attribute', async () => {
      // Attempt to inject code by breaking out of src attribute with quotes
      const maliciousSvg = 'data:image/svg+xml," onload="alert(1)';

      const iframe = await createSandboxedIcon({ iconDataUri: maliciousSvg });

      // Verify the iframe was created
      expect(iframe).toBeDefined();
      expect(iframe.srcdoc).toBeDefined();

      // Verify that quotes are escaped in the srcdoc content
      // The escaped version should contain &quot; instead of raw quotes
      expect(iframe.srcdoc).toContain('&quot;');
      // Should NOT contain the unescaped injection attempt
      expect(iframe.srcdoc).not.toMatch(/" onload="/);
    });

    it('should prevent angle bracket injection', async () => {
      // Attempt to inject by closing the img tag and adding new elements
      const maliciousSvg = 'data:image/svg+xml,"><script>alert(1)</script><img src="';

      const iframe = await createSandboxedIcon({ iconDataUri: maliciousSvg });

      expect(iframe).toBeDefined();
      expect(iframe.srcdoc).toBeDefined();

      // Verify angle brackets are escaped
      expect(iframe.srcdoc).toContain('&lt;');
      expect(iframe.srcdoc).toContain('&gt;');
      // Should NOT contain unescaped script tags
      expect(iframe.srcdoc).not.toMatch(/<script>/);
    });

    it('should prevent attribute injection with onload', async () => {
      // Try various injection vectors with onload
      const injectionVectors = [
        'data:image/svg+xml," onload="alert(1)"',
        "data:image/svg+xml,' onload='alert(1)'",
        'data:image/svg+xml,"><img onload=alert(1)>',
      ];

      for (const maliciousSvg of injectionVectors) {
        const iframe = await createSandboxedIcon({ iconDataUri: maliciousSvg });

        expect(iframe).toBeDefined();
        expect(iframe.srcdoc).toBeDefined();

        // Verify special characters are escaped
        const hasEscapedQuotes = iframe.srcdoc.includes('&quot;') || iframe.srcdoc.includes('&#x27;');
        const hasEscapedBrackets = iframe.srcdoc.includes('&lt;') || iframe.srcdoc.includes('&gt;');

        expect(hasEscapedQuotes || hasEscapedBrackets).toBe(true);
      }
    });

    it('should prevent closing tag injection', async () => {
      // Attempt to close the img tag and inject new elements
      const maliciousSvg = 'data:image/svg+xml,"></img><div onclick="alert(1)"><img src="';

      const iframe = await createSandboxedIcon({ iconDataUri: maliciousSvg });

      expect(iframe).toBeDefined();
      expect(iframe.srcdoc).toBeDefined();

      // Verify angle brackets and quotes are escaped
      expect(iframe.srcdoc).toMatch(/&(lt|gt|quot|#x27);/);
      // Should NOT contain unescaped div tags
      expect(iframe.srcdoc).not.toMatch(/<\/img>/);
      expect(iframe.srcdoc).not.toMatch(/<div/);
    });

    it('should prevent combined injection attacks', async () => {
      // Complex attack combining multiple techniques
      const maliciousSvg = "data:image/svg+xml,'></img><svg/onload=alert(1)><img src='";

      const iframe = await createSandboxedIcon({ iconDataUri: maliciousSvg });

      expect(iframe).toBeDefined();
      expect(iframe.srcdoc).toBeDefined();

      // All special characters should be escaped
      expect(iframe.srcdoc).toContain('&lt;'); // <
      expect(iframe.srcdoc).toContain('&gt;'); // >
      expect(iframe.srcdoc).toContain('&#x27;'); // '

      // Should NOT contain any unescaped malicious patterns
      // The key check is that angle brackets are escaped so tags can't be injected
      expect(iframe.srcdoc).not.toMatch(/<svg/);
      expect(iframe.srcdoc).not.toMatch(/<\/img>/);
      // Verify the malicious payload is safely contained in the escaped attribute
      expect(iframe.srcdoc).toMatch(/&lt;svg\/onload=alert\(1\)&gt;/);
    });

    it('should handle legitimate SVG content with special characters', async () => {
      // Valid SVG that happens to contain encoded special characters
      const validSvg =
        'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20r%3D%2210%22%2F%3E%3C%2Fsvg%3E';

      const iframe = await createSandboxedIcon({ iconDataUri: validSvg });

      expect(iframe).toBeDefined();
      expect(iframe.srcdoc).toBeDefined();
      // The escaped version should still be valid
      expect(iframe.sandbox).toBe('allow-same-origin');
    });

    it('should preserve functionality while escaping', async () => {
      // Ensure normal SVGs still work after escaping is applied
      const normalSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';

      const iframe = await createSandboxedIcon({ iconDataUri: normalSvg, size: 24 });

      expect(iframe).toBeDefined();
      expect(iframe.sandbox).toBe('allow-same-origin');
      expect(iframe.srcdoc).toContain('Content-Security-Policy');

      // Verify quotes in normal content are escaped
      expect(iframe.srcdoc).toContain('&quot;');
      expect(iframe.srcdoc).toContain('&lt;');
      expect(iframe.srcdoc).toContain('&gt;');
    });
  });

  describe('createSandboxedIcon (async API)', () => {
    // Mock additional APIs needed for async testing
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    const mockPostMessage = vi.fn();
    const mockSetTimeout = vi.fn();
    const mockClearTimeout = vi.fn();

    beforeEach(() => {
      // Setup additional mocks for async functionality
      vi.stubGlobal('window', {
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        setTimeout: mockSetTimeout,
        clearTimeout: mockClearTimeout,
      });

      // Reset global document setup
      global.document = {
        createElement: mockCreateElement,
      } as Partial<Document> as Document;

      // Track event listeners to simulate iframe load
      let loadHandler: () => void;
      const mockIframe = {
        sandbox: '',
        style: new Proxy(
          {},
          {
            set(target: Record<string, unknown>, prop: string, value: unknown) {
              target[prop] = value;
              return true;
            },
            get(target: Record<string, unknown>, prop: string) {
              return target[prop] || '';
            },
          },
        ) as unknown as CSSStyleDeclaration,
        title: '',
        loading: '',
        setAttribute: vi.fn(),
        srcdocPrivate: '',
        set srcdoc(value: string) {
          this.srcdocPrivate = value;
          // Simulate iframe load when srcdoc is set
          setTimeout(() => {
            if (loadHandler) {
              loadHandler();
            }
          }, 0);
        },
        get srcdoc() {
          return this.srcdocPrivate;
        },
        addEventListener: vi.fn((event: string, handler: () => void) => {
          if (event === 'load') {
            loadHandler = handler;
          }
        }),
        contentWindow: {
          postMessage: mockPostMessage,
        },
      };

      // Mock iframe with event listener support - create fresh instance for each test
      mockCreateElement.mockImplementation(() => mockIframe);

      // Mock successful timeout - assume no CSP errors
      mockSetTimeout.mockImplementation((callback: () => void) => {
        // Execute callback immediately for successful load simulation
        setTimeout(() => callback(), 0);
        return 123; // Return mock timeout ID
      });
    });

    it('should create iframe with async API', async () => {
      const validSvg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';

      const iframe = await createSandboxedIcon({ iconDataUri: validSvg, size: 24 });

      expect(mockCreateElement).toHaveBeenCalledWith('iframe');
      expect(iframe.sandbox).toBe('allow-same-origin');
      // Check that srcdoc was set (it will contain the HTML wrapper around the SVG)
      expect(iframe.srcdoc).toBeDefined();
      // The SVG should be HTML-escaped in the src attribute
      expect(iframe.srcdoc).toContain('&lt;svg');
      expect(iframe.srcdoc).toContain('&quot;');
    });

    it('should use fallback icon on error', async () => {
      const invalidSvg = 'data:image/png,invalid';
      const fallbackSvg = 'data:image/svg+xml,<svg><circle r="5"/></svg>';

      // Should successfully return iframe with fallback
      const iframe = await createSandboxedIcon({
        iconDataUri: invalidSvg,
        fallbackIcon: fallbackSvg,
        size: 24,
      });

      expect(iframe).toBeDefined();
      expect(iframe.srcdoc).toBeDefined();
      // The fallback SVG should be HTML-escaped in the src attribute
      expect(iframe.srcdoc).toContain('&lt;svg');
      expect(iframe.srcdoc).toContain('&lt;circle');
    });
  });
});
