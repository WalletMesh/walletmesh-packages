import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ModalProvider } from '@walletmesh/modal-react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ModalProvider config={{}}>
      <App />
    </ModalProvider>
  </StrictMode>,
)
