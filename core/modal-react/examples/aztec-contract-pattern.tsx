/**
 * Aztec Contract Pattern Example
 *
 * This example shows the familiar Contract.at() pattern for Aztec.js users
 * working with remote wallets through WalletMesh.
 */

import {
  WalletMeshProvider,
  useAccount,
  useAztecContract,
  useAztecWallet,
  useConnect,
} from '@walletmesh/modal-react';
import React, { useState } from 'react';

// Import your contract artifact (from @aztec/noir-contracts.js or your own)
// import { TokenContractArtifact } from '@aztec/noir-contracts.js/Token';

// For this example, we'll use a mock artifact
const TokenContractArtifact = {
  name: 'Token',
  functions: [
    { name: 'transfer', parameters: ['recipient', 'amount'] },
    { name: 'balance_of', parameters: ['owner'] },
    { name: 'mint', parameters: ['to', 'amount'] },
  ],
};

function App() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Aztec Contract Example',
        chains: ['aztec'],
        wallets: { include: ['aztec-wallet'] },
      }}
    >
      <TokenDApp />
    </WalletMeshProvider>
  );
}

function TokenDApp() {
  const { connect, disconnect } = useConnect();
  const { isConnected, address } = useAccount();
  const { aztecWallet } = useAztecWallet();

  // Contract address (would come from deployment or user input)
  const tokenAddress = '0x1234567890123456789012345678901234567890';

  // Get contract instance - just like Contract.at() in aztec.js!
  const { contract, isLoading, error } = useAztecContract(tokenAddress, TokenContractArtifact);

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

  // Check balance - view function
  const checkBalance = async () => {
    if (!contract || !aztecWallet || !address) return;

    try {
      // Call view function through wallet using standard flow
      const interaction = (contract as unknown as { methods: { balance_of: (addr: string) => { request(): Promise<unknown> } } }).methods.balance_of(
        address,
      );

      // Extract the transaction request and simulate it
      const txRequest = await interaction.request();
      const result = await aztecWallet.simulateTx(
        txRequest as Parameters<typeof aztecWallet.simulateTx>[0],
        true, // simulatePublic
      );

      // Extract return values from simulation result
      const balance = (result as { privateExecutionResult?: { returnValues?: unknown } }).privateExecutionResult?.returnValues || result;
      setBalance(balance?.toString() || '');
    } catch (err) {
      console.error('Failed to check balance:', err);
      alert('Failed to check balance');
    }
  };

  // Transfer tokens - state-changing function
  const transferTokens = async () => {
    if (!contract || !aztecWallet || !recipient || !amount) return;

    try {
      // Create the contract interaction
      const interaction = (
        contract as unknown as { methods: { transfer: (to: string, amt: bigint) => { request(): Promise<unknown> } }
      ).methods.transfer(recipient, BigInt(amount));

      // Execute through wallet using standard flow
      const txRequest = await interaction.request();
      const provenTx = await aztecWallet.proveTx(txRequest as Parameters<typeof aztecWallet.proveTx>[0]);
      const txHash = await aztecWallet.sendTx(provenTx);
      console.log('Transaction sent:', txHash);

      // Wait for confirmation
      const receipt = await aztecWallet.getTxReceipt(txHash);
      console.log('Transaction confirmed:', receipt);

      alert('Transfer successful!');

      // Refresh balance
      await checkBalance();
    } catch (err) {
      console.error('Transfer failed:', err);
      alert('Transfer failed');
    }
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Aztec Token DApp</h1>
        <button type="button" onClick={() => connect()}>
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Aztec Token DApp</h1>

      <div style={{ marginBottom: '20px' }}>
        <p>Connected: {address}</p>
        <button type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>

      {isLoading ? (
        <p>Loading contract...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error loading contract: {error.message}</p>
      ) : contract ? (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h2>Your Balance</h2>
            <p>{balance !== null ? `${balance} tokens` : 'Click to check'}</p>
            <button type="button" onClick={checkBalance}>
              Check Balance
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2>Transfer Tokens</h2>
            <input
              type="text"
              placeholder="Recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ display: 'block', marginBottom: '10px', width: '300px' }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ display: 'block', marginBottom: '10px', width: '300px' }}
            />
            <button type="button" onClick={transferTokens}>
              Transfer
            </button>
          </div>
        </>
      ) : (
        <p>No contract loaded</p>
      )}
    </div>
  );
}

export default App;
