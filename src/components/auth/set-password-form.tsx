"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function SetPasswordForm({ email }: { email?: string | null }) {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.replace("/espace-proprietaire");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="de-login-card">
      <div className="de-login-header">
        <Image
          src="/logo-de.png"
          alt="DreΛm Effect"
          width={88}
          height={88}
          className="de-login-logo"
          priority
        />
        <div>
          <h1 className="de-display de-login-title de-wordmark">
            DreΛm Effect
          </h1>
          <p className="de-login-subtitle">
            Choisissez votre mot de passe pour accéder à l&apos;espace
            propriétaire
          </p>
        </div>
      </div>

      {email && (
        <p className="text-center text-sm de-muted">
          Compte : <strong>{email}</strong>
        </p>
      )}

      <div className="de-login-fields">
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
          className="de-input de-input-lg"
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
          className="de-input de-input-lg"
        />
      </div>

      {error && <p className="de-login-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="de-btn de-btn-primary de-btn-lg de-login-submit"
      >
        {loading ? "Enregistrement…" : "Enregistrer et accéder"}
      </button>
    </form>
  );
}
