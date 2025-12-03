/**
 * Enhanced error messages with context and developer-friendly suggestions
 * @internal
 */

import type { ChainType } from '../../../types.js';

/**
 * Error message templates with helpful context
 */
export const ERROR_MESSAGES = {
  // Connection Errors
  CONNECTION: {
    WALLET_NOT_FOUND: (walletId: string) => ({
      message: `Wallet "${walletId}" not found or not installed`,
      suggestion: `Please ensure the wallet extension is installed and enabled. You can install it from the wallet's official website.`,
      link: getWalletInstallLink(walletId),
    }),

    USER_REJECTED: () => ({
      message: 'User rejected the connection request',
      suggestion:
        'The user cancelled the connection. This is normal behavior when users decide not to connect.',
    }),

    TIMEOUT: (timeout: number) => ({
      message: `Connection timed out after ${timeout}ms`,
      suggestion:
        'The wallet took too long to respond. Try refreshing the page or restarting the wallet extension.',
    }),

    ALREADY_CONNECTED: (walletId: string) => ({
      message: `Already connected to ${walletId}`,
      suggestion: 'Disconnect the current wallet before connecting to a new one.',
    }),

    CHAIN_NOT_SUPPORTED: (chainType: ChainType, walletId: string) => ({
      message: `Wallet "${walletId}" does not support ${chainType} chains`,
      suggestion: `Choose a different wallet that supports ${chainType}, or switch to a supported chain type.`,
    }),
  },

  // Configuration Errors
  CONFIGURATION: {
    INVALID_WALLET_INFO: (field: string) => ({
      message: `Invalid wallet configuration: missing or invalid "${field}"`,
      suggestion: 'Ensure the wallet info object has all required fields: id, name, icon, and chains array.',
      example: `{
  id: 'my-wallet',
  name: 'My Wallet',
  icon: 'data:image/svg+xml;base64,...',
  chains: ['evm', 'solana']
}`,
    }),

    INVALID_CHAIN_TYPE: (value: unknown) => ({
      message: `Invalid chain type: "${value}"`,
      suggestion: 'Valid chain types are: "evm", "solana", "aztec"',
    }),

    MISSING_ADAPTER: (adapterId: string) => ({
      message: `No adapter found for wallet "${adapterId}"`,
      suggestion:
        'Make sure the wallet adapter is registered. You may need to install an additional package or register a custom adapter.',
    }),
  },

  // Provider Errors
  PROVIDER: {
    NOT_FOUND: (chainType: ChainType) => ({
      message: `No provider found for ${chainType} chain`,
      suggestion: 'Ensure the wallet is connected and supports the requested chain type.',
    }),

    METHOD_NOT_SUPPORTED: (method: string, provider: string) => ({
      message: `Method "${method}" is not supported by ${provider} provider`,
      suggestion: 'Check the provider documentation for supported methods, or use a different provider.',
    }),

    INVALID_PARAMS: (method: string, expected: string) => ({
      message: `Invalid parameters for "${method}"`,
      suggestion: `Expected: ${expected}`,
    }),
  },

  // Transport Errors
  TRANSPORT: {
    CONNECTION_FAILED: (transport: string, reason?: string) => ({
      message: `Failed to connect to ${transport} transport${reason ? `: ${reason}` : ''}`,
      suggestion: 'Check your network connection and ensure the transport endpoint is accessible.',
    }),

    MESSAGE_FAILED: (transport: string) => ({
      message: `Failed to send message through ${transport} transport`,
      suggestion:
        'The transport may be disconnected. Try reconnecting or check the console for more details.',
    }),
  },

  // Development Helpers
  DEVELOPMENT: {
    DEPRECATED_METHOD: (method: string, alternative: string) => ({
      message: `Method "${method}" is deprecated`,
      suggestion: `Use "${alternative}" instead. This method will be removed in the next major version.`,
    }),

    INVALID_HOOK_CONTEXT: (hookName: string) => ({
      message: `${hookName} must be used within a WalletMeshProvider`,
      suggestion: `Wrap your app with <WalletMeshProvider> at the root level:

<WalletMeshProvider>
  <App />
</WalletMeshProvider>`,
    }),
  },
};

/**
 * Get wallet installation link
 */
function getWalletInstallLink(walletId: string): string | undefined {
  const links: Record<string, string> = {
    metamask: 'https://metamask.io/download/',
    phantom: 'https://phantom.app/download',
    coinbase: 'https://www.coinbase.com/wallet',
    rabby: 'https://rabby.io',
    // Add more wallet links as needed
  };

  return links[walletId.toLowerCase()];
}

/**
 * Format error with context for better debugging
 */
export function formatErrorWithContext(
  error: unknown,
  context: {
    operation?: string;
    walletId?: string;
    chainType?: ChainType;
    method?: string;
    [key: string]: unknown;
  },
): string {
  const lines: string[] = [];

  // Main error message
  if (error instanceof Error) {
    lines.push(`Error: ${error.message}`);
  } else {
    lines.push(`Error: ${String(error)}`);
  }

  // Add context
  lines.push('\nContext:');
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) {
      lines.push(`  ${key}: ${JSON.stringify(value)}`);
    }
  }

  // Add stack trace in development
  if (process.env['NODE_ENV'] === 'development' && error instanceof Error && error.stack) {
    lines.push('\nStack trace:');
    lines.push(error.stack);
  }

  return lines.join('\n');
}

/**
 * Create a developer-friendly error message
 */
export function createDeveloperMessage(
  template: { message: string; suggestion?: string; link?: string; example?: string },
  context?: Record<string, unknown>,
): string {
  const parts: string[] = [template.message];

  if (template.suggestion) {
    parts.push(`\n💡 Suggestion: ${template.suggestion}`);
  }

  // ✅ Show stack trace in development if cause is available (Commandment #4)
  if (process.env['NODE_ENV'] === 'development' && context?.['cause'] instanceof Error) {
    if (context['cause'].stack) {
      parts.push(`\n📚 Stack trace:\n${context['cause'].stack}`);
    }
  }

  if (template.link) {
    parts.push(`\n🔗 Learn more: ${template.link}`);
  }

  if (template.example) {
    parts.push(`\n📝 Example:\n${template.example}`);
  }

  if (context && Object.keys(context).length > 0) {
    // ✅ Don't stringify cause twice - it's already shown in stack trace
    const debugInfo = { ...context };
    delete debugInfo['cause'];

    if (Object.keys(debugInfo).length > 0) {
      parts.push(`\n🔍 Debug info: ${JSON.stringify(debugInfo, null, 2)}`);
    }
  }

  return parts.join('\n');
}
