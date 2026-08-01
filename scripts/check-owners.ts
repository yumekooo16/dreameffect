import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(url, key);

async function main() {
  const owners = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role")
    .eq("role", "owner")
    .limit(5);

  console.log("Propriétaires:", JSON.stringify(owners.data, null, 2));

  const admins = await supabase
    .from("profiles")
    .select("id, role")
    .eq("role", "admin")
    .limit(3);

  console.log("Admins:", JSON.stringify(admins.data, null, 2));
}

main();
