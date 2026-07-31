import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/src/lib/supabase/admin";
import { runScheduledAutomations } from "@/src/lib/automations/scheduled";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const result = await runScheduledAutomations(supabase);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[cron/automations]", error);
    return NextResponse.json(
      { error: "Échec des automatisations" },
      { status: 500 }
    );
  }
}
