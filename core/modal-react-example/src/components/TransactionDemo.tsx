import {
  getErrorMessage,
  isReactWalletMeshError,
  useAccount,
  useBalance,
  useTransaction,
  useWalletProvider,
} from '@walletmesh/modal-react/all';
import { useState } from 'react';

export function TransactionDemo() {
  const { isConnected, address } = useAccount();
  const { provider } = useWalletProvider();
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useBalance();
  const [message, setMessage] = useState('Hello WalletMesh!');
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [signatureResult, setSignatureResult] = useState<string | null>(null);

  // Use the real useTransaction hook
  const {
    sendTransaction,
    currentTransaction,
    isLoading: isPending,
    status,
    error: txError,
    reset: resetTx,
  } = useTransaction();

  // Derive transaction state
  const isConfirming = status === 'confirming';
  const isConfirmed = status === 'confirmed';
  const isFailed = status === 'failed';
  const txHash = currentTransaction?.txHash;

  if (!isConnected) {
    return null;
  }

  const handleSignMessage = async () => {
    if (!provider) return;
    setIsSigningMessage(true);
    try {
      // Mock signature for demo
      const signature = await new Promise<string>((resolve) => {
        setTimeout(() => resolve('0x1234567890abcdef...'), 1000);
      });
      setSignatureResult(signature);
    } catch (error) {
      console.error('Sign message failed:', error);
    } finally {
      setIsSigningMessage(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!address) return;

    try {
      // Use the useTransaction hook to send a transaction
      await sendTransaction({
        to: address, // Send to self for demo
        value: '0x0', // 0 ETH
        data: '0x', // No data
      });
    } catch (error) {
      console.error('Transaction failed:', getErrorMessage(error));
    }
  };

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Transaction Demo</h2>

      {/* Balance Check */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => refetchBalance()}
          disabled={balanceLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: balanceLoading ? 'not-allowed' : 'pointer',
            opacity: balanceLoading ? 0.6 : 1,
          }}
        >
          {balanceLoading ? 'Checking...' : 'Check Balance'}
        </button>
        {balance && (
          <div style={{ marginTop: '8px' }}>
            Balance: {balance.formatted} {balance.symbol}
          </div>
        )}
        {balanceError && (
          <div style={{ marginTop: '8px', color: '#EF4444' }}>Error: {balanceError.message}</div>
        )}
      </div>

      {/* Message Signing */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to sign"
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #D1D5DB',
              borderRadius: '4px',
            }}
          />
          <button
            type="button"
            onClick={handleSignMessage}
            disabled={isSigningMessage}
            style={{
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSigningMessage ? 'not-allowed' : 'pointer',
              opacity: isSigningMessage ? 0.6 : 1,
            }}
          >
            {isSigningMessage ? 'Signing...' : 'Sign'}
          </button>
        </div>
        {signatureResult && (
          <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>
            Signature: {signatureResult.slice(0, 50)}...
          </div>
        )}
      </div>

      {/* Test Transaction with new hook */}
      <div>
        <button
          type="button"
          onClick={handleSendTransaction}
          disabled={isPending || isConfirming}
          style={{
            padding: '8px 16px',
            backgroundColor: '#DC2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
            opacity: isPending || isConfirming ? 0.6 : 1,
          }}
        >
          {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Send Test Transaction'}
        </button>

        {/* Transaction Status Display */}
        {status !== 'idle' && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              Status:{' '}
              <span style={{ color: isConfirmed ? '#10B981' : isFailed ? '#EF4444' : '#F59E0B' }}>
                {status}
              </span>
            </div>

            {txHash && <div style={{ fontSize: '12px', wordBreak: 'break-all' }}>TX Hash: {txHash}</div>}

            {currentTransaction && (
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                <div>Transaction ID: {currentTransaction.txStatusId}</div>
                <div>Hash: {currentTransaction.txHash.substring(0, 10)}...</div>
              </div>
            )}

            {txError && (
              <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                Error: {getErrorMessage(txError)}
                {isReactWalletMeshError(txError) && (
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Code: {txError.code}</div>
                )}
              </div>
            )}

            {(isConfirmed || isFailed) && (
              <button
                type="button"
                onClick={resetTx}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
