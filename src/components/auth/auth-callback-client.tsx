"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createAuthCallbackClient } from "@/src/lib/supabase/client";

const DEFAULT_NEXT = "/auth/definir-mot-de-passe";

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DEFAULT_NEXT;
  }
  return raw;
}

/** Tokens du flux implicite (inviteUserByEmail / generateLink). */
function parseImplicitHashTokens() {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token };
}

export default function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Validation de votre invitation…");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = createAuthCallbackClient();
    const next = safeNextPath(searchParams.get("next"));
    const code = searchParams.get("code");
    // Supabase email templates / generateLink app links
    const tokenHash =
      searchParams.get("token_hash") ?? searchParams.get("token");
    const type = searchParams.get("type");
    let settled = false;

    function succeed() {
      if (settled) return;
      settled = true;
      setMessage("Invitation acceptée — redirection…");
      // Navigation complète pour que le cookie de session soit visible
      // par la page serveur /auth/definir-mot-de-passe.
      window.location.assign(next);
    }

    function fail(detail?: string) {
      if (settled) return;
      settled = true;
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set(
        "error",
        detail ??
          "Lien d'invitation invalide ou expiré. Demandez un nouvel email à DreamEffect."
      );
      window.location.assign(loginUrl.pathname + loginUrl.search);
    }

    async function exchange() {
      try {
        // 1) PKCE (?code=)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            fail(
              "Lien d'invitation invalide ou expiré. Demandez un nouvel email à DreamEffect."
            );
            return;
          }
          succeed();
          return;
        }

        // 2) token_hash (lien app / template email custom)
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            type: type as
              | "invite"
              | "signup"
              | "email"
              | "recovery"
              | "magiclink"
              | "email_change",
            token_hash: tokenHash,
          });
          if (error) {
            fail(
              "Lien d'invitation invalide ou expiré. Demandez un nouvel email à DreamEffect."
            );
            return;
          }
          succeed();
          return;
        }

        // 3) Flux implicite invitation : #access_token=…&refresh_token=…
        // Obligatoire : @supabase/ssr force PKCE et refuse detectSessionInUrl
        // sur ce type d'URL (« Not a valid PKCE flow url »).
        const tokens = parseImplicitHashTokens();
        if (tokens) {
          const { error } = await supabase.auth.setSession(tokens);
          if (error) {
            fail(
              "Lien d'invitation invalide ou expiré. Demandez un nouvel email à DreamEffect."
            );
            return;
          }
          succeed();
          return;
        }

        fail(
          "Impossible de valider l'email. Réessayez ou contactez DreamEffect."
        );
      } catch (err) {
        const detail =
          err instanceof Error
            ? err.message
            : "Impossible de valider l'email. Réessayez ou contactez DreamEffect.";
        fail(detail);
      }
    }

    void exchange();
  }, [searchParams]);

  return (
    <div className="de-login-card">
      <p className="de-muted text-center text-sm">{message}</p>
    </div>
  );
}
