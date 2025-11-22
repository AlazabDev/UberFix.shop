import { lazy } from "react";

// Dashboard & Core
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Documentation = lazy(() => import("@/pages/Documentation"));

// Maintenance
const Requests = lazy(() => import("@/pages/maintenance/Requests"));
const AllRequests = lazy(() => import("@/pages/maintenance/AllRequests"));
const RequestDetails = lazy(() => import("@/pages/maintenance/RequestDetails"));
const RequestLifecycleJourney = lazy(
  () => import("@/pages/maintenance/RequestLifecycleJourney")
);
const ServiceRequest = lazy(() => import("@/pages/maintenance/ServiceRequest"));
const ServiceMap = lazy(() => import("@/pages/maintenance/ServiceMap"));
const EmergencyService = lazy(
  () => import("@/pages/maintenance/EmergencyService")
);
const MaintenanceProcedures = lazy(
  () => import("@/pages/maintenance/MaintenanceProcedures")
);

// Properties
const Properties = lazy(() => import("@/pages/properties/Properties"));
const AddProperty = lazy(() => import("@/pages/properties/AddProperty"));
const EditProperty = lazy(() => import("@/pages/properties/EditProperty"));
const PropertyDetails = lazy(
  () => import("@/pages/properties/PropertyDetails")
);
const ArchivedProperties = lazy(
  () => import("@/pages/properties/ArchivedProperties")
);

// Reports
const Reports = lazy(() => import("@/pages/reports/Reports"));
const SLADashboard = lazy(() => import("@/pages/reports/SLADashboard"));
const ExpenseReports = lazy(
  () => import("@/pages/reports/ExpenseReports")
);
const MaintenanceReports = lazy(
  () => import("@/pages/reports/MaintenanceReports")
); // الأصلية
const ProductionReport = lazy(
  () => import("@/pages/reports/ProductionReport")
);

// Admin
const UserManagement = lazy(
  () => import("@/pages/admin/UserManagement")
);

// Technicians
const TechnicianRegistration = lazy(
  () => import("@/pages/technicians/TechnicianRegistration")
);
const TechnicianVerification = lazy(
  () => import("@/pages/technicians/TechnicianVerification")
);
const TechnicianAgreement = lazy(
  () => import("@/pages/technicians/TechnicianAgreement")
);
const TechnicianTraining = lazy(
  () => import("@/pages/technicians/TechnicianTraining")
);
const TechnicianDashboard = lazy(
  () => import("@/pages/technicians/TechnicianDashboard")
);
const TechnicianTaskManagement = lazy(
  () => import("@/pages/technicians/TechnicianTaskManagement")
);
const HallOfExcellence = lazy(
  () => import("@/pages/technicians/HallOfExcellence")
);
const AdminControlCenter = lazy(
  () => import("@/pages/admin/AdminControlCenter")
);
const ProductionMonitor = lazy(
  () => import("@/pages/admin/ProductionMonitor")
);
const Testing = lazy(() => import("@/pages/admin/Testing"));

// Messages
const Inbox = lazy(() => import("@/pages/messages/Inbox"));
const WhatsAppMessages = lazy(
  () => import("@/pages/messages/WhatsAppMessages")
);
const MessageLogs = lazy(
  () => import("@/pages/messages/MessageLogs")
);

// Projects
const ProjectDetails = lazy(() => import("@/pages/projects/ProjectDetails"));

// Settings
const Settings = lazy(() => import("@/pages/settings/Settings"));

// Vendors
const Vendors = lazy(() => import("@/pages/Vendors"));
const VendorDetails = lazy(() => import("@/pages/VendorDetails"));

// Other
const Appointments = lazy(() => import("@/pages/Appointments"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const UsersPage = lazy(() => import("@/pages/UsersPage"));

/**
 * صفحات جديدة تحت قسم Maintenance
 * (بعد التصحيح — تم إعادة تسمية المتغيّر الثاني فقط)
 */
const MaintenanceRequestDetail = lazy(
  () => import("@/pages/maintenance/MaintenanceRequestDetail")
);
const MaintenanceReportsPage = lazy(
  () => import("@/pages/maintenance/MaintenanceReports")
); // ← هذه كانت سبب المشكلة
const CreateMaintenanceRequest = lazy(
  () => import("@/pages/maintenance/CreateMaintenanceRequest")
);
const MaintenanceList = lazy(
  () => import("@/pages/maintenance/MaintenanceList")
);
const MaintenanceOverview = lazy(
  () => import("@/pages/maintenance/MaintenanceOverview")
);

export const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard />, withLayout: true },
  { path: "/sla-dashboard", element: <SLADashboard />, withLayout: true },

  // Maintenance
  { path: "/requests", element: <Requests />, withLayout: true },
  { path: "/all-requests", element: <AllRequests />, withLayout: true },
  { path: "/requests/:id", element: <RequestDetails />, withLayout: true },
  { path: "/request-lifecycle", element: <RequestLifecycleJourney />, withLayout: true },
  { path: "/service-request", element: <ServiceRequest />, withLayout: true },
  { path: "/maintenance/overview", element: <MaintenanceOverview />, withLayout: true },
  { path: "/maintenance/list", element: <MaintenanceList />, withLayout: true },
  { path: "/maintenance/create", element: <CreateMaintenanceRequest />, withLayout: true },
  { path: "/maintenance/:id", element: <MaintenanceRequestDetail />, withLayout: true },

  // Vendors
  { path: "/vendors", element: <Vendors />, withLayout: true },
  { path: "/vendors/:id", element: <VendorDetails />, withLayout: true },

  // Reports
  { path: "/reports", element: <Reports />, withLayout: true },
  { path: "/reports/expenses", element: <ExpenseReports />, withLayout: true },
  { path: "/reports/maintenance", element: <MaintenanceReports />, withLayout: true }, // الأصلية
  { path: "/maintenance/reports", element: <MaintenanceReportsPage />, withLayout: true }, // ← الجديدة بعد التصحيح

  // Properties
  { path: "/properties", element: <Properties />, withLayout: true },
  { path: "/properties/add", element: <AddProperty />, withLayout: true },
  { path: "/properties/archived", element: <ArchivedProperties />, withLayout: true },
  { path: "/properties/:id", element: <PropertyDetails />, withLayout: true },
  { path: "/properties/edit/:id", element: <EditProperty />, withLayout: true },

  // Other
  { path: "/appointments", element: <Appointments />, withLayout: true },
  { path: "/invoices", element: <Invoices />, withLayout: true },
  { path: "/documentation", element: <Documentation />, withLayout: true },
  { path: "/maintenance-procedures", element: <MaintenanceProcedures />, withLayout: true },
  { path: "/settings", element: <Settings />, withLayout: true },
  { path: "/testing", element: <Testing />, withLayout: true },
  { path: "/production-report", element: <ProductionReport />, withLayout: true },
  { path: "/production-monitor", element: <ProductionMonitor />, withLayout: true },
  { path: "/projects/:id", element: <ProjectDetails />, withLayout: true },
  { path: "/admin/users", element: <UserManagement />, withLayout: true },
  { path: "/users", element: <UsersPage />, withLayout: true },
  { path: "/admin-control-center", element: <AdminControlCenter />, withLayout: true },

  // Technicians Module
  { path: "/technicians/register", element: <TechnicianRegistration />, withLayout: true },
  { path: "/technicians/verification", element: <TechnicianVerification />, withLayout: true },
  { path: "/technicians/agreement", element: <TechnicianAgreement />, withLayout: true },
  { path: "/technicians/training", element: <TechnicianTraining />, withLayout: true },
  { path: "/technicians/dashboard", element: <TechnicianDashboard />, withLayout: true },
  { path: "/technicians/tasks", element: <TechnicianTaskManagement />, withLayout: true },
  { path: "/hall-of-excellence", element: <HallOfExcellence />, withLayout: true },

  // Messages
  { path: "/whatsapp", element: <WhatsAppMessages />, withLayout: true },
  { path: "/message-logs", element: <MessageLogs />, withLayout: true },

  // No layout
  { path: "/service-map", element: <ServiceMap />, withLayout: false },
  { path: "/emergency-service/:technicianId", element: <EmergencyService />, withLayout: false },
  { path: "/inbox", element: <Inbox />, withLayout: false }
];
