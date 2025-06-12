import './App.css';
import DApp from './components/DApp.js';
import { ToastProvider } from './contexts/ToastContext.js';

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <h1>Aztec DApp Example</h1>
        <DApp />
      </div>
    </ToastProvider>
  );
}

export default App;
