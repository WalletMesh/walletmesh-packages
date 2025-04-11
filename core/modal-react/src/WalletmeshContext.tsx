import { createContext, useContext } from 'react';
import type { ModalConfig, ModalState, ModalAction } from '@walletmesh/modal-core';

export interface WalletmeshContextType {
  /** Configuration options for the Walletmesh modal */
  config: WalletmeshConfig;
  /** List of available wallets */
  wallets: WalletInfo[];
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Error if any occurred during connection */
  error: Error | null;
  /** Current modal state */
  modalState: ModalState;
  /** Current wallet state */
  walletState: {
    /** Currently selected wallet ID */
    selectedWallet: string | null;
    /** Whether wallet is currently connected */
    isConnected: boolean;
    /** Whether wallet is currently connecting */
    isConnecting: boolean;
  };
  /** Get the current modal state */
  getState: () => ModalState;
  /** Subscribe to modal state changes */
  subscribe: (callback: (state: ModalState) => void) => () => void;
  /** Open the wallet selection modal */
  openModal: () => void;
  /** Close the wallet selection modal */
  closeModal: () => void;
  /** Open the connected wallet modal */
  openConnectedModal: () => void;
  /** Close the connected wallet modal */
  closeConnectedModal: () => void;
  /** Dispatch an action to the modal controller */
  dispatch: (action: ModalAction) => void;
  /** Connect to a wallet */
  connect: (walletId: string) => Promise<void>;
  /** Disconnect from the current wallet */
  disconnect: () => Promise<void>;
}

export interface WalletmeshConfig extends Partial<ModalConfig> {
  /** Theme for the modal - light, dark, or system */
  theme?: 'light' | 'dark' | 'system';
  /** DApp information */
  dappInfo?: {
    /** Name of the DApp */
    name: string;
    /** URL of the DApp */
    url: string;
    /** Icon URL of the DApp */
    iconUrl?: string;
    /** Description of the DApp */
    description?: string;
  };
}

export interface WalletInfo {
  /** Unique identifier for the wallet */
  id: string;
  /** Display name of the wallet */
  name: string;
  /** Icon URL for the wallet */
  iconUrl?: string;
  /** Whether the wallet is installed */
  isInstalled?: boolean;
  /** URL to download/install the wallet */
  downloadUrl?: string;
}

export type ConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'error';

// Create context with default values
const WalletmeshContext = createContext<WalletmeshContextType | undefined>(undefined);

/**
 * Hook to access the Walletmesh context
 * @returns The Walletmesh context
 * @throws Error if used outside of WalletmeshProvider
 */
export function useWalletmesh(): WalletmeshContextType {
  const context = useContext(WalletmeshContext);
  
  if (context === undefined) {
    throw new Error('useWalletmesh must be used within a WalletmeshProvider');
  }
  
  return context;
}

export { WalletmeshContext };
