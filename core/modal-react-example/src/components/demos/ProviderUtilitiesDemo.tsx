import { ChainType, useAccount, useWalletProvider } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useState } from 'react';
import styles from '../../styles/DemoCard.module.css';

interface ProviderStatusProps {
  chainType: ChainType;
  provider: unknown;
  label: string;
  onTest: (chainType: ChainType) => void;
}

function ProviderStatus({ chainType, provider, label, onTest }: ProviderStatusProps) {
  return (
    <div className={styles.providerStatusCard}>
      <div className={styles.providerHeader}>
        <h5>{label}</h5>
        <span className={provider ? styles.valueSuccess : styles.valueError}>
          {provider ? '✅ Available' : '❌ Not Available'}
        </span>
      </div>
      {Boolean(provider) && (
        <button
          type="button"
          onClick={() => onTest(chainType)}
          className={`${styles.button} ${styles.buttonSmall}`}
        >
          Test Provider
        </button>
      )}
    </div>
  );
}

/**
 * Demonstrates advanced provider usage patterns
 */
export function ProviderUtilitiesDemo() {
  const { isConnected, chainType } = useAccount();
  const { provider: currentProvider, isAvailable: isProviderReady } = useWalletProvider();

  // Note: Individual chain providers not available in current API
  // Using single provider with chain type checking
  const evmProvider = chainType === ChainType.Evm ? currentProvider : null;
  const solanaProvider = chainType === ChainType.Solana ? currentProvider : null;
  const aztecProvider = chainType === ChainType.Aztec ? currentProvider : null;

  // Typed provider is the same as current provider
  const typedProvider = currentProvider;

  const [providerInfo, setProviderInfo] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // Monitor provider readiness
  useEffect(() => {
    if (isProviderReady) {
      addLog('Provider is ready for use');
    } else {
      addLog('Provider is not ready yet');
    }
  }, [isProviderReady, addLog]);

  // Extract provider information
  useEffect(() => {
    if (currentProvider && isProviderReady) {
      try {
        const info: Record<string, unknown> = {
          type: typeof currentProvider,
          hasRequest: currentProvider && typeof currentProvider === 'object' && 'request' in currentProvider,
          hasOn: currentProvider && typeof currentProvider === 'object' && 'on' in currentProvider,
          hasRemoveListener:
            currentProvider && typeof currentProvider === 'object' && 'removeListener' in currentProvider,
        };

        // EVM provider specific
        if (
          chainType === ChainType.Evm &&
          currentProvider &&
          typeof currentProvider === 'object' &&
          'request' in currentProvider
        ) {
          info.isEIP1193 = true;
          info.methods = [
            'eth_requestAccounts',
            'eth_accounts',
            'eth_chainId',
            'eth_getBalance',
            'eth_sendTransaction',
            'wallet_switchEthereumChain',
          ];
        }

        // Solana provider specific
        if (chainType === ChainType.Solana) {
          info.isSolana = true;
          if (currentProvider && typeof currentProvider === 'object' && 'connect' in currentProvider) {
            info.hasSolanaConnect = true;
          }
          if (currentProvider && typeof currentProvider === 'object' && 'signMessage' in currentProvider) {
            info.hasSignMessage = true;
          }
        }

        // Aztec provider specific
        if (chainType === ChainType.Aztec) {
          info.isAztec = true;
          if (currentProvider && typeof currentProvider === 'object' && 'getAccounts' in currentProvider) {
            info.hasGetAccounts = true;
          }
        }

        setProviderInfo(info);
        addLog(`Provider information extracted for ${chainType}`);
      } catch (error) {
        addLog(`Error extracting provider info: ${(error as Error).message}`);
        setProviderInfo(null);
      }
    } else {
      setProviderInfo(null);
    }
  }, [currentProvider, isProviderReady, chainType, addLog]);

  const testProviderMethod = async (chainType: ChainType) => {
    addLog(`Testing ${chainType} provider method...`);

    try {
      switch (chainType) {
        case ChainType.Evm:
          if (evmProvider && typeof evmProvider === 'object' && 'request' in evmProvider) {
            const evmTypedProvider = evmProvider as {
              request: (args: { method: string }) => Promise<string[]>;
            };
            const accounts = await evmTypedProvider.request({ method: 'eth_accounts' });
            addLog(`EVM accounts: ${JSON.stringify(accounts)}`);
          } else {
            addLog('EVM provider not available or not EIP1193 compatible');
          }
          break;

        case ChainType.Solana:
          if (solanaProvider && typeof solanaProvider === 'object' && 'publicKey' in solanaProvider) {
            const solanaTypedProvider = solanaProvider as { publicKey: { toString: () => string } | null };
            const publicKey = solanaTypedProvider.publicKey;
            addLog(`Solana public key: ${publicKey?.toString() || 'Not connected'}`);
          } else {
            addLog('Solana provider not available');
          }
          break;

        case ChainType.Aztec:
          if (aztecProvider && typeof aztecProvider === 'object' && 'getAccounts' in aztecProvider) {
            const aztecTypedProvider = aztecProvider as { getAccounts: () => Promise<unknown[]> };
            const accounts = await aztecTypedProvider.getAccounts();
            addLog(`Aztec accounts: ${accounts.length} found`);
          } else {
            addLog('Aztec provider not available');
          }
          break;

        default:
          addLog(`Unknown chain type: ${chainType}`);
      }
    } catch (error) {
      addLog(`Provider method test failed: ${(error as Error).message}`);
    }
  };

  const checkProviderCapabilities = () => {
    addLog('Checking provider capabilities...');

    if (!currentProvider) {
      addLog('No provider available');
      return;
    }

    const capabilities = {
      canSign: false,
      canSendTransaction: false,
      canSwitchChain: false,
      hasEvents: false,
    };

    try {
      // Check for signing capabilities
      if (
        currentProvider &&
        typeof currentProvider === 'object' &&
        ('request' in currentProvider || 'signMessage' in currentProvider)
      ) {
        capabilities.canSign = true;
      }

      // Check for transaction capabilities
      if (
        currentProvider &&
        typeof currentProvider === 'object' &&
        ('request' in currentProvider || 'sendTransaction' in currentProvider)
      ) {
        capabilities.canSendTransaction = true;
      }

      // Check for chain switching
      if (currentProvider && typeof currentProvider === 'object' && 'request' in currentProvider) {
        capabilities.canSwitchChain = true;
      }

      // Check for event support
      if (currentProvider && typeof currentProvider === 'object' && 'on' in currentProvider) {
        capabilities.hasEvents = true;
      }

      addLog(`Capabilities: ${JSON.stringify(capabilities, null, 2)}`);
    } catch (error) {
      addLog(`Error checking capabilities: ${(error as Error).message}`);
    }
  };

  return (
    <div className={styles.demoCard}>
      <h3 className={styles.demoTitle}>🔌 Provider Utilities</h3>

      <div className={styles.section}>
        <h4>Provider Status</h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Connected:</span>
            <span className={isConnected ? styles.valueSuccess : styles.valueError}>
              {isConnected ? 'Yes' : 'No'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Provider Ready:</span>
            <span className={isProviderReady ? styles.valueSuccess : styles.valueWarning}>
              {isProviderReady ? 'Yes' : 'Initializing...'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Current Chain:</span>
            <span className={styles.valueDefault}>{chainType || 'None'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Typed Provider:</span>
            <span className={typedProvider ? styles.valueSuccess : styles.valueError}>
              {typedProvider ? 'Available' : 'Not Available'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h4>Chain-Specific Providers</h4>
        <div className={styles.providerGrid}>
          <ProviderStatus
            chainType={ChainType.Evm}
            provider={evmProvider}
            label="EVM Provider"
            onTest={testProviderMethod}
          />
          <ProviderStatus
            chainType={ChainType.Solana}
            provider={solanaProvider}
            label="Solana Provider"
            onTest={testProviderMethod}
          />
          <ProviderStatus
            chainType={ChainType.Aztec}
            provider={aztecProvider}
            label="Aztec Provider"
            onTest={testProviderMethod}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4>Provider Information</h4>
        {providerInfo ? (
          <div className={styles.providerInfoCard}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Type:</span>
                <span className={styles.valueDefault}>{String(providerInfo.type)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Has Request Method:</span>
                <span className={providerInfo.hasRequest ? styles.valueSuccess : styles.valueError}>
                  {providerInfo.hasRequest ? 'Yes' : 'No'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Has Event Support:</span>
                <span className={providerInfo.hasOn ? styles.valueSuccess : styles.valueError}>
                  {providerInfo.hasOn ? 'Yes' : 'No'}
                </span>
              </div>
              {Boolean(providerInfo.isEIP1193) && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>EIP-1193 Compatible:</span>
                  <span className={styles.valueSuccess}>Yes</span>
                </div>
              )}
              {Boolean(providerInfo.isSolana) && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Solana Wallet:</span>
                  <span className={styles.valueSuccess}>Yes</span>
                </div>
              )}
              {Boolean(providerInfo.isAztec) && (
                <div className={styles.infoItem}>
                  <span className={styles.label}>Aztec Wallet:</span>
                  <span className={styles.valueSuccess}>Yes</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.infoBox}>
            {isConnected
              ? 'Provider information will appear when ready...'
              : 'Connect a wallet to see provider information'}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          onClick={checkProviderCapabilities}
          disabled={!currentProvider || !isProviderReady}
          className={styles.button}
        >
          Check Capabilities
        </button>
      </div>

      <div className={styles.logsSection}>
        <h4>Provider Logs</h4>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <div className={styles.logEmpty}>No provider events yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={`provider-log-${Date.now()}-${i}`} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.codeExample}>
        <h4>Hook Usage</h4>
        <pre className={styles.code}>
          {`// Check provider readiness
const isProviderReady = useIsProviderReady();

// Get providers for specific chain types
const evmProvider = useProviderForChainType('evm');
const solanaProvider = useProviderForChainType('solana');
const aztecProvider = useProviderForChainType('aztec');

// Get typed provider with automatic inference
const typedProvider = useTypedProvider();

// Use provider methods safely
if (isProviderReady && evmProvider) {
  const accounts = await evmProvider.request({
    method: 'eth_accounts'
  });
}

// Type-safe provider usage
if (typedProvider && chainType === 'evm') {
  // TypeScript knows this is an EVM provider
  const balance = await typedProvider.request({
    method: 'eth_getBalance',
    params: [address, 'latest']
  });
}`}
        </pre>
      </div>
    </div>
  );
}
