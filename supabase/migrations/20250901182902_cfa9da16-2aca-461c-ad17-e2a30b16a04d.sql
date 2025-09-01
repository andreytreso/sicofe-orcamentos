-- Security Remediation Migration
-- This migration addresses critical security vulnerabilities identified in the security audit

-- ============================================================================
-- 1. SECURE COMPANY GROUPS TABLE
-- ============================================================================

-- Enable RLS on company_groups table (currently exposed)
ALTER TABLE public.company_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for company_groups - only users with company access can view relevant groups
CREATE POLICY "Users can view company groups for their companies" 
ON public.company_groups 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.companies c
    JOIN public.user_company_access uca ON c.group_id = company_groups.id
    WHERE uca.user_id = auth.uid()
  )
);

-- Only admins can manage company groups
CREATE POLICY "Admins can manage company groups" 
ON public.company_groups 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- 2. SECURE COMPANIES_WITH_GROUP VIEW
-- ============================================================================

-- Drop the current view and recreate as a security definer function
-- This prevents RLS bypass through views
DROP VIEW IF EXISTS public.companies_with_group;

-- Create a secure function to replace the view
CREATE OR REPLACE FUNCTION public.get_companies_with_group()
RETURNS TABLE (
  id uuid,
  name text,
  status text,
  cnpj text,
  email text,
  telefone text,
  endereco_rua text,
  endereco_numero text,
  endereco_cidade text,
  endereco_estado text,
  endereco_cep text,
  group_id uuid,
  group_name text,
  group_code text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.name,
    c.status,
    c.cnpj,
    c.email,
    c.telefone,
    c.endereco_rua,
    c.endereco_numero,
    c.endereco_cidade,
    c.endereco_estado,
    c.endereco_cep,
    c.group_id,
    cg.name as group_name,
    cg.code as group_code,
    c.created_at,
    c.updated_at
  FROM public.companies c
  LEFT JOIN public.company_groups cg ON c.group_id = cg.id
  WHERE EXISTS (
    SELECT 1 FROM public.user_company_access uca 
    WHERE uca.company_id = c.id AND uca.user_id = auth.uid()
  )
  OR public.is_admin(auth.uid());
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.get_companies_with_group() TO authenticated;

-- ============================================================================
-- 3. STRENGTHEN ACCOUNT HIERARCHY SECURITY
-- ============================================================================

-- Ensure account_hierarchy has proper company-based access control
-- (Already has RLS enabled from previous migration, but let's ensure proper policies)

-- Drop any overly permissive policies if they exist
DROP POLICY IF EXISTS "Account hierarchy is publicly readable" ON public.account_hierarchy;
DROP POLICY IF EXISTS "Public access to account hierarchy" ON public.account_hierarchy;

-- Ensure we have the correct company-based policies
DO $$
BEGIN
  -- Check if the correct SELECT policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'account_hierarchy' 
    AND policyname = 'Users can view account hierarchy for their companies'
  ) THEN
    CREATE POLICY "Users can view account hierarchy for their companies" 
    ON public.account_hierarchy 
    FOR SELECT 
    USING (
      company_id IN (
        SELECT uca.company_id
        FROM public.user_company_access uca
        WHERE uca.user_id = auth.uid()
      )
      OR public.is_admin(auth.uid())
    );
  END IF;
END $$;

-- ============================================================================
-- 4. STRENGTHEN PROFILES PRIVILEGE ESCALATION PROTECTION
-- ============================================================================

-- Create additional validation trigger to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is trying to change their own role to admin, prevent it
  IF NEW.user_id = auth.uid() AND OLD.role != 'admin' AND NEW.role = 'admin' THEN
    RAISE EXCEPTION 'Users cannot grant themselves admin privileges'
      USING ERRCODE = '42501';
  END IF;
  
  -- Only existing admins can create new admin users
  IF OLD.role != 'admin' AND NEW.role = 'admin' AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can grant admin privileges'
      USING ERRCODE = '42501';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the trigger to profiles table
DROP TRIGGER IF EXISTS prevent_privilege_escalation_trigger ON public.profiles;
CREATE TRIGGER prevent_privilege_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();

-- ============================================================================
-- 5. AUDIT LOGGING FOR SENSITIVE OPERATIONS
-- ============================================================================

-- Create audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.security_audit_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Create audit function
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log sensitive operations on profiles table
  IF TG_TABLE_NAME = 'profiles' AND (
    (TG_OP = 'UPDATE' AND OLD.role != NEW.role) OR
    (TG_OP = 'UPDATE' AND OLD.aprovador != NEW.aprovador) OR
    (TG_OP = 'UPDATE' AND OLD.pacoteiro != NEW.pacoteiro)
  ) THEN
    INSERT INTO public.security_audit_log (
      user_id, action, table_name, record_id, old_values, new_values
    ) VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(OLD) END,
      CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to profiles table
DROP TRIGGER IF EXISTS security_audit_trigger ON public.profiles;
CREATE TRIGGER security_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_security_event();

-- ============================================================================
-- 6. STRENGTHEN USER COMPANY ACCESS SECURITY
-- ============================================================================

-- Add validation to prevent users from granting themselves admin access to companies
CREATE OR REPLACE FUNCTION public.validate_company_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent users from granting themselves admin role to companies
  IF NEW.user_id = auth.uid() AND NEW.role = 'admin' AND (OLD IS NULL OR OLD.role != 'admin') THEN
    -- Check if the current user is already an admin in any company or system admin
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Users cannot grant themselves admin access to companies'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply validation trigger
DROP TRIGGER IF EXISTS validate_company_access_trigger ON public.user_company_access;
CREATE TRIGGER validate_company_access_trigger
  BEFORE INSERT OR UPDATE ON public.user_company_access
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_company_access();

-- ============================================================================
-- SUMMARY OF SECURITY IMPROVEMENTS
-- ============================================================================

-- The following security vulnerabilities have been addressed:
-- 1. ✅ Company Groups data exposure - Now protected with RLS
-- 2. ✅ Companies with Group view - Converted to secure function
-- 3. ✅ Account Hierarchy - Ensured proper company-based access
-- 4. ✅ Privilege Escalation Prevention - Added validation triggers
-- 5. ✅ Audit Logging - Added for sensitive operations
-- 6. ✅ Company Access Security - Prevented self-privilege escalation

-- NOTE: Leaked password protection must be enabled manually in Supabase Dashboard
-- Go to Authentication > Settings > Password validation and enable "Check against common passwords"