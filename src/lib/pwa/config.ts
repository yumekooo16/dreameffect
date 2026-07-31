/**
 * Configuration PWA centralisée — DreamEffect
 * Modifier ici pour mettre à jour le manifest, les métadonnées et le service worker.
 */

export const pwaConfig = {
  name: "DreamEffect",
  shortName: "DreamEffect",
  description: "Plateforme de gestion de conciergerie automobile DreamEffect.",
  startUrl: "/",
  scope: "/",
  display: "standalone" as const,
  orientation: "portrait-primary" as const,
  lang: "fr",
  dir: "ltr" as const,
  categories: ["business", "productivity"] as const,

  /** Couleurs alignées sur le thème sombre premium (--bg / --blue) */
  themeColor: "#09090b",
  backgroundColor: "#09090b",

  /** Version du cache service worker — incrémenter à chaque déploiement majeur */
  cacheVersion: "dreameffect-v1",

  icons: {
    /** Fichier source — remplacer logo.png puis relancer `npm run generate-pwa-icons` */
    source: "/logo.png",
    basePath: "/icons",
    sizes: {
      "192": "/icons/icon-192x192.png",
      "512": "/icons/icon-512x512.png",
      apple: "/icons/apple-touch-icon.png",
      maskable: "/icons/maskable-icon-512x512.png",
      favicon32: "/icons/favicon-32x32.png",
    },
  },

  offlineUrl: "/offline",
  serviceWorkerPath: "/sw.js",
} as const;

export type PwaConfig = typeof pwaConfig;
