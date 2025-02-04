import { AztecAddress, Fr } from '@aztec/aztec.js';
import { deriveSigningKey } from '@aztec/circuits.js';

// Import the deployment data for the test account, counter, and token contracts
// This assumes that the sandbox environment was loaded from the docker-compose config
// in `packages/examples/sandbox/` which outputs the deployment data to the `./deployment-data/` directory
import account from './deployment-data/account.json' assert { type: 'json' };
import counter from './deployment-data/counter.json' assert { type: 'json' };
import token from './deployment-data/token.json' assert { type: 'json' };

export const TEST_ACCOUNT_SCHNORR_ADDRESS = AztecAddress.fromString(account.address);
export const TEST_ACCOUNT_SCHNORR_SECRET = Fr.fromString(account.secretKey);
export const TEST_ACCOUNT_SCHNORR_SIGNING = deriveSigningKey(TEST_ACCOUNT_SCHNORR_SECRET);

export const TEST_TOKEN_CONTRACT = token.address;
export const TEST_COUNTER_CONTRACT = counter.address;
