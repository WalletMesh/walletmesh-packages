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
  useAztecWallet,
} from '@walletmesh/modal-react/aztec';
import type React from 'react';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext.js';

/**
 * DApp component for the Aztec example application demonstrating
 * the improved developer experience with modal-react hooks.
 */
const DApp: React.FC = () => {
  const { showError, showSuccess, showInfo } = useToast();

  // Use modal-react hooks for wallet management
  const { aztecWallet } = useAztecWallet();
  const { address } = useAccount();

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

  // Use contract hooks for Token and Counter contracts
  const {
    contract: tokenContract,
    execute: executeTokenTx,
    simulate: simulateTokenTx,
    isLoading: isTokenContractLoading,
    error: tokenContractError,
  } = useAztecContract<any>(
    tokenAddress,
    tokenAddress ? (TokenContractArtifact as any) : null,
  );

  const {
    contract: counterContract,
    execute: executeCounterTx,
    simulate: simulateCounterTx,
    isLoading: isCounterContractLoading,
    error: counterContractError,
  } = useAztecContract<any>(
    counterAddress,
    counterAddress ? (CounterContractArtifact as any) : null,
  );

  // State for UI display and transaction status
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [counterValue, setCounterValue] = useState<string>('');
  const [isExecutingTx, setIsExecutingTx] = useState<boolean>(false);

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
      await deployToken(
        TokenContractArtifact as any,
        [address, 'TokenName', 'TKN', 18],
        {
          onSuccess: (deployedAddress) => {
            showSuccess(`Token deployed at ${deployedAddress.toString()}`);
          },
          onError: (error) => {
            showError(`Token deployment failed: ${error.message}`);
          },
        },
      );
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
      await deployCounter(
        CounterContractArtifact as any,
        [0, address],
        {
          onSuccess: (deployedAddress) => {
            showSuccess(`Counter deployed at ${deployedAddress.toString()}`);
          },
          onError: (error) => {
            showError(`Counter deployment failed: ${error.message}`);
          },
        },
      );
    } catch (error) {
      console.error('Counter deployment failed:', error);
      if (error instanceof Error) {
        showError(`Counter deployment failed: ${error.message}`);
      }
    }
  };

  /**
   * Mints tokens to the connected account using the deployed Token contract.
   */
  const handleMintTokens = async () => {
    if (!aztecWallet || !tokenContract || !address) {
      showError('Please deploy a token contract first.');
      return;
    }

    setIsExecutingTx(true);
    try {
      // No type casting needed - execute handles wallet interaction
      showInfo('Minting tokens, please wait for confirmation...');
      const receipt = await executeTokenTx(
        tokenContract.methods.mint_to_public(address, 10000000000000000000000n),
      );
      console.log('Mint receipt:', receipt);
      showSuccess('Tokens minted successfully! You can now check your balance.');
    } catch (error) {
      console.error('Mint transaction failed:', error);
      if (error instanceof Error) {
        showError(`Transaction failed: ${error.message}`);
      }
    } finally {
      setIsExecutingTx(false);
    }
  };

  /**
   * Transfers tokens from the connected account to a test account.
   */
  const handleTransferTokens = async () => {
    if (!aztecWallet || !tokenContract || !address) {
      showError('Please deploy a token contract first.');
      return;
    }

    setIsExecutingTx(true);
    try {
      const to = await getInitialTestAccounts().then((accounts) => accounts[1].address);
      // Clean interaction without type casting
      await executeTokenTx(
        tokenContract.methods.transfer_in_public(address, to.toString(), 100000n, 0n),
      );
      showSuccess('Transferred tokens to test account');
    } catch (error) {
      if (error instanceof Error) {
        showError(`Transaction failed: ${error.message}`);
      }
    } finally {
      setIsExecutingTx(false);
    }
  };

  /**
   * Checks and displays the token balance of the connected account.
   */
  const handleGetTokenBalance = async () => {
    if (!aztecWallet || !tokenContract || !address) {
      showError('Please deploy a token contract first.');
      return;
    }

    try {
      showInfo('Checking token balance...');

      // Try to get the balance using simulation
      console.log('[DApp] Checking balance for address:', address.toString());
      const balanceMethod = tokenContract.methods.balance_of_public(address);
      console.log('[DApp] Balance method:', balanceMethod);

      const balance = await simulateTokenTx(balanceMethod);

      const balanceStr = String(balance);
      setTokenBalance(balanceStr);
      showInfo(`Token balance: ${balanceStr}`);
    } catch (error) {
      console.error('[DApp] Balance check failed:', error);

      // If simulation fails, it might be because the storage hasn't been initialized
      // or the transaction hasn't been confirmed yet
      if (error instanceof Error && error.message.includes('Assertion failed')) {
        showInfo('Balance check failed. The transaction might still be confirming or the balance is 0.');
        setTokenBalance('0');
      } else {
        showError(`Failed to check balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  /**
   * Increments the value in the deployed Counter contract.
   */
  const handleIncrementCounter = async () => {
    if (!aztecWallet || !counterContract || !address) {
      showError('Please deploy a counter contract first.');
      return;
    }

    setIsExecutingTx(true);
    try {
      // Clean execution without type casting
      await executeCounterTx(
        counterContract.methods.increment(address, address),
      );
      showSuccess('Counter incremented');
    } catch (error) {
      if (error instanceof Error) {
        showError(`Transaction failed: ${error.message}`);
      }
    } finally {
      setIsExecutingTx(false);
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
      // Use cached contract instance - no need to recreate
      const interactions = [
        counterContract.methods.increment(address, address),
        counterContract.methods.increment(address, address),
      ];

      // Execute batch
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
    if (!aztecWallet || !counterContract || !address) {
      showError('Please deploy a counter contract first.');
      return;
    }

    try {
      // Clean simulation with the hook
      const value = await simulateCounterTx(
        counterContract.methods.get_counter(address),
      );
      const valueStr = String(value);
      setCounterValue(valueStr);
      showInfo(`Counter value: ${valueStr}`);
    } catch (error) {
      if (error instanceof Error) {
        showError(`Simulation failed: ${error.message}`);
      }
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
        errorFallback={(error: Error) => <p style={{ color: 'red' }}>Error: {error.message}</p>}
      >
        <div>
          {/* Show loading states for contracts */}
          {(isTokenContractLoading || isCounterContractLoading) && (
            <div
              style={{ marginBottom: '20px', padding: '10px', background: '#fffbf0', borderRadius: '5px' }}
            >
              <p>⏳ Loading contract instances...</p>
            </div>
          )}

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
                {isDeployingToken ? getDeploymentStatus(tokenStage) : 'Deploy Token Contract'}
              </button>
            ) : (
              <>
                <p>Contract Address: {tokenAddress.toString()}</p>

                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={handleMintTokens}
                    disabled={isExecutingTx || isTokenContractLoading}
                  >
                    {isExecutingTx ? '⏳ Processing...' : 'Mint Tokens'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTransferTokens}
                    style={{ marginLeft: '5px' }}
                    disabled={isExecutingTx || isTokenContractLoading}
                  >
                    {isExecutingTx ? '⏳ Processing...' : 'Transfer Tokens'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGetTokenBalance}
                    style={{ marginLeft: '5px' }}
                    disabled={isExecutingTx || isTokenContractLoading}
                  >
                    Get Token Balance
                  </button>
                  {tokenBalance && <p>Balance: {tokenBalance}</p>}
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
                    disabled={isExecutingTx || isBatchExecuting || isCounterContractLoading}
                  >
                    {isExecutingTx ? '⏳ Processing...' : 'Increment Counter'}
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
                    disabled={isExecutingTx || isBatchExecuting || isCounterContractLoading}
                  >
                    {isBatchExecuting ? '⚡ Batch Processing...' : 'Increment Twice'}
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
                    disabled={isExecutingTx || isCounterContractLoading}
                  >
                    Get Counter Value
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