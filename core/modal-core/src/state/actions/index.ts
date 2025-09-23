/**
 * Action functions for WalletMesh store
 *
 * Actions are now external functions that operate on the store,
 * instead of being embedded in the state object. This provides:
 *
 * 1. Better separation of concerns (data vs behavior)
 * 2. Improved testability (pure functions)
 * 3. Smaller bundle size (no action objects in state)
 * 4. Cleaner store state structure
 * 5. Better performance (no action re-renders)
 */

export { uiActions } from './ui.js';
export { connectionActions } from './connections.js';
export { transactionActions } from './transactions.js';

// Re-export action types for convenience
export type {
  WalletMeshState,
  ModalView,
} from '../store.js';

import { connectionActions } from './connections.js';
import { transactionActions } from './transactions.js';
/**
 * Combined actions object for convenience
 *
 * This provides a single object containing all actions,
 * similar to the old embedded actions but without being in state.
 */
import { uiActions } from './ui.js';

export const actions = {
  ui: uiActions,
  connections: connectionActions,
  transactions: transactionActions,
};

/**
 * Hook-style action access for React components
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const storeActions = useStoreActions();
 *   const store = useStore();
 *
 *   const handleOpenModal = () => {
 *     storeActions.ui.openModal(store);
 *   };
 *
 *   return <button onClick={handleOpenModal}>Open Modal</button>;
 * }
 * ```
 */
export const useStoreActions = () => actions;
