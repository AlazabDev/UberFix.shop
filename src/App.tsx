import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { publicRoutes } from "./routes/publicRoutes.config";
import { protectedRoutes } from "./routes/routes.config";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import AppErrorBoundary from "@/components/error-boundaries/AppErrorBoundary";

// WhatsApp Hub lazy imports
const WaHubLayout = lazy(() => import("@/pages/wa-hub/layout/WaHubLayout"));
const WaHubDashboard = lazy(() => import("@/pages/wa-hub/WaHubDashboard"));
const WaInbox = lazy(() => import("@/pages/wa-hub/inbox/WaInbox"));
const WaContacts = lazy(() => import("@/pages/wa-hub/data/WaContacts"));
const WaMedia = lazy(() => import("@/pages/wa-hub/data/WaMedia"));
const WaConversations = lazy(() => import("@/pages/wa-hub/data/WaConversations"));
const WaMessages = lazy(() => import("@/pages/wa-hub/data/WaMessages"));
const WaNumbersConnected = lazy(() => import("@/pages/wa-hub/numbers/WaNumbersConnected"));
const WaNumbersDigital = lazy(() => import("@/pages/wa-hub/numbers/WaNumbersDigital"));
const WaNumbersSandbox = lazy(() => import("@/pages/wa-hub/numbers/WaNumbersSandbox"));
const WaNumbersAdd = lazy(() => import("@/pages/wa-hub/numbers/WaNumbersAdd"));
const WaTemplates = lazy(() => import("@/pages/wa-hub/integrations/WaTemplates"));
const WaFlows = lazy(() => import("@/pages/wa-hub/integrations/WaFlows"));
const WaWebhooks = lazy(() => import("@/pages/wa-hub/integrations/WaWebhooks"));
const WaApiKeys = lazy(() => import("@/pages/wa-hub/integrations/WaApiKeys"));
const PlaceholderPage = lazy(() => import("@/pages/wa-hub/PlaceholderPage"));

import "./index.css";

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">جاري التحميل...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// Hydration-safe App wrapper
function AppContent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show minimal loading state until client is mounted
  if (!mounted) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes - لا تتطلب تسجيل دخول */}
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          
          {/* Protected Routes - تتطلب تسجيل دخول */}
          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute withLayout={route.withLayout}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

          {/* WhatsApp Hub - with its own layout */}
          <Route path="/wa-hub" element={
            <ProtectedRoute withLayout={false}><WaHubLayout /></ProtectedRoute>
          }>
            <Route index element={<WaHubDashboard />} />
            <Route path="inbox" element={<WaInbox />} />
            <Route path="numbers/connected" element={<WaNumbersConnected />} />
            <Route path="numbers/digital" element={<WaNumbersDigital />} />
            <Route path="numbers/sandbox" element={<WaNumbersSandbox />} />
            <Route path="numbers/add" element={<WaNumbersAdd />} />
            <Route path="webhooks" element={<WaWebhooks />} />
            <Route path="api-keys" element={<WaApiKeys />} />
            <Route path="flows" element={<WaFlows />} />
            <Route path="templates" element={<WaTemplates />} />
            <Route path="data/conversations" element={<WaConversations />} />
            <Route path="data/messages" element={<WaMessages />} />
            <Route path="data/media" element={<WaMedia />} />
            <Route path="data/contacts" element={<WaContacts />} />
            <Route path="data/ads" element={<PlaceholderPage title="Ads (CTWA)" />} />
            <Route path="data/calls" element={<PlaceholderPage title="Calls" />} />
            <Route path="docs" element={<PlaceholderPage title="وثائق" />} />
            <Route path="support" element={<PlaceholderPage title="المساعدة" />} />
            <Route path="team-inbox" element={<PlaceholderPage title="صندوق وارد الفريق" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <AppContent />
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
