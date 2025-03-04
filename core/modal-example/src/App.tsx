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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>WalletMesh Modal Example</h1>
        <ConnectButton />
      </div>
    </WalletWrapper>
  )
}

export default App
