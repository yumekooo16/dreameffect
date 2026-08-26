"use client";

import { useEffect, useState, startTransition } from "react";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import {
  REMEMBER_ME_COOKIE,
  REMEMBER_ME_MAX_AGE,
  REMEMBER_EMAIL_KEY,
} from "@/src/lib/supabase/session";

function setRememberMePreference(enabled: boolean) {
  if (enabled) {
    document.cookie = `${REMEMBER_ME_COOKIE}=1; path=/; max-age=${REMEMBER_ME_MAX_AGE}; SameSite=Lax; Secure`;
  } else {
    document.cookie = `${REMEMBER_ME_COOKIE}=; path=/; max-age=0; SameSite=Lax; Secure`;
  }
}

function translateAuthError(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("email not confirmed") ||
    lower.includes("email_not_confirmed")
  ) {
    return "Email non vérifié. Ouvrez le lien reçu par mail pour activer votre compte, ou demandez une nouvelle invitation à DreamEffect.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  return message;
}

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fromUrl = searchParams.get("error");
    if (fromUrl) {
      startTransition(() => setError(fromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.replace("/redirect");
    }

    checkSession();
  }, [router, supabase]);

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    const hasRememberCookie = document.cookie.includes(`${REMEMBER_ME_COOKIE}=1`);
    startTransition(() => {
      if (savedEmail) setEmail(savedEmail);
      setRememberMe(hasRememberCookie || Boolean(savedEmail));
    });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setLoading(false);
      return;
    }

    setRememberMePreference(rememberMe);

    if (rememberMe) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    router.push("/redirect");
    router.refresh();
  }

  return (
    <form onSubmit={handleLogin} className="de-login-card">
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
          <h1 className="de-display de-login-title de-wordmark">DreΛm Effect</h1>
          <p className="de-login-subtitle">Espace propriétaire et administration</p>
        </div>
      </div>

      <div className="de-login-fields">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="de-input de-input-lg"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="de-input de-input-lg"
        />

        <label className="de-login-remember">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="de-checkbox"
          />
          Rester connecté
        </label>
      </div>

      {error && <p className="de-login-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="de-btn de-btn-primary de-btn-lg de-login-submit"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
