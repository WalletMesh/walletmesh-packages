import type { WalletInfo, DappInfo } from '../../types.js';
import { WalletList } from '../../config/wallets.js';
import { DefaultIcon } from '../constants/defaultIcons.js';

export interface WalletMeshProviderConfig {
  wallets: WalletInfo[];
  dappInfo: DappInfo;
  supportedChains: string[] | undefined;
}

export class WalletMeshConfig {
  private wallets: WalletInfo[];
  private dappInfo?: DappInfo;
  private supportedChains?: string[];

  private constructor() {
    // Initialize with default WalletList
    this.wallets = [...WalletList];
  }

  static create(): WalletMeshConfig {
    return new WalletMeshConfig();
  }

  clearWallets(): WalletMeshConfig {
    this.wallets = [];
    return this;
  }

  addWallet(wallet: WalletInfo): WalletMeshConfig {
    this.validateIcon(wallet.icon, `Wallet "${wallet.name}"`);
    this.wallets.push(wallet);
    return this;
  }

  addWallets(wallets: WalletInfo[]): WalletMeshConfig {
    for (const wallet of wallets) {
      this.validateIcon(wallet.icon, `Wallet "${wallet.name}"`);
    }
    this.wallets.push(...wallets);
    return this;
  }

  removeWallet(walletId: string): WalletMeshConfig {
    this.wallets = this.wallets.filter((w) => w.id !== walletId);
    return this;
  }

  setSupportedChains(chains: string[]): WalletMeshConfig {
    this.supportedChains = chains;
    return this;
  }

  setDappInfo(info: DappInfo): WalletMeshConfig {
    // Validate dapp icon if provided
    this.validateIcon(info.icon, 'DApp');
    this.dappInfo = info;
    return this;
  }

  private validateIcon(icon: string | undefined, context: string): void {
    if (icon && !this.isDataUri(icon)) {
      throw new Error(`${context} icon must be a data URI when provided. Received: ${icon}`);
    }
  }

  private isDataUri(uri: string): boolean {
    return uri.startsWith('data:');
  }

  private filterWalletsByChain(): WalletInfo[] {
    if (!this.supportedChains || this.supportedChains.length === 0) {
      return this.wallets;
    }

    return this.wallets.filter((wallet) => {
      if (!wallet.supportedChains || wallet.supportedChains.length === 0) {
        return true;
      }
      return wallet.supportedChains.some((chain) => {
        const chains = this.supportedChains;
        return chains ? chains.includes(chain) : false;
      });
    });
  }

  build(): WalletMeshProviderConfig {
    if (!this.dappInfo) {
      throw new Error('DappInfo must be set before building config');
    }

    return {
      wallets: this.filterWalletsByChain(),
      dappInfo: {
        ...this.dappInfo,
        icon: this.dappInfo.icon ?? DefaultIcon.Dapp,
      },
      supportedChains: this.supportedChains,
    };
  }
}
