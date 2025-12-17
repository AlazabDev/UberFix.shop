import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerPWA } from './lib/pwaRegister'

// Global error handler for mobile compatibility
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Register PWA
registerPWA();

// Safe render with error handling
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #0a1929; color: white; font-family: system-ui; direction: rtl; padding: 20px;">
        <div style="text-align: center; max-width: 400px;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">حدث خطأ في التطبيق</h1>
          <p style="color: #94a3b8; margin-bottom: 24px;">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
          <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px;">
            تحديث الصفحة
          </button>
        </div>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
}
