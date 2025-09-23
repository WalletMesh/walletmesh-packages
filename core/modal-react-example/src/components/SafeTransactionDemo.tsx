import { useAccount, useBalance, useWalletProvider } from '@walletmesh/modal-react/all';
import { useState } from 'react';

export function SafeTransactionDemo() {
  const { isConnected } = useAccount();
  const { data: balance, refetch: refetchBalance } = useBalance();
  const { provider } = useWalletProvider();
  const [transactionLog, setTransactionLog] = useState<string[]>([]);

  const handleGetBalance = async () => {
    try {
      setTransactionLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Getting balance...`]);

      await refetchBalance();

      setTransactionLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Balance retrieved!`,
        `  Result: ${balance?.formatted} ${balance?.symbol}`,
      ]);
    } catch (error) {
      setTransactionLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Failed to get balance: ${(error as Error).message}`,
      ]);
    }
  };

  const handleSendTransaction = async () => {
    try {
      setTransactionLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Starting transaction...`]);

      // Mock transaction for demo purposes

      // Mock transaction for demo
      const result = await new Promise<string>((resolve) => {
        setTimeout(() => resolve('0xmocktxhash123...'), 2000);
      });

      setTransactionLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Transaction sent!`,
        `  Hash: ${result}`,
      ]);
    } catch (error) {
      setTransactionLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Transaction failed: ${(error as Error).message}`,
      ]);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Transaction Demo</h2>
        <p style={{ color: '#6B7280' }}>Connect a wallet to test transaction execution</p>
      </div>
    );
  }

  // Mock active wallet for demo

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Transaction Demo</h2>

      {/* Current Wallet Info */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Active Wallet</h3>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          <div>
            <strong>Wallet:</strong> Mock Wallet
          </div>
          <div>
            <strong>Address:</strong> Connected
          </div>
          <div>
            <strong>Provider:</strong> {provider ? 'Available' : 'None'}
          </div>
        </div>
      </div>

      {/* Get Balance */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Get Balance</h3>
        <button
          type="button"
          onClick={handleGetBalance}
          disabled={false}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6366F1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Get Balance
        </button>

        {balance && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#D1FAE5',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            Balance: {balance.formatted} {balance.symbol}
          </div>
        )}
      </div>

      {/* Send Transaction */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Send Transaction</h3>
        <button
          type="button"
          onClick={handleSendTransaction}
          disabled={false}
          style={{
            padding: '8px 16px',
            backgroundColor: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Send Test Transaction
        </button>
        <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
          Sends a 0 ETH transaction for testing
        </p>
      </div>

      {/* Transaction Log */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Transaction Log</h3>
        <div
          style={{
            backgroundColor: '#1F2937',
            color: '#F9FAFB',
            padding: '8px',
            borderRadius: '4px',
            maxHeight: '150px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '11px',
          }}
        >
          {transactionLog.length === 0 ? (
            <div style={{ color: '#6B7280' }}>No transactions yet</div>
          ) : (
            transactionLog.map((log, i) => <div key={`log-${i}-${log.substring(0, 10)}`}>{log}</div>)
          )}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#6B7280' }}>
        This demo shows how to execute transactions using the simplified transaction hooks with built-in
        loading states and error handling.
      </div>
    </div>
  );
}
