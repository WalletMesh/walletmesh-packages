/**
 * Chain native symbol mappings
 */

// No longer importing ChainId as it's been removed

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class for chain symbol mappings
export class ChainNativeSymbols {
  private static readonly symbols: Record<string, string> = {
    // EVM chains - CAIP-2 format (eip155:chainId)
    'eip155:1': 'ETH', // Ethereum Mainnet
    'eip155:11155111': 'ETH', // Sepolia
    'eip155:137': 'MATIC', // Polygon
    'eip155:10': 'ETH', // Optimism
    'eip155:11155420': 'ETH', // Optimism Sepolia
    'eip155:42161': 'ETH', // Arbitrum One
    'eip155:421614': 'ETH', // Arbitrum Sepolia
    'eip155:56': 'BNB', // BNB Chain
    'eip155:97': 'BNB', // BSC Testnet
    'eip155:43114': 'AVAX', // Avalanche
    'eip155:43113': 'AVAX', // Fuji Testnet
    'eip155:250': 'FTM', // Fantom
    'eip155:4002': 'FTM', // Fantom Testnet
    'eip155:25': 'CRO', // Cronos
    'eip155:338': 'CRO', // Cronos Testnet
    'eip155:100': 'xDAI', // Gnosis
    'eip155:1284': 'GLMR', // Moonbeam
    'eip155:1285': 'MOVR', // Moonriver
    'eip155:1287': 'DEV', // Moonbase Alpha
    'eip155:42220': 'CELO', // Celo
    'eip155:44787': 'CELO', // Alfajores Testnet
    'eip155:1313161554': 'ETH', // Aurora
    'eip155:1313161555': 'ETH', // Aurora Testnet
    'eip155:8453': 'ETH', // Base
    'eip155:84532': 'ETH', // Base Sepolia

    // Solana chains - CAIP-2 format (solana:genesisHash)
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'SOL', // Mainnet
    'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'SOL', // Testnet
    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': 'SOL', // Devnet

    // Aztec chains - CAIP-2 format (aztec:reference)
    'aztec:mainnet': 'ETH',
    'aztec:testnet': 'ETH',
    'aztec:31337': 'ETH', // Sandbox
  };

  /**
   * Get native symbol for a chain
   */
  static getSymbol(chainId: string | number): string {
    const id = chainId.toString();
    // Look up the symbol for the CAIP-2 chain ID
    return ChainNativeSymbols.symbols[id] || 'ETH';
  }

  /**
   * Add custom chain symbol
   */
  static addSymbol(chainId: string | number, symbol: string): void {
    const id = chainId.toString();
    ChainNativeSymbols.symbols[id] = symbol;
  }

  /**
   * Check if chain has a known symbol
   */
  static hasSymbol(chainId: string | number): boolean {
    const id = chainId.toString();
    return id in ChainNativeSymbols.symbols;
  }

  /**
   * Get all known chain IDs for a symbol
   */
  static getChainsBySymbol(symbol: string): string[] {
    return Object.entries(ChainNativeSymbols.symbols)
      .filter(([, sym]) => sym === symbol)
      .map(([chainId]) => chainId);
  }
}
