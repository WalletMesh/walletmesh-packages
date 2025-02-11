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
    id: 'aztec_web',
    name: 'Aztec Web Wallet',
    icon: '',
    url: 'https://wallet.aztec.network',
    transport: {
      type: TransportType.PostMessage,
      options: { 
        origin: 'https://wallet.aztec.network'
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
  }
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
