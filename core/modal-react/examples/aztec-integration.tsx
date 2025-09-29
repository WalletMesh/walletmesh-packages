/**
 * Aztec Integration Example
 *
 * This example demonstrates how to use the Aztec-specific hooks in WalletMesh
 * to interact with Aztec blockchain applications.
 */

import {
  WalletMeshProvider,
  useAccount,
  useAztecAuth,
  useAztecBatch,
  useAztecContract,
  useAztecEvents,
  useAztecWallet,
  useConnect,
} from '@walletmesh/modal-react';
import React, { useState, useEffect } from 'react';

// Example token contract artifact (would come from @aztec/noir-contracts.js)
const TokenContractArtifact = {
  name: 'Token',
  // ... ABI and other contract metadata
};

/**
 * Main App Component
 */
function App() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Aztec Example DApp',
        chains: [
          {
            type: 'aztec',
            id: 'aztec-testnet',
            name: 'Aztec Testnet',
            rpcUrl: 'https://api.aztec.network',
          },
        ],
        wallets: { include: ['aztec-wallet'] },
      }}
    >
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Aztec Integration Example</h1>
        <ConnectionManager />
      </div>
    </WalletMeshProvider>
  );
}

/**
 * Connection Management Component
 */
function ConnectionManager() {
  const { connect, disconnect } = useConnect();
  const { isConnected, address } = useAccount();
  const { aztecWallet, isAvailable } = useAztecWallet();

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Connection</h2>
      {!isConnected ? (
        <button type="button" onClick={() => connect()}>
          Connect Aztec Wallet
        </button>
      ) : (
        <div>
          <p>Connected to: {address}</p>
          <p>Wallet Available: {isAvailable ? 'Yes' : 'No'}</p>
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        </div>
      )}

      {isConnected && isAvailable && (
        <>
          <AccountManager />
          <ContractInteraction />
          <EventListener />
          <BatchTransactions />
          <AuthWitnessDemo />
        </>
      )}
    </div>
  );
}

/**
 * Account Management Example
 */
function AccountManager() {
  const { accounts, activeAccount, switchAccount, signMessage, isLoadingAccounts, error } = useAztecWallet();

  const handleSign = async () => {
    try {
      const signature = await signMessage('Hello from Aztec!');
      console.log('Signature:', signature);
      alert('Message signed! Check console for signature.');
    } catch (err) {
      console.error('Failed to sign:', err);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Account Management</h2>
      {isLoadingAccounts ? (
        <p>Loading accounts...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error.message}</p>
      ) : (
        <>
          <p>Active Account: {activeAccount?.address?.toString()}</p>
          <button type="button" onClick={handleSign}>
            Sign Message
          </button>

          <h3>All Accounts ({accounts.length})</h3>
          {accounts.map((account) => (
            <div key={account.address.toString()} style={{ marginBottom: '10px' }}>
              <span>
                {account.label || 'Account'}: {account.address.toString()}
              </span>
              {!account.isActive && (
                <button
                  type="button"
                  onClick={() => switchAccount(account.address)}
                  style={{ marginLeft: '10px' }}
                >
                  Switch to this account
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Contract Interaction Example
 */
function ContractInteraction() {
  const [contractAddress, setContractAddress] = useState('');
  const { contract, isLoading, error, refetch } = useAztecContract(
    contractAddress || null,
    TokenContractArtifact,
  );
  const { aztecWallet } = useAztecWallet();

  const handleViewBalance = async () => {
    if (!contract || !aztecWallet) return;

    try {
      // Simulate calling a view function using standard Aztec flow
      const address = await aztecWallet.getAddress();
      const interaction = (contract as unknown as { methods: { balance_of: (addr: unknown) => { request(): Promise<unknown> } } }).methods.balance_of(
        address,
      );

      // Extract the transaction request and simulate it
      const txRequest = await interaction.request();
      const simulationResult = await aztecWallet.simulateTx(
        txRequest as Parameters<typeof aztecWallet.simulateTx>[0],
        true, // simulatePublic
      );

      // Extract return values from simulation result
      const balance = (simulationResult as { privateExecutionResult?: { returnValues?: unknown } }).privateExecutionResult?.returnValues || simulationResult;

      console.log('Balance:', balance);
      alert(`Balance: ${balance}`);
    } catch (err) {
      console.error('Failed to get balance:', err);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Contract Interaction</h2>
      <input
        type="text"
        placeholder="Enter token contract address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: '300px', marginRight: '10px' }}
      />
      <button type="button" onClick={refetch}>
        Load Contract
      </button>

      {isLoading && <p>Loading contract...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {contract && (
        <div>
          <p>Contract loaded successfully!</p>
          <button type="button" onClick={handleViewBalance}>
            Check Balance
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Event Listener Example
 */
function EventListener() {
  const [contractAddress, setContractAddress] = useState('');
  const { events, isListening, isLoading, subscribe, unsubscribe, queryHistorical, clearEvents } =
    useAztecEvents(contractAddress || null, TokenContractArtifact, 'Transfer');

  const handleQueryHistory = async () => {
    try {
      await queryHistorical({ fromBlock: -100 }); // Last 100 blocks
    } catch (err) {
      console.error('Failed to query events:', err);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Event Monitoring</h2>
      <input
        type="text"
        placeholder="Enter contract address to monitor"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: '300px', marginRight: '10px' }}
      />

      {contractAddress && (
        <>
          <button type="button" onClick={isListening ? unsubscribe : subscribe}>
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          <button type="button" onClick={handleQueryHistory} disabled={isLoading}>
            Query Last 100 Blocks
          </button>
          <button type="button" onClick={clearEvents}>
            Clear Events
          </button>

          <h3>Transfer Events ({events.length})</h3>
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {events.map((event, i) => (
              <div
                key={`event-${JSON.stringify(event).substring(0, 20)}-${i}`}
                style={{ marginBottom: '5px', fontSize: '12px' }}
              >
                Event #{i + 1}: {JSON.stringify(event)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Batch Transaction Example
 */
function BatchTransactions() {
  const { contract: tokenContract } = useAztecContract(
    '0x1234...', // Example address
    TokenContractArtifact,
  );
  const { executeBatch, transactionStatuses, isExecuting, progress, clearStatuses } = useAztecBatch();

  const handleBatchTransfer = async () => {
    if (!tokenContract) {
      alert('Please load a token contract first');
      return;
    }

    // Example batch of transfers
    const interactions = [
      (
        tokenContract as unknown as { methods: { transfer: (to: string, amt: number) => unknown } }
      ).methods.transfer('0xabc...', 100),
      (
        tokenContract as unknown as { methods: { transfer: (to: string, amt: number) => unknown } }
      ).methods.transfer('0xdef...', 200),
      (
        tokenContract as unknown as { methods: { transfer: (to: string, amt: number) => unknown } }
      ).methods.transfer('0x123...', 300),
    ];

    try {
      const receipts = await executeBatch(interactions);
      console.log('Batch completed:', receipts);
      alert(`Batch completed! ${receipts.length} transactions successful.`);
    } catch (err) {
      console.error('Batch failed:', err);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Batch Transactions</h2>
      <button type="button" onClick={handleBatchTransfer} disabled={isExecuting}>
        Execute Batch Transfer (3 transactions)
      </button>
      <button type="button" onClick={clearStatuses}>
        Clear Status
      </button>

      {transactionStatuses.length > 0 && (
        <>
          <p>Progress: {progress}%</p>
          <progress value={progress} max={100} style={{ width: '100%' }} />

          <h3>Transaction Status</h3>
          {transactionStatuses.map((status) => (
            <div key={status.index} style={{ marginBottom: '5px' }}>
              Transaction {status.index + 1}: {status.status}
              {status.hash && <span> (Hash: {status.hash})</span>}
              {status.error && <span style={{ color: 'red' }}> - {status.error.message}</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Auth Witness Demo
 */
function AuthWitnessDemo() {
  const { contract: tokenContract } = useAztecContract(
    '0x1234...', // Example address
    TokenContractArtifact,
  );
  const {
    createAuthWit,
    createMessageAuthWit,
    storeWitnesses,
    storedEntries,
    removeStoredEntry,
    isCreating,
  } = useAztecAuth();

  const handleCreateTransferAuth = async () => {
    if (!tokenContract) {
      alert('Please load a token contract first');
      return;
    }

    try {
      const interaction = (
        tokenContract as unknown as { methods: { transfer: (to: string, amt: number) => unknown } }
      ).methods.transfer('0xrecipient...', 1000);

      const authWit = await createAuthWit(interaction, 'Authorize transfer of 1000 tokens');

      const storageKey = storeWitnesses([authWit], 'Token Transfer Auth');
      console.log('Auth witness created and stored:', storageKey);
      alert(`Auth witness created! Storage key: ${storageKey}`);
    } catch (err) {
      console.error('Failed to create auth witness:', err);
    }
  };

  const handleCreateLoginAuth = async () => {
    try {
      const timestamp = Date.now();
      const message = `Login to Aztec DApp at ${timestamp}`;

      const authWit = await createMessageAuthWit(message, 'Login authentication');

      const storageKey = storeWitnesses([authWit], 'Login Auth');
      console.log('Login auth created:', storageKey);
      alert('Login auth created! You can now authenticate with the backend.');
    } catch (err) {
      console.error('Failed to create login auth:', err);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h2>Authorization Witnesses</h2>
      <button type="button" onClick={handleCreateTransferAuth} disabled={isCreating}>
        Create Transfer Authorization
      </button>
      <button type="button" onClick={handleCreateLoginAuth} disabled={isCreating}>
        Create Login Auth
      </button>

      <h3>Stored Auth Witnesses ({storedEntries.length})</h3>
      {storedEntries.map((entry) => (
        <div key={entry.id} style={{ marginBottom: '10px' }}>
          <strong>{entry.label}</strong> - {entry.witnesses.length} witnesses
          <button type="button" onClick={() => removeStoredEntry(entry.id)} style={{ marginLeft: '10px' }}>
            Remove
          </button>
          <div style={{ fontSize: '12px' }}>Storage Key: {entry.storageKey}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
