import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

/**
 * Callback Supabase Auth (invitation / confirmation email).
 * Configurez dans Supabase → Authentication → URL Configuration :
 * Redirect URLs : https://www.dreameffect.fr/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/espace-proprietaire";
  const next = nextRaw.startsWith("/") ? nextRaw : "/espace-proprietaire";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set(
      "error",
      "Lien d'invitation invalide ou expiré. Demandez un nouvel email à DreamEffect."
    );
    return NextResponse.redirect(loginUrl);
  }

  // Compatibilité anciens liens type token_hash
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as "invite" | "signup" | "email" | "recovery" | "magiclink" | "email_change",
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set(
    "error",
    "Impossible de valider l'email. Réessayez ou contactez DreamEffect."
  );
  return NextResponse.redirect(loginUrl);
}
