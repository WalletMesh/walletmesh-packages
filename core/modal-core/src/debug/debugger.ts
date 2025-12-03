/**
 * Debugging utilities for WalletMesh development
 * @module debug/debugger
 * @public
 */

import type { ChainType, ConnectionResult, ModalState, WalletInfo } from '../types.js';

// Extend Window interface for debug properties
declare global {
  interface Window {
    walletMeshDebugEnabled?: boolean;
    walletMeshDebug?: {
      enable: () => void;
      disable: () => void;
      report: () => Promise<void>;
      export: () => Promise<string>;
      log: (message: string, data?: unknown) => void;
    };
    ethereum?: unknown;
    aztec?: unknown;
  }
}

/**
 * Debug information about the current environment
 */
export interface DebugInfo {
  timestamp: string;
  environment: {
    browser: string;
    userAgent: string;
    platform: string;
    mobile: boolean;
  };
  wallets: {
    detected: Array<{
      id: string;
      name: string;
      available: boolean;
      version?: string;
      conflictsWith?: string[];
    }>;
    connected?: {
      walletId: string;
      address: string;
      chainType: ChainType;
      chainId: string | number;
    };
  };
  providers: {
    ethereum?: boolean;
    solana?: boolean;
    aztec?: boolean;
  };
  state?: ModalState;
}

/**
 * WalletMesh debugger for development
 * @public
 */
export class WalletMeshDebugger {
  private enabled: boolean;
  private logPrefix = '[WalletMesh Debug]';

  constructor() {
    // Enable debugging only if debug flag is explicitly set
    this.enabled = typeof window !== 'undefined' && window.walletMeshDebugEnabled === true;
  }

  /**
   * Enable or disable debugging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      window.walletMeshDebugEnabled = enabled;
    }
  }

  /**
   * Log debug information
   */
  log(message: string, data?: unknown): void {
    if (!this.enabled) return;

    console.log(
      `%c${this.logPrefix}%c ${message}`,
      'color: #4A90E2; font-weight: bold;',
      'color: inherit;',
      data,
    );
  }

  /**
   * Log warning
   */
  warn(message: string, data?: unknown): void {
    if (!this.enabled) return;

    console.warn(
      `%c${this.logPrefix}%c ${message}`,
      'color: #F5A623; font-weight: bold;',
      'color: inherit;',
      data,
    );
  }

  /**
   * Log error
   */
  error(message: string, error?: unknown): void {
    if (!this.enabled) return;

    console.error(
      `%c${this.logPrefix}%c ${message}`,
      'color: #D0021B; font-weight: bold;',
      'color: inherit;',
      error,
    );
  }

  /**
   * Log wallet detection results
   */
  logWalletDetection(results: Array<{ wallet: WalletInfo; available: boolean; details?: unknown }>): void {
    if (!this.enabled) return;

    console.group(`%c${this.logPrefix} Wallet Detection Results`, 'color: #4A90E2; font-weight: bold;');

    for (const { wallet, available, details } of results) {
      const icon = available ? '✅' : '❌';
      const color = available ? '#27AE60' : '#E74C3C';

      console.log(
        `%c${icon} ${wallet.name}%c (${wallet.id})`,
        `color: ${color}; font-weight: bold;`,
        'color: #7F8C8D;',
        details,
      );
    }

    console.groupEnd();
  }

  /**
   * Log connection attempt
   */
  logConnection(walletId: string, chainType?: ChainType): void {
    if (!this.enabled) return;

    this.log(`Attempting connection to ${walletId}${chainType ? ` on ${chainType}` : ''}`, {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log connection result
   */
  logConnectionResult(result: ConnectionResult): void {
    if (!this.enabled) return;

    console.group(`%c${this.logPrefix} Connection Successful`, 'color: #27AE60; font-weight: bold;');
    console.log('Wallet:', result.walletId);
    console.log('Address:', result.address);
    console.log('Chain:', `${result.chain.chainType} (${result.chain.chainId})`);
    console.log('Accounts:', result.accounts);
    console.groupEnd();
  }

  /**
   * Log state change
   */
  logStateChange(oldState: Partial<ModalState>, newState: Partial<ModalState>): void {
    if (!this.enabled) return;

    console.group(`%c${this.logPrefix} State Change`, 'color: #9B59B6; font-weight: bold;');
    console.log('Previous:', oldState);
    console.log('Current:', newState);
    console.groupEnd();
  }

  /**
   * Get comprehensive debug information
   */
  async getDebugInfo(): Promise<DebugInfo> {
    const info: DebugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        browser: this.getBrowserInfo(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        mobile: navigator.userAgent
          ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          : false,
      },
      wallets: {
        detected: [],
      },
      providers: {
        ethereum: typeof window.ethereum !== 'undefined',
        solana: typeof (window as { solana?: unknown }).solana !== 'undefined',
        aztec: typeof window.aztec !== 'undefined',
      },
    };

    return info;
  }

  /**
   * Export debug information as JSON
   */
  async exportDebugInfo(): Promise<string> {
    const info = await this.getDebugInfo();
    return JSON.stringify(info, null, 2);
  }

  /**
   * Create a debug report
   */
  async createDebugReport(): Promise<void> {
    if (!this.enabled) return;

    const info = await this.getDebugInfo();

    console.group(`%c${this.logPrefix} Debug Report`, 'color: #E67E22; font-weight: bold;');
    console.log('🕐 Generated at:', info.timestamp);

    console.group('🌐 Environment');
    console.table(info.environment);
    console.groupEnd();

    console.group('💰 Wallet Providers');
    console.table(info.providers);
    console.groupEnd();

    console.group('🔌 Detected Wallets');
    if (info.wallets.detected.length > 0) {
      console.table(info.wallets.detected);
    } else {
      console.log('No wallets detected');
    }
    console.groupEnd();

    if (info.wallets.connected) {
      console.group('✅ Connected Wallet');
      console.table(info.wallets.connected);
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Install global debug helper
   */
  installGlobal(): void {
    if (typeof window !== 'undefined') {
      window.walletMeshDebug = {
        enable: () => this.setEnabled(true),
        disable: () => this.setEnabled(false),
        report: () => this.createDebugReport(),
        export: () => this.exportDebugInfo(),
        log: (message: string, data?: unknown) => this.log(message, data),
      };

      this.log('Debug utilities installed. Access via window.walletMeshDebug');
    }
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;

    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  }
}

/**
 * Global debugger instance
 * @public
 */
let walletMeshDebuggerInstance: WalletMeshDebugger | null = null;

export const walletMeshDebugger = {
  get instance(): WalletMeshDebugger {
    if (!walletMeshDebuggerInstance) {
      walletMeshDebuggerInstance = new WalletMeshDebugger();
    }
    return walletMeshDebuggerInstance;
  },

  // Proxy all methods for convenience
  log: (message: string, data?: unknown) => walletMeshDebugger.instance.log(message, data),
  warn: (message: string, data?: unknown) => walletMeshDebugger.instance.warn(message, data),
  error: (message: string, error?: unknown) => walletMeshDebugger.instance.error(message, error),
  setEnabled: (enabled: boolean) => walletMeshDebugger.instance.setEnabled(enabled),
  installGlobal: () => walletMeshDebugger.instance.installGlobal(),
  logStateChange: (oldState: Partial<ModalState>, newState: Partial<ModalState>) =>
    walletMeshDebugger.instance.logStateChange(oldState, newState),
  getDebugInfo: () => walletMeshDebugger.instance.getDebugInfo(),
};
