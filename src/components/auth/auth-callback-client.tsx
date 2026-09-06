"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

const DEFAULT_NEXT = "/auth/definir-mot-de-passe";

function safeNextPath(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return DEFAULT_NEXT;
  }
  return raw;
}

function hashHasAccessToken() {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return false;
  return new URLSearchParams(hash).has("access_token");
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Validation de votre invitation…");
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const supabase = createClient();
    const next = safeNextPath(searchParams.get("next"));
    const code = searchParams.get("code");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    // Capturé tout de suite : le client peut retirer le hash après parsing
    const hadInviteHash = hashHasAccessToken();
    let settled = false;

    function succeed() {
      if (settled) return;
      settled = true;
      setMessage("Invitation acceptée — redirection…");
      if (typeof window !== "undefined" && window.location.hash) {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
      router.replace(next);
      router.refresh();
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
      router.replace(loginUrl.pathname + loginUrl.search);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session || settled) return;
      // Invite Supabase = flux implicite (hash) → SIGNED_IN
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") {
        succeed();
      }
    });

    async function exchange() {
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

      // Flux implicite (inviteUserByEmail) : tokens dans #access_token=…
      // detectSessionInUrl du browser client les consomme au démarrage.
      if (hadInviteHash) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          succeed();
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 2500));
        if (settled) return;

        const {
          data: { session: delayed },
        } = await supabase.auth.getSession();
        if (delayed) {
          succeed();
          return;
        }
      }

      fail(
        "Impossible de valider l'email. Réessayez ou contactez DreamEffect."
      );
    }

    void exchange();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="de-login-card">
      <p className="de-muted text-center text-sm">{message}</p>
    </div>
  );
}
