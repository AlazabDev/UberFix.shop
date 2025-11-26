# Supabase Usage Inventory

## Overview

- Total project files captured: 832
- Supabase tables described in generated types: 98
- Edge functions present: 36

## Supabase tables (from generated types)

- annual_grand_winners
- app_control
- app_settings
- appointments
- audit_logs
- branch_locations
- branches
- calculate_distance
- calculate_sla_deadlines
- calculate_sla_due_date
- can_access_full_appointment
- can_access_service_request
- can_transition_stage
- categories
- cities
- companies
- dashboard_stats
- districts
- error_logs
- expenses
- find_nearest_vendor
- gallery_images
- generate_invoice_number
- get_appointment_contact_info
- get_appointment_customer_info
- get_appointments_for_staff
- get_cities_for_user
- get_current_user_company_id
- get_customer_contact_info
- get_customer_email
- get_customer_name
- get_customer_phone
- get_full_customer_info
- get_table_row_counts
- get_user_tenant
- get_vendor_appointments
- hall_of_excellence
- has_role
- invoice_items
- invoices
- is_admin
- is_email_confirmed
- maintenance_requests
- maintenance_requests_audit
- message_logs
- messages
- monthly_excellence_awards
- monthly_stats
- notifications
- otp_verifications
- profiles
- projects
- properties
- properties_audit
- push_subscriptions
- recalc_request_totals
- regions
- request_approvals
- request_lifecycle
- reviews
- role_permissions
- service_addons
- service_categories
- service_items
- service_orders
- service_packages
- service_prices
- service_subcategories
- services
- sla_policies
- specialization_icons
- stores
- technician_agreements
- technician_applications
- technician_badges
- technician_complaints
- technician_coverage
- technician_daily_stats
- technician_level_history
- technician_levels
- technician_location
- technician_monthly_bonuses
- technician_performance
- technician_portfolio
- technician_services
- technician_skill_tests
- technician_tasks
- technician_training
- technician_transactions
- technician_verifications
- technician_wallet
- technician_withdrawals
- technician_work_zones
- technicians
- user_roles
- vendor_locations
- vendors
- vw_cities_public

## Edge functions and jobs

- _shared
- assign-technician-to-request
- background-jobs
- cache-service
- calculate-monthly-bonuses
- calculate-route
- chatbot
- error-tracking
- get-google-maps-key
- get-maps-key
- get-property-for-qr
- get-users
- import-gallery-images
- meta-deauthorize
- meta-delete-data
- process-approval
- process-national-id-ocr
- push-subscribe
- receive-twilio-message
- rollback-version
- safe-update
- send-approval-email
- send-email-notification
- send-invoice-email
- send-maintenance-notification
- send-notification
- send-otp
- send-twilio-message
- send-unified-notification
- send-whatsapp-notification
- sla-manager
- sla-monitor
- twilio-delivery-status
- twilio-fallback
- verify-otp
- version-history

## Table usage across frontend/hooks/functions

### app_control (3 files)
- src/__tests__/integration/database.test.ts
- src/components/admin/MaintenanceLockControl.tsx
- src/hooks/useMaintenanceLock.ts

### app_settings (3 files)
- src/components/admin/SystemSettings.tsx
- src/hooks/useAppSettings.ts
- src/pages/maintenance/ServiceMap.tsx

### appointments (3 files)
- src/components/forms/NewAppointmentForm.tsx
- src/hooks/useAppointments.ts
- src/pages/admin/Testing.tsx

### approval_audit_log (1 files)
- supabase/functions/process-approval/index.ts

### approval_steps (1 files)
- src/components/approvals/ApprovalWorkflowManager.tsx

### approval_workflows (1 files)
- src/components/approvals/ApprovalWorkflowManager.tsx

### audit_logs (5 files)
- src/components/admin/AuditLogsViewer.tsx
- supabase/functions/background-jobs/index.ts
- supabase/functions/meta-deauthorize/index.ts
- supabase/functions/meta-delete-data/index.ts
- supabase/functions/rollback-version/index.ts

### az_gallery (1 files)
- supabase/functions/import-gallery-images/index.ts

### background_jobs (1 files)
- supabase/functions/background-jobs/index.ts

### branch_locations (2 files)
- src/hooks/useBranchLocations.ts
- src/pages/BranchManagement.tsx

### branches (6 files)
- src/__tests__/integration/database.test.ts
- src/components/forms/QuickRequestForm.tsx
- src/components/service-request/RequestDetailsStep.tsx
- src/hooks/useMaintenanceRequests.ts
- src/pages/QuickRequestFromMap.tsx
- src/pages/maintenance/CreateMaintenanceRequest.tsx

### categories (4 files)
- src/components/approvals/ApprovalWorkflowManager.tsx
- src/components/service-request/RequestDetailsStep.tsx
- src/hooks/useServices.ts
- supabase/functions/cache-service/index.ts

### cities (2 files)
- src/components/forms/PropertyForm.tsx
- supabase/functions/cache-service/index.ts

### companies (2 files)
- src/__tests__/integration/database.test.ts
- src/components/forms/QuickRequestForm.tsx

### dashboard_stats (1 files)
- src/hooks/useDashboardStats.ts

### districts (2 files)
- src/components/forms/PropertyForm.tsx
- supabase/functions/cache-service/index.ts

### error_logs (3 files)
- src/components/admin/ErrorMonitoringDashboard.tsx
- src/pages/MonitoringDashboard.tsx
- supabase/functions/error-tracking/index.ts

### expenses (1 files)
- src/components/reports/ExpenseReport.tsx

### gallery_images (2 files)
- src/hooks/useGalleryImages.ts
- supabase/functions/import-gallery-images/index.ts

### hall_of_excellence (2 files)
- src/pages/technicians/HallOfExcellence.tsx
- src/utils/technicianPerformance.ts

### invoice_items (1 files)
- src/components/forms/NewInvoiceForm.tsx

### invoices (3 files)
- src/components/forms/NewInvoiceForm.tsx
- src/pages/Invoices.tsx
- src/pages/admin/Testing.tsx

### maintenance_requests (22 files)
- src/__tests__/integration/database.test.ts
- src/components/forms/QuickRequestForm.tsx
- src/components/maintenance/MaintenanceRequestActions.tsx
- src/components/maintenance/RequestWorkflowControls.tsx
- src/components/reports/MaintenanceReportDashboard.tsx
- src/components/reports/PropertyLifecycleReport.tsx
- src/components/service-request/RequestDetailsStep.tsx
- src/components/vendors/VendorReviews.tsx
- src/components/vendors/VendorTasks.tsx
- src/hooks/useMaintenanceRequests.ts
- src/hooks/usePaginatedRequests.ts
- src/pages/QuickRequestFromMap.tsx
- src/pages/admin/Testing.tsx
- src/pages/maintenance/CreateMaintenanceRequest.tsx
- src/pages/maintenance/EmergencyService.tsx
- src/pages/reports/SLADashboard.tsx
- supabase/functions/assign-technician-to-request/index.ts
- supabase/functions/process-approval/index.ts
- supabase/functions/receive-twilio-message/index.ts
- supabase/functions/send-maintenance-notification/index.ts
- supabase/functions/sla-manager/index.ts
- supabase/functions/sla-monitor/index.ts

### maintenance_requests_v2 (1 files)
- supabase/functions/send-notification/index.ts

### message_logs (5 files)
- src/components/whatsapp/WhatsAppMessagesTable.tsx
- src/pages/messages/MessageLogs.tsx
- supabase/functions/receive-twilio-message/index.ts
- supabase/functions/send-twilio-message/index.ts
- supabase/functions/send-whatsapp-notification/index.ts

### messages (1 files)
- src/hooks/useMessages.ts

### monthly_excellence_awards (1 files)
- src/utils/technicianPerformance.ts

### notifications (15 files)
- src/components/forms/NewRequestForm.tsx
- src/components/maintenance/MaintenanceRequestActions.tsx
- src/hooks/useNotifications.ts
- src/pages/admin/Testing.tsx
- src/pages/maintenance/EmergencyService.tsx
- supabase/functions/assign-technician-to-request/index.ts
- supabase/functions/background-jobs/index.ts
- supabase/functions/error-tracking/index.ts
- supabase/functions/receive-twilio-message/index.ts
- supabase/functions/send-maintenance-notification/index.ts
- supabase/functions/send-notification/index.ts
- supabase/functions/send-unified-notification/index.ts
- supabase/functions/sla-manager/index.ts
- supabase/functions/sla-monitor/index.ts
- supabase/functions/twilio-delivery-status/index.ts

### otp_verifications (2 files)
- supabase/functions/send-otp/index.ts
- supabase/functions/verify-otp/index.ts

### profiles (18 files)
- src/components/admin/UserRolesManagement.tsx
- src/components/layout/AppLayout.tsx
- src/components/layout/Header.tsx
- src/components/service-request/RequestDetailsStep.tsx
- src/hooks/useMaintenanceRequests.ts
- src/hooks/useUserRoles.ts
- src/hooks/useUserSettings.ts
- src/pages/QuickRequestFromMap.tsx
- src/pages/UsersPage.tsx
- src/pages/admin/ProductionMonitor.tsx
- src/pages/admin/Testing.tsx
- src/pages/maintenance/CreateMaintenanceRequest.tsx
- src/pages/maintenance/EmergencyService.tsx
- src/pages/maintenance/ServiceMap.tsx
- supabase/functions/meta-deauthorize/index.ts
- supabase/functions/meta-delete-data/index.ts
- supabase/functions/send-notification/index.ts
- supabase/functions/sla-monitor/index.ts

### project_phases (1 files)
- src/hooks/useProjects.ts

### project_updates (1 files)
- src/hooks/useProjects.ts

### projects (3 files)
- src/components/projects/NewProjectDialog.tsx
- src/hooks/useProjects.ts
- src/pages/admin/Testing.tsx

### properties (13 files)
- src/__tests__/integration/database.test.ts
- src/components/forms/NewAppointmentForm.tsx
- src/components/forms/PropertyForm.tsx
- src/components/properties/PropertyActionsDialog.tsx
- src/components/reports/PropertyLifecycleReport.tsx
- src/components/service-request/RequestDetailsStep.tsx
- src/hooks/useProperties.ts
- src/pages/admin/Testing.tsx
- src/pages/properties/ArchivedProperties.tsx
- src/pages/properties/EditProperty.tsx
- src/pages/properties/PropertyDetails.tsx
- supabase/functions/cache-service/index.ts
- supabase/functions/get-property-for-qr/index.ts

### push_subscriptions (1 files)
- supabase/functions/push-subscribe/index.ts

### request_approvals (2 files)
- src/components/workflow/ApprovalManager.tsx
- supabase/functions/process-approval/index.ts

### request_events (1 files)
- supabase/functions/sla-monitor/index.ts

### reviews (3 files)
- src/components/reviews/AddReviewDialog.tsx
- src/components/reviews/TechnicianReviews.tsx
- src/utils/technicianPerformance.ts

### role_permissions (2 files)
- src/components/admin/PermissionsManagement.tsx
- src/hooks/useUserRoles.ts

### services (4 files)
- src/components/service-request/RequestDetailsStep.tsx
- src/components/service-request/ServiceSelectionStep.tsx
- src/hooks/useServices.ts
- supabase/functions/cache-service/index.ts

### specialization_icons (2 files)
- src/components/forms/IconSelector.tsx
- src/hooks/useTechnicians.ts

### technician_agreements (1 files)
- src/pages/technicians/TechnicianAgreement.tsx

### technician_applications (4 files)
- src/pages/technicians/TechnicianAgreement.tsx
- src/pages/technicians/TechnicianRegistration.tsx
- src/pages/technicians/TechnicianVerification.tsx
- supabase/functions/process-national-id-ocr/index.ts

### technician_badges (3 files)
- src/pages/technicians/TechnicianDashboard.tsx
- src/pages/technicians/TechnicianTraining.tsx
- src/utils/technicianPerformance.ts

### technician_daily_stats (1 files)
- src/pages/technicians/TechnicianEarnings.tsx

### technician_levels (2 files)
- src/pages/technicians/TechnicianDashboard.tsx
- src/utils/technicianPerformance.ts

### technician_monthly_bonuses (2 files)
- src/pages/technicians/TechnicianEarnings.tsx
- supabase/functions/calculate-monthly-bonuses/index.ts

### technician_performance (2 files)
- src/pages/technicians/TechnicianDashboard.tsx
- src/utils/technicianPerformance.ts

### technician_tasks (3 files)
- src/pages/technicians/TechnicianDashboard.tsx
- src/pages/technicians/TechnicianTaskManagement.tsx
- src/utils/technicianPerformance.ts

### technician_training (1 files)
- src/pages/technicians/TechnicianTraining.tsx

### technician_transactions (1 files)
- src/pages/technicians/TechnicianWallet.tsx

### technician_verifications (2 files)
- src/pages/technicians/TechnicianAgreement.tsx
- src/pages/technicians/TechnicianVerification.tsx

### technician_wallet (3 files)
- src/pages/technicians/TechnicianWallet.tsx
- src/pages/technicians/TechnicianWithdrawal.tsx
- supabase/functions/calculate-monthly-bonuses/index.ts

### technician_withdrawals (1 files)
- src/pages/technicians/TechnicianWithdrawal.tsx

### technicians (9 files)
- src/hooks/useTechnicianLocation.ts
- src/hooks/useTechnicians.ts
- src/pages/technicians/TechnicianEarnings.tsx
- src/pages/technicians/TechnicianTraining.tsx
- src/pages/technicians/TechnicianWallet.tsx
- src/pages/technicians/TechnicianWithdrawal.tsx
- supabase/functions/assign-technician-to-request/index.ts
- supabase/functions/cache-service/index.ts
- supabase/functions/calculate-monthly-bonuses/index.ts

### user_roles (8 files)
- src/components/admin/UserRolesManagement.tsx
- src/hooks/useUserSettings.ts
- src/pages/admin/UserManagement.tsx
- supabase/functions/error-tracking/index.ts
- supabase/functions/receive-twilio-message/index.ts
- supabase/functions/rollback-version/index.ts
- supabase/functions/send-maintenance-notification/index.ts
- supabase/functions/sla-manager/index.ts

### vendor_locations (1 files)
- src/hooks/useVendorLocations.ts

### vendors (7 files)
- src/components/forms/NewAppointmentForm.tsx
- src/components/forms/NewVendorForm.tsx
- src/components/vendors/VendorLocationTracker.tsx
- src/hooks/useVendorLocations.ts
- src/hooks/useVendors.ts
- src/pages/VendorDetails.tsx
- src/pages/admin/Testing.tsx

### whatsapp_messages (1 files)
- supabase/functions/twilio-delivery-status/index.ts
