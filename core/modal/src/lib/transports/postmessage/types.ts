/**
 * @file types.ts
 * @packageDocumentation
 * Type definitions for PostMessage transport.
 */

import type { BaseTransportConfig } from '../types.js';

/**
 * Configuration options for PostMessage transport.
 */
export interface PostMessageTransportConfig extends BaseTransportConfig {
  /** Target origin for postMessage communication */
  origin: string;
  /** Target window for postMessage (defaults to window.parent) */
  targetWindow?: Window;
}
