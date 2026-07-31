import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { OfflineRetryButton } from "@/src/components/pwa/offline-retry-button";
import { pwaConfig } from "@/src/lib/pwa/config";

export const metadata: Metadata = {
  title: "Hors connexion",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="de-page flex min-h-screen items-center justify-center px-4 py-10">
      <div className="de-login-card w-full max-w-md space-y-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <Image
            src={pwaConfig.icons.sizes.apple}
            alt={pwaConfig.name}
            width={80}
            height={80}
            className="rounded-xl object-contain"
            priority
          />
          <div>
            <h1 className="de-display text-2xl sm:text-3xl tracking-tight">
              Vous êtes hors connexion
            </h1>
            <p className="mt-3 text-base de-muted leading-relaxed">
              Vérifiez votre connexion internet pour accéder à{" "}
              {pwaConfig.name}. Les données en temps réel nécessitent une
              connexion active.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <OfflineRetryButton />
          <Link href="/login" className="de-btn de-btn-ghost w-full de-btn-lg">
            Retour à la connexion
          </Link>
        </div>

        <p className="text-xs de-muted">
          Les ressources essentielles restent disponibles en cache local.
        </p>
      </div>
    </main>
  );
}
