/**
 * Error handling system exports
 * @internal
 */

// Export error types
export {
  ERROR_CODES,
  type ModalError,
  type ModalErrorCategory,
  type ErrorContext,
} from './types.js';

// Export ErrorHandler
export { ErrorHandler } from './errorHandler.js';

// Export ErrorFactory
export { ErrorFactory } from './errorFactory.js';

// Export utility functions
export { isModalError, isFatalError, isRecoverableError } from './utils.js';
export { ensureError, ensureModalError } from './ensureError.js';

// Export ModalErrorImpl class
export { ModalErrorImpl } from './modalError.js';
