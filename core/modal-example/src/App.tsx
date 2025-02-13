import './App.css'
import { ConnectButton } from '@walletmesh/modal'
import { useCallback } from 'react'
import { WalletWrapper } from './WalletWrapper'

function App() {
  const handleError = useCallback((error: Error) => {
    console.error('Wallet error:', error)
  }, [])

  return (
    <WalletWrapper onError={handleError}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-semibold text-center mb-4">WalletMesh Modal Example</h1>
        <ConnectButton />
      </div>
    </WalletWrapper>
  )
}

export default App
