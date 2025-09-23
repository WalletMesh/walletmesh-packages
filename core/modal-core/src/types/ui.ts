/**
 * UI-focused type exports
 *
 * Import path: @walletmesh/modal-core/types/ui
 *
 * This focused export provides only UI-related types
 * for better tree-shaking and cleaner imports.
 */

export type {
  ModalView,
  ModalState,
  ReactModalState,
  ErrorCategory,
  WalletMeshError,
} from './baseTypes.js';

export type { UseModalReturn } from './baseTypes.js';

export {
  MODAL_VIEWS,
  ERROR_CATEGORIES,
  isWalletMeshError,
} from './coreTypes.js';
