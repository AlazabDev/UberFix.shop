import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PageErrorBoundary } from "@/components/error-boundaries/PageErrorBoundary";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { protectedRoutes } from "@/routes/routes.config";
import { publicRoutes } from "@/routes/publicRoutes.config";
import { Loader2 } from "lucide-react";
import { useMaintenanceLock } from "@/hooks/useMaintenanceLock";
import { MaintenanceOverlay } from "@/components/MaintenanceOverlay";

// Lazy load PWA prompt to prevent blocking initial render
import { lazy } from "react";
const PWAInstallPrompt = lazy(() => 
  import("@/components/PWAInstallPrompt").then(m => ({ default: m.PWAInstallPrompt }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  const { data: lockStatus, isLoading } = useMaintenanceLock();
  
  // Don't block rendering while checking maintenance status
  // Only show maintenance overlay if explicitly locked and data is loaded
  if (!isLoading && lockStatus?.isLocked) {
    return <MaintenanceOverlay message={lockStatus.message} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}

          {/* Protected Routes */}
          {protectedRoutes.map(({ path, element, withLayout }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute withLayout={withLayout}>
                  {element}
                </ProtectedRoute>
              }
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => {
  console.log('[App] Rendering application...');
  
  return (
    <PageErrorBoundary pageName="Application">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppContent />
            {/* PWA prompt loaded lazily after main content */}
            <Suspense fallback={null}>
              <PWAInstallPrompt />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </PageErrorBoundary>
  );
};

export default App;
