import { useWalletmesh } from '@walletmesh/modal-react'
import { useState, useEffect } from 'react'
import type { ModalState } from '@walletmesh/modal-core'

function App() {
  const walletmesh = useWalletmesh();
  const { openModal, closeModal, modalState, walletState } = walletmesh;
  
  // Derive connection status from walletState
  const connectionStatus = walletState.isConnected 
    ? 'Connected' 
    : walletState.isConnecting 
      ? 'Connecting...' 
      : modalState.error 
        ? `Error: ${modalState.error.message}` 
        : 'Disconnected';
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>WalletMesh Modal Example</h1>
      
      {/* Feature 1: Open Modal */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={() => openModal()}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Open Modal
        </button>
        <button 
          onClick={() => closeModal()}
          style={{
            padding: '10px 16px',
            backgroundColor: '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Close Modal
        </button>
      </div>
      
      {/* Feature 2: Wallet Connection Status */}
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Connection Status</h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: connectionStatus === 'Connected' ? '#10B981' : 
                           connectionStatus === 'Connecting...' ? '#F59E0B' : 
                           connectionStatus.includes('Error') ? '#EF4444' : '#6B7280' 
          }}></div>
          <span>{connectionStatus}</span>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div>Modal Open: <strong>{modalState.isOpen ? 'Yes' : 'No'}</strong></div>
        </div>
      </div>
      
      {/* Feature 3: Wallet State */}
      <WalletStateInfo />
      
      {/* WalletmeshModal is auto-injected by the WalletmeshProvider */}
    </div>
  )
}

function WalletStateInfo() {
  const { modalState, walletState } = useWalletmesh();

  return (
    <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Wallet State</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <StateCard 
          title="Current View" 
          value={modalState.currentView} 
          description="The current view being displayed in the modal"
        />
        
        <StateCard 
          title="Selected Wallet" 
          value={walletState.selectedWallet || 'None'} 
          description="The wallet that has been selected by the user"
        />
        
        <StateCard 
          title="Selected Provider" 
          value={modalState.selectedProvider ? JSON.stringify(modalState.selectedProvider) : 'None'} 
          description="The provider interface that has been selected"
        />
        
        <StateCard 
          title="Selected Chain" 
          value={modalState.selectedChain || 'None'} 
          description="The blockchain network that has been selected"
        />
        
        <StateCard 
          title="Loading State" 
          value={modalState.isLoading ? 'Loading' : 'Not Loading'} 
          description="Whether the modal is currently in a loading state"
        />
        
        <StateCard 
          title="Connected" 
          value={walletState.isConnected ? 'Yes' : 'No'} 
          description="Whether a wallet is currently connected"
        />
        
        <StateCard 
          title="Connecting" 
          value={walletState.isConnecting ? 'Yes' : 'No'} 
          description="Whether a wallet connection is in progress"
        />
        
        <StateCard 
          title="Error State" 
          value={modalState.error ? modalState.error.message : 'No Error'} 
          description="Any error that occurred during the connection process"
        />
      </div>
      
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Full State</h3>
        <pre style={{ 
          backgroundColor: '#1F2937', 
          color: '#F9FAFB', 
          padding: '16px', 
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '14px'
        }}>
          {JSON.stringify(modalState, null, 2)}
        </pre>
      </div>
    </div>
  )
}

function StateCard({ title, value, description }: { title: string, value: string, description: string }) {
  return (
    <div style={{ 
      padding: '16px', 
      backgroundColor: 'white', 
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{title}</h3>
      <p style={{ 
        fontSize: '14px', 
        color: '#6B7280',
        marginBottom: '8px'
      }}>{description}</p>
      <div style={{ 
        padding: '8px', 
        backgroundColor: '#E5E7EB', 
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '14px',
        wordBreak: 'break-all'
      }}>
        {value}
      </div>
    </div>
  )
}

export default App
