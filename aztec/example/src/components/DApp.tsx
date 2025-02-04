import React, { useState } from 'react';
import { AztecChainProvider } from '@walletmesh/aztec-rpc-wallet';
import { AztecAddress } from '@aztec/aztec.js';

import { TEST_TOKEN_CONTRACT, TEST_COUNTER_CONTRACT } from '../lib/sandbox-data';

const DApp: React.FC = () => {
  const [client, setClient] = useState<AztecChainProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [counterValue, setCounterValue] = useState<string>('');

  const connectWallet = () => {
    const newClient = new AztecChainProvider(
      {
        send: async (request) => {
          console.debug('Sending request:', request);
          window.postMessage({
            type: 'wallet_request',
            data: request,
            origin: window.location.origin
          }, '*');
        }
      });

    const receiveResponse = (event: MessageEvent) => {
      console.debug('Received response:', event.data.data);
      if (event.source === window && event.data?.type === 'wallet_response') {
        newClient.receiveMessage(event.data.data);
      }
    };

    window.addEventListener('message', receiveResponse);

    newClient.connect().then((connected) => {
      if (connected) {
        setIsConnected(true);
        newClient.getAccount().then((accountAddress) => {
          setAccount(accountAddress);
        }).catch((error) => {
          window.alert(`Failed to get account: ${error.message}`);
          setIsConnected(false);
        });
      } else {
        window.alert('Failed to connect wallet.');
        setIsConnected(false);
      }
    }).catch((error) => {
      window.alert(`Failed to connect wallet: ${error.message}`);
      setIsConnected(false);
    });

    setClient(newClient);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('message', receiveResponse);
    };
  };

  const mintTokens = () => {
    if (client) {
      const args = [account, 10000000000000000000000];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: TEST_TOKEN_CONTRACT,
            functionName: 'mint_to_public',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Mint transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  };

  const transferTokens = () => {
    if (client) {
      const to = AztecAddress.random();
      const args = [
        account, // from
        to.toString(),
        100000,
        0, // nonce
      ];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: TEST_TOKEN_CONTRACT,
            functionName: 'transfer_in_public',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Transfer transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  };

  const checkTokenBalance = () => {
    if (client) {
      const args = [account];
      client.simulateTransaction({
        contractAddress: TEST_TOKEN_CONTRACT,
        functionName: 'balance_of_public',
        args,
      })
        .then((result) => {
          console.log('Token balance:', result);
          setTokenBalance((result as bigint).toString());
        })
        .catch((error) => {
          window.alert(`Simulation failed: ${error.message}`);
        });
    }
  };

  const incrementCounter = () => {
    if (client) {
      const args = [account, account];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: TEST_COUNTER_CONTRACT,
            functionName: 'increment',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Increment transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  };

  const incrementCounterTwice = () => {
    if (client) {
      const args = [account, account];
      client.sendTransaction({
        functionCalls: [
          {
            contractAddress: TEST_COUNTER_CONTRACT,
            functionName: 'increment',
            args,
          },
          {
            contractAddress: TEST_COUNTER_CONTRACT,
            functionName: 'increment',
            args,
          },
        ],
      })
        .then((transactionHash) => {
          console.log('Increment twice transaction sent, hash:', transactionHash);
        })
        .catch((error) => {
          window.alert(`Transaction failed: ${error.message}`);
        });
    }
  }

  const getCounter = () => {
    if (client) {
      const args = [account];
      client.simulateTransaction({
        contractAddress: TEST_COUNTER_CONTRACT,
        functionName: 'get_counter',
        args,
      })
        .then((result) => {
          console.log('Counter value:', result);
          setCounterValue((result as bigint).toString());
        })
        .catch((error) => {
          window.alert(`Simulation failed: ${error.message}`);
        });
    }
  };

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Account: {account}</p>
          <button onClick={mintTokens}>Mint Tokens</button>
          <button onClick={transferTokens}>Transfer Tokens</button>
          <button onClick={checkTokenBalance}>Token Balance</button>
          <button onClick={incrementCounter}>Increment Counter</button>
          <button onClick={incrementCounterTwice}>Increment Counter TWICE</button>
          <button onClick={getCounter}>Get Counter</button>

          {tokenBalance && <p>Token balance: {tokenBalance}</p>}
          {counterValue && <p>Counter: {counterValue}</p>}
        </div>
      )}
    </div>
  );
};

export default DApp;
