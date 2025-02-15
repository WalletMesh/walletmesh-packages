# WalletMesh Modal Example

This example demonstrates how to integrate the [WalletMesh Modal](../modal/README.md) into your application with proper configuration, error handling, and styling. It serves as a reference implementation showcasing best practices for wallet integration.

## Table of Contents
- [Features](#features)
- [Setup](#setup)
- [Running the Example](#running-the-example)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Customization](#customization)
- [Folder Structure](#folder-structure)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Features

- Complete wallet connection flow with status feedback
- Robust error boundary implementation
- Environment-specific configurations
- Responsive and accessible UI design
- TypeScript support with full type definitions
- Comprehensive error handling strategy
- Multiple wallet support (web + extension)
- Theme customization options

## Setup

1. Clone the repository and navigate to the example directory:
```bash
cd core/modal-example
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure the environment:
```bash
# For development (uses local wallet)
cp src/configs/development.ts.example src/configs/development.ts

# For production (uses production endpoints)
cp src/configs/production.ts.example src/configs/production.ts
```

4. Update the configuration file with your settings:
```typescript
// src/configs/development.ts or production.ts
export const config = {
  dappInfo: {
    name: "Your DApp Name",
    description: "Your DApp Description",
    icon: "path/to/icon",
    origin: "https://your-dapp.com"
  },
  // ... other configuration options
};
```

## Running the Example

Start the development server:
```bash
# Start in development mode with hot reloading
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

The example will be available at http://localhost:5173 by default.

## Configuration

### Development Configuration (`development.ts`)
```typescript
import { TransportType, AdapterType } from '@walletmesh/modal';

export const config = {
  wallets: [
    {
      id: "local_wallet",
      name: "Local Development Wallet",
      icon: "/wallet-icon.svg",
      transport: {
        type: TransportType.PostMessage,
        options: { origin: "http://localhost:3000" }
      },
      adapter: {
        type: AdapterType.WalletMeshAztec
      }
    }
  ],
  // ... other configuration options
};
```

### Production Configuration (`production.ts`)
```typescript
export const config = {
  wallets: [
    {
      id: "web_wallet",
      name: "Production Web Wallet",
      icon: "/wallet-icon.svg",
      transport: {
        type: TransportType.PostMessage,
        options: { origin: "https://wallet.production.com" }
      },
      adapter: {
        type: AdapterType.WalletMeshAztec
      }
    },
    {
      id: "extension_wallet",
      name: "Browser Extension Wallet",
      icon: "/extension-icon.svg",
      transport: {
        type: TransportType.Extension,
        options: { extensionId: "your-extension-id" }
      },
      adapter: {
        type: AdapterType.WalletMeshAztec
      }
    }
  ],
  // ... other configuration options
};
```

## Error Handling

The example implements a comprehensive error handling strategy through multiple layers:

### 1. Error Boundary Component
```typescript
import { WalletErrorBoundary } from '@walletmesh/modal';

function App() {
  return (
    <WalletErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorDisplay error={error} onReset={resetError} />
      )}
    >
      <WalletProvider>
        <YourApp />
      </WalletProvider>
    </WalletErrorBoundary>
  );
}
```

### 2. Runtime Error Handling
```typescript
function WalletWrapper() {
  const handleError = useCallback((error: Error) => {
    console.error('Wallet error:', error);
    // Implement your error handling logic
  }, []);

  return (
    <WalletProvider
      onError={handleError}
      // ... other props
    >
      <YourApp />
    </WalletProvider>
  );
}
```

### 3. User-Friendly Error UI
```typescript
function ErrorDisplay({ error, onReset }) {
  return (
    <div className="error-container">
      <h3>Something went wrong</h3>
      <p>{error.message}</p>
      <button onClick={onReset}>Try Again</button>
    </div>
  );
}
```

## Folder Structure

```
src/
  ├── configs/
  │   ├── development.ts   # Development configuration
  │   └── production.ts    # Production configuration
  ├── App.tsx             # Main application component
  ├── App.css             # Styles
  └── main.tsx            # Entry point
```

## Best Practices

1. Error Handling
   - Always wrap your app with `WalletErrorBoundary`
   - Implement user-friendly error messages
   - Provide clear recovery options
   - Log errors appropriately

2. Configuration Management
   - Use environment-specific configurations
   - Validate configuration at runtime
   - Keep sensitive data in environment variables

3. Accessibility
   - Maintain WCAG 2.1 compliance
   - Implement keyboard navigation
   - Provide proper ARIA labels
   - Ensure sufficient color contrast

4. Performance
   - Lazy load wallet connections
   - Implement proper cleanup on unmount
   - Cache wallet instances appropriately

5. Security
   - Validate all wallet interactions
   - Implement proper origin checks
   - Handle disconnections gracefully

## Customization

### Theme Customization
```css
/* App.css */
:root {
  --walletmesh-primary-color: #007bff;
  --walletmesh-secondary-color: #6c757d;
  --walletmesh-background: #ffffff;
  --walletmesh-text-color: #212529;
  --walletmesh-border-radius: 8px;
}
```

### Component Styling
```typescript
import styled from 'styled-components';
import { ConnectButton } from '@walletmesh/modal';

const StyledConnectButton = styled(ConnectButton)`
  // Your custom styles
  padding: 12px 24px;
  background: var(--walletmesh-primary-color);
  border-radius: var(--walletmesh-border-radius);
`;
```

### Custom Modal Content
```typescript
function CustomModal() {
  return (
    <WalletModal
      header={<CustomHeader />}
      footer={<CustomFooter />}
      // ... other props
    >
      <CustomContent />
    </WalletModal>
  );
}
```

## Troubleshooting

### Common Issues

1. Connection Failures
   - Check wallet configuration
   - Verify origin settings
   - Ensure proper network connectivity

2. Type Errors
   - Update @walletmesh/modal to latest version
   - Check TypeScript configuration
   - Verify import paths

3. Styling Issues
   - Check CSS variable definitions
   - Verify style precedence
   - Inspect browser dev tools

4. Runtime Errors
   - Check console for error messages
   - Verify environment configuration
   - Ensure proper error boundary setup

### Debug Mode
```typescript
<WalletProvider debug={true}>
  <YourApp />
</WalletProvider>
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

For more details, see the [contribution guidelines](../../CONTRIBUTING.md).
