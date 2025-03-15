# @walletmesh/modal-react

React adapter for WalletMesh modal components. This package provides React-specific implementations of the framework-agnostic WalletMesh modal core.

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
import { ModalProvider, SelectModal, ConnectedModal, useModal } from '@walletmesh/modal-react';

function WalletUI() {
  const { openSelectModal, openConnectedModal } = useModal();

  return (
    <>
      <button onClick={openSelectModal}>Connect Wallet</button>
      <button onClick={openConnectedModal}>Show Connected Wallet</button>

      <SelectModal>
        <h2>Select a Wallet</h2>
        {/* Wallet selection UI */}
      </SelectModal>

      <ConnectedModal>
        <h2>Connected Wallet</h2>
        {/* Connected wallet info */}
      </ConnectedModal>
    </>
  );
}

function App() {
  return (
    <ModalProvider>
      <WalletUI />
    </ModalProvider>
  );
}
```

### Configuration

You can configure modal behavior through the `ModalProvider`:

```tsx
<ModalProvider
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
</ModalProvider>
```

### Using the Modal Hook

The `useModal` hook provides access to modal state and actions:

```tsx
function WalletButton() {
  const {
    isSelectModalOpen,
    isConnectedModalOpen,
    openSelectModal,
    closeSelectModal,
    openConnectedModal,
    closeConnectedModal,
  } = useModal();

  return (
    <button 
      onClick={() => openSelectModal()}
      disabled={isSelectModalOpen || isConnectedModalOpen}
    >
      Connect Wallet
    </button>
  );
}
```

### Customizing Modal Appearance

Both `SelectModal` and `ConnectedModal` components accept standard props for customization:

```tsx
<SelectModal
  className="custom-modal"
  style={{ background: '#fff' }}
  renderCloseButton={() => (
    <button onClick={closeSelectModal}>
      Custom Close
    </button>
  )}
>
  {/* Modal content */}
</SelectModal>
```

## API Reference

### Components

#### ModalProvider

```tsx
interface ModalProviderProps {
  children: React.ReactNode;
  config?: ModalConfig;
}
```

#### SelectModal

```tsx
interface SelectModalProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  renderCloseButton?: () => React.ReactNode;
}
```

#### ConnectedModal

```tsx
interface ConnectedModalProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  renderCloseButton?: () => React.ReactNode;
}
```

### Hooks

#### useModal

```tsx
interface ModalHookResult {
  isSelectModalOpen: boolean;
  isConnectedModalOpen: boolean;
  openSelectModal: () => Promise<void>;
  closeSelectModal: () => Promise<void>;
  openConnectedModal: () => Promise<void>;
  closeConnectedModal: () => Promise<void>;
}

const modalState = useModal();
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