import { WalletMeshConfig } from '@walletmesh/modal';

export const devnetConfig = WalletMeshConfig.create()
  .setDappInfo({
    name: 'Example dApp',
    description: 'A production example of WalletMesh integration',
    origin: 'http://localhost:3000',
    rpcUrl: 'http://127.0.0.1:8080',
  })
  .build();
