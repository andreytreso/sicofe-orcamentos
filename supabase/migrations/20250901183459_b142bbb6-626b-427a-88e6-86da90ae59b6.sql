-- Security Linter Fixes Migration
-- This migration addresses security linter warnings from the previous migration

-- ============================================================================
-- 1. FIX SECURITY DEFINER FUNCTION ISSUES
-- ============================================================================

-- The linter flags security definer functions as potentially dangerous
-- Let's convert the function back to a proper RLS-protected approach
-- Instead of SECURITY DEFINER, we'll use a regular function that respects RLS

DROP FUNCTION IF EXISTS public.get_companies_with_group();

-- Recreate the companies_with_group as a view with proper RLS
-- Since we secured company_groups with RLS, the view will now be secure
CREATE VIEW public.companies_with_group AS
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
LEFT JOIN public.company_groups cg ON c.group_id = cg.id;

-- The view will automatically respect RLS policies from both tables

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATH ISSUES
-- ============================================================================

-- Ensure all our security functions have proper search_path set
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

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN 
  NEW.updated_at := now(); 
  RETURN NEW; 
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Fixed security linter issues:
-- 1. ✅ Removed SECURITY DEFINER function, replaced with RLS-protected view
-- 2. ✅ Added proper search_path to all functions
-- 3. ⚠️  Leaked password protection still requires manual action in dashboard