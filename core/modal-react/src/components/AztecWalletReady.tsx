/**
 * Aztec wallet ready component
 *
 * A wrapper component that only renders children when an Aztec
 * wallet is connected and ready, providing fallback UI for other states.
 *
 * @module components/AztecWalletReady
 * @packageDocumentation
 */

import type { ReactNode } from 'react';
import type React from 'react';
import { useAztecWallet } from '../hooks/useAztecWallet.js';

/**
 * Props for the AztecWalletReady component
 *
 * @public
 */
export interface AztecWalletReadyProps {
  /** Children to render when wallet is ready */
  children: ReactNode;
  /** Content to show when wallet is not connected */
  fallback?: ReactNode;
  /** Content to show while wallet is connecting */
  connectingFallback?: ReactNode;
  /** Content to show when there's an error */
  errorFallback?: ReactNode | ((error: Error) => ReactNode);
  /** Whether to show a default connect button as fallback */
  showConnectButton?: boolean;
  /** Custom connect button component */
  connectButton?: ReactNode;
  /** Whether to require an Aztec chain specifically */
  requireAztecChain?: boolean;
  /** Content to show when on wrong chain */
  wrongChainFallback?: ReactNode;
}

/**
 * Component that guards its children, only rendering them when Aztec wallet is ready
 *
 * This component provides a convenient way to conditionally render content
 * based on wallet connection status, handling all the various states
 * (disconnected, connecting, connected, error) with appropriate fallbacks.
 *
 * @param props - Component props
 * @returns The appropriate content based on wallet state
 *
 * @example
 * ```tsx
 * import { AztecWalletReady } from '@walletmesh/modal-react/aztec';
 *
 * function ProtectedContent() {
 *   return (
 *     <AztecWalletReady
 *       fallback={<div>Please connect your wallet</div>}
 *       connectingFallback={<div>Connecting...</div>}
 *     >
 *       <div>
 *         <h2>Wallet is connected!</h2>
 *         <ContractInteractions />
 *       </div>
 *     </AztecWalletReady>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With error handling and custom fallbacks
 * function AdvancedGuard() {
 *   return (
 *     <AztecWalletReady
 *       showConnectButton={true}
 *       errorFallback={(error) => (
 *         <div className="error">
 *           <p>Connection failed: {error.message}</p>
 *           <button onClick={() => window.location.reload()}>
 *             Retry
 *           </button>
 *         </div>
 *       )}
 *       requireAztecChain={true}
 *       wrongChainFallback={
 *         <div>Please switch to an Aztec network</div>
 *       }
 *     >
 *       <AztecDApp />
 *     </AztecWalletReady>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Minimal usage - uses default fallbacks
 * function SimpleGuard() {
 *   return (
 *     <AztecWalletReady>
 *       <p>This content is only visible when wallet is ready</p>
 *     </AztecWalletReady>
 *   );
 * }
 * ```
 *
 * @public
 */
export function AztecWalletReady({
  children,
  fallback,
  connectingFallback,
  errorFallback,
  showConnectButton = false,
  connectButton,
  requireAztecChain = true,
  wrongChainFallback,
}: AztecWalletReadyProps): React.ReactElement {
  const { status, error, isAztecChain, isReady } = useAztecWallet();

  // Handle error state
  if (status === 'error' && error) {
    if (errorFallback) {
      return <>{typeof errorFallback === 'function' ? errorFallback(error) : errorFallback}</>;
    }
    return (
      <div style={{ padding: '20px', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px' }}>
        <strong>Connection Error:</strong> {error.message}
      </div>
    );
  }

  // Handle wrong chain
  if (requireAztecChain && status === 'ready' && !isAztecChain) {
    if (wrongChainFallback) {
      return <>{wrongChainFallback}</>;
    }
    return (
      <div style={{ padding: '20px', color: '#ca8a04', border: '1px solid #fde68a', borderRadius: '8px' }}>
        Please switch to an Aztec network to continue.
      </div>
    );
  }

  // Handle connecting state
  if (status === 'connecting') {
    if (connectingFallback) {
      return <>{connectingFallback}</>;
    }
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '10px' }}>🔄 Connecting to Aztec wallet...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>This may take a few moments</div>
      </div>
    );
  }

  // Handle disconnected state
  if (status === 'disconnected' || !isReady) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (showConnectButton) {
      if (connectButton) {
        return <>{connectButton}</>;
      }
      // Import and use AztecConnectButton if available
      // For now, show a simple message
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ marginBottom: '10px' }}>Please connect your Aztec wallet to continue</p>
          <div style={{ fontSize: '12px', color: '#666' }}>Use the connect button to get started</div>
        </div>
      );
    }
    return <div style={{ padding: '20px', textAlign: 'center' }}>Wallet not connected</div>;
  }

  // Wallet is ready - render children
  return <>{children}</>;
}

/**
 * Higher-order component version of AztecWalletReady
 *
 * Wraps a component to only render it when the Aztec wallet is ready.
 *
 * @param Component - Component to wrap
 * @param options - Guard options
 * @returns Wrapped component
 *
 * @example
 * ```tsx
 * import { withAztecWalletReady } from '@walletmesh/modal-react/aztec';
 *
 * const ProtectedComponent = withAztecWalletReady(
 *   MyComponent,
 *   { showConnectButton: true }
 * );
 * ```
 *
 * @public
 */
export function withAztecWalletReady<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AztecWalletReadyProps, 'children'>,
): React.ComponentType<P> {
  return function WalletReadyComponent(props: P) {
    return (
      <AztecWalletReady {...options}>
        <Component {...props} />
      </AztecWalletReady>
    );
  };
}
