"use client";

import { useEffect } from "react";
import { pwaConfig } from "@/src/lib/pwa/config";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register(pwaConfig.serviceWorkerPath, {
        scope: pwaConfig.scope,
        updateViaCache: "none",
      })
      .catch((error) => {
        console.error("[PWA] Service worker registration failed:", error);
      });
  }, []);

  return null;
}
