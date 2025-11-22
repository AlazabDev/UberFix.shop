-- =========================================
-- Critical Performance Indexes Migration
-- Adding indexes to support 5000+ users
-- =========================================

-- 1. MAINTENANCE_REQUESTS
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_workflow_stage ON maintenance_requests(workflow_stage);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_at ON maintenance_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_assigned_vendor ON maintenance_requests(assigned_vendor_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_property ON maintenance_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_branch ON maintenance_requests(branch_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_company ON maintenance_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_created_by ON maintenance_requests(created_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status_created ON maintenance_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_company_status ON maintenance_requests(company_id, status);

-- 2. PROPERTIES
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON properties(created_by);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- 3. PROFILES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 4. TECHNICIANS
CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_rating ON technicians(rating DESC);
CREATE INDEX IF NOT EXISTS idx_technicians_is_verified ON technicians(is_verified);
CREATE INDEX IF NOT EXISTS idx_technicians_created_at ON technicians(created_at DESC);

-- 5. APPOINTMENTS
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_vendor ON appointments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_property ON appointments(property_id);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(appointment_date, status);

-- 6. NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, created_at DESC) WHERE read_at IS NULL;

-- 7. MESSAGES
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, created_at DESC) WHERE is_read = false;

-- 8. INVOICES
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);

-- 9. REVIEWS
CREATE INDEX IF NOT EXISTS idx_reviews_technician ON reviews(technician_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 10. REQUEST_LIFECYCLE
CREATE INDEX IF NOT EXISTS idx_request_lifecycle_request ON request_lifecycle(request_id);
CREATE INDEX IF NOT EXISTS idx_request_lifecycle_status ON request_lifecycle(status);
CREATE INDEX IF NOT EXISTS idx_request_lifecycle_created_at ON request_lifecycle(created_at DESC);

-- 11. AUDIT_LOGS
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 12. EXPENSES
CREATE INDEX IF NOT EXISTS idx_expenses_request ON expenses(maintenance_request_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);

-- 13. PROJECTS
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- 14. VENDORS  
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at DESC);

-- 15. BRANCHES
CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(company_id);

-- 16. ERROR_LOGS
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_hash ON error_logs(error_hash);

-- 17. SERVICES
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON services(subcategory_id);

-- 18. CATEGORIES
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);