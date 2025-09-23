/**
 * WalletMeshChainSwitchButton Component
 *
 * A React component that provides a button for switching blockchain chains
 * with visual feedback and animations during the switching process.
 *
 * Features:
 * - Displays current chain with icon and name
 * - Shows loading state during chain switching
 * - Pulse animation on button during switch
 * - Success indicator for current chain
 * - Disabled state during switching
 *
 * @module components/WalletMeshChainSwitchButton
 */

import type { SupportedChain } from '@walletmesh/modal-core';
import { useAccount } from '../hooks/useAccount.js';
import { useSwitchChain } from '../hooks/useSwitchChain.js';
import styles from './WalletMeshChainSwitchButton.module.css';

/**
 * Props for WalletMeshChainSwitchButton component
 *
 * @public
 */
export interface WalletMeshChainSwitchButtonProps {
  /** Target chain to switch to */
  targetChain: SupportedChain;
  /** Display name for the chain */
  chainName: string;
  /** Optional icon URL for the chain */
  chainIcon?: string;
  /** Additional CSS class names */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Callback when chain switch is initiated */
  onChainSwitch?: (chain: SupportedChain) => void;
  /** Callback when chain switch succeeds */
  onSuccess?: (chain: SupportedChain) => void;
  /** Callback when chain switch fails */
  onError?: (error: Error) => void;
}

/**
 * WalletMeshChainSwitchButton Component
 *
 * Renders a button that allows users to switch to a specific blockchain chain.
 * Shows visual feedback during the switching process including loading states
 * and animations.
 *
 * @example
 * ```tsx
 * <WalletMeshChainSwitchButton
 *   targetChain={{ chainId: '0x1', chainType: 'evm', name: 'Ethereum Mainnet', required: false, label: 'Ethereum Mainnet', interfaces: [], group: 'mainnet' }}
 *   chainName="Ethereum Mainnet"
 *   chainIcon="/images/ethereum.svg"
 *   onSuccess={(chain) => console.log('Switched to', chain.name)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom styling and error handling
 * <WalletMeshChainSwitchButton
 *   targetChain={{ chainId: '0x89', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' }}
 *   chainName="Polygon"
 *   chainIcon="/images/polygon.svg"
 *   className="my-custom-button"
 *   onError={(error) => toast.error(error.message)}
 * />
 * ```
 *
 * @param props - Component props
 * @returns React component for chain switching
 *
 * @public
 */
export function WalletMeshChainSwitchButton({
  targetChain,
  chainName,
  chainIcon,
  className = '',
  disabled = false,
  onChainSwitch,
  onSuccess,
  onError,
}: WalletMeshChainSwitchButtonProps) {
  const { chain: currentChain } = useAccount();
  const { switchChain, isSwitching } = useSwitchChain({
    onSuccess: (data) => {
      onSuccess?.(data.toChain);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const isCurrentChain = currentChain?.chainId === targetChain.chainId;
  const isSwitchingToThis = isSwitching && !isCurrentChain;

  const handleSwitch = async () => {
    if (disabled || isCurrentChain || isSwitching) return;

    onChainSwitch?.(targetChain);

    try {
      await switchChain(targetChain);
    } catch (error) {
      // Error is already handled by onError callback
      console.error('Chain switch failed:', error);
    }
  };

  return (
    <button
      type="button"
      className={`${styles['chainSwitchButton']} ${className} ${
        isCurrentChain ? styles['current'] : ''
      } ${isSwitchingToThis ? styles['switching'] : ''}`}
      onClick={handleSwitch}
      disabled={disabled || isSwitching}
      aria-label={`Switch to ${chainName}`}
      aria-pressed={isCurrentChain}
      aria-busy={isSwitchingToThis}
    >
      {chainIcon && <img src={chainIcon} alt={`${chainName} icon`} className={styles['chainIcon']} />}

      <span className={styles['chainName']}>{chainName}</span>

      {isCurrentChain && (
        <span className={styles['currentIndicator']} aria-label="Current chain">
          ✓
        </span>
      )}

      {isSwitchingToThis && <div className={styles['switchingSpinner']} aria-label="Switching chain" />}
    </button>
  );
}

// Add display name for React DevTools
WalletMeshChainSwitchButton.displayName = 'WalletMeshChainSwitchButton';
