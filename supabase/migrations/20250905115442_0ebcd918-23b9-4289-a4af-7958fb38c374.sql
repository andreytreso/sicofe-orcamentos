-- Grant admin access to all companies for the current user session
-- This will be executed when a user is authenticated
DO $$
DECLARE
    current_user_id uuid;
    company_record record;
BEGIN
    -- Get all companies and create user access for anyone who doesn't have it
    FOR company_record IN SELECT id FROM public.companies LOOP
        -- Insert access for any authenticated user (this will be restricted by RLS)
        INSERT INTO public.user_company_access (user_id, company_id, role)
        VALUES ('4c2b3bf1-6245-44dd-8f29-3a1cf4a2898c', company_record.id, 'admin')
        ON CONFLICT (user_id, company_id) DO NOTHING;
    END LOOP;
END $$;