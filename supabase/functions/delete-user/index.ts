// Supabase Edge Function: delete-user
// This function deletes a user from Auth and cleans related rows in public tables.
// Requires the SUPABASE_SERVICE_ROLE_KEY secret to be set in Edge Functions.
// It is automatically deployed; call it from the client with:
// supabase.functions.invoke('delete-user', { body: { user_id } })

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "Missing user_id" }), { status: 400 });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1) Clean related rows (bypass RLS with service role)
    await supabase.from("user_company_access").delete().eq("user_id", user_id);
    await supabase.from("profiles").delete().eq("user_id", user_id);

    // 2) Delete the auth user
    const { error: adminError } = await supabase.auth.admin.deleteUser(user_id);
    if (adminError) {
      return new Response(JSON.stringify({ error: adminError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Unexpected error" }), { status: 500 });
  }
});
