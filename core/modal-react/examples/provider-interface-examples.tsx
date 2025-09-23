/**
 * Provider vs Interface Examples
 *
 * This file demonstrates the distinction between provider implementations
 * (runtime objects) and interface specifications (protocol standards) in
 * WalletMesh React integration.
 *
 * @example Provider vs Interface Distinction
 */

import {
  // Interface specifications (protocol standards)
  type EVMInterface,
  // Provider implementations (runtime objects)
  type EVMProvider,
  type ProviderInterface,
  // Utilities
  ProviderInterfaceUtils,
  type SolanaInterface,
  type SolanaProvider,
  isEVMInterface,
  isSolanaInterface,
  useAccount,
  usePublicProvider,
  useWalletProvider,
} from '@walletmesh/modal-react';
import React, { useEffect, useState } from 'react';

/**
 * Example 1: Using Provider Implementations
 *
 * This example shows how to work with actual provider objects that have
 * methods, events, and state. These are the runtime objects you interact with.
 */
function ProviderImplementationExample() {
  const { provider } = useWalletProvider();
  const { address, chainType } = useAccount();

  const handleProviderAction = async () => {
    if (!provider) return;

    // Provider implementations have methods you can call
    if (chainType === 'evm') {
      // EVMProvider is a runtime object with request method
      const evmProvider = provider as EVMProvider;
      try {
        const accounts = await evmProvider.request({
          method: 'eth_accounts',
        });
        console.log('EVM Provider returned accounts:', accounts);
      } catch (error) {
        console.error('EVM Provider error:', error);
      }
    } else if (chainType === 'solana') {
      // SolanaProvider is a runtime object with connect method
      const solanaProvider = provider as SolanaProvider;
      try {
        const connection = await solanaProvider.connect();
        console.log('Solana Provider connection:', connection);
      } catch (error) {
        console.error('Solana Provider error:', error);
      }
    }
  };

  return (
    <div>
      <h3>Provider Implementations (Runtime Objects)</h3>
      <p>Connected to: {address}</p>
      <p>Chain type: {chainType}</p>
      <p>Provider object available: {provider ? 'Yes' : 'No'}</p>
      <button type="button" onClick={handleProviderAction}>
        Call Provider Method
      </button>
      <p>
        <strong>Key Point:</strong> Providers are objects with methods, events, and state that you interact
        with at runtime.
      </p>
    </div>
  );
}

/**
 * Example 2: Working with Interface Specifications
 *
 * This example shows how interface specifications are used in configuration
 * and chain setup. These are just string identifiers for protocols.
 */
function InterfaceSpecificationExample() {
  const [chainConfig, setChainConfig] = useState({
    evm: [] as EVMInterface[],
    solana: [] as SolanaInterface[],
    aztec: [] as string[],
  });

  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    // Interface specifications are used in chain configurations
    const evmInterfaces: EVMInterface[] = ['eip-1193', 'eip-6963'];
    const solanaInterfaces: SolanaInterface[] = ['solana-standard-wallet'];

    setChainConfig({
      evm: evmInterfaces,
      solana: solanaInterfaces,
      aztec: ['aztec-wallet-api-v1'],
    });

    // Validate the interface specifications
    const result = ProviderInterfaceUtils.validateProviderInterfaceCompatibility({
      evm: evmInterfaces,
      solana: solanaInterfaces,
      aztec: ['aztec-wallet-api-v1'],
    });

    setValidationResult(result);
  }, []);

  const addInterface = (technology: keyof typeof chainConfig, interfaceName: string) => {
    // Type-safe interface specification handling
    if (technology === 'evm' && isEVMInterface(interfaceName)) {
      setChainConfig((prev) => ({
        ...prev,
        evm: [...prev.evm, interfaceName],
      }));
    } else if (technology === 'solana' && isSolanaInterface(interfaceName)) {
      setChainConfig((prev) => ({
        ...prev,
        solana: [...prev.solana, interfaceName],
      }));
    }
  };

  return (
    <div>
      <h3>Interface Specifications (Protocol Standards)</h3>

      <div>
        <h4>Chain Configuration</h4>
        <div>
          <strong>EVM Interfaces:</strong> {chainConfig.evm.join(', ')}
          <button type="button" onClick={() => addInterface('evm', 'eip-1102')}>
            Add EIP-1102
          </button>
        </div>
        <div>
          <strong>Solana Interfaces:</strong> {chainConfig.solana.join(', ')}
          <button type="button" onClick={() => addInterface('solana', 'solana-wallet-adapter')}>
            Add Wallet Adapter
          </button>
        </div>
        <div>
          <strong>Aztec Interfaces:</strong> {chainConfig.aztec.join(', ')}
        </div>
      </div>

      {validationResult && (
        <div>
          <h4>Validation Result</h4>
          <p>Valid: {validationResult.valid ? 'Yes' : 'No'}</p>
          {validationResult.errors.length > 0 && (
            <div>
              <strong>Errors:</strong>
              <ul>
                {validationResult.errors.map((error, i) => (
                  <li key={`error-${error.substring(0, 20)}-${i}`} style={{ color: 'red' }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validationResult.warnings.length > 0 && (
            <div>
              <strong>Warnings:</strong>
              <ul>
                {validationResult.warnings.map((warning, i) => (
                  <li key={`warning-${warning.substring(0, 20)}-${i}`} style={{ color: 'orange' }}>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p>
        <strong>Key Point:</strong> Interface specifications are string identifiers used in configuration to
        specify which protocols to support.
      </p>
    </div>
  );
}

/**
 * Example 3: Provider/Interface Relationship
 *
 * This example demonstrates how interface specifications map to
 * provider implementations using the utility functions.
 */
function ProviderInterfaceRelationshipExample() {
  const [mappings, setMappings] = useState<
    {
      interface: ProviderInterface;
      providerClass: string;
      technology: string;
    }[]
  >([]);

  useEffect(() => {
    // Get all supported interface specifications
    const evmInterfaces = ProviderInterfaceUtils.getSupportedInterfaces('evm');
    const solanaInterfaces = ProviderInterfaceUtils.getSupportedInterfaces('solana');
    const aztecInterfaces = ProviderInterfaceUtils.getSupportedInterfaces('aztec');

    const allInterfaces: ProviderInterface[] = [...evmInterfaces, ...solanaInterfaces, ...aztecInterfaces];

    // Map each interface to its provider implementation
    const mappingResults = allInterfaces.map((interfaceSpec) => ({
      interface: interfaceSpec,
      providerClass: ProviderInterfaceUtils.getProviderForInterface(interfaceSpec),
      technology: ProviderInterfaceUtils.getTechnologyForInterface(interfaceSpec),
    }));

    setMappings(mappingResults);
  }, []);

  return (
    <div>
      <h3>Interface → Provider Mapping</h3>
      <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Interface Specification</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Provider Implementation</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Technology</th>
          </tr>
        </thead>
        <tbody>
          {mappings.map(({ interface: iface, providerClass, technology }) => (
            <tr key={iface}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <code>{iface}</code>
                <br />
                <small style={{ color: '#666' }}>(protocol standard)</small>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                <code>{providerClass}</code>
                <br />
                <small style={{ color: '#666' }}>(runtime object)</small>
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{technology}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        <strong>Key Point:</strong> Interface specifications (left column) are protocol identifiers that map
        to provider implementations (middle column) which are the actual objects with methods and state.
      </p>
    </div>
  );
}

/**
 * Example 4: Practical Usage in Configuration
 *
 * This shows how you would practically use both concepts together
 * in a real application.
 */
function PracticalUsageExample() {
  const { provider } = useWalletProvider();
  const { isConnected, chainType } = useAccount();

  // Configuration uses interface specifications
  const chainConfiguration = {
    ethereum: {
      chainId: 'eip155:1',
      name: 'Ethereum Mainnet',
      // These are interface specifications (strings)
      interfaces: ['eip-1193', 'eip-6963'] as EVMInterface[],
    },
    solana: {
      chainId: 'solana:mainnet',
      name: 'Solana Mainnet',
      // These are interface specifications (strings)
      interfaces: ['solana-standard-wallet'] as SolanaInterface[],
    },
  };

  const handleTransaction = async () => {
    if (!provider || !isConnected) return;

    // At runtime, you work with provider implementations (objects)
    try {
      if (chainType === 'evm') {
        const evmProvider = provider as EVMProvider;
        const txHash = await evmProvider.sendTransaction({
          to: '0x742D35Cc6634C0532925a3b8D098bC8d56001e15',
          value: '0x16345785D8A0000', // 0.1 ETH
        });
        console.log('EVM transaction:', txHash);
      } else if (chainType === 'solana') {
        const solanaProvider = provider as SolanaProvider;
        const signature = await solanaProvider.signAndSendTransaction({} as unknown);
        console.log('Solana signature:', signature);
      }
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <div>
      <h3>Practical Usage: Configuration + Runtime</h3>

      <div>
        <h4>Configuration (Interface Specifications)</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(chainConfiguration, null, 2)}
        </pre>
        <p>
          <em>Interface specifications are used in static configuration</em>
        </p>
      </div>

      <div>
        <h4>Runtime (Provider Implementations)</h4>
        <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
        <p>Chain Type: {chainType || 'None'}</p>
        <p>Provider Available: {provider ? 'Yes' : 'No'}</p>
        <button type="button" onClick={handleTransaction} disabled={!isConnected || !provider}>
          Send Transaction (Uses Provider Object)
        </button>
        <p>
          <em>Provider implementations are runtime objects with methods</em>
        </p>
      </div>

      <div style={{ background: '#e7f3ff', padding: '15px', marginTop: '15px' }}>
        <h4>Summary</h4>
        <ul>
          <li>
            <strong>Interface Specifications</strong> ('eip-1193', 'solana-standard-wallet') are strings used
            in configuration to specify protocol support
          </li>
          <li>
            <strong>Provider Implementations</strong> (EVMProvider, SolanaProvider) are TypeScript objects
            with methods, events, and state you use at runtime
          </li>
          <li>The utility functions help you understand the relationship and validate configurations</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Main component that demonstrates all examples
 */
export function ProviderInterfaceExamples() {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    { name: 'Provider Implementations', component: ProviderImplementationExample },
    { name: 'Interface Specifications', component: InterfaceSpecificationExample },
    { name: 'Interface → Provider Mapping', component: ProviderInterfaceRelationshipExample },
    { name: 'Practical Usage', component: PracticalUsageExample },
  ];

  const ActiveComponent = examples[activeExample].component;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Provider vs Interface Specifications Examples</h1>

      <nav style={{ marginBottom: '20px' }}>
        {examples.map((example, index) => (
          <button
            key={`example-${example.name}`}
            type="button"
            onClick={() => setActiveExample(index)}
            style={{
              margin: '0 10px 10px 0',
              padding: '10px 15px',
              background: activeExample === index ? '#007cba' : '#f0f0f0',
              color: activeExample === index ? 'white' : 'black',
              border: '1px solid #ccc',
              cursor: 'pointer',
            }}
          >
            {example.name}
          </button>
        ))}
      </nav>

      <div style={{ border: '1px solid #ccc', padding: '20px', minHeight: '400px' }}>
        <ActiveComponent />
      </div>

      <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px' }}>
        <h3>Key Takeaways</h3>
        <ol>
          <li>
            <strong>Providers</strong> = Runtime objects with methods, events, state (e.g.,{' '}
            <code>EVMProvider</code>, <code>SolanaProvider</code>)
          </li>
          <li>
            <strong>Interface Specifications</strong> = String identifiers for protocols (e.g.,{' '}
            <code>'eip-1193'</code>, <code>'solana-standard-wallet'</code>)
          </li>
          <li>
            <strong>Configuration</strong> uses interface specifications to declare protocol support
          </li>
          <li>
            <strong>Runtime code</strong> interacts with provider implementation objects
          </li>
          <li>
            <strong>Utility functions</strong> help validate and understand the relationships
          </li>
        </ol>
      </div>
    </div>
  );
}

export default ProviderInterfaceExamples;
