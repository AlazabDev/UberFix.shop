import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";
import DataDeletion from "./pages/public/DataDeletion";

// Auth Pages
import AuthCallback from "./pages/auth/AuthCallback";
import AuthV1Callback from "./pages/auth/AuthV1Callback";

// 404 Page
import NotFound from "./pages/NotFound";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route path="/" element={<Index />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/delete-data" element={<DataDeletion />} />
        
        {/* Auth Callback Routes */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth/v1/callback" element={<AuthV1Callback />} />
        
        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
