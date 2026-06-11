import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "../.env.local") });

const ADMIN_EMAIL = (process.argv[2] ?? "jonaslim@noxpwr.com").toLowerCase();

async function findUserId(
  supabase: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return null;
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) return match.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(url, key);

  let userId: string | null = null;
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      email_confirm: true,
    });

  if (created?.user) {
    userId = created.user.id;
    console.log(`Created auth user ${ADMIN_EMAIL}`);
  } else if (createErr) {
    userId = await findUserId(supabase, ADMIN_EMAIL);
    if (!userId) throw new Error(createErr.message);
    console.log(`Auth user already existed for ${ADMIN_EMAIL}`);
  }

  if (!userId) throw new Error("Could not resolve user id");

  const { error: upsertErr } = await supabase.from("profiles").upsert(
    { id: userId, email: ADMIN_EMAIL, role: "admin" },
    { onConflict: "id" }
  );
  if (upsertErr) {
    throw new Error(
      `${upsertErr.message}\nDid you run supabase/migrations/004_auth_profiles.sql?`
    );
  }

  console.log(`✓ ${ADMIN_EMAIL} is now an admin (${userId})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
