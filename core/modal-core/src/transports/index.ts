/**
 * Transport system exports
 * This module provides transport layer implementations for different communication protocols
 *
 * @module transports
 */

/**
 * Export core transport types and interfaces
 */
export * from './types.js';

/**
 * Export Chrome extension transport implementation
 * Provides communication with Chrome extension-based wallets
 */
export * from './chrome-extension/index.js';

/**
 * Export WebSocket transport implementation
 * Provides communication with WebSocket-based wallets
 */
export * from './websocket/index.js';
