/**
 * Simple view navigation utilities
 *
 * Exports navigation hooks and utilities for modal view management.
 * Provides a simplified navigation system for modal state transitions.
 *
 * @module modal/views
 * @internal
 */

export { useViewNavigation, isValidViewTransition } from './navigation.js';
export type { ModalView } from '../../../schemas/connection.js';
