import type ChromeTypes from './chrome.js';

/**
 * Global Type Definitions
 * Augments the global scope with types used throughout the WalletClient
 *
 * @module global-types
 */

declare global {
  /**
   * Augment the Window interface with Chrome extension APIs
   * This allows access to Chrome extension APIs in the browser environment
   */
  interface Window {
    /** Chrome extension APIs */
    chrome?:
      | {
          /** Runtime API for extension lifecycle and communication */
          runtime: ChromeTypes.Runtime.RuntimeStatic;
          /** Tabs API for managing browser tabs */
          tabs: ChromeTypes.Tabs.Tab;
        }
      | undefined;
  }
}
