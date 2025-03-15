/**
 * @packageDocumentation
 * Modal store implementation for WalletMesh Core.
 */

import { create } from 'zustand';

/**
 * Modal configuration options
 */
export interface ModalConfig {
  onBeforeOpen?: () => Promise<boolean> | boolean;
  onAfterOpen?: () => void;
  onBeforeClose?: () => Promise<boolean> | boolean;
  onAfterClose?: () => void;
}

/**
 * Modal store state and actions
 */
export interface ModalStore {
  isSelectModalOpen: boolean;
  isConnectedModalOpen: boolean;
  config: Required<ModalConfig>;
  setConfig: (config: Partial<ModalConfig>) => void;
  openSelectModal: () => Promise<void>;
  closeSelectModal: () => Promise<void>;
  openConnectedModal: () => Promise<void>;
  closeConnectedModal: () => Promise<void>;
}

/**
 * Modal store state
 */
type ModalState = ModalStore;

/**
 * Default modal configuration
 */
const defaultConfig: Required<ModalConfig> = {
  onBeforeOpen: async () => true,
  onAfterOpen: () => {},
  onBeforeClose: async () => true,
  onAfterClose: () => {},
};

/**
 * Creates the modal store with zustand
 */
export const createModalStore = () =>
  create<ModalState>((set, get) => ({
    isSelectModalOpen: false,
    isConnectedModalOpen: false,
    config: { ...defaultConfig },

    setConfig: (newConfig) =>
      set((state) => ({
        config: {
          ...defaultConfig,
          ...state.config,
          ...newConfig,
        },
      })),

    openSelectModal: async () => {
      const { config } = get();
      const canOpen = (await config.onBeforeOpen()) ?? true;

      if (canOpen) {
        set({ isSelectModalOpen: true });
        config.onAfterOpen();
      }
    },

    closeSelectModal: async () => {
      const { config } = get();
      const canClose = (await config.onBeforeClose()) ?? true;

      if (canClose) {
        set({ isSelectModalOpen: false });
        config.onAfterClose();
      }
    },

    openConnectedModal: async () => {
      const { config } = get();
      const canOpen = (await config.onBeforeOpen()) ?? true;

      if (canOpen) {
        set({ isConnectedModalOpen: true });
        config.onAfterOpen();
      }
    },

    closeConnectedModal: async () => {
      const { config } = get();
      const canClose = (await config.onBeforeClose()) ?? true;

      if (canClose) {
        set({ isConnectedModalOpen: false });
        config.onAfterClose();
      }
    },
  }));

/**
 * Default modal store instance
 */
export const defaultModalStore = createModalStore();

/**
 * Type for accessing the modal store
 */
export type UseModalStore = typeof defaultModalStore;
