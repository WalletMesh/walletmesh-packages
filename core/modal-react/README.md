# @walletmesh/modal-react

React adapter for WalletMesh modal components. This package provides React-specific implementations of the framework-agnostic WalletMesh modal core, including a unified modal component for wallet selection and connection.

## Installation

```bash
npm install @walletmesh/modal-react
# or
pnpm add @walletmesh/modal-react
# or
yarn add @walletmesh/modal-react
```

## Usage

### Basic Example

```tsx
import { WalletmeshProvider, WalletmeshModal, useWalletmesh } from '@walletmesh/modal-react';

function WalletUI() {
  const { openModal } = useWalletmesh();

  return (
    <>
      <button onClick={openModal}>Connect Wallet</button>
      
      {/* WalletmeshModal is auto-injected by the WalletmeshProvider */}
    </>
  );
}

function App() {
  return (
    <WalletmeshProvider 
      wallets={[
        { id: 'metamask', name: 'MetaMask', iconUrl: 'https://metamask.io/icon.png' },
        { id: 'coinbase', name: 'Coinbase Wallet', iconUrl: 'https://www.coinbase.com/icon.png' }
      ]}
      config={{}}
    >
      <WalletUI />
    </WalletmeshProvider>
  );
}
```

### Configuration

You can configure modal behavior through the `WalletmeshProvider`:

```tsx
<WalletmeshProvider
  config={{
    onBeforeOpen: async () => {
      // Return false to prevent modal from opening
      return true;
    },
    onAfterOpen: () => {
      console.log('Modal opened');
    },
    onBeforeClose: async () => {
      // Return false to prevent modal from closing
      return true;
    },
    onAfterClose: () => {
      console.log('Modal closed');
    },
  }}
>
  <App />
</WalletmeshProvider>
```

### Using the Walletmesh Hook

The `useWalletmesh` hook provides access to modal state and actions:

```tsx
function WalletButton() {
  const { openModal, modalState, connectionStatus } = useWalletmesh();

  return (
    <button 
      onClick={openModal}
      disabled={modalState.isOpen}
    >
      {connectionStatus === 'connected' ? 'Wallet Connected' : 'Connect Wallet'}
    </button>
  );
}
```

### Customizing Modal Appearance

The modal appearance is configured through the `WalletmeshProvider`. The `WalletmeshModal` component is automatically injected by the provider:

```tsx
<WalletmeshProvider
  wallets={[
    { id: 'metamask', name: 'MetaMask', iconUrl: 'https://metamask.io/icon.png' },
    { id: 'coinbase', name: 'Coinbase Wallet', iconUrl: 'https://www.coinbase.com/icon.png' }
  ]}
  config={{
    theme: 'dark',
    dappInfo: {
      name: 'My DApp',
      url: 'https://mydapp.com',
      iconUrl: 'https://mydapp.com/icon.png',
      description: 'My awesome DApp'
    }
  }}
>
  {/* Your app content */}
</WalletmeshProvider>
```

If you need to manually include the modal (when `autoInjectModal` is set to false):

```tsx
<WalletmeshModal 
  className="custom-modal"
  style={{ background: '#fff' }}
  theme="dark"
/>
```

## API Reference

### Components

#### WalletmeshProvider

```tsx
interface WalletmeshProviderProps {
  children: React.ReactNode;
  config?: WalletmeshConfig;
  wallets?: WalletInfo[];
  autoInjectModal?: boolean;
}
```

#### WalletmeshModal

```tsx
interface WalletmeshModalProps {
  className?: string;
  style?: React.CSSProperties;
  renderCloseButton?: () => React.ReactNode;
  wallets?: Array<{
    id: string;
    name: string;
    iconUrl?: string;
  }>;
  theme?: 'light' | 'dark' | 'system';
}
```

#### SelectModal (Legacy)

```tsx
interface SelectModalProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  renderCloseButton?: () => React.ReactNode;
}
```

#### ConnectedModal (Legacy)

```tsx
interface ConnectedModalProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  renderCloseButton?: () => React.ReactNode;
}
```

### Hooks

#### useWalletmesh

```tsx
interface WalletmeshContextType {
  config: WalletmeshConfig;
  wallets: WalletInfo[];
  connectionStatus: ConnectionStatus;
  error: Error | null;
  modalState: ModalState;
  walletState: {
    selectedWallet: string | null;
    isConnected: boolean;
    isConnecting: boolean;
  };
  getState: () => ModalState;
  subscribe: (callback: (state: ModalState) => void) => () => void;
  openModal: () => void;
  closeModal: () => void;
  openConnectedModal: () => void;
  closeConnectedModal: () => void;
  dispatch: (action: ModalAction) => void;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  controller: ModalController;
}

const context = useWalletmesh();
```

### Configuration

```tsx
interface ModalConfig {
  onBeforeOpen?: () => Promise<boolean>;
  onAfterOpen?: () => void;
  onBeforeClose?: () => Promise<boolean>;
  onAfterClose?: () => void;
}
```

## License

Apache-2.0