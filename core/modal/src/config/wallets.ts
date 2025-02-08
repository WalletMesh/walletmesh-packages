import { AdapterType, ConnectorType, type WalletInfo } from '../types.js';

export const WalletList: WalletInfo[] = [
  {
    name: 'FireWallet',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='10' fill='%23FF9900'/></svg>",
    adapterType: AdapterType.WalletMeshAztecAdapter,
    connectorType: ConnectorType.WebWallet,
  },
  {
    name: 'Obsidian',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect width='24' height='24' fill='%2300A3FF'/></svg>",
    adapterType: AdapterType.WalletMeshAztecAdapter,
    connectorType: ConnectorType.WebWallet,
  },
  {
    name: 'AzGuard',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 0 L24 24 L0 24 Z' fill='%2320E3B2'/></svg>",
    adapterType: AdapterType.WalletMeshAztecAdapter,
    connectorType: ConnectorType.Extension,
  },
];
