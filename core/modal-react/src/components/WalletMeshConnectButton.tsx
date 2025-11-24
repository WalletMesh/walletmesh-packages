import type React from 'react';
import { useStore } from '../hooks/internal/useStore.js';
import { useAccount } from '../hooks/useAccount.js';
import { useConfig } from '../hooks/useConfig.js';
import { useSwitchChain } from '../hooks/useSwitchChain.js';
import { useConnectButtonState } from '../index.js';
import type { ChainType } from '../types.js';

/**
 * Props for the WalletMeshConnectButton component
 */
export interface WalletMeshConnectButtonProps {
  /** Custom label for the connect button */
  label?: string;
  /** Custom label for the connecting button */
  connectingLabel?: string;
  /** Custom label for the reconnecting button */
  reconnectingLabel?: string;
  /** Custom label for the connected button */
  connectedLabel?: string;
  /** Custom className for styling */
  className?: string;
  /** Custom styles object */
  style?: React.CSSProperties;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Whether to show the address when connected */
  showAddress?: boolean;
  /** Whether to show the chain when connected */
  showChain?: boolean;
  /** Whether to show the wallet name when connected */
  showWalletName?: boolean;
  /** Custom click handler for when connected (instead of opening modal) */
  onConnectedClick?: () => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Target chain type for chain-specific buttons */
  targetChainType?: ChainType;
}

/**
 * Get default styles based on props
 */
function getButtonStyles(
  size: WalletMeshConnectButtonProps['size'] = 'md',
  variant: WalletMeshConnectButtonProps['variant'] = 'primary',
  disabled = false,
): React.CSSProperties {
  const baseStyles: React.CSSProperties = {
    borderWidth: '0',
    borderStyle: 'none',
    borderRadius: 'var(--wm-radius-md, 8px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 'var(--wm-weight-medium, 500)',
    transition: 'all var(--wm-duration-normal, 0.2s) var(--wm-easing-default, ease)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--wm-space-sm, 8px)',
    opacity: disabled ? 0.6 : 1,
  };

  // Size styles
  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: 'var(--wm-space-xs, 6px) var(--wm-space-sm, 12px)', fontSize: 'var(--wm-text-sm, 14px)' },
    md: {
      padding: 'var(--wm-space-sm, 10px) var(--wm-space-md, 16px)',
      fontSize: 'var(--wm-text-base, 16px)',
    },
    lg: { padding: 'var(--wm-space-sm, 12px) var(--wm-space-lg, 20px)', fontSize: 'var(--wm-text-lg, 18px)' },
  };

  // Variant styles using CSS variables for theme support
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--wm-color-primary, #4F46E5)',
      color: 'var(--wm-color-text-on-primary, #ffffff)',
    },
    secondary: {
      backgroundColor: 'var(--wm-color-secondary, #6B7280)',
      color: 'var(--wm-color-text-on-secondary, #ffffff)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--wm-color-primary, #4F46E5)',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: 'var(--wm-color-primary, #4F46E5)',
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
}

/**
 * Pre-built connect button component with sensible defaults
 *
 * Provides a ready-to-use wallet connection button that handles
 * both connection and disconnection states automatically.
 *
 * ## Features
 * - **Automatic State Management**: Shows appropriate UI based on connection state
 * - **Built-in Loading States**: Displays spinner during connection
 * - **Address Display**: Optionally shows shortened wallet address
 * - **Chain Display**: Optionally shows current chain ID
 * - **Disconnect Confirmation**: Optional confirmation dialog before disconnecting
 * - **Custom Behavior**: Override default disconnect with custom click handler
 * - **Responsive Design**: Three size variants with proper scaling
 * - **Accessibility**: Proper ARIA attributes and keyboard support
 *
 * ## Styling
 * The button comes with three variants:
 * - `primary`: Blue background, white text (default)
 * - `secondary`: Gray background, white text
 * - `outline`: Transparent background with border
 *
 * ## Connection States
 * - **Disconnected**: Shows connect label, opens modal on click
 * - **Connecting**: Shows loading spinner with "Connecting..." text
 * - **Connected**: Shows green dot indicator with configurable content
 *
 * @param props - Component props
 * @returns React element representing the connect button
 *
 * @example
 * ```tsx
 * // Simple usage with defaults
 * <WalletMeshConnectButton />
 * ```
 *
 * @example
 * ```tsx
 * // Custom styling and labels
 * <WalletMeshConnectButton
 *   size="lg"
 *   variant="outline"
 *   label="Connect Your Wallet"
 *   className="custom-button"
 *   style={{ borderRadius: '12px' }}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Show wallet information when connected
 * <WalletMeshConnectButton
 *   showAddress={true}
 *   showChain={true}
 *   size="md"
 * />
 * // Connected state shows: "🟢 0x1234...5678 • Chain: 1"
 * ```
 *
 * @example
 * ```tsx
 * // Custom connected behavior (e.g., show account modal instead of disconnect)
 * function App() {
 *   const [showAccountModal, setShowAccountModal] = useState(false);
 *
 *   return (
 *     <>
 *       <WalletMeshConnectButton
 *         onConnectedClick={() => setShowAccountModal(true)}
 *         showAddress={true}
 *       />
 *       {showAccountModal && <AccountModal />}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom connected click behavior
 * <WalletMeshConnectButton
 *   onConnectedClick={() => console.log('Connected wallet clicked')}
 *   showAddress={true}
 * />
 * // When user clicks connected button: calls custom handler instead of opening modal
 * ```
 *
 * @example
 * ```tsx
 * // Disabled state for maintenance or loading
 * <WalletMeshConnectButton
 *   disabled={isMaintenanceMode}
 *   label={isMaintenanceMode ? "Maintenance" : "Connect Wallet"}
 * />
 * ```
 *
 * @category Components
 * @since 1.0.0
 */
export function WalletMeshConnectButton({
  label = 'Connect Wallet',
  connectingLabel = 'Connecting...',
  reconnectingLabel = 'Reconnecting...',
  connectedLabel = 'Connected',
  className,
  style,
  size = 'md',
  variant = 'primary',
  showAddress = false,
  showChain = false,
  showWalletName = false,
  onConnectedClick,
  disabled = false,
  targetChainType,
}: WalletMeshConnectButtonProps) {
  const { isConnected, isConnecting, isReconnecting, address, chain, chainType, wallet } = useAccount();
  const { open } = useConfig();
  const { isSwitching } = useSwitchChain();
  const currentView = useStore((state) => state.ui.currentView);

  // Check if we're in chain switching state
  const isChainSwitching = isSwitching || currentView === 'switchingChain';

  // Determine the correct connecting label based on state
  const effectiveConnectingLabel = isReconnecting
    ? reconnectingLabel
    : isChainSwitching
      ? 'Switching Chain...'
      : connectingLabel;

  // Use modal-core connect button service for business logic
  const buttonState = useConnectButtonState(
    {
      isConnected,
      isConnecting: isConnecting || isChainSwitching || isReconnecting,
      address,
      chainId: chain?.chainId,
      chainType,
      wallet,
    },
    {
      ...(targetChainType && { targetChainType }),
      labels: {
        connect: label,
        connecting: effectiveConnectingLabel,
        connected: connectedLabel,
      },
      showAddress,
      showChain,
      showWalletName,
    },
  );

  const buttonStyles = getButtonStyles(size, variant, disabled || buttonState.content.disabled);
  const finalStyles = { ...buttonStyles, ...style };

  const handleClick = async () => {
    if (disabled || buttonState.content.disabled) return;

    if (buttonState.action === 'connect') {
      // Open modal for wallet selection with optional chain type filter
      open(targetChainType ? { targetChainType } : undefined);
    } else if (buttonState.action === 'disconnect') {
      // Handle disconnect or show connection info based on props
      if (onConnectedClick) {
        onConnectedClick();
      } else {
        // Default behavior: open modal to show connection info
        open(targetChainType ? { targetChainType } : undefined);
      }
    }
    // For 'disabled' action, do nothing
  };

  const getButtonContent = () => {
    // Special handling for reconnecting state (show spinner with reconnecting label)
    if (isReconnecting) {
      return (
        <>
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>{reconnectingLabel}</span>
        </>
      );
    }

    // Special handling for chain switching state
    if (isChainSwitching) {
      return (
        <>
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: 'var(--wm-color-warning, #f59e0b)',
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span>Switching Chain...</span>
        </>
      );
    }

    if (buttonState.content.showIndicator) {
      if (buttonState.content.indicatorType === 'loading') {
        return (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'currentColor',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            {buttonState.content.text}
          </>
        );
      }

      if (buttonState.content.indicatorType === 'success') {
        return (
          <>
            <div
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
              }}
            />
            {buttonState.content.text}
          </>
        );
      }
    }

    return buttonState.content.text;
  };

  return (
    <>
      {/* Add keyframe animations for loading spinner and chain switching */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
      `}</style>

      <button
        className={className}
        style={{
          ...finalStyles,
          ...(isChainSwitching && {
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'var(--wm-color-warning, #f59e0b)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }),
        }}
        onClick={handleClick}
        disabled={disabled || buttonState.content.disabled || isChainSwitching}
        type="button"
        aria-busy={isChainSwitching}
      >
        {getButtonContent()}
      </button>
    </>
  );
}
