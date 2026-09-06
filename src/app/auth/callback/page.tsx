import { Suspense } from "react";
import AuthCallbackClient from "@/src/components/auth/auth-callback-client";

/**
 * Callback Auth (invitation / confirmation / recovery).
 * Page client : les invitations Supabase n'utilisent pas PKCE et
 * renvoient les tokens dans le hash (#access_token=…), invisible côté serveur.
 *
 * Dashboard Supabase → Authentication → URL Configuration :
 * Redirect URLs : https://www.dreameffect.fr/auth/callback
 */
export default function AuthCallbackPage() {
  return (
    <main className="de-page de-login-page">
      <Suspense
        fallback={
          <div className="de-login-card">
            <p className="de-muted text-center text-sm">
              Validation de votre invitation…
            </p>
          </div>
        }
      >
        <AuthCallbackClient />
      </Suspense>
    </main>
  );
}
