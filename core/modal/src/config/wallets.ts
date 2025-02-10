import { TransportType } from '../lib/transports/types.js';
import { AdapterType } from '../lib/adapters/types.js';
import type { WalletInfo } from '../types.js';

export const WalletList: WalletInfo[] = [
  {
    id: 'firewallet',
    name: 'FireWallet',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='10' fill='%23FF9900'/></svg>",
    transport: {
      type: TransportType.PostMessage
    },
    adapter: {
      type: AdapterType.WalletMeshAztec
    }
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect width='24' height='24' fill='%2300A3FF'/></svg>",
    transport: {
      type: TransportType.PostMessage
    },
    adapter: {
      type: AdapterType.WalletMeshAztec
    }
  },
  {
    id: 'azguard',
    name: 'AzGuard',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 0 L24 24 L0 24 Z' fill='%2320E3B2'/></svg>",
    transport: {
      type: TransportType.Extension
    },
    adapter: {
      type: AdapterType.WalletMeshAztec
    }
  },
];
