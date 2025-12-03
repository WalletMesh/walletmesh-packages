/**
 * Logger Utility for Modal-React Package
 *
 * This module provides a configurable logging system for the React integration
 * of WalletMesh. It wraps the core logger with React-specific defaults and
 * environment detection.
 *
 * ## Configuration Methods
 *
 * The logger can be configured through multiple methods (in priority order):
 * 1. **Explicit parameter**: Pass `debug` flag to logger functions
 * 2. **WalletMesh config**: Set `debug: true` in WalletMeshProvider
 * 3. **Environment variable**: `NODE_ENV=development` enables debug
 * 4. **Global flag**: `window.__WALLETMESH_DEBUG__ = true`
 *
 * ## Architecture
 *
 * - **Global Instance**: Single logger instance for consistency
 * - **Component Loggers**: Named loggers for specific components
 * - **Level Control**: Debug, Info, Warn, Error levels
 * - **Prefix System**: Hierarchical naming for log organization
 *
 * ## Usage Patterns
 *
 * ```typescript
 * // In React components
 * const logger = createComponentLogger('MyComponent');
 * logger.debug('Component mounted', { props });
 * logger.error('Connection failed', error);
 *
 * // In hooks
 * const logger = getLogger();
 * logger.info('Hook initialized');
 * ```
 *
 * @module utils/logger
 * @category Utilities
 */

import { type Logger, createDebugLogger } from '@walletmesh/modal-core';

/**
 * Logger instance for modal-react
 * Singleton pattern ensures consistent logging across the library
 * @internal
 */
let logger: Logger | null = null;

/**
 * Check if debug mode is enabled through various configuration methods
 *
 * Priority order:
 * 1. NODE_ENV=development
 * 2. window.__WALLETMESH_DEBUG__ flag
 *
 * @returns True if debug logging should be enabled
 * @internal
 */
function isDebugEnabled(): boolean {
  // Check for NODE_ENV development mode
  if (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') {
    return true;
  }

  // Check for debug flag in window object (browser environments)
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { __WALLETMESH_DEBUG__?: boolean }).__WALLETMESH_DEBUG__
  ) {
    return true;
  }

  return false;
}

/**
 * Get or create the global logger instance
 *
 * This function implements a singleton pattern to ensure all React components
 * use the same logger instance. It supports runtime configuration changes.
 *
 * @param debug - Optional debug flag to override environment detection
 * @param prefix - Optional prefix for log messages (default: 'WalletMesh:React')
 * @returns Logger instance configured for React usage
 *
 * @example
 * ```typescript
 * // Get default logger
 * const logger = getLogger();
 * logger.info('Application started');
 *
 * // Enable debug mode explicitly
 * const debugLogger = getLogger(true);
 * debugLogger.debug('Detailed information');
 * ```
 *
 * @example
 * ```typescript
 * // Use in a React hook
 * function useCustomHook() {
 *   const logger = getLogger();
 *
 *   useEffect(() => {
 *     logger.debug('Hook mounted');
 *     return () => logger.debug('Hook unmounted');
 *   }, []);
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export function getLogger(debug?: boolean, prefix = 'WalletMesh:React'): Logger {
  if (!logger) {
    const debugEnabled = debug !== undefined ? debug : isDebugEnabled();
    logger = createDebugLogger(prefix, debugEnabled);
  }

  // Update debug mode if explicitly provided
  if (debug !== undefined) {
    logger.setLevel(debug ? 0 : 3); // 0 = Debug, 3 = Error
  }

  return logger;
}

/**
 * Create a named logger for a specific component or module
 *
 * Creates a new logger instance with a hierarchical name for better
 * log organization and filtering. Each component gets its own logger
 * with a unique prefix.
 *
 * @param name - Component or module name (e.g., 'ConnectButton', 'useAccount')
 * @param debug - Optional debug flag to override environment detection
 * @returns Logger instance with prefixed name
 *
 * @example
 * ```typescript
 * // In a React component
 * const logger = createComponentLogger('WalletList');
 *
 * useEffect(() => {
 *   logger.debug('Component mounted', { walletCount: wallets.length });
 *   return () => logger.debug('Component unmounted');
 * }, []);
 *
 * // In a custom hook
 * function useCustomHook() {
 *   const logger = createComponentLogger('useCustomHook', true); // Force debug
 *   logger.debug('Hook called');
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with error handling
 * const logger = createComponentLogger('DataFetcher');
 *
 * async function fetchData() {
 *   try {
 *     logger.info('Fetching data...');
 *     const data = await api.getData();
 *     logger.debug('Data received', { count: data.length });
 *     return data;
 *   } catch (error) {
 *     logger.error('Failed to fetch data', error);
 *     throw error;
 *   }
 * }
 * ```
 *
 * @category Utilities
 * @public
 */
export function createComponentLogger(name: string, debug?: boolean): Logger {
  const prefix = `WalletMesh:React:${name}`;
  const debugEnabled = debug !== undefined ? debug : isDebugEnabled();
  return createDebugLogger(prefix, debugEnabled);
}

/**
 * Re-export Logger type for convenience
 * @category Utilities
 * @public
 */
export type { Logger };

/**
 * Get the React-specific logger instance
 *
 * Convenience function that always returns the React logger with default settings.
 * This is useful when you need a logger without customization options.
 *
 * @returns Logger instance configured for React usage
 *
 * @example
 * ```typescript
 * const logger = getReactLogger();
 * logger.info('React app initialized');
 * logger.debug('Component state', { state });
 * ```
 *
 * @category Utilities
 * @public
 */
export function getReactLogger(): Logger {
  return getLogger();
}
