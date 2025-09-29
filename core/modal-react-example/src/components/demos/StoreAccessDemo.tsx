import { ChainType, useAccount, useConfig, useWalletMeshContext } from '@walletmesh/modal-react/all';
import { useCallback, useState } from 'react';
import styles from '../../styles/DemoCard.module.css';

interface StoreSnapshot {
  timestamp: string;
  connection: {
    isConnected: boolean;
    address?: string;
    chainId?: string;
    chainType?: string;
  };
  modal: {
    isOpen: boolean;
  };
  config: {
    appName: string;
    chains?: string[];
    wallets?: string[];
  } | null;
  client: {
    isInitialized: boolean;
    hasServices: boolean;
  };
}

interface StoreSnapshotDisplayProps {
  storeSnapshot: StoreSnapshot | null;
}

interface ConfigurationDisplayProps {
  config: {
    appName?: string;
    chains?: Array<{
      chainId: string;
      chainType: string;
      name: string;
      required: boolean;
      label?: string;
      interfaces?: string[];
      group?: string;
      icon?: string;
    }>;
    wallets?: Array<{
      id: string;
      name: string;
      icon?: string;
      [key: string]: any;
    }>;
    debug?: boolean;
    isOpen?: boolean;
    open?: () => void;
    close?: () => void;
  } | null;
}

function StoreSnapshotDisplay({ storeSnapshot }: StoreSnapshotDisplayProps) {
  if (!storeSnapshot) {
    return (
      <div className={styles.infoBox}>
        No store snapshot captured yet. Click "Capture Store Snapshot" to see the current state.
      </div>
    );
  }

  return (
    <div className={styles.methodCard}>
      <h5>Store Snapshot</h5>
      <p>Captured at: {new Date(storeSnapshot.timestamp).toLocaleString()}</p>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Connected:</span>
          <span className={storeSnapshot.connection.isConnected ? styles.valueSuccess : styles.valueError}>
            {storeSnapshot.connection.isConnected ? 'Yes' : 'No'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Address:</span>
          <span className={styles.valueDefault}>
            {storeSnapshot.connection.address?.slice(0, 8)}...
            {storeSnapshot.connection.address?.slice(-4) || 'None'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Chain:</span>
          <span className={styles.valueDefault}>
            {storeSnapshot.connection.chainType || 'None'} ({storeSnapshot.connection.chainId || 'N/A'})
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Modal Open:</span>
          <span className={storeSnapshot.modal.isOpen ? styles.valueWarning : styles.valueDefault}>
            {storeSnapshot.modal.isOpen ? 'Yes' : 'No'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Client Ready:</span>
          <span className={storeSnapshot.client.isInitialized ? styles.valueSuccess : styles.valueError}>
            {storeSnapshot.client.isInitialized ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ConfigurationDisplay({ config }: ConfigurationDisplayProps) {
  if (!config) {
    return <div className={styles.warningBox}>No configuration available</div>;
  }

  return (
    <div className={styles.methodCard}>
      <h5>Current Configuration</h5>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.label}>App Name:</span>
          <span className={styles.valueDefault}>{config.appName || 'Not set'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Chains:</span>
          <span className={styles.valueDefault}>{config.chains?.join(', ') || 'None'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Wallets:</span>
          <span className={styles.valueDefault}>{config.wallets?.join(', ') || 'None'}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Debug Mode:</span>
          <span className={styles.valueDefault}>{config.debug ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Demonstrates store access patterns and state management
 */
export function StoreAccessDemo() {
  const { client, isInitializing } = useWalletMeshContext();
  const { address, chain, chainType, isConnected } = useAccount();
  const config = useConfig();
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = config;

  const [storeSnapshot, setStoreSnapshot] = useState<StoreSnapshot | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  // const [customStateKey, setCustomStateKey] = useState('');
  // const [customStateValue, setCustomStateValue] = useState('');

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  const captureStoreSnapshot = useCallback(() => {
    if (!client || isInitializing) {
      addLog('Client not initialized');
      return;
    }

    try {
      // Access store state through context
      const snapshot = {
        timestamp: new Date().toISOString(),
        connection: {
          isConnected,
          address: address ?? undefined,
          chainId: chain?.chainId ?? undefined,
          chainType: chainType ?? undefined,
        },
        modal: {
          isOpen: isModalOpen,
        },
        config: config
          ? {
              appName: config.appName,
              chains: config.chains?.map((chain) => chain.toString()),
              wallets: config.wallets?.map((wallet) => wallet.name),
            }
          : null,
        client: {
          isInitialized: !isInitializing,
          hasServices: !!client.getServices,
        },
      };

      setStoreSnapshot(snapshot);
      addLog('Store snapshot captured successfully');
    } catch (error) {
      addLog(`Error capturing store snapshot: ${(error as Error).message}`);
    }
  }, [client, isInitializing, isConnected, address, chain, chainType, isModalOpen, config, addLog]);

  const inspectClientServices = () => {
    if (!client || isInitializing) {
      addLog('Client not initialized');
      return;
    }

    try {
      const services = client.getServices?.();
      if (services) {
        const serviceNames = Object.keys(services);
        addLog(`Available services: ${serviceNames.join(', ')}`);

        for (const serviceName of serviceNames) {
          const service = services[serviceName as keyof typeof services];
          addLog(
            `Service "${serviceName}": ${typeof service} with ${Object.keys(service || {}).length} properties`,
          );
        }
      } else {
        addLog('No services available');
      }
    } catch (error) {
      addLog(`Error inspecting services: ${(error as Error).message}`);
    }
  };

  const testModalInteraction = () => {
    if (isModalOpen) {
      closeModal();
      addLog('Modal closed via store action');
    } else {
      openModal();
      addLog('Modal opened via store action');
    }
  };

  const inspectConfiguration = () => {
    if (!config) {
      addLog('No configuration available');
      return;
    }

    try {
      const configInfo = {
        appName: config.appName,
        appDescription: config.appDescription,
        appUrl: config.appUrl,
        chains: config.chains,
        wallets: config.wallets,
        debug: config.debug,
      };

      addLog(`Configuration: ${JSON.stringify(configInfo, null, 2)}`);
    } catch (error) {
      addLog(`Error inspecting configuration: ${(error as Error).message}`);
    }
  };

  const testStateObservation = () => {
    addLog('Testing state observation patterns...');

    // Simulate watching for state changes
    let changeCount = 0;
    const interval = setInterval(() => {
      changeCount++;
      addLog(
        `State observation tick ${changeCount}: connected=${isConnected}, address=${address?.slice(0, 8)}...`,
      );

      if (changeCount >= 3) {
        clearInterval(interval);
        addLog('State observation test completed');
      }
    }, 1000);
  };

  const debugStoreAccess = () => {
    addLog('Debugging store access patterns...');

    // Test various store access methods
    const accessTests = [
      () => isConnected !== undefined,
      () => typeof address === 'string' || address === undefined,
      () => typeof chain?.chainId === 'string' || chain?.chainId === undefined,
      () => [ChainType.Evm, ChainType.Solana, ChainType.Aztec, null].includes(chainType),
      () => typeof isModalOpen === 'boolean',
    ];

    accessTests.forEach((test, index) => {
      try {
        const result = test();
        addLog(`Store access test ${index + 1}: ${result ? 'PASS' : 'FAIL'}`);
      } catch (error) {
        addLog(`Store access test ${index + 1}: ERROR - ${(error as Error).message}`);
      }
    });
  };

  return (
    <div className={styles.demoCard}>
      <h3 className={styles.demoTitle}>🗄️ Store Access</h3>

      <div className={styles.section}>
        <h4>Current Store State</h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Client Initialized:</span>
            <span className={!isInitializing ? styles.valueSuccess : styles.valueError}>
              {!isInitializing ? 'Yes' : 'No'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Connection Status:</span>
            <span className={isConnected ? styles.valueSuccess : styles.valueError}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Modal State:</span>
            <span className={isModalOpen ? styles.valueWarning : styles.valueDefault}>
              {isModalOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Config Loaded:</span>
            <span className={config ? styles.valueSuccess : styles.valueError}>{config ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Store Inspection</h4>
        <div className={styles.actions}>
          <button type="button" onClick={captureStoreSnapshot} className={styles.button}>
            Capture Store Snapshot
          </button>
          <button type="button" onClick={inspectClientServices} className={styles.button}>
            Inspect Client Services
          </button>
          <button type="button" onClick={inspectConfiguration} className={styles.button}>
            Inspect Configuration
          </button>
          <button type="button" onClick={debugStoreAccess} className={styles.button}>
            Debug Store Access
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Store Interaction</h4>
        <div className={styles.actions}>
          <button type="button" onClick={testModalInteraction} className={styles.button}>
            {isModalOpen ? 'Close Modal' : 'Open Modal'}
          </button>
          <button type="button" onClick={testStateObservation} className={styles.button}>
            Test State Observation
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Store Snapshot</h4>
        <StoreSnapshotDisplay storeSnapshot={storeSnapshot} />
      </div>

      <div className={styles.section}>
        <h4>Configuration</h4>
        <ConfigurationDisplay config={config} />
      </div>

      <div className={styles.logsSection}>
        <h4>Store Access Logs</h4>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <div className={styles.logEmpty}>No store access events yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={`store-log-${Date.now()}-${i}`} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.codeExample}>
        <h4>Hook Usage Examples</h4>
        <pre className={styles.code}>
          {`// Access WalletMesh context and client
const { client, isInitializing } = useWalletMeshContext();

// Access account state from store
const { address, chain, chainType, isConnected } = useAccount();

// Access modal state and controls through useConfig
const { isOpen, open, close } = useConfig();

// Access configuration
const config = useConfig();

// Access client services
if (client && !isInitializing) {
  const services = client.getServices();
  
  // Access specific services
  const connectionManager = services.connectionManager;
  const walletHealth = services.walletHealth;
}

// Monitor store state changes
useEffect(() => {
  console.log('Connection state changed:', { 
    isConnected, 
    address, 
    chainId: chain?.chainId 
  });
}, [isConnected, address, chain]);

// Conditional rendering based on store state
if (isInitializing) {
  return <LoadingSpinner />;
}

if (!isConnected) {
  return <ConnectWallet />;
}

return <WalletConnectedContent />;`}
        </pre>
      </div>
    </div>
  );
}
