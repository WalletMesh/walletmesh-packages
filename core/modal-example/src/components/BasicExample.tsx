import { ConnectButton } from '@walletmesh/modal';
import './styles/examples.css';

/**
 * Basic example showing the simplest usage of WalletMesh Modal.
 * Uses the ConnectButton component with its default behavior.
 */
export const BasicExample = () => {
  return (
    <div>
      <p className="section-description">
        This example demonstrates the quickest way to add wallet connection to your app.
        Just import and use the ConnectButton component - it handles everything automatically.
      </p>
      <div className="custom-state">
        <ConnectButton />
      </div>
      <p style={{ 
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '16px',
        fontStyle: 'italic'
      }}>
        Tip: Click the button above to see the default wallet connection flow.
      </p>
    </div>
  );
};
