import './App.css';
import {
  AztecExampleWalletAdapter,
  AztecTransactionStatusOverlay,
  BackgroundTransactionIndicator,
  AztecWalletMeshProvider,
  ChainType,
  WalletMeshErrorBoundary,
  WalletMeshErrorRecovery,
} from '@walletmesh/modal-react/aztec';
import DApp from './components/DApp.js';
import TransactionStatusOverlay from './components/TransactionStatusOverlay.js';
import { ToastProvider } from './contexts/ToastContext.js';

function App() {
  return (
    <WalletMeshErrorBoundary
      fallback={({ error, resetError }: { error: unknown; resetError: () => void }) => (
        <WalletMeshErrorRecovery
          error={error as Error}
          resetError={resetError}
          chainType={ChainType.Aztec}
          enableAutoRetry={true}
          showTechnicalDetails={process.env.NODE_ENV === 'development'}
        />
      )}
      onError={(error: unknown, errorInfo: any) => {
        // Log errors to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('WalletMesh Error:', error);
          console.error('Error Info:', errorInfo);
        }
        // In production, you could send this to an error tracking service
        // logToErrorService(error, errorInfo);
      }}
    >
      <AztecWalletMeshProvider
        config={{
          appName: 'Aztec DApp Demo',
          appDescription: 'Example Aztec dApp using WalletMesh with zero-knowledge proofs',
          // Provide explicit metadata for proper identification
          appMetadata: {
            // Explicitly set the origin for the dApp (helps with cross-origin communication)
            origin: window.location.origin,
            name: 'Aztec DApp Demo',
            description: 'Example Aztec dApp using WalletMesh with zero-knowledge proofs',
            url: window.location.href,
            icon: '/favicon.ico',
          },
          // Explicitly specify which chain to use
          chains: [
            {
              chainId: 'aztec:31337',
              required: false,
              label: 'Aztec Sandbox',
            },
          ],
          // Include the Aztec Example Wallet for testing in development
          // Pass the wallet info, not the class
          wallets: [AztecExampleWalletAdapter.getWalletInfo()],
          // Declare the permissions this dApp requires
          permissions: [
            // Account Methods (required for initialization)
            'aztec_getAddress',
            'aztec_getCompleteAddress', // ⚠️ CRITICAL: Required for wallet initialization - fetches complete address with public keys

            // Chain/Node Methods (required for initialization and queries)
            'aztec_getChainId', // ⚠️ CRITICAL: Required for wallet initialization - identifies the connected chain
            'aztec_getVersion', // ⚠️ CRITICAL: Required for wallet initialization - verifies protocol compatibility
            'aztec_getBlockNumber',
            'aztec_getCurrentBaseFees',
            'aztec_getNodeInfo',
            'aztec_getPXEInfo',

            // Transaction Methods (core functionality)
            'aztec_sendTx',
            'aztec_simulateTx',
            'aztec_simulateUtility', // Required for "Get Counter Value" functionality
            'aztec_getTxReceipt',
            'aztec_proveTx',

            // Contract Methods (deployment and interaction)
            'aztec_getContracts',
            'aztec_registerContract',
            'aztec_registerContractClass',

            // Auth Methods (authorization)
            'aztec_createAuthWit',

            // Event Methods (monitoring)
            'aztec_getPrivateEvents',
            'aztec_getPublicEvents',

            // WalletMesh-specific Methods
            'aztec_wmExecuteTx',
            'aztec_wmSimulateTx',
            'aztec_wmDeployContract',
          ],
          // These wallets will be registered and appear as "discovered" wallets
          // The AztecWalletMeshProvider will automatically filter for Aztec-compatible wallets
          // All other configuration uses sensible defaults:
          // - Auto-discovers Aztec wallets
          // - Sets up discovery with appropriate timeouts
          // - Enables debug mode in development
        }}
      >
        <ToastProvider>
          <div className="App">
            <h1>Aztec DApp Example</h1>
            <DApp />
          </div>
          {/*
            TransactionStatusOverlay shows the full transaction lifecycle for SYNC transactions (executeSync).
            It replaces the legacy ProvingOverlay, providing comprehensive tracking with 8 stages:
            idle → preparing → proving → signing → broadcasting → confirming → confirmed/failed

            For ASYNC transactions (execute), this overlay does NOT appear.
            Instead, BackgroundTransactionIndicator provides a non-intrusive floating badge,
            allowing users to continue working while transactions process in the background.
          */}
          <TransactionStatusOverlay />
          <AztecTransactionStatusOverlay />
          <BackgroundTransactionIndicator position="bottom-right" />
        </ToastProvider>
      </AztecWalletMeshProvider>
    </WalletMeshErrorBoundary>
  );
}

export default App;
