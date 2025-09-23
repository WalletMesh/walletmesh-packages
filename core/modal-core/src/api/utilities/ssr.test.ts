import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Connection } from '../../internal/client/WalletMeshClient.js';
import type { ModalController, ModalState } from '../../types.js';
import {
  SSR_MODAL_STATE,
  createSSRController,
  createUniversalController,
  isServer,
  ssrState,
} from './ssr.js';

// Type for global manipulation in tests
interface GlobalWithWindow {
  window?: Window | object;
}

describe('SSR Utilities', () => {
  describe('SSR_MODAL_STATE', () => {
    it('should provide safe default state for SSR', () => {
      expect(SSR_MODAL_STATE).toEqual({
        connection: {
          state: 'idle',
        },
        wallets: [],
        selectedWalletId: undefined,
        isOpen: false,
      });
    });

    it('should have correct shape and values', () => {
      // Verify the structure of SSR_MODAL_STATE
      expect(SSR_MODAL_STATE).toHaveProperty('connection');
      expect(SSR_MODAL_STATE).toHaveProperty('wallets');
      expect(SSR_MODAL_STATE).toHaveProperty('selectedWalletId');
      expect(SSR_MODAL_STATE).toHaveProperty('isOpen');

      // Verify the values
      expect(SSR_MODAL_STATE.connection.state).toBe('idle');
      expect(SSR_MODAL_STATE.wallets).toEqual([]);
      expect(SSR_MODAL_STATE.selectedWalletId).toBeUndefined();
      expect(SSR_MODAL_STATE.isOpen).toBe(false);

      // Verify it's a plain object
      expect(typeof SSR_MODAL_STATE).toBe('object');
      expect(SSR_MODAL_STATE).not.toBeNull();
    });
  });

  describe('SSRController', () => {
    let controller: ReturnType<typeof createSSRController>;

    beforeEach(() => {
      controller = createSSRController();
    });

    describe('WalletMeshClient Interface', () => {
      it('should implement getState returning SSR state', () => {
        const state = controller.getState();
        expect(state).toEqual(SSR_MODAL_STATE);
      });

      it('should implement subscribe with no-op', () => {
        const callback = vi.fn();
        const unsubscribe = controller.subscribe(callback);

        expect(callback).not.toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');

        // Calling unsubscribe should not throw
        expect(() => unsubscribe()).not.toThrow();
      });

      it('should throw error when connecting with walletId', async () => {
        await expect(controller.connect('metamask')).rejects.toThrow(
          'Cannot connect wallet in SSR environment',
        );
      });

      it('should return undefined when connecting without walletId (open modal)', async () => {
        const result = await controller.connect();
        expect(result).toBeUndefined();
      });

      it('should implement disconnect as no-op', async () => {
        await expect(controller.disconnect()).resolves.toBeUndefined();
        await expect(controller.disconnect('walletId')).resolves.toBeUndefined();
      });

      it('should implement disconnectAll as no-op', async () => {
        await expect(controller.disconnectAll()).resolves.toBeUndefined();
      });

      it('should implement openModal as no-op', async () => {
        await expect(controller.openModal()).resolves.toBeUndefined();
        await expect(controller.openModal({ forceWalletSelection: true })).resolves.toBeUndefined();
      });

      it('should implement closeModal as no-op', () => {
        expect(() => controller.closeModal()).not.toThrow();
      });

      it('should implement on event handler with no-op', () => {
        const handler = vi.fn();
        const unsubscribe = controller.on('connection:success', handler);

        expect(handler).not.toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
      });

      it('should implement once event handler with no-op', () => {
        const handler = vi.fn();
        const unsubscribe = controller.once('modal:opened', handler);

        expect(handler).not.toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
      });

      it('should throw error when switching chain', async () => {
        await expect(controller.switchChain('0x1')).rejects.toThrow('Cannot switch chain in SSR environment');
        await expect(controller.switchChain('0x1', 'metamask')).rejects.toThrow(
          'Cannot switch chain in SSR environment',
        );
      });

      it('should implement destroy as no-op', () => {
        expect(() => controller.destroy()).not.toThrow();
      });

      it('should return false for isConnected', () => {
        expect(controller.isConnected).toBe(false);
      });

      it('should return empty actions from getActions', async () => {
        const actions = controller.getActions();

        expect(actions).toHaveProperty('openModal');
        expect(actions).toHaveProperty('closeModal');
        expect(actions).toHaveProperty('selectWallet');
        expect(actions).toHaveProperty('connect');
        expect(actions).toHaveProperty('disconnect');
        expect(actions).toHaveProperty('retry');

        // All actions should be no-ops
        expect(() => actions.openModal()).not.toThrow();
        expect(() => actions.closeModal()).not.toThrow();
        await expect(actions.selectWallet('test')).resolves.toBeUndefined();
        await expect(actions.connect()).resolves.toBeUndefined();
        await expect(actions.disconnect()).resolves.toBeUndefined();
        await expect(actions.retry()).resolves.toBeUndefined();
      });

      it('should return null services from getServices', () => {
        const services = controller.getServices();

        expect(services.transaction).toBeNull();
        expect(services.balance).toBeNull();
        expect(services.chain).toBeNull();
        expect(services.connection).toBeNull();
        expect(services.account).toBeNull();
        expect(services.preferences).toBeNull();
        expect(services.sessionManagement).toBeNull();
        expect(services.connectionRecovery).toBeNull();
        expect(services.walletHealth).toBeNull();
        expect(services.chainEnsurance).toBeNull();
        expect(services.eventMapping).toBeNull();
      });
    });

    describe('Headless Modal Interface', () => {
      it('should provide headless modal interface', () => {
        expect(controller.modal).toBeDefined();
        expect(controller.modal.getState).toBeDefined();
        expect(controller.modal.subscribe).toBeDefined();
        expect(controller.modal.getActions).toBeDefined();
        expect(controller.modal.destroy).toBeDefined();
      });

      it('should return SSR state from modal.getState', () => {
        const state = controller.modal.getState();
        expect(state).toEqual(SSR_MODAL_STATE);
      });

      it('should implement modal.subscribe with no-op', () => {
        const listener = vi.fn();
        const unsubscribe = controller.modal.subscribe(listener);

        expect(listener).not.toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
      });

      it('should return no-op actions from modal.getActions', async () => {
        const actions = controller.modal.getActions();

        expect(() => actions.openModal()).not.toThrow();
        expect(() => actions.closeModal()).not.toThrow();
        await expect(actions.selectWallet('test')).resolves.toBeUndefined();
        await expect(actions.connect()).resolves.toBeUndefined();
        await expect(actions.disconnect()).resolves.toBeUndefined();
        await expect(actions.retry()).resolves.toBeUndefined();
      });

      it('should implement modal.destroy as no-op', () => {
        expect(() => controller.modal.destroy()).not.toThrow();
      });
    });
  });

  describe('isServer', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
      originalWindow = globalThis.window;
    });

    afterEach(() => {
      if (originalWindow !== undefined) {
        (globalThis as GlobalWithWindow).window = originalWindow;
      } else {
        (globalThis as GlobalWithWindow).window = undefined;
      }
    });

    it('should return true when window is undefined', () => {
      (globalThis as GlobalWithWindow).window = undefined;
      expect(isServer()).toBe(true);
    });

    it('should return false when window is defined', () => {
      (globalThis as GlobalWithWindow).window = {};
      expect(isServer()).toBe(false);
    });
  });

  describe('createUniversalController', () => {
    let originalWindow: typeof globalThis.window;
    let mockBrowserController: ModalController;

    beforeEach(() => {
      originalWindow = globalThis.window;

      mockBrowserController = {
        open: vi.fn(),
        close: vi.fn(),
        getState: vi.fn(
          () =>
            ({
              connection: { state: 'connected' },
              wallets: [{ id: 'metamask', name: 'MetaMask' }],
              selectedWalletId: 'metamask',
              isOpen: true,
            }) as ModalState,
        ),
        subscribe: vi.fn(() => () => {}),
        connect: vi.fn(
          async () =>
            ({
              address: '0x123',
              chainId: '0x1',
              chainType: 'evm',
              provider: {},
            }) as Connection,
        ),
        disconnect: vi.fn(),
        selectWallet: vi.fn(),
        reset: vi.fn(),
        setView: vi.fn(),
        goBack: vi.fn(),
        getAvailableWallets: vi.fn(async () => []),
        cleanup: vi.fn(),
      };
    });

    afterEach(() => {
      if (originalWindow !== undefined) {
        (globalThis as GlobalWithWindow).window = originalWindow;
      } else {
        (globalThis as GlobalWithWindow).window = undefined;
      }
    });

    describe('Server Environment', () => {
      beforeEach(() => {
        (globalThis as GlobalWithWindow).window = undefined;
      });

      it('should return SSR-safe controller in server environment', () => {
        const controller = createUniversalController(() => mockBrowserController);

        expect(controller).toBeDefined();
        expect(mockBrowserController.open).not.toHaveBeenCalled();
      });

      it('should provide no-op methods in SSR controller', () => {
        const controller = createUniversalController(() => mockBrowserController);

        expect(() => controller.open()).not.toThrow();
        expect(() => controller.close()).not.toThrow();
        expect(() => controller.selectWallet('test')).not.toThrow();
        expect(() => controller.reset()).not.toThrow();
        expect(() => controller.setView('walletSelection')).not.toThrow();
        expect(() => controller.goBack()).not.toThrow();
        expect(() => controller.cleanup()).not.toThrow();
      });

      it('should return SSR state from getState', () => {
        const controller = createUniversalController(() => mockBrowserController);
        const state = controller.getState();

        expect(state).toEqual(SSR_MODAL_STATE);
      });

      it('should return no-op unsubscribe from subscribe', () => {
        const controller = createUniversalController(() => mockBrowserController);
        const callback = vi.fn();
        const unsubscribe = controller.subscribe(callback);

        expect(callback).not.toHaveBeenCalled();
        expect(typeof unsubscribe).toBe('function');
        expect(() => unsubscribe()).not.toThrow();
      });

      it('should throw error when connecting in SSR', async () => {
        const controller = createUniversalController(() => mockBrowserController);

        await expect(controller.connect('metamask')).rejects.toThrow(
          'Cannot connect wallet in SSR environment',
        );
      });

      it('should implement disconnect as no-op in SSR', async () => {
        const controller = createUniversalController(() => mockBrowserController);

        await expect(controller.disconnect()).resolves.toBeUndefined();
      });

      it('should return empty array from getAvailableWallets in SSR', async () => {
        const controller = createUniversalController(() => mockBrowserController);
        const wallets = await controller.getAvailableWallets();

        expect(wallets).toEqual([]);
      });
    });

    describe('Browser Environment', () => {
      beforeEach(() => {
        (globalThis as GlobalWithWindow).window = {};
      });

      it('should return browser controller in browser environment', () => {
        const controller = createUniversalController(() => mockBrowserController);

        expect(controller).toBe(mockBrowserController);
      });

      it('should call factory function to create browser controller', () => {
        const factory = vi.fn(() => mockBrowserController);
        const controller = createUniversalController(factory);

        expect(factory).toHaveBeenCalledTimes(1);
        expect(controller).toBe(mockBrowserController);
      });

      it('should not create SSR controller in browser', () => {
        const controller = createUniversalController(() => mockBrowserController);

        // Verify it's the browser controller by checking state
        const state = controller.getState();
        expect(state).not.toEqual(SSR_MODAL_STATE);
        expect(state.wallets).toHaveLength(1);
      });
    });
  });

  describe('ssrState', () => {
    describe('serialize', () => {
      it('should serialize modal state to JSON string', () => {
        const state: ModalState = {
          connection: {
            state: 'connected',
            progress: { step: 'signing', message: 'Please sign' },
          },
          wallets: [{ id: 'metamask', name: 'MetaMask' }],
          selectedWalletId: 'metamask',
          isOpen: true,
        };

        const serialized = ssrState.serialize(state);
        expect(typeof serialized).toBe('string');

        const parsed = JSON.parse(serialized);
        expect(parsed).toEqual(state);
      });

      it('should handle empty state', () => {
        const serialized = ssrState.serialize(SSR_MODAL_STATE);
        const parsed = JSON.parse(serialized);

        expect(parsed).toEqual(SSR_MODAL_STATE);
      });

      it('should handle state with error', () => {
        const state: ModalState = {
          connection: {
            state: 'error',
            error: {
              code: 'connection_failed',
              message: 'Failed to connect',
              category: 'connection',
              fatal: false,
            },
          },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };

        const serialized = ssrState.serialize(state);
        const parsed = JSON.parse(serialized);

        expect(parsed).toEqual(state);
      });
    });

    describe('deserialize', () => {
      it('should deserialize valid JSON string to modal state', () => {
        const state: ModalState = {
          connection: { state: 'connected' },
          wallets: [{ id: 'phantom', name: 'Phantom' }],
          selectedWalletId: 'phantom',
          isOpen: true,
        };

        const serialized = JSON.stringify(state);
        const deserialized = ssrState.deserialize(serialized);

        expect(deserialized).toEqual(state);
      });

      it('should return SSR_MODAL_STATE for invalid JSON', () => {
        const deserialized = ssrState.deserialize('invalid json {');
        expect(deserialized).toEqual(SSR_MODAL_STATE);
      });

      it('should return SSR_MODAL_STATE for empty string', () => {
        const deserialized = ssrState.deserialize('');
        expect(deserialized).toEqual(SSR_MODAL_STATE);
      });

      it('should handle malformed but valid JSON', () => {
        const deserialized = ssrState.deserialize('{}');
        expect(deserialized).toEqual({});
      });

      it('should preserve all state properties when deserializing', () => {
        const complexState: ModalState = {
          connection: {
            state: 'connecting',
            progress: {
              step: 'awaiting_signature',
              message: 'Please approve in wallet',
              percent: 50,
            },
          },
          wallets: [
            { id: 'metamask', name: 'MetaMask', icon: 'https://metamask.io/icon.png' },
            { id: 'walletconnect', name: 'WalletConnect' },
          ],
          selectedWalletId: 'metamask',
          isOpen: true,
        };

        const serialized = JSON.stringify(complexState);
        const deserialized = ssrState.deserialize(serialized);

        expect(deserialized).toEqual(complexState);
      });
    });

    describe('extractSafeState', () => {
      it('should extract basic state properties', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [{ id: 'test', name: 'Test' }],
          selectedWalletId: 'test',
          isOpen: true,
        };

        const safeState = ssrState.extractSafeState(state);
        expect(safeState).toEqual(state);
      });

      it('should preserve connection progress', () => {
        const state: ModalState = {
          connection: {
            state: 'connecting',
            progress: {
              step: 'initializing',
              message: 'Setting up connection',
              percent: 25,
            },
          },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };

        const safeState = ssrState.extractSafeState(state);
        expect(safeState.connection.progress).toEqual(state.connection.progress);
      });

      it('should preserve connection error', () => {
        const state: ModalState = {
          connection: {
            state: 'error',
            error: {
              code: 'wallet_not_found',
              message: 'Wallet not installed',
              category: 'wallet',
              fatal: true,
            },
          },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };

        const safeState = ssrState.extractSafeState(state);
        expect(safeState.connection.error).toEqual(state.connection.error);
      });

      it('should create new arrays for wallets', () => {
        const state: ModalState = {
          connection: { state: 'idle' },
          wallets: [{ id: 'wallet1', name: 'Wallet 1' }],
          selectedWalletId: undefined,
          isOpen: false,
        };

        const safeState = ssrState.extractSafeState(state);

        // Should be a new array
        expect(safeState.wallets).not.toBe(state.wallets);
        expect(safeState.wallets).toEqual(state.wallets);

        // Modifying original should not affect safe state
        state.wallets.push({ id: 'wallet2', name: 'Wallet 2' });
        expect(safeState.wallets).toHaveLength(1);
      });

      it('should handle state with all optional properties', () => {
        const state: ModalState = {
          connection: {
            state: 'connected',
            progress: {
              step: 'completed',
              message: 'Connected successfully',
              percent: 100,
            },
            error: {
              code: 'previous_error',
              message: 'This was a previous error',
              category: 'general',
              fatal: false,
            },
          },
          wallets: [
            { id: 'wallet1', name: 'Wallet 1', icon: 'icon1.png' },
            { id: 'wallet2', name: 'Wallet 2' },
          ],
          selectedWalletId: 'wallet1',
          isOpen: true,
        };

        const safeState = ssrState.extractSafeState(state);

        expect(safeState).toEqual({
          connection: {
            state: 'connected',
            progress: { ...state.connection.progress },
            error: { ...state.connection.error },
          },
          wallets: [...state.wallets],
          selectedWalletId: 'wallet1',
          isOpen: true,
        });
      });

      it('should handle minimal state', () => {
        const minimalState: ModalState = {
          connection: { state: 'idle' },
          wallets: [],
          selectedWalletId: undefined,
          isOpen: false,
        };

        const safeState = ssrState.extractSafeState(minimalState);
        expect(safeState).toEqual(minimalState);
      });
    });
  });
});
