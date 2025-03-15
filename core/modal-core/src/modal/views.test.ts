import { describe, test, expect, vi } from 'vitest';
import { ViewSystem } from './views.js';
import type { ModalState, ModalView } from '../types/modal.js';
import { ProviderInterface } from '../types/providers.js';

describe('ViewSystem', () => {
  test('initializes with default views', () => {
    const viewSystem = new ViewSystem();

    const walletSelectionView = viewSystem.getView('walletSelection');
    expect(walletSelectionView).toBeDefined();
    expect(walletSelectionView?.allowedTransitions).toContain('providerSelection');
    expect(walletSelectionView?.allowedTransitions).toContain('connecting');
  });

  test('validates view transitions correctly', () => {
    const viewSystem = new ViewSystem();
    const state: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: 'metamask',
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Valid transition
    expect(viewSystem.isValidTransition('walletSelection', 'providerSelection', state)).toBe(true);

    // Invalid transition (not in allowed transitions)
    expect(viewSystem.isValidTransition('walletSelection', 'connected', state)).toBe(false);
  });

  test('executes view transitions with lifecycle hooks', async () => {
    const viewSystem = new ViewSystem();
    const onEnterMock = vi.fn();
    const onExitMock = vi.fn();

    // Register custom view with hooks
    viewSystem.registerView({
      id: 'walletSelection',
      allowedTransitions: ['providerSelection'],
      onEnter: onEnterMock,
      onExit: onExitMock,
    });

    const state: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: 'metamask',
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    await viewSystem.executeTransition('walletSelection', 'providerSelection', state);

    expect(onExitMock).toHaveBeenCalled();
    // Provider selection view should be registered by default
    expect(viewSystem.getView('providerSelection')).toBeDefined();
  });

  test('validates view state requirements', () => {
    const viewSystem = new ViewSystem();

    const stateWithoutWallet: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    const stateWithWallet: ModalState = {
      ...stateWithoutWallet,
      selectedWallet: 'metamask',
    };

    // Should not allow connecting without wallet
    expect(viewSystem.isValidTransition('walletSelection', 'connecting', stateWithoutWallet)).toBe(false);

    // Should allow connecting with wallet
    expect(viewSystem.isValidTransition('walletSelection', 'connecting', stateWithWallet)).toBe(true);
  });

  test('handles provider interface validation', () => {
    const viewSystem = new ViewSystem();

    const state: ModalState = {
      isOpen: true,
      currentView: 'providerSelection',
      selectedWallet: 'metamask',
      selectedProvider: ProviderInterface.EIP1193,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    expect(viewSystem.isValidTransition('providerSelection', 'connecting', state)).toBe(true);
  });

  test('handles view hook execution failures', async () => {
    const viewSystem = new ViewSystem();
    const hookError = new Error('Hook execution failed');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Register view with failing hook
    viewSystem.registerView({
      id: 'error',
      allowedTransitions: ['walletSelection' as const] satisfies ModalView[],
      onEnter: () => {
        throw hookError;
      },
    });

    const state: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    const success = await viewSystem.executeTransition('walletSelection', 'error', state);
    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Error during view transition:', hookError);

    consoleSpy.mockRestore();
  });

  test('validates provider selection with various states', () => {
    const viewSystem = new ViewSystem();

    // State without wallet
    const invalidState: ModalState = {
      isOpen: true,
      currentView: 'providerSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // State with wallet
    const validState: ModalState = {
      ...invalidState,
      selectedWallet: 'metamask',
    };

    const providerView = viewSystem.getView('providerSelection');
    expect(providerView?.validate?.(invalidState)).toBe(false);
    expect(providerView?.validate?.(validState)).toBe(true);
  });

  test('handles transition validation with validation disabled', () => {
    const viewSystem = new ViewSystem({ validateTransitions: false });

    const invalidState: ModalState = {
      isOpen: true,
      currentView: 'providerSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Should allow transition even with invalid state when validation is disabled
    expect(viewSystem.isValidTransition('walletSelection', 'providerSelection', invalidState)).toBe(true);
  });

  test('handles lifecycle hooks properly', async () => {
    const viewSystem = new ViewSystem();
    const onEnterMock = vi.fn();
    const onExitMock = vi.fn();

    // Register both views with hooks
    viewSystem.registerView({
      id: 'walletSelection',
      allowedTransitions: ['providerSelection'],
      onExit: onExitMock,
    });

    viewSystem.registerView({
      id: 'providerSelection',
      allowedTransitions: [],
      onEnter: onEnterMock,
    });

    const state: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    await viewSystem.executeTransition('walletSelection', 'providerSelection', state);

    expect(onExitMock).toHaveBeenCalled();
    expect(onEnterMock).toHaveBeenCalled();
    // Check execution order if both hooks were called
    if (onExitMock.mock.invocationCallOrder[0] && onEnterMock.mock.invocationCallOrder[0]) {
      expect(onExitMock.mock.invocationCallOrder[0]).toBeLessThan(onEnterMock.mock.invocationCallOrder[0]);
    }
  });

  test('handles error view transitions', () => {
    const viewSystem = new ViewSystem();

    const errorState: ModalState = {
      isOpen: true,
      currentView: 'error',
      selectedWallet: 'metamask',
      selectedProvider: null,
      selectedChain: null,
      error: new Error('Test error'),
      isLoading: false,
    };

    // Should allow returning to wallet selection from error
    expect(viewSystem.isValidTransition('error', 'walletSelection', errorState)).toBe(true);
  });

  test('prevents invalid view transitions', async () => {
    const viewSystem = new ViewSystem();

    const state: ModalState = {
      isOpen: true,
      currentView: 'connected',
      selectedWallet: 'metamask',
      selectedProvider: ProviderInterface.EIP1193,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Connected view should not allow transitions
    const success = await viewSystem.executeTransition('connected', 'walletSelection', state);
    expect(success).toBe(false);
  });

  test('allows view registration override', () => {
    const viewSystem = new ViewSystem();
    const customView = {
      id: 'walletSelection' as const,
      allowedTransitions: ['connecting' as const] satisfies ModalView[],
      validate: (state: ModalState) => state.selectedWallet !== null,
    };

    viewSystem.registerView(customView);
    const registeredView = viewSystem.getView('walletSelection');

    expect(registeredView).toBeDefined();
    expect(registeredView?.allowedTransitions).toEqual(['connecting']);
  });

  test('handles view configuration and validation comprehensively', () => {
    const viewSystem = new ViewSystem();

    // Test state object for validation
    const testState: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Get existing view transitions
    const defaultTransitions = viewSystem.getAllowedTransitions('walletSelection');

    // Register view with default transitions and validate function
    const testView = {
      id: 'walletSelection' as ModalView,
      allowedTransitions: defaultTransitions,
      validate: () => true, // Default validate function always returns true
    };
    const viewBeforeOverride = viewSystem.getView('walletSelection');
    viewSystem.registerView(testView);
    const viewAfterOverride = viewSystem.getView('walletSelection');

    // Verify transitions are preserved
    expect(viewBeforeOverride?.allowedTransitions).toEqual(viewAfterOverride?.allowedTransitions);

    // Test getting allowed transitions
    const existingTransitions = viewSystem.getAllowedTransitions('walletSelection');
    expect(existingTransitions).toContain('providerSelection');
    expect(existingTransitions).toContain('connecting');

    // Test invalid view transitions
    const nonexistentTransitions = viewSystem.getAllowedTransitions('invalidView' as ModalView);
    expect(nonexistentTransitions).toEqual([]);

    // Test validation with no explicit validate function
    const customView = viewSystem.getView('walletSelection');
    expect(customView?.validate?.(testState)).toBe(true);
  });

  test('initializes view system with custom initial view', () => {
    // Test default view configuration with lifecycle hooks
    const initialView = 'walletSelection' as const;
    const onEnterMock = vi.fn();
    const onExitMock = vi.fn();

    const viewSystem = new ViewSystem();
    viewSystem.registerView({
      id: initialView,
      allowedTransitions: ['providerSelection' as const, 'connecting' as const] satisfies ModalView[],
      onEnter: onEnterMock,
      onExit: onExitMock,
    });

    const defaultView = viewSystem.getView(initialView);
    expect(defaultView).toBeDefined();
    expect(defaultView?.allowedTransitions).toEqual(['providerSelection', 'connecting']);
    expect(defaultView?.onEnter).toBeDefined();
    expect(defaultView?.onExit).toBeDefined();

    // Test lifecycle hook execution
    const state: ModalState = {
      isOpen: true,
      currentView: initialView,
      selectedWallet: 'metamask',
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    expect(viewSystem.isValidTransition(initialView, 'providerSelection', state)).toBe(true);
  });

  test('validates each view with appropriate states', async () => {
    const viewSystem = new ViewSystem();

    // Basic state without requirements
    const baseState: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // State with wallet only
    const walletState: ModalState = {
      ...baseState,
      selectedWallet: 'metamask',
    };

    // State with wallet and provider
    const fullState: ModalState = {
      ...walletState,
      selectedProvider: ProviderInterface.EIP1193,
    };

    // Get all default views
    const walletView = viewSystem.getView('walletSelection');
    const providerView = viewSystem.getView('providerSelection');
    const errorView = viewSystem.getView('error');
    const connectedView = viewSystem.getView('connected');
    const connectingView = viewSystem.getView('connecting');

    // Test each view with appropriate states
    expect(walletView?.validate?.(baseState)).toBe(true);
    expect(providerView?.validate?.(baseState)).toBe(false);
    expect(providerView?.validate?.(walletState)).toBe(true);
    expect(errorView?.validate?.(baseState)).toBe(true);
    expect(connectedView?.validate?.(baseState)).toBe(false);
    expect(connectedView?.validate?.(fullState)).toBe(true);
    expect(connectingView?.validate?.(baseState)).toBe(false);
    expect(connectingView?.validate?.(fullState)).toBe(true);

    // Test empty lifecycle hooks
    expect(providerView?.onEnter).toBeDefined();
    const enterResult = await providerView?.onEnter?.();
    expect(enterResult).toBeUndefined();

    expect(errorView?.onExit).toBeDefined();
    const exitResult = await errorView?.onExit?.();
    expect(exitResult).toBeUndefined();

    // Test transition with required state
    const success = await viewSystem.executeTransition('providerSelection', 'connecting', fullState);
    expect(success).toBe(true);
  });

  test('handles transitions with nonexistent views comprehensively', async () => {
    const viewSystem = new ViewSystem();
    const nonexistentView = 'nonexistent' as ModalView;
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const state: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Test all operations with non-existent view
    expect(viewSystem.getAllowedTransitions(nonexistentView)).toEqual([]);
    expect(viewSystem.getView(nonexistentView)).toBeUndefined();
    expect(viewSystem.isValidTransition(nonexistentView, 'walletSelection', state)).toBe(false);
    expect(viewSystem.isValidTransition('walletSelection', nonexistentView, state)).toBe(false);

    // Test transition execution with non-existent views
    const resultFrom = await viewSystem.executeTransition(nonexistentView, 'walletSelection', state);
    expect(resultFrom).toBe(false);

    const resultTo = await viewSystem.executeTransition('walletSelection', nonexistentView, state);
    expect(resultTo).toBe(false);

    consoleSpy.mockRestore();
  });

  test('initializes with minimal configuration', () => {
    // Create view system with empty config
    const viewSystem = new ViewSystem({});

    // Verify default configuration is applied
    const config = viewSystem.getConfig();
    expect(config.defaultView).toBe('walletSelection');
    expect(config.validateTransitions).toBe(true);
  });

  test('handles multiple hook failures gracefully', async () => {
    const viewSystem = new ViewSystem();
    const hookError1 = new Error('Exit hook failed');
    const hookError2 = new Error('Enter hook failed');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Register view with failing hooks
    viewSystem.registerView({
      id: 'error' as const,
      allowedTransitions: ['walletSelection' as const] satisfies ModalView[],
      onEnter: () => {
        throw hookError2;
      },
      onExit: () => {
        throw hookError1;
      },
    });

    const state: ModalState = {
      isOpen: true,
      currentView: 'error',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Execute transition should fail due to hook errors
    const success = await viewSystem.executeTransition('error', 'walletSelection', state);
    expect(success).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('Error during view transition:', hookError1);
    // onEnter won't be called if onExit fails
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  test('handles undefined lifecycle hooks gracefully', async () => {
    const viewSystem = new ViewSystem();

    // Register view with no hooks
    const customView = {
      id: 'error' as const,
      allowedTransitions: ['walletSelection' as const] satisfies ModalView[],
    };

    viewSystem.registerView(customView);

    // Test transition with undefined hooks
    const state: ModalState = {
      isOpen: true,
      currentView: 'error',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Execute transition should succeed even with undefined hooks
    const success = await viewSystem.executeTransition('error', 'walletSelection', state);
    expect(success).toBe(true);
  });

  test('handles default view hooks behavior', async () => {
    const viewSystem = new ViewSystem();

    // Get default views and test their hooks
    const walletView = viewSystem.getView('walletSelection');
    const errorView = viewSystem.getView('error');
    const providerView = viewSystem.getView('providerSelection');

    // Test default onEnter hooks
    expect(walletView?.onEnter).toBeDefined();
    expect(errorView?.onEnter).toBeDefined();
    expect(providerView?.onEnter).toBeDefined();

    // Test return values of default hooks
    const walletEnterResult = await walletView?.onEnter?.();
    const errorEnterResult = await errorView?.onEnter?.();
    const providerEnterResult = await providerView?.onEnter?.();
    const errorExitResult = await errorView?.onExit?.();

    // All default hooks should return undefined
    expect(walletEnterResult).toBeUndefined();
    expect(errorEnterResult).toBeUndefined();
    expect(providerEnterResult).toBeUndefined();
    expect(errorExitResult).toBeUndefined();
  });

  test('handles validation state edge cases', () => {
    const viewSystem = new ViewSystem();

    // Test connecting view validation
    const connectingView = {
      id: 'connecting' as const,
      allowedTransitions: ['connected' as const] satisfies ModalView[],
      validate: (state: ModalState) => Boolean(state.selectedWallet && state.selectedProvider),
    };

    viewSystem.registerView(connectingView);

    // Test with empty state
    const emptyState: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Test validation with strict requirements
    expect(viewSystem.isValidTransition('walletSelection', 'connecting', emptyState)).toBe(false);

    // Test with validation disabled
    viewSystem.updateConfig({ validateTransitions: false });
    expect(viewSystem.isValidTransition('walletSelection', 'connecting', emptyState)).toBe(true);
  });

  test('handles state initialization and validation comprehensively', () => {
    // Test initial configuration with default view and validation
    const initialConfig = {
      defaultView: 'walletSelection' as const,
      validateTransitions: true,
    };
    const viewSystem = new ViewSystem(initialConfig);

    // Test default view initialization
    expect(viewSystem.getView(initialConfig.defaultView)).toBeDefined();

    // Test transition validation when enabled
    const invalidState: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    expect(viewSystem.isValidTransition('walletSelection', 'connecting', invalidState)).toBe(false);

    // Test config update and validation behavior

    viewSystem.updateConfig({
      validateTransitions: false,
    });

    const state: ModalState = {
      isOpen: true,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    };

    // Should allow transition even without wallet selected when validation is disabled
    expect(viewSystem.isValidTransition('walletSelection', 'connecting', state)).toBe(true);
  });
});
