# Service API Reference

Quick reference for the consolidated services in WalletMesh Modal Core.

## ServiceRegistry

Central registry managing all services.

```typescript
interface ServiceRegistry {
  // Get all services
  getServices(): Services;
  
  // Get specific service
  getService<T extends keyof Services>(name: T): Services[T];
  
  // Lifecycle
  dispose(): void;
}

interface Services {
  connectionService: ConnectionService;
  chainService: ChainService;
  transactionService: TransactionService;
  balanceService: BalanceService;
  dAppRpcService: DAppRpcService;
  walletPreferenceService: WalletPreferenceService;
}
```

## ConnectionService

Manages wallet connections, sessions, and health monitoring.

### Core Methods

```typescript
// Connection Management
connect(params: ConnectionParams): Promise<ConnectionResult>
disconnect(sessionId: string): Promise<void>
reconnect(sessionId: string): Promise<ConnectionResult>

// Session Management
getActiveSession(): SessionState | null
getAllSessions(): SessionState[]
getSessionById(sessionId: string): SessionState | null
switchSession(sessionId: string): void
updateSessionMetadata(sessionId: string, metadata: Partial<SessionMetadata>): void

// Account Management
getAccount(sessionId?: string): AccountInfo | null
getAccounts(sessionId?: string): AccountInfo[]
switchAccount(address: string, sessionId?: string): void

// Health & Recovery
checkHealth(provider: unknown): HealthStatus
analyzeError(error: unknown): ErrorAnalysis
getRecoveryStrategies(error: ModalError): RecoveryStrategy[]

// Parameters
interface ConnectionParams {
  walletId: string;
  provider: unknown;
  chainId?: ChainId;
  permissions?: PermissionSet;
  metadata?: Record<string, unknown>;
}

interface ConnectionResult {
  sessionId: string;
  accounts: AccountInfo[];
  chainId: ChainId;
  provider: unknown;
}
```

## ChainService

Manages blockchain configurations and chain switching.

### Core Methods

```typescript
// Chain Information
getChainInfo(chainId: ChainId): ChainInfo | null
getSupportedChains(): ChainInfo[]
getChainByType(chainType: ChainType): ChainInfo[]

// Chain Validation
validateChain(chainId: ChainId, provider?: unknown): ValidationResult
isChainSupported(chainId: ChainId): boolean
checkCompatibility(chainId: ChainId, walletId: string): CompatibilityResult

// Chain Switching
switchChain(provider: unknown, targetChainId: ChainId): Promise<void>
addChain(provider: unknown, chainConfig: ChainConfig): Promise<void>

// Chain Analysis
analyzeChainMismatch(expected: ChainId, actual: ChainId): MismatchAnalysis
getChainRequirements(chainId: ChainId): ChainRequirements

// Types
interface ChainInfo {
  chainId: ChainId;
  chainType: ChainType;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}
```

## TransactionService

Handles transaction lifecycle and monitoring.

### Core Methods

```typescript
// Transaction Execution
sendTransaction(params: TransactionParams): Promise<TransactionResult>
signMessage(message: string, provider: unknown): Promise<string>
signTypedData(data: TypedData, provider: unknown): Promise<string>

// Transaction Monitoring
getTransaction(txId: string): TransactionResult | null
getTransactionStatus(txId: string): TransactionStatus
waitForConfirmation(txId: string, confirmations?: number): Promise<TransactionReceipt>

// Transaction History
getTransactionHistory(filter?: TransactionFilter): TransactionResult[]
clearTransactionHistory(): void

// Gas Estimation
estimateGas(params: TransactionParams): Promise<GasEstimate>
getCurrentGasPrice(chainId: ChainId): Promise<GasPrice>

// Types
interface TransactionParams {
  from: string;
  to: string;
  value?: string;
  data?: string;
  chainId: ChainId;
  gas?: string;
  gasPrice?: string;
}

interface TransactionResult {
  id: string;
  hash: string;
  status: TransactionStatus;
  chainType: ChainType;
  from: string;
  to: string;
  value: string;
  startTime: number;
  endTime?: number;
  error?: TransactionError;
}

type TransactionStatus = 
  | 'idle' 
  | 'preparing' 
  | 'signing' 
  | 'broadcasting' 
  | 'confirming' 
  | 'confirmed' 
  | 'failed';
```

## BalanceService

Manages balance queries and caching.

### Core Methods

```typescript
// Balance Queries
getBalance(params: BalanceQueryParams): Promise<BalanceInfo>
getBalances(params: MultiBalanceParams): Promise<BalanceInfo[]>
getTokenBalance(token: TokenInfo, account: string): Promise<TokenBalance>

// Balance Updates
refreshBalance(account: string, chainId: ChainId): Promise<void>
startPolling(params: PollingParams): void
stopPolling(): void

// Cache Management
clearCache(account?: string, chainId?: ChainId): void
getCachedBalance(account: string, chainId: ChainId): BalanceInfo | null

// Token Metadata
getTokenMetadata(address: string, chainId: ChainId): Promise<TokenMetadata>
getNativeCurrencySymbol(chainId: ChainId): string

// Types
interface BalanceQueryParams {
  account: string;
  chainId: ChainId;
  includeTokens?: boolean;
  tokenAddresses?: string[];
}

interface BalanceInfo {
  account: string;
  chainId: ChainId;
  native: {
    balance: string;
    formatted: string;
    symbol: string;
  };
  tokens?: TokenBalance[];
  lastUpdated: number;
}
```

## DAppRpcService

Handles RPC communication with wallets.

### Core Methods

```typescript
// RPC Communication
sendRequest<T = unknown>(request: RpcRequest): Promise<T>
sendBatchRequest(requests: RpcRequest[]): Promise<RpcResponse[]>

// Provider Management
validateProvider(provider: unknown): boolean
getProviderCapabilities(provider: unknown): ProviderCapabilities

// Event Handling
subscribeToEvents(provider: unknown, handlers: EventHandlers): () => void
handleProviderEvent(event: ProviderEvent): void

// Types
interface RpcRequest {
  method: string;
  params?: unknown[];
  id?: string | number;
}

interface RpcResponse<T = unknown> {
  result?: T;
  error?: RpcError;
  id: string | number;
}

interface ProviderCapabilities {
  methods: string[];
  events: string[];
  eip1193: boolean;
  batch: boolean;
}
```

## WalletPreferenceService

Manages user preferences and wallet usage history.

### Core Methods

```typescript
// Preference Management
getPreferences(): UserPreferences
updatePreferences(updates: Partial<UserPreferences>): void
resetPreferences(): void

// Usage Tracking
recordWalletUsage(walletId: string): void
getWalletUsageHistory(): WalletUsageRecord[]
getMostUsedWallet(): string | null

// Wallet Sorting
getSortedWallets(wallets: WalletInfo[]): WalletInfo[]
getRecommendedWallets(chainType?: ChainType): string[]

// Types
interface UserPreferences {
  defaultWallet?: string;
  autoConnect: boolean;
  hideZeroBalances: boolean;
  preferredChains: ChainId[];
  theme?: 'light' | 'dark' | 'auto';
}

interface WalletUsageRecord {
  walletId: string;
  lastUsed: number;
  useCount: number;
  connectedChains: ChainId[];
}
```

## Common Types Used Across Services

```typescript
// Chain Identification
type ChainId = string | number;

enum ChainType {
  Evm = 'evm',
  Solana = 'solana',
  Aztec = 'aztec'
}

// Account Information
interface AccountInfo {
  address: string;
  chainType?: ChainType;
  publicKey?: string;
  metadata?: Record<string, unknown>;
}

// Session State
interface SessionState {
  sessionId: string;
  walletId: string;
  status: ConnectionStatus;
  accounts: AccountInfo[];
  activeAccount: AccountInfo;
  chain: ChainInfo;
  provider: {
    instance: unknown;
    type: string;
    version: string;
  };
  permissions: PermissionSet;
  metadata: Record<string, unknown>;
  lifecycle: {
    createdAt: number;
    lastActiveAt: number;
    expiresAt?: number;
  };
}

// Error Types
interface ModalError {
  code: string;
  message: string;
  category: ErrorCategory;
  data?: Record<string, unknown>;
  recoverable: boolean;
}

type ErrorCategory = 
  | 'connection' 
  | 'network' 
  | 'wallet' 
  | 'user' 
  | 'general';
```

## Service Usage Examples

### Basic Connection Flow

```typescript
// Get services
const services = serviceRegistry.getServices();

// Connect wallet
const result = await services.connectionService.connect({
  walletId: 'metamask',
  provider: window.ethereum
});

// Get balance
const balance = await services.balanceService.getBalance({
  account: result.accounts[0].address,
  chainId: result.chainId
});

// Send transaction
const tx = await services.transactionService.sendTransaction({
  from: result.accounts[0].address,
  to: '0x...',
  value: '1000000000000000000', // 1 ETH
  chainId: result.chainId
});
```

### Chain Switching

```typescript
// Validate target chain
const validation = services.chainService.validateChain('137');

if (validation.isValid) {
  // Switch chain
  await services.chainService.switchChain(
    provider,
    '137' // Polygon
  );
  
  // Refresh balances for new chain
  await services.balanceService.refreshBalance(
    account,
    '137'
  );
}
```

### Error Handling

```typescript
try {
  await services.connectionService.connect(params);
} catch (error) {
  // Analyze error
  const analysis = services.connectionService.analyzeError(error);
  
  // Get recovery strategies
  const strategies = services.connectionService.getRecoveryStrategies(
    error as ModalError
  );
  
  // Apply recovery
  for (const strategy of strategies) {
    if (await strategy.canRecover(error)) {
      await strategy.recover(error);
      break;
    }
  }
}
```

## Service Testing

```typescript
import { 
  createMockServiceDependencies,
  createMockEvmProvider 
} from '@walletmesh/modal-core/testing';

// Create mocked services
const deps = createMockServiceDependencies();
const services = new ServiceRegistry(deps);

// Mock provider
const provider = createMockEvmProvider({
  eth_accounts: ['0x123...'],
  eth_chainId: '0x1'
});

// Test service interaction
const result = await services.connectionService.connect({
  walletId: 'test',
  provider
});

expect(result.sessionId).toBeDefined();
```