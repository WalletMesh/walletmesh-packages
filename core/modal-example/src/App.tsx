import './App.css'
import { ConnectButton } from '@walletmesh/modal'

function App() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold text-center mb-4">WalletMesh Modal Example</h1>
      <ConnectButton />
    </div>
  )
}

export default App
