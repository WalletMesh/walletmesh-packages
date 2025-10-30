/**
 * DOM utilities module
 *
 * This module previously exported the WalletStorage utility for persisting wallet
 * connection state and user preferences using browser localStorage. As of January 2025,
 * WalletStorage was removed as part of a migration to unified Zustand-based persistence.
 *
 * **Architecture Change**: All wallet session persistence is now handled through the
 * Zustand store (`src/state/store.ts`), which provides:
 * - Unified state management across the entire modal-core package
 * - Automatic localStorage persistence via Zustand's persist middleware
 * - Type-safe access to SessionState with full wallet context
 * - Elimination of dual-storage confusion
 *
 * **For Wallet Adapters**: Session persistence is now managed through:
 * - `AbstractWalletAdapter.persistSession()` - Stores adapter reconstruction data in SessionState
 * - `AbstractWalletAdapter.restoreSession()` - Loads session data from Zustand store
 * - `AbstractWalletAdapter.cleanup()` - Removes sessions from Zustand store
 *
 * @see {@link ../../../state/store.ts} for the unified Zustand store
 * @see {@link ../../wallets/base/AbstractWalletAdapter.ts} for adapter session management
 *
 * @module internal/utils/dom
 * @internal
 */

// No exports - WalletStorage removed in favor of Zustand store (2025-01)
