/**
 * Modal implementation exports
 *
 * Exports the core modal controller and related functionality including
 * view navigation utilities and configuration types.
 *
 * @module modal
 * @internal
 */

// Core modal controller exports
export {
  ModalController,
  type RecoveryOptions,
  type ConnectOptions,
  type DisconnectOptions,
  type ModalControllerOptions,
  type ModalConfig,
  MODAL_CONFIG,
} from './controller.js';

// View exports
export { useViewNavigation, isValidViewTransition } from './views/index.js';
export type { ModalView } from '../../schemas/connection.js';
