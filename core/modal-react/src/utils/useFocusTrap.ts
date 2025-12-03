/**
 * Focus trap utility for managing focus within a container.
 *
 * This hook provides focus trapping functionality for modal overlays and dialogs.
 * It ensures that keyboard navigation stays within the container and properly
 * handles focus restoration when the trap is deactivated.
 *
 * @module utils/useFocusTrap
 * @packageDocumentation
 */

import { useEffect, useRef } from 'react';

/**
 * Configuration options for the focus trap hook.
 *
 * @public
 */
export interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is currently active.
   * When false, focus trapping is disabled.
   *
   * @defaultValue true
   */
  enabled?: boolean;

  /**
   * Whether to automatically focus the first focusable element when the trap activates.
   *
   * @defaultValue true
   */
  autoFocus?: boolean;

  /**
   * Whether to restore focus to the previously focused element when the trap deactivates.
   *
   * @defaultValue true
   */
  restoreFocus?: boolean;

  /**
   * CSS selector for elements that should be included in the focus trap.
   * Defaults to standard focusable elements.
   *
   * @defaultValue 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
   */
  focusableSelector?: string;
}

/**
 * Default CSS selector for focusable elements.
 *
 * Includes common interactive elements that can receive keyboard focus.
 *
 * @internal
 */
const DEFAULT_FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook for creating a focus trap within a container element.
 *
 * Ensures that keyboard navigation (Tab/Shift+Tab) stays within the specified
 * container. This is essential for accessible modal dialogs and overlays.
 *
 * ## Features
 *
 * - **Tab Navigation Control**: Keeps focus within the container
 * - **Automatic Focus**: Optionally focuses first element on activation
 * - **Focus Restoration**: Restores focus when trap is deactivated
 * - **Customizable Selectors**: Configure which elements are focusable
 * - **SSR Safe**: Handles server-side rendering gracefully
 *
 * ## Usage
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap({
 *     enabled: isOpen,
 *     autoFocus: true,
 *     restoreFocus: true
 *   });
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div ref={containerRef} role="dialog">
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Configuration options for the focus trap
 * @returns React ref to attach to the container element
 *
 * @public
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  options: UseFocusTrapOptions = {},
): React.RefObject<T | null> {
  const {
    enabled = true,
    autoFocus = true,
    restoreFocus = true,
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
  } = options;

  const containerRef = useRef<T | null>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Skip if focus trap is disabled or we're in SSR
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    // Store the currently focused element for restoration later
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    /**
     * Gets all focusable elements within the container.
     *
     * @returns Array of focusable HTML elements
     * @internal
     */
    const getFocusableElements = (): HTMLElement[] => {
      if (!container) return [];
      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));
    };

    /**
     * Handles Tab and Shift+Tab keyboard events to trap focus.
     *
     * @param event - Keyboard event
     * @internal
     */
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Tab key
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();

      // If there are no focusable elements, prevent default and return
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Handle Shift+Tab (backward navigation)
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      }
      // Handle Tab (forward navigation)
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Add keyboard event listener
    container.addEventListener('keydown', handleKeyDown);

    // Auto-focus first focusable element if enabled
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Use requestAnimationFrame to ensure the element is ready to receive focus
        requestAnimationFrame(() => {
          focusableElements[0]?.focus();
        });
      } else {
        // If no focusable elements, focus the container itself if it has tabindex
        if (container.tabIndex >= 0) {
          requestAnimationFrame(() => {
            container.focus();
          });
        }
      }
    }

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        // Use requestAnimationFrame to ensure the previous element is ready
        requestAnimationFrame(() => {
          previouslyFocusedElement.current?.focus();
        });
      }
    };
  }, [enabled, autoFocus, restoreFocus, focusableSelector]);

  return containerRef;
}
