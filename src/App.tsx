import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Projects from "./pages/projects/Projects";
import Gallery from "./pages/public/Gallery";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";
import QuickRequestFromMap from "./pages/QuickRequestFromMap";
import RoleSelection from "./pages/auth/RoleSelection";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";
import DataDeletion from "./pages/public/DataDeletion";
import ServiceMap from "./pages/maintenance/ServiceMap";

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
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/quick-request" element={<QuickRequestFromMap />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/data-deletion" element={<DataDeletion />} />
        <Route path="/delete-data" element={<DataDeletion />} />
        <Route path="/service-map" element={<ServiceMap />} />
        
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
