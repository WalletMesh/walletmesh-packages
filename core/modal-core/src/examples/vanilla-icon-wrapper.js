/**
 * Example vanilla JavaScript implementation demonstrating usage of modal-core icon utilities
 * This shows how the migrated utilities can be used in plain JavaScript without any framework
 */

import {
  RECOVERY_PRESETS,
  applyFallbackToElement,
  createIconAccessibilityAttributes,
  createIconContainerConfig,
  createIconErrorRecovery,
  createSandboxedIcon,
  normalizeIconOptions,
} from '@walletmesh/modal-core';

/**
 * Creates a sandboxed icon wrapper using vanilla JavaScript
 *
 * @param {Object} options - Configuration options
 * @param {string} options.src - Icon data URI
 * @param {number} [options.size=24] - Icon size in pixels
 * @param {string} [options.className] - CSS class name
 * @param {string} [options.alt] - Alt text for accessibility
 * @param {string} [options.fallbackIcon] - Fallback icon data URI
 * @param {number} [options.cspTimeout] - CSP timeout in milliseconds
 * @param {boolean} [options.disabled=false] - Whether the icon is disabled
 * @param {Object} [options.disabledStyle] - Custom disabled styling
 * @param {Function} [options.onClick] - Click handler function
 * @param {Function} [options.onCspError] - CSP error callback
 * @returns {HTMLElement} The created icon container element
 */
export function createVanillaIconWrapper(options) {
  const {
    src,
    size = 24,
    className = '',
    alt = '',
    fallbackIcon,
    cspTimeout,
    disabled = false,
    disabledStyle,
    onClick,
    onCspError,
  } = options;

  // Create error recovery instance
  const errorRecovery = createIconErrorRecovery(RECOVERY_PRESETS.conservative);

  // Component state
  let _hasError = false;
  let isLoading = true;

  // Generate container configuration using modal-core utility
  const containerConfig = createIconContainerConfig({
    size,
    disabled,
    clickable: !!onClick,
    loading: isLoading,
    className,
  });

  // Create container element
  const containerElement = document.createElement('div');

  // Apply container styling and attributes
  Object.assign(containerElement.style, containerConfig.containerStyles);
  for (const [key, value] of Object.entries(containerConfig.attributes)) {
    containerElement.setAttribute(key, value);
  }

  if (className) {
    containerElement.className = className;
  }

  // Generate accessibility attributes using modal-core utility
  const a11yAttributes = createIconAccessibilityAttributes({
    alt,
    disabled,
    clickable: !!onClick,
    loading: isLoading,
  });

  // Apply accessibility attributes
  for (const [key, value] of Object.entries(a11yAttributes)) {
    containerElement.setAttribute(key, value);
  }

  // Event handlers
  function handleClick(event) {
    if (!isLoading && !disabled && onClick) {
      event.preventDefault();
      onClick();
    }
  }

  function handleKeyDown(event) {
    if (!isLoading && !disabled && onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick();
    }
  }

  // Add event listeners
  if (onClick) {
    containerElement.addEventListener('click', handleClick);
    containerElement.addEventListener('keydown', handleKeyDown);
  }

  // Icon loading logic
  async function loadIcon() {
    // Clear existing content
    containerElement.innerHTML = '';
    _hasError = false;
    isLoading = true;

    // Update container state
    containerElement.setAttribute('data-has-error', 'false');

    // Show loading state
    const loadingElement = document.createElement('div');
    Object.assign(loadingElement.style, containerConfig.loading.styles);
    for (const [key, value] of Object.entries(containerConfig.loading.attributes)) {
      loadingElement.setAttribute(key, value);
    }
    loadingElement.textContent = containerConfig.loading.content;
    containerElement.appendChild(loadingElement);

    try {
      // Normalize options using modal-core utility
      const normalizedOptions = normalizeIconOptions({
        iconDataUri: src,
        size,
        fallbackIcon,
        timeout: cspTimeout,
        disabled,
        disabledStyle,
        onCspError: onCspError
          ? (error) => {
              console.warn('CSP blocked icon:', error);
              onCspError(error);
            }
          : undefined,
      });

      const iframe = await createSandboxedIcon(normalizedOptions);

      // Apply accessibility attributes to iframe
      const iframeA11yAttributes = createIconAccessibilityAttributes({
        alt,
        disabled,
        clickable: !!onClick,
        loading: false,
      });

      for (const [key, value] of Object.entries(iframeA11yAttributes)) {
        iframe.setAttribute(key, value);
      }

      // Replace loading with iframe
      containerElement.innerHTML = '';
      containerElement.appendChild(iframe);
      isLoading = false;

      // Update accessibility attributes for loaded state
      const finalA11yAttributes = createIconAccessibilityAttributes({
        alt,
        disabled,
        clickable: !!onClick,
        loading: false,
      });

      for (const [key, value] of Object.entries(finalA11yAttributes)) {
        containerElement.setAttribute(key, value);
      }
    } catch (error) {
      console.warn('Failed to create sandboxed icon:', error);

      // Use unified error recovery pipeline
      const recoveryResult = await errorRecovery.recover(error, {
        iconDataUri: src,
        size,
        fallbackIcon,
        timeout: cspTimeout,
        disabled,
        disabledStyle,
      });

      containerElement.innerHTML = '';

      if (recoveryResult.success) {
        if (recoveryResult.result instanceof HTMLIFrameElement) {
          containerElement.appendChild(recoveryResult.result);
          isLoading = false;
        } else if (
          recoveryResult.result &&
          typeof recoveryResult.result === 'object' &&
          'content' in recoveryResult.result
        ) {
          const fallbackElement = document.createElement('div');
          applyFallbackToElement(fallbackElement, recoveryResult.result);
          containerElement.appendChild(fallbackElement);
          isLoading = false;
        }
      } else {
        _hasError = true;
        isLoading = false;
        containerElement.setAttribute('data-has-error', 'true');

        // Create basic error fallback
        const errorElement = document.createElement('div');
        errorElement.textContent = '⚠️';
        errorElement.style.fontSize = `${size * 0.8}px`;
        errorElement.style.color = '#666';
        errorElement.setAttribute('title', `Failed to load icon: ${alt || 'Unknown'}`);
        containerElement.appendChild(errorElement);
      }

      // Update accessibility attributes for final state
      const errorA11yAttributes = createIconAccessibilityAttributes({
        alt,
        disabled,
        clickable: !!onClick,
        loading: false,
      });

      for (const [key, value] of Object.entries(errorA11yAttributes)) {
        containerElement.setAttribute(key, value);
      }
    }
  }

  // Load icon immediately
  loadIcon();

  // Expose methods for dynamic updates
  containerElement.updateIcon = (newOptions) => {
    Object.assign(options, newOptions);
    return loadIcon();
  };

  containerElement.destroy = () => {
    if (onClick) {
      containerElement.removeEventListener('click', handleClick);
      containerElement.removeEventListener('keydown', handleKeyDown);
    }
    containerElement.innerHTML = '';
  };

  return containerElement;
}

/**
 * Creates a wallet icon wrapper using vanilla JavaScript
 *
 * @param {Object} options - Configuration options
 * @param {Object} options.wallet - Wallet information
 * @param {string} options.wallet.id - Wallet ID
 * @param {string} options.wallet.name - Wallet name
 * @param {string} options.wallet.icon - Wallet icon data URI
 * @param {number} [options.size=24] - Icon size in pixels
 * @param {string} [options.className] - CSS class name
 * @param {Function} [options.onClick] - Click handler that receives wallet ID
 * @param {boolean} [options.disabled=false] - Whether the wallet is disabled
 * @param {Object} [options.disabledStyle] - Custom disabled styling
 * @param {string} [options.fallbackIcon] - Fallback icon data URI
 * @param {number} [options.cspTimeout] - CSP timeout in milliseconds
 * @param {Function} [options.onCspError] - CSP error callback
 * @returns {HTMLElement} The created wallet icon container element
 */
export function createVanillaWalletIcon(options) {
  const {
    wallet,
    size = 24,
    className,
    onClick,
    disabled = false,
    disabledStyle,
    fallbackIcon,
    cspTimeout,
    onCspError,
  } = options;

  const handleClick = onClick && !disabled ? () => onClick(wallet.id) : undefined;

  return createVanillaIconWrapper({
    src: wallet.icon,
    size,
    className,
    alt: `${wallet.name} wallet icon${disabled ? ' (unsupported)' : ''}`,
    fallbackIcon,
    cspTimeout,
    disabled,
    disabledStyle,
    onClick: handleClick,
    onCspError,
  });
}

/**
 * Example usage and demonstration
 */
export function demonstrateVanillaIconWrapper() {
  // Create a basic icon
  const basicIcon = createVanillaIconWrapper({
    src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="blue"/></svg>',
    size: 32,
    alt: 'Example icon',
    onClick: () => console.log('Icon clicked!'),
  });

  // Create a wallet icon
  const walletIcon = createVanillaWalletIcon({
    wallet: {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="orange"/></svg>',
    },
    size: 40,
    onClick: (walletId) => console.log(`Wallet ${walletId} clicked!`),
  });

  // Add to page
  document.body.appendChild(basicIcon);
  document.body.appendChild(walletIcon);

  // Demonstrate dynamic updates
  setTimeout(() => {
    basicIcon.updateIcon({
      src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="green"/></svg>',
      alt: 'Updated icon',
    });
  }, 3000);

  // Cleanup after 10 seconds
  setTimeout(() => {
    basicIcon.destroy();
    walletIcon.destroy();
    basicIcon.remove();
    walletIcon.remove();
  }, 10000);
}

// Export utilities for convenience
export {
  createSandboxedIcon,
  createIconContainerConfig,
  createIconAccessibilityAttributes,
  normalizeIconOptions,
  createIconErrorRecovery,
  applyFallbackToElement,
  RECOVERY_PRESETS,
} from '@walletmesh/modal-core';
