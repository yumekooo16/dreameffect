import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import SetPasswordForm from "@/src/components/auth/set-password-form";

export default async function DefinePasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "Ouvrez d'abord le lien d'invitation reçu par email pour choisir votre mot de passe."
        )
    );
  }

  return (
    <main className="de-page de-login-page">
      <SetPasswordForm email={user.email} />
    </main>
  );
}
