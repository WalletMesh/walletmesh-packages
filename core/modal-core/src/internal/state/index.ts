/**
 * State management exports
 *
 * Exports unified state management functionality including stores, selectors,
 * and domain-specific state management components.
 *
 * @module state
 * @internal
 */

export * from '../../state/store.js';
// Don't re-export selectors to avoid conflicts
// export * from '../../api/system/selectors.js';
// export * from './selectors.js';
