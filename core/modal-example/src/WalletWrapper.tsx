import React from 'react';
import { WalletProvider, DappInfo, TransportType, AdapterType } from '@walletmesh/modal';

const dappInfo: DappInfo = {
  name: 'Example Dapp',
  description: 'Example Dapp Description',
  origin: 'http://localhost:3000',
  icon: '',
};

const wallets = [
  {
    id: 'aztec_obsidian',
    name: 'Obsidian Wallet',
    icon: 'https://obsidion.vercel.app/wallet-logo@3x.svg',
    url: 'https://obsidion.vercel.app/sign',
    transport: {
      type: TransportType.Null,
    },
    adapter: {
      type: AdapterType.ObsidionAztec,
      options: {
        chainId: 'aztec',
        networkId: '31337',
      }
    }
  },
  {
    id: 'aztec_web',
    name: 'Non-Working Aztec Web Wallet',
    icon: 'https://clarified.io/favicon.ico',
    url: 'https://aztec.wallet',
    transport: {
      type: TransportType.PostMessage,
      options: {
        origin: 'https://aztec.wallet',
      }
    },
    adapter: {
      type: AdapterType.WalletMeshAztec,
      options: {
        chainId: 'aztec',
        networkId: '1',
        rpcUrl: 'https://api.aztec.network/rpc'
      }
    }
  },
];

interface WalletWrapperProps {
  children: React.ReactNode;
}

export const WalletWrapper: React.FC<WalletWrapperProps> = ({ children }) => {
  return (
    <WalletProvider dappInfo={dappInfo} wallets={wallets}>
      {children}
    </WalletProvider>
  );
};
