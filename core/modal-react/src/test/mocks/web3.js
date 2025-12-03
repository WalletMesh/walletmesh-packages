/**
 * Mock for web3.js library
 * Used in tests to avoid requiring the actual web3 dependency
 */

export const utils = {
  fromWei: (value, unit) => {
    if (unit !== 'ether') throw new Error('Only ether unit supported in mock');
    const weiString = String(value);
    const ethString = weiString.padStart(19, '0');
    const whole = ethString.slice(0, -18) || '0';
    const decimal = ethString.slice(-18).replace(/0+$/, '');
    return decimal ? `${whole}.${decimal}` : whole;
  },
  toWei: (value, unit) => {
    if (unit !== 'ether') throw new Error('Only ether unit supported in mock');
    const parts = String(value).split('.');
    const whole = parts[0] || '0';
    const decimal = (parts[1] || '').padEnd(18, '0').slice(0, 18);
    return whole + decimal;
  },
};

// Default export to satisfy import('web3')
export default {
  utils,
};
