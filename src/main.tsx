import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerPWA } from './lib/pwaRegister'

// Register PWA
registerPWA();

createRoot(document.getElementById("root")!).render(<App />);
