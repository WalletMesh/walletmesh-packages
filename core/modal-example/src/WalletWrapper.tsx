import React from 'react';
import { WalletMeshProvider } from '@walletmesh/modal';
import { sandboxConfig } from './configs/sandbox';
import { devnetConfig } from './configs/devnet';

const isDevelopment = process.env.NODE_ENV === 'development';
const config = isDevelopment ? sandboxConfig : devnetConfig;

interface WalletWrapperProps {
  children: React.ReactNode;
}

export const WalletWrapper: React.FC<WalletWrapperProps> = ({ children }) => {
  return (
    <WalletMeshProvider {...config}>
      {children}
    </WalletMeshProvider>
  );
};
