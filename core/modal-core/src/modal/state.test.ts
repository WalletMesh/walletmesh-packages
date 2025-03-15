import { describe, test, expect, vi } from 'vitest';
import { ModalStateManager } from './state.js';
import type { ModalState, ModalConfig } from '../types/modal.js';
import { ProviderInterface } from '../types/providers.js';
import { ChainType } from '../types/chains.js';

describe('ModalStateManager', () => {
  test('initializes with default state', () => {
    const manager = new ModalStateManager();
    const state = manager.getState();

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

  test('initializes with custom state', () => {
    const initialState: Partial<ModalState> = {
      isOpen: true,
      currentView: 'connecting',
      selectedWallet: 'metamask',
    };

    const manager = new ModalStateManager({}, initialState);
    const state = manager.getState();

    expect(state).toMatchObject(initialState);
  });

  test('notifies subscribers of state changes', () => {
    const manager = new ModalStateManager();
    const listener = vi.fn();

    const unsubscribe = manager.subscribe(listener);
    manager.dispatch({ type: 'OPEN' });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        currentView: 'walletSelection',
      }),
    );

    unsubscribe();
    manager.dispatch({ type: 'CLOSE' });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('handles wallet selection with provider selection enabled', () => {
    const config: ModalConfig = {
      showProviderSelection: true,
    };

    const manager = new ModalStateManager(config);
    manager.dispatch({
      type: 'SELECT_WALLET',
      wallet: 'metamask',
    });

    expect(manager.getState()).toMatchObject({
      selectedWallet: 'metamask',
      currentView: 'providerSelection',
    });
  });

  test('handles wallet selection with provider selection disabled', () => {
    const config: ModalConfig = {
      showProviderSelection: false,
    };

    const manager = new ModalStateManager(config);
    manager.dispatch({
      type: 'SELECT_WALLET',
      wallet: 'metamask',
    });

    expect(manager.getState()).toMatchObject({
      selectedWallet: 'metamask',
      currentView: 'connecting',
    });
  });

  test('handles provider selection', () => {
    const manager = new ModalStateManager();
    manager.dispatch({
      type: 'SELECT_PROVIDER',
      provider: ProviderInterface.EIP1193,
    });

    expect(manager.getState()).toMatchObject({
      selectedProvider: ProviderInterface.EIP1193,
      currentView: 'connecting',
    });
  });

  test('handles chain selection', () => {
    const manager = new ModalStateManager();
    manager.dispatch({
      type: 'SELECT_CHAIN',
      chain: ChainType.ETHEREUM,
    });

    expect(manager.getState()).toMatchObject({
      selectedChain: ChainType.ETHEREUM,
    });
  });

  test('handles connection flow', () => {
    const manager = new ModalStateManager();

    manager.dispatch({ type: 'START_CONNECTING' });
    expect(manager.getState()).toMatchObject({
      currentView: 'connecting',
      isLoading: true,
    });

    manager.dispatch({ type: 'CONNECTION_SUCCESS' });
    expect(manager.getState()).toMatchObject({
      currentView: 'connected',
      isLoading: false,
    });
  });

  test('handles connection error', () => {
    const manager = new ModalStateManager();
    const error = new Error('Connection failed');

    manager.dispatch({
      type: 'CONNECTION_ERROR',
      error,
    });

    expect(manager.getState()).toMatchObject({
      currentView: 'error',
      error,
      isLoading: false,
    });
  });

  test('handles back navigation from provider selection', () => {
    const manager = new ModalStateManager();

    // Setup initial state
    manager.dispatch({ type: 'SELECT_WALLET', wallet: 'metamask' });
    manager.dispatch({ type: 'BACK' });

    expect(manager.getState()).toMatchObject({
      currentView: 'walletSelection',
      selectedWallet: null,
    });
  });

  test('resets state', () => {
    const manager = new ModalStateManager();

    // Setup some state
    manager.dispatch({ type: 'OPEN' });
    manager.dispatch({ type: 'SELECT_WALLET', wallet: 'metamask' });

    // Reset
    manager.dispatch({ type: 'RESET' });

    expect(manager.getState()).toEqual({
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
    const manager = new ModalStateManager();
    const newConfig: Partial<ModalConfig> = {
      showProviderSelection: true,
      defaultChain: ChainType.ETHEREUM,
    };

    manager.updateConfig(newConfig);
    expect(manager.getConfig()).toEqual(newConfig);
  });

  test('does not notify listeners when state remains unchanged', () => {
    const manager = new ModalStateManager();
    const listener = vi.fn();

    manager.subscribe(listener);

    // Apply the same state
    const currentState = manager.getState();
    manager['setState'](currentState);

    expect(listener).not.toHaveBeenCalled();
  });

  test('handles edge cases in chain selection', () => {
    const manager = new ModalStateManager();

    // Test selecting same chain multiple times
    manager.dispatch({ type: 'SELECT_CHAIN', chain: ChainType.ETHEREUM });
    manager.dispatch({ type: 'SELECT_CHAIN', chain: ChainType.ETHEREUM });
    expect(manager.getState().selectedChain).toBe(ChainType.ETHEREUM);

    // Test chain selection during error state
    manager.dispatch({ type: 'CONNECTION_ERROR', error: new Error('Test error') });
    manager.dispatch({ type: 'SELECT_CHAIN', chain: ChainType.ETHEREUM });
    expect(manager.getState().selectedChain).toBe(ChainType.ETHEREUM);
    expect(manager.getState().error).toBeNull(); // Should clear error
  });

  test('handles back navigation from all states', () => {
    const manager = new ModalStateManager({ showProviderSelection: true });

    // Test back from connecting with provider selection enabled
    manager.dispatch({ type: 'SELECT_WALLET', wallet: 'metamask' });
    manager.dispatch({ type: 'SELECT_PROVIDER', provider: ProviderInterface.EIP1193 });
    manager.dispatch({ type: 'START_CONNECTING' });
    manager.dispatch({ type: 'BACK' });
    expect(manager.getState()).toMatchObject({
      currentView: 'providerSelection',
      selectedProvider: null,
      isLoading: false,
    });

    // Test back from error state
    manager.dispatch({ type: 'CONNECTION_ERROR', error: new Error('Test error') });
    manager.dispatch({ type: 'BACK' });
    expect(manager.getState()).toMatchObject({
      currentView: 'walletSelection',
      selectedWallet: null,
      selectedProvider: null,
      error: null,
      isLoading: false,
    });

    // Test back from connected state (should not change state)
    manager.dispatch({ type: 'SELECT_WALLET', wallet: 'metamask' });
    manager.dispatch({ type: 'SELECT_PROVIDER', provider: ProviderInterface.EIP1193 });
    manager.dispatch({ type: 'CONNECTION_SUCCESS' });
    const connectedState = manager.getState();
    manager.dispatch({ type: 'BACK' });
    expect(manager.getState()).toEqual(connectedState);
  });

  test('handles unknown action types', () => {
    const manager = new ModalStateManager();
    const initialState = manager.getState();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // @ts-expect-error Testing invalid action type
    manager.dispatch({ type: 'INVALID_ACTION' });

    expect(manager.getState()).toEqual(initialState);
    expect(consoleSpy).toHaveBeenCalledWith('Unknown action type:', 'INVALID_ACTION');

    consoleSpy.mockRestore();
  });
});
