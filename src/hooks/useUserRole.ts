import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type RoleInfo = { role: string | null; isAdmin: boolean };

export function useUserRole() {
  return useQuery<RoleInfo>({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr) throw uerr;
      if (!user) return { role: null, isAdmin: false };

      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      const role = data?.role?.toLowerCase() ?? null;
      return { role, isAdmin: role === "admin" };
    },
    staleTime: 60_000,
  });
}
