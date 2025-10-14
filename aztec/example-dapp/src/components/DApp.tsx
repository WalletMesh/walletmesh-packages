import { getInitialTestAccounts } from '@aztec/accounts/testing';
import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';
import { CounterContractArtifact } from '@aztec/noir-test-contracts.js/Counter';
import {
  AztecConnectButton,
  AztecWalletReady,
  useAccount,
  useAztecBatch,
  useAztecContract,
  useAztecDeploy,
  useAztecAddress,
  useAztecSimulation,
  useAztecWallet,
  useAztecTransaction,
  getDeploymentStageLabel,
} from '@walletmesh/modal-react/aztec';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext.js';

/**
 * DApp component for the Aztec example application demonstrating
 * the improved developer experience with modal-react hooks.
 */
const DApp: React.FC = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const externalAztecRpcUrl =
    import.meta.env?.VITE_AZTEC_RPC_URL || 'https://sandbox.aztec.walletmesh.com/api/v1/public';

  // Use modal-react hooks for wallet management
  const { aztecWallet } = useAztecWallet();
  const { address } = useAccount();

  // Use simulation hook for contract calls
  const { simulate: simulateInteraction } = useAztecSimulation();

  // Use Aztec-specific hooks for deployment
  const {
    deploy: deployToken,
    isDeploying: isDeployingToken,
    stage: tokenStage,
    deployedAddress: tokenAddress,
  } = useAztecDeploy();

  const {
    deploy: deployCounter,
    isDeploying: isDeployingCounter,
    stage: counterStage,
    deployedAddress: counterAddress,
  } = useAztecDeploy();

  const { executeBatch, isExecuting: isBatchExecuting, progress: batchProgress } = useAztecBatch();
  const { toAztecAddress, toAddressString } = useAztecAddress();
  const {
    executeSync,
    execute: executeAsync,
    activeTransaction,
    backgroundTransactions,
  } = useAztecTransaction();

  // Use contract hooks for Token and Counter contracts
  const {
    contract: tokenContract,
    isLoading: isTokenContractLoading,
    error: tokenContractError,
  } = useAztecContract<any>(tokenAddress, tokenAddress ? (TokenContractArtifact as any) : null);

  const {
    contract: counterContract,
    isLoading: isCounterContractLoading,
    error: counterContractError,
  } = useAztecContract<any>(counterAddress, counterAddress ? (CounterContractArtifact as any) : null);

  // State for UI display and transaction status
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [isRefreshingBalance, setIsRefreshingBalance] = useState<boolean>(false);
  const [counterValue, setCounterValue] = useState<string>('');
  const [isFetchingCounterValue, setIsFetchingCounterValue] = useState<boolean>(false);

  // Derive transaction execution state from the hook
  const isMintExecuting =
    activeTransaction?.status === 'simulating' ||
    activeTransaction?.status === 'proving' ||
    activeTransaction?.status === 'sending';
  const hasBackgroundTransactions = backgroundTransactions.length > 0;

  const simulateUsingExternalRpc = useCallback(
    async <T,>(
      contractAddress: string,
      artifact: unknown,
      methodName: string,
      args: unknown[],
    ): Promise<T> => {
      if (!externalAztecRpcUrl) {
        throw new Error('External RPC URL not configured');
      }

      const aztec = await import('@aztec/aztec.js');
      const accounts = await import('@aztec/accounts/testing');
      const pxe = aztec.createPXEClient(externalAztecRpcUrl);

      // Get a test wallet for simulation purposes
      const wallets = await accounts.getDeployedTestAccountsWallets(pxe);
      if (wallets.length === 0) {
        throw new Error('No test accounts found on the external RPC');
      }
      const testWallet = wallets[0];

      const address = aztec.AztecAddress.fromString(contractAddress);
      const contract = await aztec.Contract.at(address, artifact as any, testWallet);
      const method = (contract.methods as Record<string, (...methodArgs: unknown[]) => unknown>)[methodName];
      if (typeof method !== 'function') {
        throw new Error(`Method ${methodName} not found on contract`);
      }
      const interaction = method(...args) as { simulate: () => Promise<T> };
      return await interaction.simulate();
    },
    [externalAztecRpcUrl],
  );

  const refreshTokenBalance = useCallback(async (): Promise<string | null> => {
    if (!tokenContract || !address || !tokenAddress) {
      setTokenBalance('');
      return null;
    }

    const ownerAddressHex = toAddressString(address);

    const fallbackSimulation = async () => {
      const balance = await simulateInteraction(tokenContract.methods.balance_of_public(ownerAddressHex));
      const balanceStr = String(balance);
      setTokenBalance(balanceStr);
      return balanceStr;
    };

    setIsRefreshingBalance(true);
    try {
      if (externalAztecRpcUrl) {
        try {
          const balance = await simulateUsingExternalRpc<unknown>(
            tokenAddress.toString(),
            TokenContractArtifact,
            'balance_of_public',
            [ownerAddressHex],
          );
          const balanceStr =
            balance !== null && typeof (balance as any)?.toString === 'function'
              ? (balance as any).toString()
              : String(balance);
          setTokenBalance(balanceStr);
          return balanceStr;
        } catch (error) {
          console.warn('[DApp] External RPC balance fetch failed, falling back to wallet RPC', error);
          return await fallbackSimulation();
        }
      }

      return await fallbackSimulation();
    } catch (error) {
      console.warn('[DApp] Failed to refresh token balance', error);
      setTokenBalance('0');
      return '0';
    } finally {
      setIsRefreshingBalance(false);
    }
  }, [
    tokenContract,
    tokenAddress,
    address,
    simulateInteraction,
    toAddressString,
    externalAztecRpcUrl,
    simulateUsingExternalRpc,
  ]);

  useEffect(() => {
    if (!tokenAddress) {
      setTokenBalance('');
    }
  }, [tokenAddress]);

  useEffect(() => {
    if (!counterAddress) {
      setCounterValue('');
    }
  }, [counterAddress]);

  /**
   * Deploys the TokenContractArtifact to the Aztec network using the connected wallet.
   */
  const handleDeployToken = async () => {
    if (!aztecWallet || !address) {
      showError('Please connect a wallet first.');
      return;
    }

    try {
      // Hook now handles artifact compatibility internally
      await deployToken(TokenContractArtifact as any, [address, 'TokenName', 'TKN', 18], {
        onSuccess: (deployedAddress) => {
          showSuccess(`Token deployed at ${deployedAddress.toString()}`);
          setTokenBalance('');
        },
        onError: (error) => {
          showError(`Token deployment failed: ${error.message}`);
        },
      });
    } catch (error) {
      console.error('Token deployment failed:', error);
      if (error instanceof Error) {
        showError(`Token deployment failed: ${error.message}`);
      }
    }
  };

  /**
   * Deploys the CounterContractArtifact to the Aztec network.
   */
  const handleDeployCounter = async () => {
    if (!aztecWallet || !address) {
      showError('Please connect a wallet first.');
      return;
    }

    try {
      // Hook now handles artifact compatibility internally
      await deployCounter(CounterContractArtifact as any, [0, address], {
        onSuccess: (deployedAddress) => {
          showSuccess(`Counter deployed at ${deployedAddress.toString()}`);
        },
        onError: (error) => {
          showError(`Counter deployment failed: ${error.message}`);
        },
      });
    } catch (error) {
      console.error('Counter deployment failed:', error);
      if (error instanceof Error) {
        showError(`Counter deployment failed: ${error.message}`);
      }
    }
  };

  /**
   * Mints tokens to the connected account using the deployed Token contract.
   * Uses sync mode (blocking with overlay).
   */
<<<<<<< HEAD
  const mintTokens = async () => {
    if (wallet && tokenAddress) {
      setIsMinting(true);
      try {
        const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
        const tx = tokenContract.methods.mint_to_public(account, 10000000000000000000000n).send({ from: wallet.getAddress() });
        const receipt = await tx.wait();
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
=======
  const handleMintTokens = async () => {
    if (!aztecWallet || !tokenContract || !address) {
>>>>>>> ebf6afe2 (fix(aztec-rpc-wallet): add missing scopes parameter to simulateUtility method)
      showError('Please deploy a token contract first.');
      return;
    }

    try {
      showInfo('Minting tokens, please wait for confirmation...');
      const ownerAddress = toAztecAddress(address);
      const ownerAddressHex = ownerAddress.toString();
      const interaction = tokenContract.methods.mint_to_public(ownerAddressHex, 10000000000000000000000n);

      // Use executeSync for blocking behavior with overlay
      await executeSync(interaction);

      // Automatically refresh balance after successful mint
      await refreshTokenBalance();

      showSuccess('Tokens minted successfully! You can now transfer them.');
    } catch (error) {
      console.error('Mint transaction failed:', error);
      if (error instanceof Error) {
        showError(`Transaction failed: ${error.message}`);
      }
    }
  };

  /**
   * Transfers tokens from the connected account to a test account.
   * Uses async mode (background execution with callbacks).
   */
<<<<<<< HEAD
  const transferTokens = async () => {
    if (wallet && tokenAddress) {
      setIsTransferring(true);
      try {
        const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
        const to = await getInitialTestAccounts().then(accounts => accounts[1].address);
        const tx = tokenContract.methods.transfer_in_public(account, to.toString(), 100000n, 0n).send({ from: wallet.getAddress() });
        const receipt = await tx.wait();
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
=======
  const handleTransferTokens = async () => {
    if (!aztecWallet || !tokenContract || !address) {
>>>>>>> ebf6afe2 (fix(aztec-rpc-wallet): add missing scopes parameter to simulateUtility method)
      showError('Please deploy a token contract first.');
      return;
    }

    if (!tokenBalance || tokenBalance === '0') {
      showInfo('Mint some tokens before transferring.');
      return;
    }

    try {
      const to = await getInitialTestAccounts().then((accounts) => toAztecAddress(accounts[1].address));
      const ownerAddress = toAztecAddress(address);
      const interaction = tokenContract.methods.transfer_in_public(
        ownerAddress.toString(),
        to.toString(),
        100000n,
        0n,
      );

      // Use executeAsync for background execution
      await executeAsync(interaction, {
        onSuccess: () => {
          showSuccess('Transferred tokens to test account');
        },
        onError: (error) => {
          showError(`Transaction failed: ${error.message}`);
        },
      });

      showInfo('Transfer started in background. Check the indicator for progress.');
    } catch (error) {
      if (error instanceof Error) {
        showError(`Transaction failed: ${error.message}`);
      }
    }
  };

  /**
   * Checks and displays the token balance of the connected account.
   */
<<<<<<< HEAD
  const checkTokenBalance = async () => {
    if (wallet && tokenAddress) {
      setIsCheckingBalance(true);
      try {
        const tokenContract = await Contract.at(tokenAddress, TokenContractArtifact, wallet);
        const balance = await tokenContract.methods.balance_of_public(account).simulate({ from: wallet.getAddress() });
        setTokenBalance(balance.toString());
        showInfo(`Token balance: ${balance.toString()}`);
      } catch (error: any) {
        showError(`Simulation failed: ${error.message}`);
      } finally {
        setIsCheckingBalance(false);
      }
    } else {
=======
  const handleGetTokenBalance = async () => {
    if (!aztecWallet || !tokenContract || !address) {
>>>>>>> ebf6afe2 (fix(aztec-rpc-wallet): add missing scopes parameter to simulateUtility method)
      showError('Please deploy a token contract first.');
      return;
    }

    try {
      showInfo('Checking token balance...');
      const balance = await refreshTokenBalance();
      if (balance !== null) {
        showInfo(`Token balance: ${balance}`);
      }
    } catch (error) {
      console.error('[DApp] Balance check failed:', error);
      showError(`Failed to check balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Increments the value in the deployed Counter contract.
   * Uses async mode (background execution with callbacks).
   */
  const handleIncrementCounter = async () => {
    if (!aztecWallet || !counterContract || !address) {
      showError('Please deploy a counter contract first.');
      return;
    }

    try {
      const ownerAddress = toAztecAddress(address);
      const interaction = counterContract.methods.increment(ownerAddress.toString(), ownerAddress.toString());

      // Use executeAsync for background execution
      await executeAsync(interaction, {
        onSuccess: () => {
          showSuccess('Counter incremented');
        },
        onError: (error) => {
          showError(`Transaction failed: ${error.message}`);
        },
      });

      showInfo('Counter increment started in background. Check the indicator for progress.');
    } catch (error) {
      if (error instanceof Error) {
        showError(`Transaction failed: ${error.message}`);
      }
    }
  };

  /**
   * Increments the Counter contract value twice in a batch transaction.
   */
  const handleIncrementCounterTwice = async () => {
    if (!aztecWallet || !counterContract || !address) {
      showError('Please deploy a counter contract first.');
      return;
    }

    try {
      const ownerAddressHex = toAddressString(address);
      const interactions = [
        counterContract.methods.increment(ownerAddressHex, ownerAddressHex),
        counterContract.methods.increment(ownerAddressHex, ownerAddressHex),
      ];

      await executeBatch(interactions as any);
      showSuccess('Counter incremented twice in batch');
    } catch (error) {
      if (error instanceof Error) {
        showError(`Batch transaction failed: ${error.message}`);
      }
    }
  };

  /**
   * Retrieves and displays the current value from the Counter contract.
   */
  const handleGetCounter = async () => {
    if (!aztecWallet || !counterContract || !counterAddress || !address) {
      showError('Please deploy a counter contract first.');
      return;
    }

    setIsFetchingCounterValue(true);
    try {
      const ownerAddressHex = toAddressString(address);
      let value: unknown;

      if (externalAztecRpcUrl) {
        try {
          value = await simulateUsingExternalRpc<unknown>(
            counterAddress.toString(),
            CounterContractArtifact,
            'get_counter',
            [ownerAddressHex],
          );
        } catch (error) {
          console.warn('[DApp] External RPC counter fetch failed, falling back to wallet RPC', error);
          value = await simulateInteraction(counterContract.methods.get_counter(ownerAddressHex));
        }
      } else {
        value = await simulateInteraction(counterContract.methods.get_counter(ownerAddressHex));
      }

      const valueStr = String(value);
      setCounterValue(valueStr);
      showInfo(`Counter value: ${valueStr}`);
    } catch (error) {
      if (error instanceof Error) {
        showError(`Simulation failed: ${error.message}`);
      }
    } finally {
      setIsFetchingCounterValue(false);
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
        errorFallback={(error: Error) => <p style={{ color: 'red' }}>Error: {error.message}</p>}
      >
        <div>
          {/* Show error states for contracts */}
          {tokenContractError && (
            <div
              style={{ marginBottom: '20px', padding: '10px', background: '#ffebee', borderRadius: '5px' }}
            >
              <p style={{ color: '#c62828' }}>❌ Token contract error: {tokenContractError.message}</p>
            </div>
          )}

          {counterContractError && (
            <div
              style={{ marginBottom: '20px', padding: '10px', background: '#ffebee', borderRadius: '5px' }}
            >
              <p style={{ color: '#c62828' }}>❌ Counter contract error: {counterContractError.message}</p>
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
                {isDeployingToken ? getDeploymentStageLabel(tokenStage) : 'Deploy Token Contract'}
              </button>
            ) : (
              <>
                <p>Contract Address: {tokenAddress.toString()}</p>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleMintTokens}
                    disabled={isMintExecuting || isTokenContractLoading}
                  >
                    {isMintExecuting ? '⏳ Processing...' : 'Mint Tokens (Sync)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTransferTokens}
                    style={{ marginLeft: '5px' }}
                    disabled={
                      isTokenContractLoading || isRefreshingBalance || !tokenBalance || tokenBalance === '0'
                    }
                  >
                    Transfer Tokens (Async)
                  </button>
                  <button
                    type="button"
                    onClick={handleGetTokenBalance}
                    style={{ marginLeft: '5px' }}
                    disabled={isMintExecuting || isTokenContractLoading || isRefreshingBalance}
                  >
                    {isRefreshingBalance ? '⏳ Fetching…' : 'Get Token Balance'}
                  </button>
                  {tokenBalance && <p>Balance: {tokenBalance}</p>}
                  {hasBackgroundTransactions && (
                    <p style={{ fontSize: '0.9em', color: '#1976d2' }}>
                      ⚡ {backgroundTransactions.length} transaction(s) running in background
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Counter Contract Section */}
          <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h3>Counter Contract</h3>

            {!counterAddress ? (
              <button type="button" onClick={handleDeployCounter} disabled={isDeployingCounter}>
                {isDeployingCounter ? getDeploymentStageLabel(counterStage) : 'Deploy Counter Contract'}
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
                      cursor: 'pointer',
                    }}
                    disabled={isBatchExecuting || isCounterContractLoading}
                  >
                    Increment Counter (Async)
                  </button>
                  <button
                    type="button"
                    onClick={handleIncrementCounterTwice}
                    style={{
                      marginRight: '5px',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    disabled={isBatchExecuting || isCounterContractLoading}
                  >
                    {isBatchExecuting ? '⚡ Batch Processing...' : 'Increment Twice (Batch)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGetCounter}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    disabled={isCounterContractLoading || isFetchingCounterValue}
                  >
                    {isFetchingCounterValue ? '⏳ Simulating...' : 'Get Counter Value'}
                  </button>
                  {counterValue && <p>Counter: {counterValue}</p>}
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
