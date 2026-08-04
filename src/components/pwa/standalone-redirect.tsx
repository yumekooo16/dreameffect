"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pwaConfig } from "@/src/lib/pwa/config";
import { isPublicAppPath, isStandaloneMode } from "@/src/lib/pwa/standalone";

/**
 * En mode PWA (standalone), redirige le site vitrine vers l'entrée applicative.
 * iOS ignore parfois start_url du manifest et ouvre la page d'installation.
 */
export function StandaloneRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isStandaloneMode()) return;
    if (!isPublicAppPath(pathname)) return;

    router.replace(pwaConfig.appEntryPath);
  }, [pathname, router]);

  return null;
}
