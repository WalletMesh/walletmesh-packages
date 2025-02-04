import './App.css';
import DApp from './components/DApp.js';
import Wallet from './components/Wallet.js';

function App() {
  return (
    <div className="app-container">
      <div className="pane">
        <h2>DApp</h2>
        <DApp />
      </div>
      <div className="pane wallet-pane">
        <h2>Wallet Server</h2>
        <Wallet />
      </div>
    </div>
  );
}

export default App;
