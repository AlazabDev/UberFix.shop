-- Create facebook_users table for storing Facebook authenticated users
CREATE TABLE public.facebook_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facebook_id TEXT UNIQUE NOT NULL,
    email TEXT,
    name TEXT NOT NULL,
    picture_url TEXT,
    access_token TEXT,
    supabase_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_facebook_users_facebook_id ON public.facebook_users(facebook_id);
CREATE INDEX idx_facebook_users_supabase_user_id ON public.facebook_users(supabase_user_id);

-- Enable RLS
ALTER TABLE public.facebook_users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own Facebook profile
CREATE POLICY "Users can view own facebook profile"
ON public.facebook_users
FOR SELECT
USING (
    supabase_user_id = auth.uid() OR
    auth.uid() IS NOT NULL
);

-- Policy: Service role can manage all records (for Edge Function)
CREATE POLICY "Service role full access"
ON public.facebook_users
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_facebook_users_updated_at
BEFORE UPDATE ON public.facebook_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();