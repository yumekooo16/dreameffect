import { Suspense } from "react";
import LoginForm from "@/src/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="de-page de-login-page">
      <Suspense
        fallback={
          <div className="de-login-card">
            <p className="de-muted text-center text-sm">Chargement…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
