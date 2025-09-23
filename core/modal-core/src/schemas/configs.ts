/**
 * Transport configuration schemas for runtime validation
 *
 * This module defines Zod schemas for validating transport configurations
 * at runtime. Transports handle the communication layer between the modal
 * and wallet providers (popup windows, browser extensions, etc.).
 *
 * @module schemas/configs
 */

import { z } from 'zod';

/**
 * Base transport configuration schema with common properties
 *
 * All transport types inherit these common configuration options.
 * These control basic connection behavior and retry logic.
 *
 * @example
 * ```typescript
 * const config: BaseTransportConfig = {
 *   url: 'wss://wallet.example.com',
 *   timeout: 30000,           // 30 seconds
 *   reconnect: true,          // Auto-reconnect on disconnect
 *   reconnectInterval: 5000   // Try every 5 seconds
 * };
 * ```
 */
export const baseTransportConfigSchema = z.object({
  /**
   * Transport URL for connection
   */
  url: z.string().url().optional(),

  /**
   * Connection timeout in milliseconds
   */
  timeout: z.number().int().positive().optional(),

  /**
   * Whether to automatically reconnect on disconnect
   */
  reconnect: z.boolean().optional(),

  /**
   * Interval between reconnection attempts in milliseconds
   */
  reconnectInterval: z.number().int().positive().optional(),
});

/**
 * Popup transport configuration schema
 *
 * Configuration for popup window transports, commonly used for
 * wallet connections that open in a separate browser window.
 *
 * @example
 * ```typescript
 * // Centered popup window
 * const popupConfig: PopupConfig = {
 *   width: 400,
 *   height: 600,
 *   target: '_blank',
 *   features: 'menubar=no,toolbar=no,location=no'
 * };
 *
 * // Full configuration with retry logic
 * const advancedConfig: PopupConfig = {
 *   url: 'https://wallet.example.com/connect',
 *   width: 450,
 *   height: 700,
 *   timeout: 60000,        // 1 minute timeout
 *   reconnect: true,       // Auto-reconnect if connection drops
 *   reconnectInterval: 3000 // Retry every 3 seconds
 * };
 * ```
 */
export const popupConfigSchema = baseTransportConfigSchema.extend({
  /**
   * Popup window width in pixels
   */
  width: z.number().int().positive().optional(),

  /**
   * Popup window height in pixels
   */
  height: z.number().int().positive().optional(),

  /**
   * Target window name
   */
  target: z.string().optional(),

  /**
   * Window features string for window.open()
   */
  features: z.string().optional(),
});

/**
 * Chrome extension transport configuration schema
 *
 * Configuration for communicating with Chrome extension wallets.
 * The extension ID is required and must match the installed extension.
 *
 * @example
 * ```typescript
 * // Basic extension config
 * const extensionConfig: ChromeExtensionConfig = {
 *   extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn' // MetaMask
 * };
 *
 * // With retry logic for reliability
 * const robustConfig: ChromeExtensionConfig = {
 *   extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
 *   retries: 3,           // Try 3 times
 *   retryDelay: 1000,     // Wait 1 second between retries
 *   timeout: 10000,       // 10 second timeout per attempt
 *   reconnect: true       // Reconnect if extension reloads
 * };
 * ```
 *
 * @remarks
 * Extension IDs can be found in chrome://extensions when developer mode is enabled
 */
export const chromeExtensionConfigSchema = baseTransportConfigSchema.extend({
  /**
   * Chrome extension ID
   */
  extensionId: z.string().min(1),

  /**
   * Number of connection retry attempts
   */
  retries: z.number().int().nonnegative().optional(),

  /**
   * Delay between retry attempts in milliseconds
   */
  retryDelay: z.number().int().positive().optional(),
});

/**
 * Transport configuration discriminated union
 *
 * Validates transport configurations based on the 'type' discriminator.
 * Each transport type has its own specific configuration requirements.
 *
 * @example
 * ```typescript
 * // Popup transport
 * const popupTransport: TransportConfig = {
 *   type: 'popup',
 *   config: {
 *     width: 400,
 *     height: 600,
 *     timeout: 30000
 *   }
 * };
 *
 * // Chrome extension transport
 * const extensionTransport: TransportConfig = {
 *   type: 'chrome-extension',
 *   config: {
 *     extensionId: 'abcdefghijklmnopqrstuvwxyz123456',
 *     retries: 5,
 *     retryDelay: 2000
 *   }
 * };
 *
 * // Validate at runtime
 * try {
 *   const validated = transportConfigSchema.parse(userConfig);
 *   // Config is valid and typed
 * } catch (error) {
 *   // Handle validation errors
 *   console.error('Invalid transport config:', error);
 * }
 * ```
 */
export const transportConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('popup'),
    config: popupConfigSchema,
  }),
  z.object({
    type: z.literal('chrome-extension'),
    config: chromeExtensionConfigSchema,
  }),
]);

/**
 * DApp RPC configuration schema
 *
 * Configuration for dApp-specific RPC endpoints, allowing applications
 * to use their own infrastructure for blockchain data while wallets
 * use their own nodes for transaction submission.
 *
 * @example
 * ```typescript
 * const dappRpcConfig: DAppRpcConfig = {
 *   timeout: 30000,      // 30 second timeout
 *   retries: 3,          // Retry 3 times
 *   loadBalance: true,   // Use round-robin load balancing
 *   headers: {
 *     'X-API-Key': 'your-api-key'
 *   }
 * };
 * ```
 */
export const dAppRpcConfigSchema = z.object({
  /** Timeout for RPC requests in milliseconds (1-600000) */
  timeout: z.number().int().min(1).max(600000).optional().describe('Timeout in milliseconds (1-600000)'),

  /** Number of retry attempts on failure (0-10) */
  retries: z.number().int().min(0).max(10).optional().describe('Number of retry attempts (0-10)'),

  /** Whether to use round-robin load balancing across endpoints */
  loadBalance: z.boolean().optional(),

  /** Custom headers to include in RPC requests */
  headers: z
    .record(z.string())
    .optional()
    .refine((headers) => {
      if (!headers) return true;
      // Prevent injection attacks by blocking security-sensitive headers
      const dangerousHeaders = ['host', 'origin', 'referer', 'authorization', 'cookie'];
      return !Object.keys(headers).some((key) => dangerousHeaders.includes(key.toLowerCase()));
    }, 'Cannot override security-sensitive headers (host, origin, referer, authorization, cookie)'),
});

/**
 * DApp RPC endpoint schema
 *
 * Defines an RPC endpoint for a specific blockchain network,
 * including URLs and chain-specific configuration.
 *
 * @example
 * ```typescript
 * const endpoint: DAppRpcEndpoint = {
 *   chainId: '1',
 *   chainType: 'evm',
 *   urls: [
 *     'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
 *     'https://mainnet.infura.io/v3/your-project-id'
 *   ],
 *   config: {
 *     timeout: 30000,
 *     retries: 3,
 *     loadBalance: true
 *   }
 * };
 * ```
 */
export const dAppRpcEndpointSchema = z.object({
  /** Chain ID this endpoint serves */
  chainId: z.union([z.string(), z.number()]),

  /** Chain type (evm, solana, aztec) */
  chainType: z.enum(['evm', 'solana', 'aztec']),

  /** RPC endpoint URLs (primary and fallbacks) */
  urls: z
    .array(z.string().url())
    .min(1)
    .describe('Array of valid RPC endpoint URLs')
    .refine((urls) => {
      // Ensure all URLs are HTTPS in production
      if (process.env['NODE_ENV'] === 'production') {
        return urls.every((url) => url.startsWith('https://'));
      }
      return true;
    }, 'Production URLs must use HTTPS'),

  /** Configuration for this endpoint */
  config: dAppRpcConfigSchema.optional(),
});

/**
 * WebSocket transport configuration schema
 *
 * Configuration for WebSocket-based wallet connections.
 * Used for real-time bidirectional communication with wallets.
 *
 * @example
 * ```typescript
 * const wsConfig: WebSocketConfig = {
 *   url: 'wss://wallet.example.com/connect',
 *   timeout: 30000,
 *   reconnect: true,
 *   reconnectInterval: 5000,
 *   maxReconnectAttempts: 10,
 *   pingInterval: 30000,
 *   pongTimeout: 5000
 * };
 * ```
 */
export const webSocketConfigSchema = baseTransportConfigSchema.extend({
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts: z.number().int().min(0).max(100).optional(),

  /** Interval for WebSocket ping messages in milliseconds */
  pingInterval: z.number().int().positive().optional(),

  /** Timeout for pong response in milliseconds */
  pongTimeout: z.number().int().positive().optional(),

  /** WebSocket subprotocols */
  protocols: z.array(z.string()).optional(),

  /** Binary type for WebSocket messages */
  binaryType: z.enum(['blob', 'arraybuffer']).optional(),
});

/**
 * IFrame transport configuration schema
 *
 * Configuration for iframe-based wallet connections.
 * Used for embedded wallet interfaces within the application.
 *
 * @example
 * ```typescript
 * const iframeConfig: IFrameConfig = {
 *   url: 'https://wallet.example.com/embed',
 *   width: '100%',
 *   height: 600,
 *   sandbox: 'allow-scripts allow-same-origin',
 *   allowedOrigins: ['https://wallet.example.com']
 * };
 * ```
 */
export const iframeConfigSchema = baseTransportConfigSchema.extend({
  /** IFrame width (pixels or percentage) */
  width: z.union([z.number().int().positive(), z.string()]).optional(),

  /** IFrame height (pixels or percentage) */
  height: z.union([z.number().int().positive(), z.string()]).optional(),

  /** Sandbox attribute for security */
  sandbox: z.string().optional(),

  /** List of allowed origins for postMessage communication */
  allowedOrigins: z.array(z.string().url()).optional(),

  /** Whether to allow fullscreen mode */
  allowFullscreen: z.boolean().optional(),

  /** Custom CSS styles for the iframe */
  style: z.record(z.string()).optional(),
});

/**
 * Extended transport configuration with new transport types
 */
export const extendedTransportConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('popup'),
    config: popupConfigSchema,
  }),
  z.object({
    type: z.literal('chrome-extension'),
    config: chromeExtensionConfigSchema,
  }),
  z.object({
    type: z.literal('websocket'),
    config: webSocketConfigSchema,
  }),
  z.object({
    type: z.literal('iframe'),
    config: iframeConfigSchema,
  }),
]);

// Type exports
export type BaseTransportConfig = z.infer<typeof baseTransportConfigSchema>;
export type PopupConfig = z.infer<typeof popupConfigSchema>;
export type ChromeExtensionConfig = z.infer<typeof chromeExtensionConfigSchema>;
export type TransportConfig = z.infer<typeof transportConfigSchema>;
export type DAppRpcConfig = z.infer<typeof dAppRpcConfigSchema>;
export type DAppRpcEndpoint = z.infer<typeof dAppRpcEndpointSchema>;
export type WebSocketConfig = z.infer<typeof webSocketConfigSchema>;
export type IFrameConfig = z.infer<typeof iframeConfigSchema>;
export type ExtendedTransportConfig = z.infer<typeof extendedTransportConfigSchema>;
