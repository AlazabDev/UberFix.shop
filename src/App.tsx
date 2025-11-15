import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { protectedRoutes } from "@/routes/routes.config";
import { publicRoutes } from "@/routes/publicRoutes.config";
import { Loader2 } from "lucide-react";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { useMaintenanceLock } from "@/hooks/useMaintenanceLock";
import { MaintenanceOverlay } from "@/components/MaintenanceOverlay";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst',
    },
  },
});

// مكون Loading مركزي لـ Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MaintenanceLockWrapper />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const MaintenanceLockWrapper = () => {
  const { data: lockStatus, isLoading } = useMaintenanceLock();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (lockStatus?.isLocked) {
    return <MaintenanceOverlay message={lockStatus.message} />;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <PWAInstallPrompt />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* المسارات العامة (Public Routes) */}
              {publicRoutes.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}

              {/* المسارات المحمية (Protected Routes) */}
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
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
