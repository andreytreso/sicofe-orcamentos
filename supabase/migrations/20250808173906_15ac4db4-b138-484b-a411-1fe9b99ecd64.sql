begin;

-- Fix Function Search Path Mutable warnings by setting search_path explicitly
ALTER FUNCTION public.is_admin(uid uuid) SET search_path = public;
ALTER FUNCTION public.profiles_protect_admin_fields() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

commit;