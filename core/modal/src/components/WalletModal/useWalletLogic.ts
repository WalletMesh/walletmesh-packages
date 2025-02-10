import { useState, useCallback, useEffect } from 'react';
import { ConnectionStatus, type WalletInfo, type ConnectedWallet } from '../../types.js';
import { WalletMeshClient } from '../../lib/client/WalletMeshClient.js';
import { toast } from 'react-hot-toast';

const LOCAL_STORAGE_KEY = 'walletmesh_wallet_session';

export const useWalletLogic = () => {
  const [client] = useState(() => new WalletMeshClient());
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Idle);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSession) {
      const sessionData = JSON.parse(storedSession) as ConnectedWallet;
      setConnectionStatus(ConnectionStatus.Resuming);

      client.connectWallet(sessionData)
        .then((resumed) => {
          setConnectedWallet(resumed);
          setConnectionStatus(ConnectionStatus.Connected);
        })
        .catch((err) => {
          console.error('Failed to resume session:', err);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setConnectedWallet(null);
          setConnectionStatus(ConnectionStatus.Idle);
          setIsModalOpen(true);
          toast.error('Failed to resume wallet connection. Please reconnect.');
        });
    }
  }, [client]);

  useEffect(() => {
    if (connectedWallet) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(connectedWallet));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [connectedWallet]);

  const connectWallet = useCallback(
    async (wallet: WalletInfo) => {
      setConnectionStatus(ConnectionStatus.Connecting);
      try {
        const connected = await client.connectWallet(wallet);
        setConnectedWallet(connected);
        setConnectionStatus(ConnectionStatus.Connected);
        setIsModalOpen(false);
      } catch (err) {
        console.error('Connection error:', err);
        setConnectionStatus(ConnectionStatus.Idle);
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error('Failed to connect wallet');
        }
      }
    },
    [client],
  );

  const disconnectWallet = useCallback(async () => {
    if (!connectedWallet) return;

    setConnectionStatus(ConnectionStatus.Disconnecting);
    try {
      await client.disconnectWallet(connectedWallet.id);
      setConnectedWallet(null);
      setConnectionStatus(ConnectionStatus.Idle);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error('Disconnection error:', err);
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to disconnect wallet');
      }
      setConnectionStatus(ConnectionStatus.Idle);
    }
  }, [client, connectedWallet]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return {
    connectionStatus,
    connectedWallet,
    connectWallet,
    disconnectWallet,
    isModalOpen,
    openModal,
    closeModal,
  };
};
