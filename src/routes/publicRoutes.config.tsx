import { lazy } from "react";

// Auth pages
const Index = lazy(() => import("@/pages/public/Index"));
const RoleSelection = lazy(() => import("@/pages/auth/RoleSelection"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const AuthCallback = lazy(() => import("@/pages/auth/AuthCallback"));

// Public pages
const About = lazy(() => import("@/pages/public/About"));
const PrivacyPolicy = lazy(() => import("@/pages/public/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/public/TermsOfService"));
const Services = lazy(() => import("@/pages/public/Services"));
const Gallery = lazy(() => import("@/pages/public/Gallery"));
const Blog = lazy(() => import("@/pages/public/Blog"));
const BlogPost = lazy(() => import("@/pages/public/BlogPost"));
const FAQ = lazy(() => import("@/pages/public/FAQ"));
const UserGuide = lazy(() => import("@/pages/public/UserGuide"));

// Other public pages
const Projects = lazy(() => import("@/pages/projects/Projects"));
const QuickRequest = lazy(() => import("@/pages/properties/QuickRequest"));
const Map = lazy(() => import("@/pages/Map"));
const PWASettings = lazy(() => import("@/pages/settings/PWASettings"));
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
  { path: "/faq", element: <FAQ /> },
  { path: "/user-guide", element: <UserGuide /> },
  { path: "/projects", element: <Projects /> },
  { path: "/blog", element: <Blog /> },
  { path: "/blog/:slug", element: <BlogPost /> },
  { path: "/quick-request/:propertyId", element: <QuickRequest /> },
  { path: "/map", element: <Map /> },
  { path: "/pwa-settings", element: <PWASettings /> },
  { path: "*", element: <NotFound /> },
];
