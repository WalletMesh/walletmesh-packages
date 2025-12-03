/**
 * Mock for ethers.js library
 * Used in tests to avoid requiring the actual ethers dependency
 */

export const formatEther = (wei) => {
  const weiString = String(wei);
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

export const getAddress = (address) => {
  // Simple mock - just returns the address as-is
  return address;
};

export const isAddress = (address) => {
  // Simple validation - check if it's a hex string with 40 chars
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Default export to satisfy import('ethers')
export default {
  formatEther,
  parseEther,
  getAddress,
  isAddress,
};
