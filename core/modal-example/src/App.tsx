import './App.css'
import { ConnectButton, useWallet, ConnectionStatus } from '@walletmesh/modal';

function App() {
  function WalletStatus() {
    const { connectionStatus, connectedWallet } = useWallet()

    return (
      <div className="mt-4 text-center">
        {connectionStatus === ConnectionStatus.Connected && connectedWallet ? (
          <div>
            <p className="text-green-600 dark:text-green-400">Connected to {connectedWallet.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Click the wallet button above for more details
            </p>
            <div className="mt-4 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <h3 className="text-lg font-semibold mb-2">DApp Access Example:</h3>
              <p className="text-sm">
                <strong>Chain:</strong> {connectedWallet.chain}
              </p>
              <p className="text-sm">
                <strong>Address:</strong> {connectedWallet.address}
              </p>
              <p className="text-sm">
                <strong>Session ID:</strong> {connectedWallet.sessionId || "Not available"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Not connected to any wallet</p>
        )}
      </div>
    )
  }

  function DemoContent() {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold text-center mb-4">WalletMesh Modal Example</h1>
        <ConnectButton />
        <WalletStatus />
      </div>
    )
  }

   return (
      <DemoContent />
  )

}

export default App
