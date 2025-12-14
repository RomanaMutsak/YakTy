import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "" // <--- Ключ Адміна!
    );

    const { user_id } = await req.json();
    if (!user_id) throw new Error("Не надано user_id");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Користувача успішно видалено" }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Помилка видалення користувача:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});