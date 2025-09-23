import {
  aztecChains,
  evmChains,
  solanaChains,
  useAccount,
  useConfig,
  useWalletProvider,
  WalletMeshConnectButton,
} from '@walletmesh/modal-react/all';

export function AdvancedFeatures() {
  const { isConnected, chain } = useAccount();
  const { provider } = useWalletProvider();
  const { chains } = useConfig();

  // Mock provider ready state for demo
  const isReady = !!provider;

  // Chain data using new explicit chain API
  const allChains = [...evmChains, ...solanaChains, ...aztecChains];
  const mainnetChains = allChains.filter(
    (chain) =>
      !chain.chainId.includes('testnet') &&
      !chain.chainId.includes('devnet') &&
      !chain.chainId.includes('sepolia') &&
      !chain.chainId.includes('amoy') &&
      !chain.chainId.includes('sandbox'),
  );
  const testnetChains = allChains.filter(
    (chain) =>
      chain.chainId.includes('testnet') ||
      chain.chainId.includes('devnet') ||
      chain.chainId.includes('sepolia') ||
      chain.chainId.includes('amoy') ||
      chain.chainId.includes('sandbox'),
  );

  // Find current chain
  const currentChain = chain
    ? allChains.find((c) => c.chainId === chain.chainId || c.chainId.endsWith(`:${chain.chainId}`))
    : null;

  if (!isConnected) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Advanced Features</h2>

        <div style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ marginBottom: '16px', color: '#6B7280' }}>
            Connect your wallet to explore advanced features
          </p>
          <WalletMeshConnectButton size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Advanced Features</h2>

      {/* Safe Provider Demo */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Safe Provider</h3>
        <div style={{ fontSize: '14px' }}>
          <div>Provider Ready: {isReady ? 'Yes' : 'No'}</div>
          <div>Provider Type: {provider ? provider.constructor.name : 'None'}</div>
        </div>
      </div>

      {/* Chain Information Demo */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Chain Information</h3>
        <div style={{ fontSize: '14px' }}>
          <div>Total Chains Available: {allChains.length}</div>
          <div>Mainnet Chains: {mainnetChains.length}</div>
          <div>Testnet Chains: {testnetChains.length}</div>
          <div>Configured Chains: {chains.length}</div>
          {currentChain && (
            <div style={{ marginTop: '8px' }}>
              <strong>Current Chain:</strong> {currentChain.label}
            </div>
          )}
        </div>
      </div>

      {/* Built-in Components */}
      <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Connect Button Variants</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <WalletMeshConnectButton size="sm" variant="outline" showAddress={true} />
          <WalletMeshConnectButton size="md" showChain={true} connectedLabel="Sign Out" />
        </div>
      </div>
    </div>
  );
}
