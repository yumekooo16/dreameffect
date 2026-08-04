"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  REMEMBER_ME_COOKIE,
  REMEMBER_ME_MAX_AGE,
  REMEMBER_EMAIL_KEY,
} from "@/src/lib/supabase/session";
import { readConsentFromDocument } from "@/src/lib/gdpr/cookies";

function setRememberMePreference(enabled: boolean) {
  if (enabled) {
    document.cookie = `${REMEMBER_ME_COOKIE}=1; path=/; max-age=${REMEMBER_ME_MAX_AGE}; SameSite=Lax`;
  } else {
    document.cookie = `${REMEMBER_ME_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    const consent = readConsentFromDocument();
    if (!consent?.preferences) return;

    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    const hasRememberCookie = document.cookie.includes(`${REMEMBER_ME_COOKIE}=1`);
    if (savedEmail) setEmail(savedEmail);
    setRememberMe(hasRememberCookie || Boolean(savedEmail));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const consent = readConsentFromDocument();
    const canRemember = rememberMe && consent?.preferences === true;

    setRememberMePreference(canRemember);

    if (canRemember) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    router.push("/redirect");
    router.refresh();
  }

  return (
    <main className="de-page flex min-h-screen items-center justify-center px-4 py-10">
      <form
        onSubmit={handleLogin}
        className="de-login-card w-full max-w-xl space-y-8"
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <Image
            src="/logo.png"
            alt="DreΛm Effect"
            width={100}
            height={100}
            className="rounded-xl object-contain"
            priority
          />
          <div>
            <h1 className="de-display text-3xl sm:text-4xl tracking-tight">
              DreΛm Effect
            </h1>
            <p className="mt-2 text-base de-muted">Connexion DreamEffect</p>
          </div>
        </div>

        <div className="space-y-4">
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

          <label className="flex cursor-pointer items-center gap-2 text-sm de-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--blue-border)]"
            />
            Rester connecté
          </label>
        </div>

        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="de-btn de-btn-primary de-btn-lg w-full"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
