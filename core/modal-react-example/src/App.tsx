import { formatError } from '@walletmesh/modal-core';
import {
  EVMConnectButton,
  getReactLogger,
  SolanaConnectButton,
  useAccount,
  useConnect,
  useWalletEvents,
} from '@walletmesh/modal-react/all';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

// Lazy load Aztec components to improve bundle size
const AztecConnectButton = lazy(() =>
  import('@walletmesh/modal-react/all').then((module) => ({
    default: module.AztecConnectButton,
  })),
);

import { DevModePanel } from './components/DevModePanel';
import { BalanceDisplayDemo } from './components/demos/BalanceDisplayDemo';
import { ChainSwitchingDemo } from './components/demos/ChainSwitchingDemo';
import { ConnectionManagementDemo } from './components/demos/ConnectionManagementDemo';
import { DevModeDemo } from './components/demos/DevModeDemo';
import { DualWalletDemo } from './components/demos/DualWalletDemo';
import { EventHandlingDemo } from './components/demos/EventHandlingDemo';
import { ModalControlDemo } from './components/demos/ModalControlDemo';
import { ProviderComparisonDemo } from './components/demos/ProviderComparisonDemo';
import { TransactionDemo } from './components/demos/TransactionDemo';
// Demo components
import { WalletDiscoveryDemo } from './components/demos/WalletDiscoveryDemo';
// Debugger components
import { SessionDebugger } from './components/SessionDebugger';

import styles from './styles/App.module.css';

function DisconnectButton() {
  const { address } = useAccount();
  const { disconnect, isDisconnecting } = useConnect();

  const handleDisconnect = async () => {
    console.log('DisconnectButton clicked, calling disconnect...');
    try {
      await disconnect();
      console.log('Disconnect completed successfully');
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDisconnect}
      disabled={isDisconnecting}
      className={styles.disconnectButton}
      style={{
        padding: '12px 24px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: isDisconnecting ? 'not-allowed' : 'pointer',
        opacity: isDisconnecting ? 0.6 : 1,
        fontSize: '16px',
        fontWeight: '500',
      }}
    >
      {isDisconnecting ? 'Disconnecting...' : `Disconnect ${address?.slice(0, 6)}...${address?.slice(-4)}`}
    </button>
  );
}

function App() {
  // Initialize logger for this component - use useMemo to make it stable
  const logger = useMemo(() => getReactLogger(), []);

  // Demo section state
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  // Track page reload for demo purposes
  const [pageLoadTime] = useState(() => new Date().toISOString());
  const [isPageFresh] = useState(() => {
    const lastLoad = sessionStorage.getItem('walletmesh-example-last-load');
    sessionStorage.setItem('walletmesh-example-last-load', new Date().toISOString());
    return !lastLoad || Date.now() - new Date(lastLoad).getTime() > 5000;
  });

  // Use the new consolidated hooks
  const { isConnected, address, chain, chainType, isConnecting } = useAccount();
  const { error: connectError } = useConnect();

  // Debug logging for account state
  useEffect(() => {
    console.log('[App] useAccount state:', { isConnected, address, chain, chainType, isConnecting });
  }, [isConnected, address, chain, chainType, isConnecting]);

  // Debug logging
  useEffect(() => {
    logger.debug('Account state changed', { isConnected, address, chain, chainType, isConnecting });
  }, [isConnected, address, chain, chainType, isConnecting, logger]);

  // Add listener for chain switch events to trigger re-check
  const chainSwitchHandler = useMemo(
    () => (data: unknown) => {
      logger.info('Chain switched event received, checking account state again...');
      logger.debug('Chain switch event data', data);
      // Force a re-check by logging current account state
      setTimeout(() => {
        logger.debug('Account state after chain switch', {
          isConnected,
          address,
          chain,
          chainType,
          isConnecting,
        });
      }, 100);
    },
    [logger, isConnected, address, chain, chainType, isConnecting],
  );

  useWalletEvents('chain:switched', chainSwitchHandler);

  // Derive connection status
  const connection = {
    status: isConnected ? 'connected' : isConnecting ? 'connecting' : 'disconnected',
    address,
    chain,
    chainType,
    isConnecting,
    error: connectError,
  };

  // Derive display status
  const displayStatus =
    connection.status === 'connected'
      ? 'Connected'
      : connection.status === 'connecting'
        ? 'Connecting...'
        : connection.error
          ? `Error: ${String(formatError(connection.error).message)}`
          : 'Disconnected';

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>WalletMesh Modal Example</h1>

      {/* Page Reload Indicator */}
      <div className={styles.pageReloadIndicator}>
        <div className={styles.reloadInfo}>
          <span className={styles.reloadLabel}>Page loaded at:</span>
          <span className={styles.reloadTime}>{new Date(pageLoadTime).toLocaleTimeString()}</span>
          {isPageFresh && <span className={styles.freshBadge}>Fresh Load</span>}
          {!isPageFresh && <span className={styles.reloadBadge}>Page Reloaded</span>}
        </div>
      </div>

      {/* Feature 1: Modal Controls */}
      <div className={styles.modalControls}>
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px' }}>
          <strong>Debug:</strong> isConnected = {isConnected ? 'true' : 'false'}, address ={' '}
          {address || 'null'}, status = {connection.status}
        </div>
        {isConnected ? (
          /* Show disconnect button when connected */
          <DisconnectButton />
        ) : (
          /* Show EVM, Solana, and Aztec connect buttons */
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <EVMConnectButton
              showAddress={true}
              showChain={true}
              showTransactionStatus={true}
              showNetworkIndicator={true}
              label="Connect EVM Wallet"
            />
            <SolanaConnectButton
              showAddress={true}
              showChain={true}
              showTransactionStatus={true}
              showClusterIndicator={true}
              label="Connect Solana Wallet"
            />
            <Suspense fallback={<div>Loading Aztec wallet...</div>}>
              <AztecConnectButton showAddress={true} showChain={true} label="Connect Aztec Wallet" />
            </Suspense>
          </div>
        )}
      </div>

      {/* Feature 1.5: Direct Wallet Connection with ConnectButton */}
      <div className={styles.directConnectButtons}>
        <h3>Chain-Specific ConnectButton Examples</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <EVMConnectButton
            showAddress={true}
            showChain={true}
            showTransactionStatus={true}
            showNetworkIndicator={true}
            showGasEstimate={false}
            onTransactionStart={() => {
              logger.info('EVM transaction started');
            }}
            onTransactionComplete={() => {
              logger.info('EVM transaction completed');
            }}
            onTransactionError={(error) => {
              logger.error('EVM transaction error:', error);
            }}
            onConnectedClick={() => {
              logger.info('EVM wallet connected button clicked');
            }}
          />
          <SolanaConnectButton
            showAddress={true}
            showChain={true}
            showTransactionStatus={true}
            showClusterIndicator={true}
            showBalance={false}
            onTransactionStart={() => {
              logger.info('Solana transaction started');
            }}
            onTransactionComplete={() => {
              logger.info('Solana transaction completed');
            }}
            onTransactionError={(error) => {
              logger.error('Solana transaction error:', error);
            }}
          />
          <Suspense fallback={<div>Loading Aztec wallet...</div>}>
            <AztecConnectButton
              showAddress={true}
              showChain={true}
              onConnectedClick={() => {
                logger.info('Aztec wallet connected button clicked');
              }}
            />
          </Suspense>
        </div>
      </div>

      {/* Feature 2: Connection Status */}
      <div
        className={`${
          connection.status === 'connected'
            ? styles.connectionStatusConnected
            : connection.error
              ? styles.connectionStatusError
              : styles.connectionStatus
        }`}
      >
        <h2 className={styles.statusTitle}>Connection Status</h2>
        <div className={styles.statusIndicator}>
          <div
            className={`${
              connection.status === 'connected'
                ? styles.statusDotConnected
                : connection.status === 'connecting'
                  ? styles.statusDotConnecting
                  : connection.error
                    ? styles.statusDotError
                    : styles.statusDotDisconnected
            }`}
          />
          <span className={styles.statusText}>{displayStatus}</span>
        </div>
        <div className={styles.statusDetails}>
          <div className={styles.statusDetail}>
            <span className={styles.statusDetailLabel}>Status:</span> {connection.status}
          </div>
          <div className={styles.statusDetail}>
            <span className={styles.statusDetailLabel}>Address:</span> {connection.address || 'Not connected'}
          </div>
          <div className={styles.statusDetail}>
            <span className={styles.statusDetailLabel}>Chain:</span> {connection.chain?.name || 'None'} (
            {connection.chain?.chainId || 'Unknown'})
          </div>
          <div className={styles.statusDetail}>
            <span className={styles.statusDetailLabel}>Chain Type:</span> {connection.chainType || 'None'}
          </div>
        </div>
        {connection.error ? (
          <div className={styles.errorMessage}>
            Error: {String(formatError(connection.error as Error).message)}
          </div>
        ) : null}
      </div>

      {/* Demo Showcase Section */}
      <div className={styles.demoSection}>
        <h2 className={styles.demoTitle}>🧪 Interactive WalletMesh Demos</h2>
        <p className={styles.demoDescription}>
          Explore WalletMesh capabilities with interactive demonstrations of key features.
        </p>

        {/* Demo Navigation */}
        <div className={styles.demoNavigation}>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'dual-wallet' ? null : 'dual-wallet')}
            className={`${styles.demoButton} ${activeDemo === 'dual-wallet' ? styles.active : ''}`}
          >
            🔄 Dual Wallet
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'discovery' ? null : 'discovery')}
            className={`${styles.demoButton} ${activeDemo === 'discovery' ? styles.active : ''}`}
          >
            🔍 Wallet Discovery
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'modal' ? null : 'modal')}
            className={`${styles.demoButton} ${activeDemo === 'modal' ? styles.active : ''}`}
          >
            🎛️ Modal Control
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'connection' ? null : 'connection')}
            className={`${styles.demoButton} ${activeDemo === 'connection' ? styles.active : ''}`}
          >
            🔗 Connection Manager
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'chains' ? null : 'chains')}
            className={`${styles.demoButton} ${activeDemo === 'chains' ? styles.active : ''}`}
          >
            ⛓️ Chain Switching
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'transactions' ? null : 'transactions')}
            className={`${styles.demoButton} ${activeDemo === 'transactions' ? styles.active : ''}`}
          >
            💸 Transactions
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'balance' ? null : 'balance')}
            className={`${styles.demoButton} ${activeDemo === 'balance' ? styles.active : ''}`}
          >
            💰 Balance Display
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'providers' ? null : 'providers')}
            className={`${styles.demoButton} ${activeDemo === 'providers' ? styles.active : ''}`}
          >
            🔌 Provider Comparison
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'events' ? null : 'events')}
            className={`${styles.demoButton} ${activeDemo === 'events' ? styles.active : ''}`}
          >
            📡 Event Handling
          </button>
          <button
            type="button"
            onClick={() => setActiveDemo(activeDemo === 'devmode' ? null : 'devmode')}
            className={`${styles.demoButton} ${activeDemo === 'devmode' ? styles.active : ''}`}
          >
            🛠️ DevMode Features
          </button>
        </div>

        {/* Demo Content */}
        <div className={styles.demoContent}>
          {activeDemo === 'dual-wallet' && <DualWalletDemo />}
          {activeDemo === 'discovery' && <WalletDiscoveryDemo />}
          {activeDemo === 'modal' && <ModalControlDemo />}
          {activeDemo === 'connection' && <ConnectionManagementDemo />}
          {activeDemo === 'chains' && <ChainSwitchingDemo />}
          {activeDemo === 'transactions' && <TransactionDemo />}
          {activeDemo === 'balance' && <BalanceDisplayDemo />}
          {activeDemo === 'providers' && <ProviderComparisonDemo />}
          {activeDemo === 'events' && <EventHandlingDemo />}
          {activeDemo === 'devmode' && <DevModeDemo />}

          {activeDemo === null && (
            <div className={styles.demoPlaceholder}>
              <div className={styles.placeholderIcon}>🚀</div>
              <h3 className={styles.placeholderTitle}>Select a Demo to Get Started</h3>
              <p className={styles.placeholderText}>
                Choose from the demo buttons above to explore different WalletMesh features. Each demo
                provides interactive examples and implementation code.
              </p>
              <div className={styles.demoFeatures}>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🔄</span>
                  <span className={styles.featureText}>Connect EVM and Solana wallets simultaneously</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🔍</span>
                  <span className={styles.featureText}>Discover wallets across origins</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>💸</span>
                  <span className={styles.featureText}>Send transactions on multiple chains</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureIcon}>🔗</span>
                  <span className={styles.featureText}>Manage wallet connections</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Developer Tools Section */}
      <div className={styles.developerTools}>
        <h2 className={styles.toolsTitle}>🛠️ Developer Tools</h2>
        <div className={styles.toolsGrid}>
          <div className={styles.toolCard}>
            <h3 className={styles.toolCardTitle}>DevMode Panel</h3>
            <DevModePanel />
          </div>
          <div className={styles.toolCard}>
            <h3 className={styles.toolCardTitle}>Session Debugger</h3>
            <SessionDebugger />
          </div>
        </div>
      </div>

      {/* WalletMeshModal is auto-injected by the WalletMeshProvider */}
    </div>
  );
}

export default App;
