-- تحديث البيانات القديمة لاستخدام القيم الجديدة
UPDATE maintenance_requests SET status = 'In Progress' WHERE status = 'InProgress';
UPDATE maintenance_requests SET status = 'On Hold' WHERE status = 'Waiting';