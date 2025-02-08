export interface DappInfo {
  name: string;
  description: string;
  icon: string; // Data URI for the Dapp icon.
  origin: string;
}

export interface WalletInfo {
  name: string;
  icon: string;
  url?: string;
  adapterType: AdapterType;
  adapterOptions?: AdapterOptions;
  connectorType: ConnectorType;
  connectorOptions?: ConnectorOptions;
}

export interface ConnectedWallet extends WalletInfo {
  chain?: string;
  address?: string;
  sessionId?: string;
}

export interface Connector {
  connect(wallet: WalletInfo): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  getProvider(): Promise<unknown>;
  resumeSession(sessionData: ConnectedWallet): Promise<ConnectedWallet>;
}

export interface ConnectorOptions {
  url?: string;
  origin?: string;
  extensionId?: string;
}

export enum ConnectionStatus {
  Idle = 'idle',
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnecting = 'disconnecting',
  Resuming = 'resuming',
}

export enum ConnectorType {
  WebWallet = 'webwallet',
  Extension = 'extension',
}

export enum AdapterType {
  WalletMeshAztecAdapter = 'wm_aztec',
}

export interface Adapter {
  connect(wallet: WalletInfo): Promise<ConnectedWallet>;
  disconnect(): Promise<void>;
  getProvider(): Promise<unknown>;
  resumeSession(sessionData: ConnectedWallet): Promise<ConnectedWallet>;
}

export interface AdapterOptions {
  chainId?: string;
}
