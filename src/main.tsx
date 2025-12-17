import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerPWA } from './lib/pwaRegister'

console.log('[Main] Application starting...');

// Global error handler for mobile compatibility
window.addEventListener('error', (event) => {
  console.error('[Main] Global error:', event.error?.message || event.message, event.error?.stack);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Main] Unhandled promise rejection:', event.reason);
});

// Register PWA safely
try {
  registerPWA();
  console.log('[Main] PWA registration complete');
} catch (e) {
  console.error('[Main] PWA registration failed:', e);
}

// Safe render with error handling
const rootElement = document.getElementById("root");
console.log('[Main] Root element found:', !!rootElement);

if (rootElement) {
  try {
    console.log('[Main] Creating React root...');
    const root = createRoot(rootElement);
    console.log('[Main] Rendering App...');
    root.render(<App />);
    console.log('[Main] App rendered successfully');
  } catch (error) {
    console.error('[Main] Failed to render app:', error);
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
  console.error('[Main] Root element not found');
}
