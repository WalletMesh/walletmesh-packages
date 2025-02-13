import { TransportType } from '../lib/transports/types.js';
import { AdapterType } from '../lib/adapters/types.js';
import type { WalletInfo } from '../types.js';

export const WalletList: WalletInfo[] = [
  {
    id: 'firewallet',
    name: 'FireWallet',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='10' fill='%23FF9900'/></svg>",
    transport: {
      type: TransportType.PostMessage,
    },
    adapter: {
      type: AdapterType.WalletMeshAztec,
    },
  },
  {
    id: 'aztec_obsidian',
    name: 'Obsidian Wallet',
    icon: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iODkwcHgiIGhlaWdodD0iODkwcHgiIHZpZXdCb3g9IjAgMCA4OTAgODkwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogIDx0aXRsZT53YWxsZXQtbG9nb0AzeDwvdGl0bGU+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTAwJSIgaWQ9ImxpbmVhckdyYWRpZW50LTEiPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNjE2MTYxIiBvZmZzZXQ9IjAlIi8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM1MjUyNTIiIG9mZnNldD0iMTAwJSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCB4MT0iNTAlIiB5MT0iMCUiIHgyPSI1MCUiIHkyPSIxMDAlIiBpZD0ibGluZWFyR3JhZGllbnQtMiI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGMUYxRjEiIG9mZnNldD0iMCUiLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzNFM0UzRSIgb2Zmc2V0PSIxMDAlIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGxpbmVhckdyYWRpZW50IHgxPSI1MCUiIHkxPSIwJSIgeDI9IjUwJSIgeTI9IjEwMCUiIGlkPSJsaW5lYXJHcmFkaWVudC0zIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0JCQkJCQiIgb2Zmc2V0PSIwJSIvPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjODU4NTg1IiBvZmZzZXQ9IjEwMCUiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICA8bGluZWFyR3JhZGllbnQgeDE9IjUwJSIgeTE9IjAlIiB4Mj0iNTAlIiB5Mj0iMTQ2LjM1MTg4JSIgaWQ9ImxpbmVhckdyYWRpZW50LTQiPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjNkI4MEZGIiBvZmZzZXQ9IjAuMDU3MzY0NTEwNSUiLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzY1NTJFQSIgb2Zmc2V0PSIzNS41MDM5NzklIi8+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM4RjVDRDciIG9mZnNldD0iNjQuNjAxOTg0NyUiLz4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzU3NTdBOCIgb2Zmc2V0PSIxMDAlIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8ZyBpZD0id2FsbGV0LWxvZ28iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgaWQ9ImxvZ28iIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM0LCAwKSI+CiAgICAgIDxwb2x5Z29uIGlkPSJidG1fcmlnaHQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMSkiIHBvaW50cz0iNDExIDg5MCA4MjIgNDQ1IDY0NiA0MjgiLz4KICAgICAgPHBvbHlnb24gaWQ9ImJ0bV9sZWZ0IiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTEpIiBwb2ludHM9IjQxMSA4OTAgMTc2IDQyOCAwIDQ0NSIvPgogICAgICA8cG9seWdvbiBpZD0ibWlkZGxlIiBmaWxsPSJ1cmwoI2xpbmVhckdyYWRpZW50LTIpIiBwb2ludHM9IjQxMSAwIDY0NiA0MjggNDExIDg5MCAxNzYgNDI4Ii8+CiAgICAgIDxwb2x5Z29uIGlkPSJ0b3BfcmlnaHQiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtMykiIHBvaW50cz0iNDExIDAgODIyIDQ0NSA2NDYgNDI4Ii8+CiAgICAgIDxwb2x5Z29uIGlkPSJ0b3BfbGVmdCIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudC0zKSIgcG9pbnRzPSI0MTEgMCAxNzYgNDI4IDAgNDQ1Ii8+CiAgICAgIDxwb2x5Z29uIGlkPSJSZWN0YW5nbGUiIGZpbGw9InVybCgjbGluZWFyR3JhZGllbnQtNCkiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogY29sb3I7IiBwb2ludHM9IjQxMSAwIDgyMiA0NDQuOTk3MzAxIDQxMSA4OTAgLTQuNjgzODk3NzFlLTExIDQ0NSIvPgogICAgPC9nPgogIDwvZz4KPC9zdmc+Cg==',
    url: 'https://obsidion.vercel.app/sign',
    transport: {
      type: TransportType.Null,
    },
    adapter: {
      type: AdapterType.ObsidionAztec,
      options: {
        chainId: 'aztec',
        networkId: '31337',
      },
    },
  },
  {
    id: 'azguard',
    name: 'AzGuard',
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M12 0 L24 24 L0 24 Z' fill='%2320E3B2'/></svg>",
    transport: {
      type: TransportType.PostMessage,
    },
    adapter: {
      type: AdapterType.WalletMeshAztec,
    },
  },
];
