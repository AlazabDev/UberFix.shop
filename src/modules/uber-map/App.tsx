import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import RegisterService from "./pages/RegisterService";
import QuickRequest from "./pages/QuickRequest";
import TrackOrders from "./pages/TrackOrders";
import Invoices from "./pages/Invoices";
import CompletedServices from "./pages/CompletedServices";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={MapPage} />
      <Route path={"/register-service"} component={RegisterService} />
      <Route path={"/quick-request"} component={QuickRequest} />
      <Route path={"/track-orders"} component={TrackOrders} />
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/completed-services"} component={CompletedServices} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="pb-24">
            <Router />
          </div>
          <Navigation />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
