import { getInitialTestAccounts } from '@aztec/accounts/testing';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
import { CounterContractArtifact } from '@aztec/noir-test-contracts.js/Counter';
import {
  AztecConnectButton,
  AztecWalletReady,
  useAztecBatch,
  useAztecContract,
  useAztecDeploy,
  useAztecTransaction,
  useAztecWallet,
} from '@walletmesh/modal-react/aztec';
import type React from 'react';
import { useToast } from '../contexts/ToastContext.js';

// Type definitions for contract methods
interface TokenContract {
  methods: {
    mint_to_public: (address: unknown, amount: bigint) => Promise<unknown>;
    transfer_in_public: (from: unknown, to: string, amount: bigint, nonce: bigint) => Promise<unknown>;
    balance_of_public: (address: unknown) => Promise<unknown>;
  };
}

interface CounterContract {
  methods: {
    increment: (address: unknown, by: unknown) => any;
    get_counter: (address: unknown) => any;
  };
}


/**
 * DApp component for the Aztec example application demonstrating
 * the improved developer experience with new hooks and components.
 */
const DApp: React.FC = () => {
  const { showError, showSuccess, showInfo } = useToast();

  // State for wallet connection and account details
  const [wallet, setWallet] = useState<AztecDappWallet | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // State for Token contract
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [counterValue, setCounterValue] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<AztecAddress | null>(null);
  const [counterAddress, setCounterAddress] = useState<AztecAddress | null>(null);

  // Loading states
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeployingToken, setIsDeployingToken] = useState(false);
  const [isDeployingCounter, setIsDeployingCounter] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [isIncrementingTwice, setIsIncrementingTwice] = useState(false);
  const [isGettingCounter, setIsGettingCounter] = useState(false);

  /** Ref to the AztecRouterProvider instance. */
  const providerRef = useRef<AztecRouterProvider | null>(null);
  /** Ref to the wallet window. */
  const walletWindowRef = useRef<Window | null>(null);
  /** Ref to the transport cleanup function. */
  const transportCleanupRef = useRef<(() => void) | null>(null);

  /**
   * Connects the DApp to the Aztec wallet via WalletMesh.
   * Opens the wallet in a new window and sets up cross-window communication.
   */
  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      // Open wallet in a new window
      // Use environment variable or fallback to localhost for development
      const walletOrigin = import.meta.env.VITE_WALLET_URL || 'http://localhost:5174';

      // Set up the message listener BEFORE opening the window to avoid race conditions
      let handleReady: ((event: MessageEvent) => void) | null = null;
      let timeout: NodeJS.Timeout | null = null;

      const walletReadyPromise = new Promise<void>((resolve, reject) => {
        timeout = setTimeout(() => {
          if (handleReady) {
            window.removeEventListener('message', handleReady);
          }
          reject(new Error('Wallet window took too long to respond'));
        }, 30000); // 30 second timeout

        handleReady = (event: MessageEvent) => {
          if (event.origin === walletOrigin && event.data?.type === 'wallet_ready') {
            if (timeout) clearTimeout(timeout);
            window.removeEventListener('message', handleReady!);
            resolve();
          }
        };

        window.addEventListener('message', handleReady);
      });

      // Now open the wallet window
      const walletWindow = window.open(walletOrigin, 'walletMeshWallet', 'width=800,height=600');

      if (!walletWindow) {
        // Clean up the event listener if window open fails
        if (handleReady) {
          window.removeEventListener('message', handleReady);
        }
        if (timeout) clearTimeout(timeout);
        throw new Error('Failed to open wallet window. Please check your popup blocker.');
      }

      walletWindowRef.current = walletWindow;

      // Wait for wallet window to be ready
      await walletReadyPromise;

      // Create cross-window transport
      const transport = createDappToWalletTransport(walletWindow, walletOrigin);

      // Store cleanup function
      transportCleanupRef.current = () => {
        if ('cleanup' in transport && typeof transport.cleanup === 'function') {
          transport.cleanup();
        }
      };

      // Create provider with Aztec serialization support
      const provider = new AztecRouterProvider(transport);
      providerRef.current = provider;

      // Connect using the helper that returns an initialized wallet
      const { wallet: newWallet } = await connectAztec(provider, 'aztec:31337');

      setIsConnected(true);
      setWallet(newWallet);

      // Get the address (should be cached from initialization)
      const accountAddress = newWallet.getAddress();

      // Defensive string conversion to handle any edge cases
      const addressString = typeof accountAddress === 'string'
        ? accountAddress
        : (accountAddress?.toString?.() ?? String(accountAddress));

      setAccount(addressString);
      showSuccess('Wallet connected successfully!');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      showError(`Failed to connect wallet: ${error.message}`);
      setIsConnected(false);
      setWallet(null);
      setAccount('');
      transportCleanupRef.current?.();
      walletWindowRef.current?.close();
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnects the wallet and closes the wallet window.
   */
  const disconnectWallet = () => {
    setIsConnected(false);
    setWallet(null);
    setAccount('');
    transportCleanupRef.current?.();
    walletWindowRef.current?.close();
    walletWindowRef.current = null;
    showInfo('Wallet disconnected');
  };

  /**
   * Deploys the TokenContractArtifact to the Aztec network using the connected wallet.
   * Updates component state with the deployed token contract's address.
   */
  const deployToken = async () => {
    if (wallet) {
      setIsDeployingToken(true);
      try {
        const ownerAddress = await wallet.getAddress();

        const deploySentTx = await wallet.deployContract(TokenContractArtifact, [ownerAddress, 'TokenName', 'TKN', 18]);
        // const deploySentTx = await Contract.deploy(wallet, TokenContractArtifact, [ownerAddress, 'TokenName', 'TKN', 18]).send();;

        const token = await deploySentTx.deployed();
        setTokenAddress(token.address);
        showSuccess(`Token deployed at ${token.address.toString()}`);
      }
      catch (error: any) {
        console.error('Token deployment failed:', error);
        showError(`Token deployment failed: ${error.message}`);
      } finally {
        setIsDeployingToken(false);
      }
    } else {
      showError('Please connect a wallet first.');
    }
  };

  /**
   * Deploys the CounterContractArtifact to the Aztec network.
   * Updates component state with the deployed counter contract's address.
   */
  const deployCounter = async () => {
    if (wallet) {
      setIsDeployingCounter(true);
      try {
        const ownerAddress = await wallet.getAddress();
        const deploySentTx = await Contract.deploy(wallet, CounterContractArtifact, [0, ownerAddress]).send({ from: ownerAddress });
        const counter = await deploySentTx.deployed();
        setCounterAddress(counter.address);
        showSuccess(`Counter deployed at ${counter.address.toString()}`);
      } catch (error: any) {
        showError(`Counter deployment failed: ${error.message}`);
        console.error('Counter deployment failed:', error);
      } finally {
        setIsDeployingCounter(false);
      }
    } else {
      showError('Please connect a wallet first.');
    }
  };

  /**
   * Mints tokens to the connected account using the deployed Token contract.
   */
  const mintTokens = async () => {
    if (wallet && tokenAddress) {
      setIsMinting(true);
      try {
        const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
        const interaction = tokenContract.methods.mint_to_public(account, 10000000000000000000000n);
        const sentTx = await wallet.wmExecuteTx(interaction);
        const receipt = await sentTx.wait();
        if (receipt.status !== TxStatus.SUCCESS) {
          showError(`Minting failed: ${receipt.error}`);
          throw new Error(`Minting failed: ${receipt.error}`);
        }
        showSuccess('Tokens minted successfully');
      } catch (error: any) {
        console.error('Mint transaction failed:', error);
        showError(`Transaction failed: ${error.message}`);
      } finally {
        setIsMinting(false);
      }
    } else {
      showError('Please deploy a token contract first.');
    }
  };

  /**
   * Transfers tokens from the connected account to a test account.
   */
  const transferTokens = async () => {
    if (wallet && tokenAddress) {
      setIsTransferring(true);
      try {
        const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
        const to = await getInitialTestAccounts().then(accounts => accounts[1].address);
        const interaction = tokenContract.methods.transfer_in_public(account, to.toString(), 100000n, 0n);
        const sentTx = await wallet.wmExecuteTx(interaction);
        const receipt = await sentTx.wait();
        if (receipt.status != TxStatus.SUCCESS) {
          throw new Error(`Transfer failed: ${receipt.error}`);
        }
        showSuccess(`Transferred tokens to ${to.toString()}`);
      } catch (error: any) {
        showError(`Transaction failed: ${error.message}`);
      } finally {
        setIsTransferring(false);
      }
    } else {
      showError('Please deploy a token contract first.');
    }
  };

  /**
   * Checks and displays the token balance of the connected account.
   */
  const checkTokenBalance = async () => {
    if (wallet && tokenAddress) {
      setIsCheckingBalance(true);
      try {
        const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
        // TODO(twt): Switch to using `wallet.wmSimulateTx` once it returns a higher-level result
        const balance = await tokenContract.methods.balance_of_public(account).simulate({ from: wallet.getAddress() });
        setTokenBalance(balance.toString());
        showInfo(`Token balance: ${balance.toString()}`);
      } catch (error: any) {
        showError(`Simulation failed: ${error.message}`);
      } finally {
        setIsCheckingBalance(false);
      }
    } else {
      showError('Please deploy a token contract first.');
    }
  };

  /**
   * Increments the value in the deployed Counter contract.
   */
  const incrementCounter = async () => {
    if (wallet && counterAddress) {
      setIsIncrementing(true);
      try {
        const counterContract = await Contract.at(counterAddress, CounterContractArtifact, wallet);
        const tx = await counterContract.methods.increment(account, account).send({ from: wallet.getAddress() });
        await tx.wait();
        showSuccess('Counter incremented');
      } catch (error: any) {
        showError(`Transaction failed: ${error.message}`);
      } finally {
        setIsIncrementing(false);
      }
    } else {
      showError('Please deploy a counter contract first.');
    }
  };

  /**
   * Increments the Counter contract value twice in two separate transactions.
   */
  const incrementCounterTwice = async () => {
    if (wallet && counterAddress) {
      setIsIncrementingTwice(true);
      try {
        const counterContract = await Contract.at(counterAddress, CounterContractArtifact, wallet);
        // Execute two increments in sequence
        const tx1 = await counterContract.methods.increment(account, account).send({ from: wallet.getAddress() });
        await tx1.wait();
        const tx2 = await counterContract.methods.increment(account, account).send({ from: wallet.getAddress() });
        await tx2.wait();
        showSuccess('Counter incremented twice');
      } catch (error: any) {
        showError(`Transaction failed: ${error.message}`);
      } finally {
        setIsIncrementingTwice(false);
      }
    } else {
      showError('Please deploy a counter contract first.');
    }
  }

  /**
   * Retrieves and displays the current value from the Counter contract.
   */
  const getCounter = async () => {
    if (wallet && counterAddress) {
      setIsGettingCounter(true);
      try {
        const counterContract = await Contract.at(counterAddress, CounterContractArtifact, wallet);
        const value = await counterContract.methods.get_counter(account).simulate({ from: wallet.getAddress() });
        setCounterValue(value.toString());
        showInfo(`Counter value: ${value.toString()}`);
      } catch (error: any) {
        showError(`Simulation failed: ${error.message}`);
      } finally {
        setIsGettingCounter(false);
      }
    } else {
      showError('Please deploy a counter contract first.');
    }
  };

  // Helper to get status message for deployments
  const getDeploymentStatus = (stage: string) => {
    switch (stage) {
      case 'preparing':
        return '📝 Preparing...';
      case 'computing':
        return '🔢 Computing address...';
      case 'proving':
        return '🔐 Generating proof...';
      case 'sending':
        return '📤 Sending...';
      case 'confirming':
        return '⏳ Confirming...';
      case 'success':
        return '✅ Deployed!';
      case 'error':
        return '❌ Failed';
      default:
        return '';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <AztecConnectButton showProvingStatus={true} size="lg" variant="primary" />
      </div>

      {/* Use AztecWalletReady to handle wallet connection states */}
      <AztecWalletReady
        fallback={<p>Please connect your Aztec wallet to interact with contracts</p>}
        connectingFallback={<p>🔄 Initializing Aztec wallet...</p>}
        errorFallback={(error: any) => <p style={{ color: 'red' }}>Error: {error.message}</p>}
      >
        <div>
          {/* Show proving progress when transaction is in progress */}
          {txStatus === 'proving' && (
            <div
              style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}
            >
              <p>🔐 Generating zero-knowledge proof...</p>
              <progress value={provingProgress} max={100} style={{ width: '100%' }} />
            </div>
          )}

          {/* Show batch progress when batch is executing */}
          {isBatchExecuting && (
            <div
              style={{ marginBottom: '20px', padding: '10px', background: '#e0f7fa', borderRadius: '5px' }}
            >
              <p>⚡ Executing batch transactions...</p>
              <progress value={batchProgress} max={100} style={{ width: '100%' }} />
              <p style={{ fontSize: '0.9em', marginTop: '5px' }}>{batchProgress}% complete</p>
            </div>
          )}

          {/* Token Contract Section */}
          <div
            style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          >
            <h3>Token Contract</h3>

            {!tokenAddress ? (
              <button type="button" onClick={handleDeployToken} disabled={isDeployingToken}>
                {isDeployingToken ? getDeploymentStatus(tokenStage) : 'Deploy Token Contract'}
              </button>
            ) : (
              <>
                <p>Contract Address: {tokenAddress.toString()}</p>


                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleMintTokens}
                    disabled={txStatus !== 'idle' && txStatus !== 'success' && txStatus !== 'error'}
                  >
                    Mint Tokens
                  </button>
                  <button
                    type="button"
                    onClick={handleTransferTokens}
                    style={{ marginLeft: '5px' }}
                    disabled={txStatus !== 'idle' && txStatus !== 'success' && txStatus !== 'error'}
                  >
                    Transfer Tokens
                  </button>
                  <button
                    type="button"
                    onClick={handleGetTokenBalance}
                    style={{ marginLeft: '5px' }}
                    disabled={tokenContract.isLoading}
                  >
                    Get Token Balance
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Counter Contract Section */}
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>Counter Contract</h3>

            {!counterAddress ? (
              <button type="button" onClick={handleDeployCounter} disabled={isDeployingCounter}>
                {isDeployingCounter ? getDeploymentStatus(counterStage) : 'Deploy Counter Contract'}
              </button>
            ) : (
              <>
                <p>Contract Address: {counterAddress.toString()}</p>
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleIncrementCounter}
                    style={{
                      marginRight: '5px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    disabled={txStatus !== 'idle' && txStatus !== 'success' && txStatus !== 'error' || isBatchExecuting}
                  >
                    Increment Counter
                  </button>
                  <button
                    type="button"
                    onClick={handleIncrementCounterTwice}
                    style={{
                      marginRight: '5px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    disabled={txStatus !== 'idle' && txStatus !== 'success' && txStatus !== 'error' || isBatchExecuting}
                  >
                    Increment Twice
                  </button>
                  <button
                    type="button"
                    onClick={handleGetCounter}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    disabled={counterContract.isLoading}
                  >
                    Get Counter Value
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </AztecWalletReady>
    </div>
  );
};

export default DApp;
