-- Add foreign key to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_roles_user_id_fkey' 
    AND table_name = 'user_roles'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing roles to app_role enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    -- Create enum if it doesn't exist
    CREATE TYPE public.app_role AS ENUM (
      'admin', 'manager', 'staff', 'technician', 
      'vendor', 'customer', 'accounting', 'engineering', 
      'warehouse', 'dispatcher'
    );
  ELSE
    -- Add missing values to existing enum
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dispatcher';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;