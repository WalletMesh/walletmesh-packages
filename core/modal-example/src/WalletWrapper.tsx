import React from 'react';
import { WalletProvider, WalletErrorBoundary } from '@walletmesh/modal';
import { sandboxConfig } from './configs/sandbox';
import { devnetConfig } from './configs/devnet';

const isDevelopment = process.env.NODE_ENV === 'development';
const config = isDevelopment ? sandboxConfig : devnetConfig;

interface WalletWrapperProps {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}

export const WalletWrapper: React.FC<WalletWrapperProps> = ({ children, onError }) => {
  return (
    <WalletErrorBoundary onError={onError}>
      <WalletProvider config={config} onError={onError}>
        {children}
      </WalletProvider>
    </WalletErrorBoundary>
  );
};
