import React from 'react';
import { WalletMeshProvider, DappInfo, WalletList } from '@walletmesh/modal';

const dappInfo: DappInfo = {
  name: 'Example Dapp',
  description: 'Example Dapp Description',
  origin: 'http://localhost:3000',
  icon: '',
};

interface WalletWrapperProps {
  children: React.ReactNode;
}

export const WalletWrapper: React.FC<WalletWrapperProps> = ({ children }) => {
  return (
    <WalletMeshProvider dappInfo={dappInfo} wallets={WalletList}>
      {children}
    </WalletMeshProvider>
  );
};
