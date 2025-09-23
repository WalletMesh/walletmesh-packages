/**
 * Permission Management System
 *
 * This module provides two permission management implementations:
 *
 * 1. Three-State Manager (AllowAskDenyManager):
 *    - Production-ready implementation with granular control
 *    - Methods can be ALLOW (auto-permit), DENY (auto-reject), or ASK (prompt user)
 *    - Supports chain-specific permissions
 *    - Interactive permission prompts via AskCallback
 *    - Suitable for production environments
 *
 * 2. Permissive Manager (PermissivePermissionsManager):
 *    - Development-focused implementation that allows all operations
 *    - Zero configuration required
 *    - No user interaction
 *    - NOT suitable for production use
 *
 * Usage Guide:
 * - For production: Use AllowAskDenyManager with appropriate permission states
 * - For development: Use PermissivePermissionsManager for quick iteration
 * - For testing: Use either based on test requirements
 *
 * @example Production Setup
 * ```typescript
 * import { AllowAskDenyManager, AllowAskDenyState } from '@walletmesh/router/permissions';
 *
 * const prodManager = new AllowAskDenyManager(
 *   // Approval callback for new permission requests
 *   async (context, request) => {
 *     const approved = await showPermissionDialog(request);
 *     return approved ? request : {};
 *   },
 *   // Ask callback for methods in ASK state
 *   async (context, request) => {
 *     return await showMethodPrompt(request.method);
 *   },
 *   // Initial permission states
 *   new Map([
 *     ['eip155:1', new Map([
 *       ['eth_sendTransaction', AllowAskDenyState.ASK],
 *       ['eth_accounts', AllowAskDenyState.ALLOW],
 *       ['personal_sign', AllowAskDenyState.DENY]
 *     ])]
 *   ])
 * );
 * ```
 *
 * @example Development Setup
 * ```typescript
 * import { PermissivePermissionsManager } from '@walletmesh/router/permissions';
 *
 * // Simple setup for development
 * const devManager = new PermissivePermissionsManager();
 * ```
 *
 * @see {@link AllowAskDenyManager} for production-ready implementation
 * @see {@link PermissivePermissionsManager} for development implementation
 */

export {
  /**
   * Type representing permission states for methods across chains.
   * Maps chain IDs to their method permissions.
   */
  type AllowAskDenyChainPermissions,
  /**
   * Production-ready permission manager with granular control.
   * Implements a three-state model for method permissions.
   */
  AllowAskDenyManager,
  /**
   * Enum defining the three possible permission states:
   * - ALLOW: Method calls are automatically permitted
   * - DENY: Method calls are automatically rejected
   * - ASK: User is prompted for each call
   */
  AllowAskDenyState,
  /**
   * Callback type for handling permission prompts.
   * Used to get user approval for methods in ASK state.
   */
  AskCallback,
} from './allowAskDeny.js';

export {
  /**
   * Development-focused permission manager that allows all operations.
   * Provides zero-configuration setup but no security guarantees.
   */
  PermissivePermissionsManager,
} from './permissive.js';
