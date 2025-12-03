import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment } from '../../testing/index.js';
import {
  addElementListener,
  appendToDOM,
  attachGlobalListener,
  createDOMElement,
  createSafeInterval,
  createSafeTimeout,
  domAttribute,
  queryDOM,
  removeFromDOM,
  setDOMStyles,
} from './dom-essentials.js';

// Mock the environment utilities
vi.mock('../../api/utils/environment.js', () => ({
  isBrowser: vi.fn(),
  getDocument: vi.fn(),
}));

describe('dom-essentials', () => {
  let mockDocument: Document;
  let mockElement: HTMLElement;
  let mockWindow: Window;
  let isBrowserMock: ReturnType<typeof vi.fn>;
  let getDocumentMock: ReturnType<typeof vi.fn>;

  // Use centralized test setup pattern
  const testEnv = createTestEnvironment({
    customSetup: async () => {
      // Get mock functions
      const environmentModule = await import('../../api/utils/environment.js');
      isBrowserMock = vi.mocked(environmentModule.isBrowser);
      getDocumentMock = vi.mocked(environmentModule.getDocument);

      // Mock DOM element
      mockElement = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        getAttribute: vi.fn(),
        setAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        parentNode: {
          removeChild: vi.fn(),
        },
        style: {},
      };

      // Mock document
      mockDocument = {
        querySelector: vi.fn(),
        createElement: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      // Mock window
      mockWindow = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        setTimeout: vi.fn(),
        setInterval: vi.fn(),
      };

      // Setup global mocks
      (global as typeof global & { document?: Document }).document = mockDocument;
      (global as typeof global & { window?: Window }).window = mockWindow;
      (global as typeof global & { setTimeout?: typeof setTimeout }).setTimeout = vi.fn();
      (global as typeof global & { setInterval?: typeof setInterval }).setInterval = vi.fn();
    },
    customTeardown: () => {
      // Clean up globals
      Object.assign(global, { document: undefined });
      Object.assign(global, { window: undefined });
      Object.assign(global, { setTimeout: undefined });
      Object.assign(global, { setInterval: undefined });
    },
  });

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('queryDOM', () => {
    it('should query DOM element successfully in browser', () => {
      getDocumentMock.mockReturnValue(mockDocument);
      mockDocument.querySelector.mockReturnValue(mockElement);

      const result = queryDOM('#test');

      expect(getDocumentMock).toHaveBeenCalled();
      expect(mockDocument.querySelector).toHaveBeenCalledWith('#test');
      expect(result).toBe(mockElement);
    });

    it('should return null when no document available', () => {
      getDocumentMock.mockReturnValue(null);

      const result = queryDOM('#test');

      expect(result).toBeNull();
      expect(mockDocument.querySelector).not.toHaveBeenCalled();
    });

    it('should return null when element not found', () => {
      getDocumentMock.mockReturnValue(mockDocument);
      mockDocument.querySelector.mockReturnValue(null);

      const result = queryDOM('#nonexistent');

      expect(result).toBeNull();
      expect(mockDocument.querySelector).toHaveBeenCalledWith('#nonexistent');
    });

    it('should support generic type parameter', () => {
      getDocumentMock.mockReturnValue(mockDocument);
      const mockInputElement = { ...mockElement, value: 'test' };
      mockDocument.querySelector.mockReturnValue(mockInputElement);

      const result = queryDOM<HTMLInputElement>('input[type="text"]');

      expect(result).toBe(mockInputElement);
    });
  });

  describe('appendToDOM', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
      getDocumentMock.mockReturnValue(mockDocument);
    });

    it('should append child to parent element successfully', () => {
      const parentElement = mockElement;
      const childElement = { ...mockElement };

      const result = appendToDOM(parentElement, childElement);

      expect(result).toBe(true);
      expect(parentElement.appendChild).toHaveBeenCalledWith(childElement);
    });

    it('should append child using parent selector', () => {
      mockDocument.querySelector.mockReturnValue(mockElement);
      const childElement = { ...mockElement };

      const result = appendToDOM('#parent', childElement);

      expect(result).toBe(true);
      expect(mockDocument.querySelector).toHaveBeenCalledWith('#parent');
      expect(mockElement.appendChild).toHaveBeenCalledWith(childElement);
    });

    it('should return false when not in browser', () => {
      isBrowserMock.mockReturnValue(false);
      const childElement = { ...mockElement };

      const result = appendToDOM(mockElement, childElement);

      expect(result).toBe(false);
      expect(mockElement.appendChild).not.toHaveBeenCalled();
    });

    it('should return false when parent element not found', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const childElement = { ...mockElement };

      const result = appendToDOM('#nonexistent', childElement);

      expect(result).toBe(false);
    });

    it('should return false when parent element is null', () => {
      const childElement = { ...mockElement };

      const result = appendToDOM(null as HTMLElement, childElement);

      expect(result).toBe(false);
    });
  });

  describe('removeFromDOM', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
      getDocumentMock.mockReturnValue(mockDocument);
    });

    it('should remove element from DOM successfully', () => {
      const element = {
        ...mockElement,
        parentNode: {
          removeChild: vi.fn(),
          contains: vi.fn().mockReturnValue(true),
        },
      };

      const result = removeFromDOM(element);

      expect(result).toBe(true);
      expect(element.parentNode.removeChild).toHaveBeenCalledWith(element);
    });

    it('should remove element using selector', () => {
      const element = {
        ...mockElement,
        parentNode: {
          removeChild: vi.fn(),
          contains: vi.fn().mockReturnValue(true),
        },
      };
      mockDocument.querySelector.mockReturnValue(element);

      const result = removeFromDOM('#element');

      expect(result).toBe(true);
      expect(mockDocument.querySelector).toHaveBeenCalledWith('#element');
      expect(element.parentNode.removeChild).toHaveBeenCalledWith(element);
    });

    it('should return false when not in browser', () => {
      isBrowserMock.mockReturnValue(false);

      const result = removeFromDOM(mockElement);

      expect(result).toBe(false);
    });

    it('should return false when element not found', () => {
      mockDocument.querySelector.mockReturnValue(null);

      const result = removeFromDOM('#nonexistent');

      expect(result).toBe(false);
    });

    it('should return false when element has no parent', () => {
      const element = { ...mockElement, parentNode: null };

      const result = removeFromDOM(element);

      expect(result).toBe(false);
    });

    it('should return false when element is null', () => {
      const result = removeFromDOM(null as HTMLElement);

      expect(result).toBe(false);
    });
  });

  describe('createDOMElement', () => {
    it('should create DOM element successfully', () => {
      getDocumentMock.mockReturnValue(mockDocument);
      const mockCreatedElement = { tagName: 'DIV' };
      mockDocument.createElement.mockReturnValue(mockCreatedElement);

      const result = createDOMElement('div');

      expect(getDocumentMock).toHaveBeenCalled();
      expect(mockDocument.createElement).toHaveBeenCalledWith('div');
      expect(result).toBe(mockCreatedElement);
    });

    it('should return null when no document available', () => {
      getDocumentMock.mockReturnValue(null);

      const result = createDOMElement('div');

      expect(result).toBeNull();
      expect(mockDocument.createElement).not.toHaveBeenCalled();
    });

    it('should support different HTML tag types', () => {
      getDocumentMock.mockReturnValue(mockDocument);
      mockDocument.createElement.mockReturnValue(mockElement);

      createDOMElement('span');
      createDOMElement('button');
      createDOMElement('input');

      expect(mockDocument.createElement).toHaveBeenCalledWith('span');
      expect(mockDocument.createElement).toHaveBeenCalledWith('button');
      expect(mockDocument.createElement).toHaveBeenCalledWith('input');
    });
  });

  describe('domAttribute', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
      getDocumentMock.mockReturnValue(mockDocument);
    });

    describe('getter behavior', () => {
      it('should get attribute value from element', () => {
        mockElement.getAttribute.mockReturnValue('test-value');

        const result = domAttribute(mockElement, 'data-test');

        expect(mockElement.getAttribute).toHaveBeenCalledWith('data-test');
        expect(result).toBe('test-value');
      });

      it('should get attribute using selector', () => {
        mockDocument.querySelector.mockReturnValue(mockElement);
        mockElement.getAttribute.mockReturnValue('test-value');

        const result = domAttribute('#element', 'data-test');

        expect(mockDocument.querySelector).toHaveBeenCalledWith('#element');
        expect(mockElement.getAttribute).toHaveBeenCalledWith('data-test');
        expect(result).toBe('test-value');
      });

      it('should return null when not in browser (getter)', () => {
        isBrowserMock.mockReturnValue(false);

        const result = domAttribute(mockElement, 'data-test');

        expect(result).toBeNull();
        expect(mockElement.getAttribute).not.toHaveBeenCalled();
      });

      it('should return null when element not found (getter)', () => {
        mockDocument.querySelector.mockReturnValue(null);

        const result = domAttribute('#nonexistent', 'data-test');

        expect(result).toBeNull();
      });

      it('should return null when attribute not found', () => {
        mockElement.getAttribute.mockReturnValue(null);

        const result = domAttribute(mockElement, 'nonexistent-attr');

        expect(result).toBeNull();
      });
    });

    describe('setter behavior', () => {
      it('should set attribute value on element', () => {
        const result = domAttribute(mockElement, 'data-test', 'new-value');

        expect(mockElement.setAttribute).toHaveBeenCalledWith('data-test', 'new-value');
        expect(result).toBe(true);
      });

      it('should set attribute using selector', () => {
        mockDocument.querySelector.mockReturnValue(mockElement);

        const result = domAttribute('#element', 'data-test', 'new-value');

        expect(mockDocument.querySelector).toHaveBeenCalledWith('#element');
        expect(mockElement.setAttribute).toHaveBeenCalledWith('data-test', 'new-value');
        expect(result).toBe(true);
      });

      it('should return false when not in browser (setter)', () => {
        isBrowserMock.mockReturnValue(false);

        const result = domAttribute(mockElement, 'data-test', 'value');

        expect(result).toBe(false);
        expect(mockElement.setAttribute).not.toHaveBeenCalled();
      });

      it('should return false when element not found (setter)', () => {
        mockDocument.querySelector.mockReturnValue(null);

        const result = domAttribute('#nonexistent', 'data-test', 'value');

        expect(result).toBe(false);
      });
    });
  });

  describe('setDOMStyles', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
      getDocumentMock.mockReturnValue(mockDocument);
    });

    it('should set styles on element', () => {
      const element = { ...mockElement, style: {} };
      const styles = { color: 'red', fontSize: '16px' };

      const result = setDOMStyles(element, styles);

      expect(result).toBe(true);
      expect(element.style).toEqual(styles);
    });

    it('should set styles using selector', () => {
      const element = { ...mockElement, style: {} };
      mockDocument.querySelector.mockReturnValue(element);
      const styles = { backgroundColor: 'blue' };

      const result = setDOMStyles('#element', styles);

      expect(mockDocument.querySelector).toHaveBeenCalledWith('#element');
      expect(result).toBe(true);
      expect(element.style).toEqual(styles);
    });

    it('should return false when not in browser', () => {
      isBrowserMock.mockReturnValue(false);
      const styles = { color: 'red' };

      const result = setDOMStyles(mockElement, styles);

      expect(result).toBe(false);
    });

    it('should return false when element not found', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const styles = { color: 'red' };

      const result = setDOMStyles('#nonexistent', styles);

      expect(result).toBe(false);
    });

    it('should handle partial CSS style declarations', () => {
      const element = { ...mockElement, style: { color: 'blue' } };
      const styles = { fontSize: '14px', fontWeight: 'bold' };

      const result = setDOMStyles(element, styles);

      expect(result).toBe(true);
      expect(element.style).toEqual({ color: 'blue', fontSize: '14px', fontWeight: 'bold' });
    });
  });

  describe('addElementListener', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
      getDocumentMock.mockReturnValue(mockDocument);
    });

    it('should add event listener to element', () => {
      const handler = vi.fn();
      const options = { passive: true };

      const cleanup = addElementListener(mockElement, 'click', handler, options);

      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, options);
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should add event listener using selector', () => {
      mockDocument.querySelector.mockReturnValue(mockElement);
      const handler = vi.fn();

      const cleanup = addElementListener('#element', 'click', handler);

      expect(mockDocument.querySelector).toHaveBeenCalledWith('#element');
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, undefined);
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should return no-op cleanup when not in browser', () => {
      isBrowserMock.mockReturnValue(false);
      const handler = vi.fn();

      const cleanup = addElementListener(mockElement, 'click', handler);

      expect(cleanup).toBeInstanceOf(Function);
      expect(mockElement.addEventListener).not.toHaveBeenCalled();
    });

    it('should return no-op cleanup when element not found', () => {
      mockDocument.querySelector.mockReturnValue(null);
      const handler = vi.fn();

      const cleanup = addElementListener('#nonexistent', 'click', handler);

      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should remove event listener when cleanup called', () => {
      const handler = vi.fn();
      const options = { capture: true };

      const cleanup = addElementListener(mockElement, 'click', handler, options);
      cleanup();

      expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler, options);
    });

    it('should handle boolean options', () => {
      const handler = vi.fn();

      const _cleanup = addElementListener(mockElement, 'click', handler, true);

      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', handler, true);
    });

    it('should support different event types', () => {
      const handler = vi.fn();

      addElementListener(mockElement, 'mouseover', handler);
      addElementListener(mockElement, 'keydown', handler);
      addElementListener(mockElement, 'focus', handler);

      expect(mockElement.addEventListener).toHaveBeenCalledWith('mouseover', handler, undefined);
      expect(mockElement.addEventListener).toHaveBeenCalledWith('keydown', handler, undefined);
      expect(mockElement.addEventListener).toHaveBeenCalledWith('focus', handler, undefined);
    });
  });

  describe('attachGlobalListener', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
    });

    it('should attach listener to window', () => {
      const handler = vi.fn();
      const options = { passive: true };

      const cleanup = attachGlobalListener('window', 'resize', handler, options);

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', handler, options);
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should attach listener to document', () => {
      const handler = vi.fn();

      const cleanup = attachGlobalListener('document', 'DOMContentLoaded', handler);

      expect(mockDocument.addEventListener).toHaveBeenCalledWith('DOMContentLoaded', handler, undefined);
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should return no-op cleanup when not in browser', () => {
      isBrowserMock.mockReturnValue(false);
      const handler = vi.fn();

      const cleanup = attachGlobalListener('window', 'resize', handler);

      expect(cleanup).toBeInstanceOf(Function);
      expect(mockWindow.addEventListener).not.toHaveBeenCalled();
    });

    it('should remove listener when cleanup called (window)', () => {
      const handler = vi.fn();
      const options = { capture: true };

      const cleanup = attachGlobalListener('window', 'resize', handler, options);
      cleanup();

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', handler, options);
    });

    it('should remove listener when cleanup called (document)', () => {
      const handler = vi.fn();

      const cleanup = attachGlobalListener('document', 'click', handler);
      cleanup();

      expect(mockDocument.removeEventListener).toHaveBeenCalledWith('click', handler, undefined);
    });

    it('should handle boolean options', () => {
      const handler = vi.fn();

      attachGlobalListener('window', 'scroll', handler, false);

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('scroll', handler, false);
    });
  });

  describe('createSafeTimeout', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
    });

    it('should create timeout in browser', () => {
      const callback = vi.fn();
      const mockTimeoutId = 123;
      vi.mocked(global.setTimeout).mockReturnValue(mockTimeoutId as NodeJS.Timeout);

      const result = createSafeTimeout(callback, 1000);

      expect(global.setTimeout).toHaveBeenCalledWith(callback, 1000);
      expect(result).toBe(mockTimeoutId);
    });

    it('should return null when not in browser', () => {
      isBrowserMock.mockReturnValue(false);
      const callback = vi.fn();

      const result = createSafeTimeout(callback, 1000);

      expect(result).toBeNull();
      expect(global.setTimeout).not.toHaveBeenCalled();
    });

    it('should handle zero delay', () => {
      const callback = vi.fn();
      const mockTimeoutId = 456;
      vi.mocked(global.setTimeout).mockReturnValue(mockTimeoutId as NodeJS.Timeout);

      const result = createSafeTimeout(callback, 0);

      expect(global.setTimeout).toHaveBeenCalledWith(callback, 0);
      expect(result).toBe(mockTimeoutId);
    });
  });

  describe('createSafeInterval', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
    });

    it('should create interval in browser', () => {
      const callback = vi.fn();
      const mockIntervalId = 789;
      vi.mocked(global.setInterval).mockReturnValue(mockIntervalId as NodeJS.Timeout);

      const result = createSafeInterval(callback, 5000);

      expect(global.setInterval).toHaveBeenCalledWith(callback, 5000);
      expect(result).toBe(mockIntervalId);
    });

    it('should return null when not in browser', () => {
      isBrowserMock.mockReturnValue(false);
      const callback = vi.fn();

      const result = createSafeInterval(callback, 5000);

      expect(result).toBeNull();
      expect(global.setInterval).not.toHaveBeenCalled();
    });

    it('should handle short intervals', () => {
      const callback = vi.fn();
      const mockIntervalId = 101;
      vi.mocked(global.setInterval).mockReturnValue(mockIntervalId as NodeJS.Timeout);

      const result = createSafeInterval(callback, 100);

      expect(global.setInterval).toHaveBeenCalledWith(callback, 100);
      expect(result).toBe(mockIntervalId);
    });
  });

  describe('Integration scenarios', () => {
    beforeEach(() => {
      isBrowserMock.mockReturnValue(true);
      getDocumentMock.mockReturnValue(mockDocument);
    });

    it('should handle complete DOM manipulation workflow', () => {
      // Create element
      const createdElement = { ...mockElement, style: {} };
      mockDocument.createElement.mockReturnValue(createdElement);

      // Query parent
      const parentElement = { ...mockElement };
      mockDocument.querySelector.mockReturnValue(parentElement);

      // Workflow
      const element = createDOMElement('div');
      let success = false;
      if (element) {
        domAttribute(element, 'id', 'test-element');
        setDOMStyles(element, { color: 'red' });
        success = appendToDOM('#parent', element);
      }

      expect(success).toBe(true);
      expect(createdElement.setAttribute).toHaveBeenCalledWith('id', 'test-element');
      expect(createdElement.style).toEqual({ color: 'red' });
      expect(parentElement.appendChild).toHaveBeenCalledWith(createdElement);
    });

    it('should handle event listener cleanup properly', () => {
      const handler = vi.fn();
      mockDocument.querySelector.mockReturnValue(mockElement);

      const cleanup1 = addElementListener('#element', 'click', handler);
      const cleanup2 = attachGlobalListener('window', 'resize', handler);

      // Cleanup
      cleanup1();
      cleanup2();

      expect(mockElement.removeEventListener).toHaveBeenCalledWith('click', handler, undefined);
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', handler, undefined);
    });

    it('should gracefully handle SSR environment', () => {
      isBrowserMock.mockReturnValue(false);
      getDocumentMock.mockReturnValue(null);

      const element = createDOMElement('div');
      const appendResult = appendToDOM('#parent', mockElement);
      const removeResult = removeFromDOM('#element');
      const attrResult = domAttribute('#element', 'test');
      const styleResult = setDOMStyles('#element', { color: 'red' });
      const timeoutResult = createSafeTimeout(() => {}, 1000);
      const intervalResult = createSafeInterval(() => {}, 1000);

      expect(element).toBeNull();
      expect(appendResult).toBe(false);
      expect(removeResult).toBe(false);
      expect(attrResult).toBeNull();
      expect(styleResult).toBe(false);
      expect(timeoutResult).toBeNull();
      expect(intervalResult).toBeNull();
    });
  });
});
