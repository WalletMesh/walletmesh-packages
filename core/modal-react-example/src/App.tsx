import { useWalletmesh } from '@walletmesh/modal-react'

function App() {
  // Get the context from the hook
  const context = useWalletmesh();
  
  // Derive connection status
  const displayStatus = context.connectionStatus === 'connected'
    ? 'Connected' 
    : context.connectionStatus === 'connecting'
      ? 'Connecting...' 
      : context.error 
        ? `Error: ${context.error.message}` 
        : 'Disconnected';
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>WalletMesh Modal Example</h1>
      
      {/* Feature 1: Open Modal */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={() => context.openModal()}
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
          onClick={() => context.closeModal()}
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
            backgroundColor: displayStatus === 'Connected' ? '#10B981' : 
                           displayStatus === 'Connecting...' ? '#F59E0B' : 
                           displayStatus.includes('Error') ? '#EF4444' : '#6B7280' 
          }}></div>
          <span>{displayStatus}</span>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div>Modal Open: <strong>{context.modalState?.isOpen ? 'Yes' : 'No'}</strong></div>
        </div>
      </div>
      
      {/* Feature 3: Wallet State */}
      <WalletStateInfo />
      
      {/* WalletmeshModal is auto-injected by the WalletmeshProvider */}
    </div>
  )
}

function WalletStateInfo() {
  // Get the context from the hook
  const context = useWalletmesh();

  return (
    <div style={{ padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Wallet State</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <StateCard 
          title="Current View" 
          value={context.modalState?.currentView} 
          description="The current view being displayed in the modal"
        />
        
        <StateCard 
          title="Selected Wallet" 
          value={context.modalState?.selectedWallet || 'None'} 
          description="The wallet that has been selected by the user"
        />
        
        <StateCard 
          title="Selected Provider" 
          value={context.modalState?.selectedProvider ? JSON.stringify(context.modalState.selectedProvider) : 'None'} 
          description="The provider interface that has been selected"
        />
        
        <StateCard 
          title="Selected Chain" 
          value={context.modalState?.selectedChain || 'None'} 
          description="The blockchain network that has been selected"
        />
        
        <StateCard 
          title="Loading State" 
          value={context.modalState?.isLoading ? 'Loading' : 'Not Loading'} 
          description="Whether the modal is currently in a loading state"
        />
        
        <StateCard 
          title="Connected" 
          value={context.connectionStatus === 'connected' ? 'Yes' : 'No'} 
          description="Whether a wallet is currently connected"
        />
        
        <StateCard 
          title="Connecting" 
          value={context.connectionStatus === 'connecting' ? 'Yes' : 'No'} 
          description="Whether a wallet connection is in progress"
        />
        
        <StateCard 
          title="Error State" 
          value={context.error ? context.error.message : 'No Error'} 
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
          {JSON.stringify(context.modalState, null, 2)}
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
