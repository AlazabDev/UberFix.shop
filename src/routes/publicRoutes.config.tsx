import { lazy } from "react";

// Lazy load public pages
const Index = lazy(() => import("@/pages/Index"));
const RoleSelection = lazy(() => import("@/pages/RoleSelection"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const About = lazy(() => import("@/pages/About"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Services = lazy(() => import("@/pages/Services"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Projects = lazy(() => import("@/pages/Projects"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const QuickRequest = lazy(() => import("@/pages/QuickRequest"));
const Map = lazy(() => import("@/pages/Map"));
const UberMapTest = lazy(() => import("@/pages/UberMapTest"));
const UberMapApp = lazy(() => import("@/modules/uber-map/App"));
const RegisterService = lazy(() => import("@/modules/uber-map/pages/RegisterService"));
const UberQuickRequest = lazy(() => import("@/modules/uber-map/pages/QuickRequest"));
const TrackOrders = lazy(() => import("@/modules/uber-map/pages/TrackOrders"));
const UberInvoices = lazy(() => import("@/modules/uber-map/pages/Invoices"));
const CompletedServices = lazy(() => import("@/modules/uber-map/pages/CompletedServices"));
const PWASettings = lazy(() => import("@/pages/PWASettings"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/**
 * المسارات العامة (لا تتطلب تسجيل دخول)
 */
export const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "/role-selection", element: <RoleSelection /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/about", element: <About /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/services", element: <Services /> },
  { path: "/gallery", element: <Gallery /> },
  { path: "/projects", element: <Projects /> },
  { path: "/blog", element: <Blog /> },
  { path: "/blog/:slug", element: <BlogPost /> },
  { path: "/quick-request/:propertyId", element: <QuickRequest /> },
  { path: "/map", element: <Map /> },
  { path: "/uber-map-test", element: <UberMapTest /> },
  { path: "/uber-map", element: <UberMapApp /> },
  { path: "/uber-map/register-service", element: <RegisterService /> },
  { path: "/uber-map/quick-request", element: <UberQuickRequest /> },
  { path: "/uber-map/track-orders", element: <TrackOrders /> },
  { path: "/uber-map/invoices", element: <UberInvoices /> },
  { path: "/uber-map/completed-services", element: <CompletedServices /> },
  { path: "/pwa-settings", element: <PWASettings /> },
  { path: "*", element: <NotFound /> },
];
