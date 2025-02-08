import { useState, useCallback, useEffect } from 'react';
import type { WalletInfo, ConnectedWallet, Connector, Adapter } from '../../types.js';
import { createAdapter } from '../../lib/adapters/createAdapter.js';
import { createConnector } from '../../lib/connectors/createConnector.js';
import { ConnectionStatus } from '../../types.js';
import { toast } from 'react-hot-toast';

const LOCAL_STORAGE_KEY = 'walletmesh_wallet_session';

export const useWalletLogic = () => {
  const [adapter, setAdapter] = useState<Adapter | null>(null);
  const [connector, setConnector] = useState<Connector | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.Idle);
  const [connectedWallet, setConnectedWallet] = useState<ConnectedWallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const storedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSession) {
      const sessionData = JSON.parse(storedSession) as ConnectedWallet;
      const newAdapter = createAdapter(sessionData);
      const newConnector = createConnector(newAdapter, sessionData);
      setAdapter(newAdapter);
      setConnector(newConnector);
      setConnectionStatus(ConnectionStatus.Resuming);

      newConnector
        .resumeSession(sessionData)
        .then((resumed) => {
          setConnectedWallet(resumed);
          setConnectionStatus(ConnectionStatus.Connected);
        })
        .catch((err) => {
          console.error('Failed to resume session:', err);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setAdapter(null);
          setConnector(null);
          setConnectedWallet(null);
          setConnectionStatus(ConnectionStatus.Idle);
          setIsModalOpen(true);
          toast.error('Failed to resume wallet connection. Please reconnect.');
        });
    }
  }, []);

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
        const activeAdapter = adapter || createAdapter(wallet);
        const activeConnector = connector || createConnector(activeAdapter, wallet);
        await activeAdapter.connect(wallet);
        const connected = await activeConnector.connect(wallet);
        setConnectedWallet(connected);
        setConnectionStatus(ConnectionStatus.Connected);
        setIsModalOpen(false);
        setAdapter(activeAdapter);
        setConnector(activeConnector);
      } catch (err) {
        console.error('Connection error:', err);
        setConnectionStatus(ConnectionStatus.Idle);
        toast.error(err instanceof Error ? err.message : 'Failed to connect wallet');
      }
    },
    [adapter, connector],
  );

  const resumeSession = useCallback(
    async (sessionData: ConnectedWallet) => {
      if (connectionStatus === ConnectionStatus.Connected) return;

      setConnectionStatus(ConnectionStatus.Resuming);
      const activeAdapter = adapter || createAdapter(sessionData);
      const activeConnector = connector || createConnector(activeAdapter, sessionData);
      setAdapter(activeAdapter);
      setConnector(activeConnector);

      try {
        const resumed = await activeConnector.resumeSession(sessionData);
        setConnectedWallet(resumed);
        setConnectionStatus(ConnectionStatus.Connected);
        setIsModalOpen(false);
      } catch (err) {
        console.error('Session resume error:', err);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setAdapter(null);
        setConnector(null);
        setConnectedWallet(null);
        setConnectionStatus(ConnectionStatus.Idle);
        setIsModalOpen(true);
        toast.error('Failed to resume wallet connection. Please reconnect.');
      }
    },
    [adapter, connector, connectionStatus],
  );

  const disconnectWallet = useCallback(async () => {
    if (!adapter || !connector) return;

    setConnectionStatus(ConnectionStatus.Disconnecting);
    try {
      await adapter.disconnect();
      await connector.disconnect();
      setConnectedWallet(null);
      setConnectionStatus(ConnectionStatus.Idle);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setAdapter(null);
      setConnector(null);
    } catch (err) {
      console.error('Disconnection error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    } finally {
      setConnectionStatus(ConnectionStatus.Idle);
    }
  }, [adapter, connector]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return {
    connectionStatus,
    connectedWallet,
    connectWallet,
    resumeSession,
    disconnectWallet,
    isModalOpen,
    openModal,
    closeModal,
  };
};
