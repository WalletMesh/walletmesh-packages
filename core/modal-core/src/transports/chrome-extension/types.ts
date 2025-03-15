import type { TransportConfig } from '../types.js';

/**
 * Configuration options specific to Chrome Extension transport
 * Extends the base transport configuration with Chrome extension-specific options
 *
 * @interface ChromeExtensionTransportConfig
 * @extends {TransportConfig}
 */
export interface ChromeExtensionTransportConfig extends TransportConfig {
  /**
   * ID of the target Chrome extension
   * This should match the extension ID in the Chrome Web Store or local development ID
   */
  extensionId: string;
}
