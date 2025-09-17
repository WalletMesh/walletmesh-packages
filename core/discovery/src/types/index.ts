/**
 * Type definitions for the Generic Cross-Blockchain Discovery Protocol.
 *
 * Re-exports all type definitions organized by domain for clean imports.
 *
 * @module types
 * @category Types
 * @since 0.1.0
 */

// Core protocol types
export * from './core.js';

// Capability and responder types
export * from './capabilities.js';

// Security types
export * from './security.js';

// Configuration types
export * from './testing.js';

// Re-export logger type for convenience
export type { Logger } from '../core/logger.js';
