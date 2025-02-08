import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.js'
import { WalletWrapper } from './WalletWrapper';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletWrapper>
      <App />
    </WalletWrapper>
  </StrictMode>,
)
