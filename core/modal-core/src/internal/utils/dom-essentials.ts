/**
 * Essential DOM utilities for SSR-safe browser API access
 *
 * This module contains only the DOM utilities that are actually used
 * in the modal-core codebase. The full dom.ts file has been deprecated.
 *
 * @module utils/dom-essentials
 * @internal
 */

import { getDocument, isBrowser } from '../../api/utils/environment.js';

/**
 * Query DOM for a single element
 * @param selector - CSS selector
 * @returns Found element or null
 */
export const queryDOM = <E extends Element = Element>(selector: string): E | null => {
  const doc = getDocument();
  if (!doc) return null;
  return doc.querySelector<E>(selector);
};

/**
 * Append child to parent safely
 * @param parent - Parent element or selector
 * @param child - Child element to append
 * @returns Success status
 */
export const appendToDOM = (parent: Element | string, child: Element): boolean => {
  if (!isBrowser()) return false;

  const parentElement = typeof parent === 'string' ? queryDOM(parent) : parent;
  if (!parentElement) return false;

  parentElement.appendChild(child);
  return true;
};

/**
 * Remove element from DOM safely
 * @param element - Element or selector to remove
 * @returns Success status
 */
export const removeFromDOM = (element: Element | string): boolean => {
  if (!isBrowser()) return false;

  const el = typeof element === 'string' ? queryDOM(element) : element;
  if (!el || !el.parentNode) return false;

  // Check if element is actually a child of its parent before removing
  if (el.parentNode.contains(el)) {
    el.parentNode.removeChild(el);
    return true;
  }

  return false;
};

/**
 * Create a DOM element safely
 * @param tagName - HTML tag name
 * @returns Created element or null in SSR
 */
export const createDOMElement = <K extends keyof HTMLElementTagNameMap>(
  tagName: K,
): HTMLElementTagNameMap[K] | null => {
  const doc = getDocument();
  if (!doc) return null;
  return doc.createElement(tagName);
};

/**
 * Get/set element attribute safely
 * @param element - Element or selector
 * @param name - Attribute name
 * @param value - Value to set (omit to get)
 * @returns Attribute value or success status
 */
export function domAttribute(element: Element | string, name: string): string | null;
export function domAttribute(element: Element | string, name: string, value: string): boolean;
export function domAttribute(
  element: Element | string,
  name: string,
  value?: string,
): string | null | boolean {
  if (!isBrowser()) return value === undefined ? null : false;

  const el = typeof element === 'string' ? queryDOM(element) : element;
  if (!el) return value === undefined ? null : false;

  if (value === undefined) {
    return el.getAttribute(name);
  }

  el.setAttribute(name, value);
  return true;
}

/**
 * Set element styles safely
 * @param element - Element or selector
 * @param styles - Style properties to set
 * @returns Success status
 */
export const setDOMStyles = (
  element: HTMLElement | string,
  styles: Partial<CSSStyleDeclaration>,
): boolean => {
  if (!isBrowser()) return false;

  const el = typeof element === 'string' ? queryDOM<HTMLElement>(element) : element;
  if (!el) return false;

  Object.assign(el.style, styles);
  return true;
};

/**
 * Add element event listener safely
 * @param element - Element or selector
 * @param event - Event name
 * @param handler - Event handler
 * @param options - Event listener options
 * @returns Cleanup function
 */
export const addElementListener = <K extends keyof HTMLElementEventMap>(
  element: Element | string,
  event: K,
  handler: (this: Element, ev: HTMLElementEventMap[K]) => unknown,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser()) return () => {};

  const el = typeof element === 'string' ? queryDOM(element) : element;
  if (!el) return () => {};

  el.addEventListener(event, handler as EventListener, options);
  return () => el.removeEventListener(event, handler as EventListener, options);
};

/**
 * Add global event listener (window/document) safely
 * @param target - 'window' or 'document'
 * @param event - Event name
 * @param handler - Event handler
 * @param options - Event listener options
 * @returns Cleanup function
 */
export const attachGlobalListener = (
  target: 'window' | 'document',
  event: string,
  handler: EventListener,
  options?: boolean | AddEventListenerOptions,
): (() => void) => {
  if (!isBrowser()) return () => {};

  const targetElement = target === 'window' ? window : document;
  targetElement.addEventListener(event, handler, options);
  return () => targetElement.removeEventListener(event, handler, options);
};

/**
 * Create a safe setTimeout that won't run on server
 * @param callback - Callback function
 * @param delay - Delay in milliseconds
 * @returns Timer ID or null
 */
export const createSafeTimeout = (
  callback: () => void,
  delay: number,
): ReturnType<typeof setTimeout> | null => {
  if (!isBrowser()) return null;
  return setTimeout(callback, delay);
};

/**
 * Create a safe setInterval that won't run on server
 * @param callback - Callback function
 * @param delay - Delay in milliseconds
 * @returns Timer ID or null
 */
export const createSafeInterval = (
  callback: () => void,
  delay: number,
): ReturnType<typeof setInterval> | null => {
  if (!isBrowser()) return null;
  return setInterval(callback, delay);
};
