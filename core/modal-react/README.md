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
  const { controller } = useWalletmesh();

  return (
    <>
      <button onClick={() => controller.open()}>Connect Wallet</button>
      
      <WalletmeshModal 
        wallets={[
          { id: 'metamask', name: 'MetaMask', iconUrl: 'https://metamask.io/icon.png' },
          { id: 'coinbase', name: 'Coinbase Wallet', iconUrl: 'https://www.coinbase.com/icon.png' }
        ]}
        theme="system"
      />
    </>
  );
}

function App() {
  return (
    <WalletmeshProvider>
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

The `useWalletmesh` hook provides access to modal state and controller:

```tsx
function WalletButton() {
  const { controller, modalState } = useWalletmesh();

  return (
    <button 
      onClick={() => controller.open()}
      disabled={modalState.isOpen}
    >
      Connect Wallet
    </button>
  );
}
```

### Customizing Modal Appearance

The `WalletmeshModal` component accepts various props for customization:

```tsx
<WalletmeshModal
  className="custom-modal"
  style={{ background: '#fff' }}
  renderCloseButton={() => {
    const { controller } = useWalletmesh();
    return (
      <button onClick={() => controller.close()}>
        Custom Close
      </button>
    );
  }}
  wallets={[
    { id: 'metamask', name: 'MetaMask', iconUrl: 'https://metamask.io/icon.png' },
    { id: 'coinbase', name: 'Coinbase Wallet', iconUrl: 'https://www.coinbase.com/icon.png' }
  ]}
  theme="dark"
/>
```

## API Reference

### Components

#### WalletmeshProvider

```tsx
interface WalletmeshProviderProps {
  children: React.ReactNode;
  config?: ModalConfig;
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
  controller: {
    open: () => void;
    close: () => void;
    selectWallet: (walletId: string) => void;
    reset: () => void;
    getState: () => ModalState;
    subscribe: (callback: (state: ModalState) => void) => () => void;
  };
  modalState: ModalState;
}

const { controller, modalState } = useWalletmesh();
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