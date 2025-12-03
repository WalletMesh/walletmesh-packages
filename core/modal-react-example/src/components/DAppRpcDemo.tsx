import type { RpcResult } from '@walletmesh/modal-core';
import { useWalletMeshContext } from '@walletmesh/modal-react/all';
import { useEffect, useState } from 'react';

// Define the DAppRpcService interface locally since it might not be properly exported
interface DAppRpcService {
  registerEndpoint(config: {
    chainId: string;
    chainType: string;
    urls: string[];
    config?: {
      timeout?: number;
      retries?: number;
      loadBalance?: boolean;
      headers?: Record<string, string>;
    };
  }): void;
  call<T = unknown>(chainId: string, method: string, params?: unknown[]): Promise<RpcResult<T>>;
  testConnectivity(): Promise<
    Array<{
      chainId: string;
      url: string;
      success: boolean;
      responseTime?: number;
      error?: string;
    }>
  >;
  getStats(): {
    totalEndpoints: number;
    totalUrls: number;
    chainIds: string[];
  };
  getRegisteredChains(): string[];
}

export function DAppRpcDemo() {
  const { client } = useWalletMeshContext();
  const [dappRpcService, setDappRpcService] = useState<DAppRpcService | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    sepoliaBlock?: RpcResult<string>;
    aztecStatus?: RpcResult<string>;
    connectivity?: Array<{
      chainId: string;
      url: string;
      success: boolean;
      responseTime?: number;
      error?: string;
    }>;
  }>({});

  // Initialize dApp RPC service
  useEffect(() => {
    if (!client) return;

    const initService = async () => {
      try {
        // Wait for client to be initialized
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const service = client.getDAppRpcService?.();
        if (service) {
          // Manually configure the dApp RPC endpoints since the simplified
          // chain configuration doesn't include them
          const dappService = service as DAppRpcService;

          // Configure Ethereum Sepolia Testnet
          dappService.registerEndpoint({
            chainId: '11155111',
            chainType: 'evm',
            urls: [
              'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
              'https://rpc.ankr.com/eth_sepolia',
            ],
            config: {
              timeout: 30000,
              retries: 3,
              loadBalance: true,
              headers: {
                'User-Agent': 'WalletMesh-Example/1.0',
              },
            },
          });

          // Configure Aztec Sandbox
          dappService.registerEndpoint({
            chainId: '31337',
            chainType: 'aztec',
            urls: ['https://sandbox.aztec.walletmesh.com/api/v1/public'],
            config: {
              timeout: 30000,
              retries: 2,
              loadBalance: false,
            },
          });

          setDappRpcService(dappService);
        }
      } catch (error) {
        console.error('Failed to get dApp RPC service:', error);
      }
    };

    initService();
  }, [client]);

  const testSepoliaRpc = async () => {
    if (!dappRpcService) return;

    setLoading(true);
    try {
      const result = await dappRpcService.call<string>('11155111', 'eth_blockNumber');
      setResults((prev) => ({ ...prev, sepoliaBlock: result }));
    } catch (error) {
      console.error('Sepolia RPC call failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testAztecRpc = async () => {
    if (!dappRpcService) return;

    setLoading(true);
    try {
      // Available Aztec sandbox methods use 'node_' prefix:
      // - node_getNodeInfo: Get comprehensive node information
      // - node_getChainId: Get the chain ID
      // - node_getVersion: Get the version
      // - node_getBlockNumber: Get current block number
      // Note: The sandbox uses 'node_' prefix, not 'aztec_' prefix
      // Try a direct HTTP GET request first to see if the endpoint is accessible
      const testResponse = await fetch('https://sandbox.aztec.walletmesh.com/api/v1/public');
      console.log('Direct GET test response:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        headers: Object.fromEntries(testResponse.headers.entries()),
      });

      // If GET works, try the RPC call
      const result = await dappRpcService.call<string>('31337', 'node_getNodeInfo');
      setResults((prev) => ({ ...prev, aztecStatus: result }));
    } catch (error) {
      console.error('Aztec RPC call failed:', error);

      // Try alternative method names
      try {
        console.log('Trying alternative method: node_getVersion');
        const result = await dappRpcService.call<string>('31337', 'node_getVersion');
        setResults((prev) => ({ ...prev, aztecStatus: result }));
      } catch (error2) {
        console.error('Alternative method also failed:', error2);
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnectivity = async () => {
    if (!dappRpcService) return;

    setLoading(true);
    try {
      const connectivityResults = await dappRpcService.testConnectivity();
      const stringifiedResults = connectivityResults.map((result) => ({
        ...result,
        chainId: String(result.chainId),
      }));
      setResults((prev) => ({ ...prev, connectivity: stringifiedResults }));
    } catch (error) {
      console.error('Connectivity test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = dappRpcService?.getStats();
  const registeredChains = dappRpcService?.getRegisteredChains() || [];

  return (
    <div
      style={{
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        margin: '20px 0',
      }}
    >
      <h2>dApp RPC Service Demo</h2>
      <p>
        This demonstrates the dApp RPC service which allows your dApp to communicate directly with blockchain
        nodes using your own infrastructure, separate from the wallet's RPC endpoints. Currently configured
        for Ethereum Sepolia Testnet and Aztec Sandbox.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <h3>Service Status</h3>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p>
            <strong>Service Available:</strong> {dappRpcService ? 'Yes' : 'No'}
          </p>
          {stats && (
            <>
              <p>
                <strong>Total Endpoints:</strong> {stats.totalEndpoints}
              </p>
              <p>
                <strong>Total URLs:</strong> {stats.totalUrls}
              </p>
              <p>
                <strong>Registered Chains:</strong> {registeredChains.join(', ')}
              </p>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>RPC Test Actions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={testSepoliaRpc}
            disabled={loading || !dappRpcService}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Testing...' : 'Test Sepolia RPC'}
          </button>

          <button
            type="button"
            onClick={testAztecRpc}
            disabled={loading || !dappRpcService}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#00ffff',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Testing...' : 'Test Aztec RPC (node_getNodeInfo)'}
          </button>

          <button
            type="button"
            onClick={testConnectivity}
            disabled={loading || !dappRpcService}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Testing...' : 'Test Connectivity'}
          </button>
        </div>
      </div>

      <div>
        <h3>Results</h3>

        {results.sepoliaBlock && (
          <div
            style={{
              backgroundColor: '#f0f8ff',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            <h4>Sepolia Testnet Block Number</h4>
            <p>
              <strong>Block:</strong> {Number.parseInt(results.sepoliaBlock.data, 16)}
            </p>
            <p>
              <strong>Endpoint:</strong> {results.sepoliaBlock.endpoint}
            </p>
            <p>
              <strong>Response Time:</strong> {results.sepoliaBlock.responseTime}ms
            </p>
            <p>
              <strong>Was Retry:</strong> {results.sepoliaBlock.isRetry ? 'Yes' : 'No'}
            </p>
          </div>
        )}

        {results.aztecStatus && (
          <div
            style={{
              backgroundColor: '#e0ffff',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            <h4>Aztec Node Status</h4>
            <p>
              <strong>Status:</strong>{' '}
              {typeof results.aztecStatus.data === 'string'
                ? results.aztecStatus.data
                : JSON.stringify(results.aztecStatus.data)}
            </p>
            <p>
              <strong>Endpoint:</strong> {results.aztecStatus.endpoint}
            </p>
            <p>
              <strong>Response Time:</strong> {results.aztecStatus.responseTime}ms
            </p>
            <p>
              <strong>Was Retry:</strong> {results.aztecStatus.isRetry ? 'Yes' : 'No'}
            </p>
          </div>
        )}

        {results.connectivity && (
          <div
            style={{
              backgroundColor: '#f0fff4',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            <h4>Connectivity Test Results</h4>
            {results.connectivity.map((result) => (
              <div
                key={`${result.chainId}-${result.url}`}
                style={{
                  margin: '5px 0',
                  padding: '5px',
                  backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                  borderRadius: '3px',
                }}
              >
                <p>
                  <strong>Chain:</strong> {result.chainId}
                </p>
                <p>
                  <strong>URL:</strong> {result.url}
                </p>
                <p>
                  <strong>Status:</strong> {result.success ? 'Success' : 'Failed'}
                </p>
                {result.responseTime && (
                  <p>
                    <strong>Response Time:</strong> {result.responseTime}ms
                  </p>
                )}
                {result.error && (
                  <p>
                    <strong>Error:</strong> {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
