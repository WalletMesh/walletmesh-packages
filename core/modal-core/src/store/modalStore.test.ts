import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createModalStore, type ModalConfig } from './modalStore.js';

describe('Modal Store', () => {
  const store = createModalStore();
  const defaultCallbacks = {
    onBeforeOpen: vi.fn().mockResolvedValue(true),
    onAfterOpen: vi.fn(),
    onBeforeClose: vi.fn().mockResolvedValue(true),
    onAfterClose: vi.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    // Reset store state
    store.setState({
      isSelectModalOpen: false,
      isConnectedModalOpen: false,
      config: defaultCallbacks,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const modalState = store.getState();
      expect(modalState.isSelectModalOpen).toBe(false);
      expect(modalState.isConnectedModalOpen).toBe(false);
      expect(modalState.config).toBeDefined();
      expect(modalState.config.onBeforeOpen).toBeDefined();
      expect(modalState.config.onAfterOpen).toBeDefined();
      expect(modalState.config.onBeforeClose).toBeDefined();
      expect(modalState.config.onAfterClose).toBeDefined();
    });
  });

  describe('default callbacks', () => {
    const defaultStore = createModalStore();

    beforeEach(() => {
      defaultStore.setState({
        isSelectModalOpen: false,
        isConnectedModalOpen: false,
        config: { ...defaultStore.getState().config }
      });
    });

    it('should have default handlers that work as expected', async () => {
      const { config } = defaultStore.getState();
      
      const canOpen = await config.onBeforeOpen();
      expect(canOpen).toBe(true);
      
      const canClose = await config.onBeforeClose();
      expect(canClose).toBe(true);
      
      // Test void callbacks don't throw
      expect(() => { config.onAfterOpen(); config.onAfterClose(); }).not.toThrow();
    });
  });

  describe('setConfig', () => {
    it('should preserve default config when setting new config', () => {
      const newConfig: Partial<ModalConfig> = {
        onAfterOpen: vi.fn()
      };
      
      store.getState().setConfig(newConfig);
      const state = store.getState();
      
      expect(state.config.onAfterOpen).toBe(newConfig.onAfterOpen);
      expect(state.config.onBeforeOpen).toBeDefined();
      expect(state.config.onBeforeClose).toBeDefined();
      expect(state.config.onAfterClose).toBeDefined();
    });

    it('should merge multiple config updates', () => {
      const firstConfig: Partial<ModalConfig> = {
        onAfterOpen: vi.fn()
      };
      const secondConfig: Partial<ModalConfig> = {
        onAfterClose: vi.fn()
      };
      
      store.getState().setConfig(firstConfig);
      store.getState().setConfig(secondConfig);
      
      const state = store.getState();
      
      expect(state.config.onAfterOpen).toBe(firstConfig.onAfterOpen);
      expect(state.config.onAfterClose).toBe(secondConfig.onAfterClose);
    });

    it('should override previous config with new values', () => {
      const fn1 = vi.fn();
      const fn2 = vi.fn();
      store.getState().setConfig({ onAfterOpen: fn1 });
      store.getState().setConfig({ onAfterOpen: fn2 });
      expect(store.getState().config.onAfterOpen).toBe(fn2);
    });
  });
  describe('select modal', () => {
    it('should open select modal', async () => {
      await store.getState().openSelectModal();

      expect(defaultCallbacks.onBeforeOpen).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterOpen).toHaveBeenCalled();
      expect(store.getState().isSelectModalOpen).toBe(true);
    });

    it('should open select modal when onBeforeOpen returns undefined', async () => {
      defaultCallbacks.onBeforeOpen.mockResolvedValueOnce(undefined);

      await store.getState().openSelectModal();

      expect(defaultCallbacks.onBeforeOpen).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterOpen).toHaveBeenCalled();
      expect(store.getState().isSelectModalOpen).toBe(true);
    });

    it('should handle synchronous onBeforeOpen for select modal', async () => {
      defaultCallbacks.onBeforeOpen.mockReturnValueOnce(true);
      await store.getState().openSelectModal();
      expect(store.getState().isSelectModalOpen).toBe(true);
      expect(defaultCallbacks.onAfterOpen).toHaveBeenCalled();
    });

    it('should not open select modal when onBeforeOpen is synchronously false', async () => {
      defaultCallbacks.onBeforeOpen.mockReturnValueOnce(false);
      await store.getState().openSelectModal();
      expect(store.getState().isSelectModalOpen).toBe(false);
      expect(defaultCallbacks.onAfterOpen).not.toHaveBeenCalled();
    });

    it('should not open select modal when onBeforeOpen returns false', async () => {
      defaultCallbacks.onBeforeOpen.mockResolvedValueOnce(false);

      await store.getState().openSelectModal();

      expect(defaultCallbacks.onBeforeOpen).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterOpen).not.toHaveBeenCalled();
      expect(store.getState().isSelectModalOpen).toBe(false);
    });

    it('should close select modal', async () => {
      store.setState({ isSelectModalOpen: true });

      await store.getState().closeSelectModal();

      expect(defaultCallbacks.onBeforeClose).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterClose).toHaveBeenCalled();
      expect(store.getState().isSelectModalOpen).toBe(false);
    });

    it('should close select modal when onBeforeClose returns undefined', async () => {
      store.setState({ isSelectModalOpen: true });
      defaultCallbacks.onBeforeClose.mockResolvedValueOnce(undefined);

      await store.getState().closeSelectModal();

      expect(defaultCallbacks.onBeforeClose).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterClose).toHaveBeenCalled();
      expect(store.getState().isSelectModalOpen).toBe(false);
    });

    it('should not close select modal when onBeforeClose returns false', async () => {
      store.setState({ isSelectModalOpen: true });
      defaultCallbacks.onBeforeClose.mockResolvedValueOnce(false);

      await store.getState().closeSelectModal();

      expect(defaultCallbacks.onBeforeClose).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterClose).not.toHaveBeenCalled();
      expect(store.getState().isSelectModalOpen).toBe(true);
    });
  });

  describe('connected modal', () => {
    it('should open connected modal', async () => {
      await store.getState().openConnectedModal();

      expect(defaultCallbacks.onBeforeOpen).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterOpen).toHaveBeenCalled();
      expect(store.getState().isConnectedModalOpen).toBe(true);
    });

    it('should open connected modal when onBeforeOpen returns undefined', async () => {
      defaultCallbacks.onBeforeOpen.mockResolvedValueOnce(undefined);

      await store.getState().openConnectedModal();

      expect(defaultCallbacks.onBeforeOpen).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterOpen).toHaveBeenCalled();
      expect(store.getState().isConnectedModalOpen).toBe(true);
    });

    it('should handle synchronous onBeforeOpen for connected modal', async () => {
      defaultCallbacks.onBeforeOpen.mockReturnValueOnce(true);
      await store.getState().openConnectedModal();
      expect(store.getState().isConnectedModalOpen).toBe(true);
      expect(defaultCallbacks.onAfterOpen).toHaveBeenCalled();
    });

    it('should not open connected modal when onBeforeOpen is synchronously false', async () => {
      defaultCallbacks.onBeforeOpen.mockReturnValueOnce(false);
      await store.getState().openConnectedModal();
      expect(store.getState().isConnectedModalOpen).toBe(false);
      expect(defaultCallbacks.onAfterOpen).not.toHaveBeenCalled();
    });

    it('should not open connected modal when onBeforeOpen returns false', async () => {
      defaultCallbacks.onBeforeOpen.mockResolvedValueOnce(false);

      await store.getState().openConnectedModal();

      expect(defaultCallbacks.onBeforeOpen).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterOpen).not.toHaveBeenCalled();
      expect(store.getState().isConnectedModalOpen).toBe(false);
    });

    it('should close connected modal', async () => {
      store.setState({ isConnectedModalOpen: true });

      await store.getState().closeConnectedModal();

      expect(defaultCallbacks.onBeforeClose).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterClose).toHaveBeenCalled();
      expect(store.getState().isConnectedModalOpen).toBe(false);
    });

    it('should close connected modal when onBeforeClose returns undefined', async () => {
      store.setState({ isConnectedModalOpen: true });
      defaultCallbacks.onBeforeClose.mockResolvedValueOnce(undefined);

      await store.getState().closeConnectedModal();

      expect(defaultCallbacks.onBeforeClose).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterClose).toHaveBeenCalled();
      expect(store.getState().isConnectedModalOpen).toBe(false);
    });

    it('should not close connected modal when onBeforeClose returns false', async () => {
      store.setState({ isConnectedModalOpen: true });
      defaultCallbacks.onBeforeClose.mockResolvedValueOnce(false);

      await store.getState().closeConnectedModal();

      expect(defaultCallbacks.onBeforeClose).toHaveBeenCalled();
      expect(defaultCallbacks.onAfterClose).not.toHaveBeenCalled();
      expect(store.getState().isConnectedModalOpen).toBe(true);
    });
  });
});
