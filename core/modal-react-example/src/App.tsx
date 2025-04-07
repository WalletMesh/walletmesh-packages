import { useModal, useModalContext } from '@walletmesh/modal-react'

function App() {
  const { openSelectModal, closeSelectModal } = useModal();
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>WalletMesh Modal Example</h1>
      <button onClick={() => {
        openSelectModal();
      }}>Open Modal</button>
      <button onClick={() => {
        closeSelectModal();
      }}>Close Modal</button>
      <ModalInfo />
    </div>
  )
}

function ModalInfo() {
  const modalController = useModalContext();

  return (
    <dl>
      <dt>Modal Controller</dt>
      <dd>
        <pre>
          {JSON.stringify(modalController, null, 2)}
        </pre>
      </dd>
    </dl>
  )
}

export default App
