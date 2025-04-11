import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { WalletmeshProvider } from '@walletmesh/modal-react'

// Sample wallet list for the modal
const wallets = [
  {
    id: 'metamask',
    name: 'MetaMask',
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    iconUrl: 'https://avatars.githubusercontent.com/u/37784886'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    iconUrl: 'https://avatars.githubusercontent.com/u/1885080'
  },
  {
    id: 'custom',
    name: 'Custom Wallet'
  }
];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletmeshProvider config={{}} wallets={wallets}>
      <App />
    </WalletmeshProvider>
  </StrictMode>,
)
