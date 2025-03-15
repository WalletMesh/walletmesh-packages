import { describe, test, expect, vi } from 'vitest';
import { ModalControllerImpl } from './controller.js';
import type { ModalState, ModalConfig } from '../types/modal.js';
import { ProviderInterface } from '../types/providers.js';
import { ChainType } from '../types/chains.js';

describe('ModalController', () => {
  test('handles connection error properly', async () => {
    const controller = new ModalControllerImpl();
    const error = new Error('Connection failed');
    const stateChanges: ModalState[] = [];

    // Subscribe to state changes
    controller.subscribe((state) => {
      stateChanges.push({ ...state });
    });

    // Set up initial state
    controller.selectWallet('metamask');

    // Mock the state manager dispatch to throw on START_CONNECTING
    const originalDispatch = controller['stateManager'].dispatch;
    controller['stateManager'].dispatch = vi.fn((action) => {
      if (action.type === 'START_CONNECTING') {
        throw error;
      }
      return originalDispatch.call(controller['stateManager'], action);
    });

    // Attempt connection and verify it throws
    await expect(controller.connect()).rejects.toThrow(error);

    // Verify error was dispatched
    expect(controller['stateManager'].dispatch).toHaveBeenCalledWith({
      type: 'CONNECTION_ERROR',
      error,
    });
  });

  test('initializes with default configuration', () => {
    const controller = new ModalControllerImpl();
    const state = controller.getState();

    expect(state).toEqual({
      isOpen: false,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    });
  });

  test('initializes with custom configuration', () => {
    const config: ModalConfig = {
      theme: 'dark',
      showProviderSelection: true,
      defaultChain: ChainType.ETHEREUM,
    };

    const controller = new ModalControllerImpl({ config });
    expect(controller.getConfig()).toEqual(config);
  });

  test('handles basic modal operations', () => {
    const controller = new ModalControllerImpl();

    controller.open();
    const openState = controller.getState();
    expect(openState.isOpen).toBe(true);

    controller.close();
    const closedState = controller.getState();
    expect(closedState.isOpen).toBe(false);
  });

  test('handles wallet selection flow', () => {
    const controller = new ModalControllerImpl({
      config: { showProviderSelection: true },
    });

    controller.open();
    controller.selectWallet('metamask');

    const state = controller.getState();
    expect(state.selectedWallet).toBe('metamask');
    expect(state.currentView).toBe('providerSelection');
  });

  test('handles provider selection flow', () => {
    const controller = new ModalControllerImpl();

    controller.selectProvider(ProviderInterface.EIP1193);

    const state = controller.getState();
    expect(state.selectedProvider).toBe(ProviderInterface.EIP1193);
    expect(state.currentView).toBe('connecting');
  });

  test('handles chain selection', () => {
    const controller = new ModalControllerImpl({
      config: { defaultChain: ChainType.ETHEREUM },
    });

    controller.selectChain(ChainType.ETHEREUM);
    expect(controller.getState().selectedChain).toBe(ChainType.ETHEREUM);
  });

  test('throws error when connecting without wallet selection', async () => {
    const controller = new ModalControllerImpl();
    await expect(controller.connect()).rejects.toThrow('No wallet selected');
  });

  test('warns on invalid view transitions', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const controller = new ModalControllerImpl({
      config: { showProviderSelection: true },
    });

    // Mock executeTransition to return false for invalid transition
    vi.spyOn(controller['viewSystem'], 'executeTransition').mockResolvedValue(false);

    // Mock getPreviousView
    vi.spyOn(controller as any, 'getPreviousView').mockReturnValue('invalidView');

    // Trigger a state change
    controller.selectWallet('metamask');

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith('Invalid view transition: invalidView -> providerSelection');

    consoleSpy.mockRestore();
  });

  test('handles view transition errors', async () => {
    const error = new Error('Transition failed');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const controller = new ModalControllerImpl({
      config: { showProviderSelection: true },
    });

    // Mock getPreviousView
    vi.spyOn(controller as any, 'getPreviousView').mockReturnValue('walletSelection');

    // Mock executeTransition to throw
    vi.spyOn(controller['viewSystem'], 'executeTransition').mockRejectedValue(error);

    // Trigger a state change
    controller.selectWallet('metamask');

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith('Error during view transition:', error);

    consoleSpy.mockRestore();
  });

  test('handles cancellation in different states', () => {
    const controller = new ModalControllerImpl();

    // Test cancellation during loading
    controller.selectWallet('metamask');
    controller['stateManager'].dispatch({ type: 'START_CONNECTING' });
    expect(controller.getState().isLoading).toBe(true);

    controller.cancel();
    expect(controller.getState().isLoading).toBe(false);

    // Test cancellation in normal state
    controller.open();
    controller.cancel();
    expect(controller.getState().isOpen).toBe(false);
  });

  test('handles state subscription', () => {
    const controller = new ModalControllerImpl();
    const listener = vi.fn();

    const unsubscribe = controller.subscribe(listener);
    controller.open();

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
      }),
    );

    unsubscribe();
    controller.close();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('handles back navigation', () => {
    const controller = new ModalControllerImpl({
      config: { showProviderSelection: true },
    });

    controller.selectWallet('metamask');
    expect(controller.getState().currentView).toBe('providerSelection');

    controller.back();
    const state = controller.getState();
    expect(state.currentView).toBe('walletSelection');
    expect(state.selectedWallet).toBeNull();
  });

  test('handles reset', () => {
    const controller = new ModalControllerImpl();

    controller.open();
    controller.selectWallet('metamask');
    controller.selectProvider(ProviderInterface.EIP1193);

    controller.reset();
    expect(controller.getState()).toEqual({
      isOpen: false,
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      selectedChain: null,
      error: null,
      isLoading: false,
    });
  });

  test('handles config updates', () => {
    const controller = new ModalControllerImpl();
    const newConfig: Partial<ModalConfig> = {
      theme: 'dark',
      showProviderSelection: true,
    };

    controller.updateConfig(newConfig);
    expect(controller.getConfig()).toEqual(newConfig);
  });

  describe('View Transitions', () => {
    test('getPreviousView returns null by default', () => {
      const controller = new ModalControllerImpl();
      const previousView = controller['getPreviousView']();
      expect(previousView).toBeNull();
    });

    test('handleStateChange skips transition for same view', async () => {
      const controller = new ModalControllerImpl();
      const executeTransitionSpy = vi.spyOn(controller['viewSystem'], 'executeTransition');

      await controller['handleStateChange']({
        ...controller.getState(),
        currentView: 'walletSelection',
      });

      expect(executeTransitionSpy).not.toHaveBeenCalled();
    });
  });
});
