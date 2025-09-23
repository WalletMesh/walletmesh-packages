/**
 * Mock for viem library
 * Used in tests to avoid requiring the actual viem dependency
 */

export const formatEther = (value) => {
  const weiString = String(value);
  const ethString = weiString.padStart(19, '0');
  const whole = ethString.slice(0, -18) || '0';
  const decimal = ethString.slice(-18).replace(/0+$/, '');
  return decimal ? `${whole}.${decimal}` : whole;
};

export const parseEther = (ether) => {
  const parts = String(ether).split('.');
  const whole = parts[0] || '0';
  const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18);
  return BigInt(whole + decimal);
};

// Default export to satisfy import('viem')
export default {
  formatEther,
  parseEther,
};
