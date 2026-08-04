/** Routes du site vitrine — hors espace admin / propriétaire. */
export function isPublicAppPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/contact" || pathname === "/proprietaires") return true;
  if (pathname === "/vehicules" || pathname.startsWith("/vehicules/")) {
    return true;
  }
  return false;
}

/** PWA installée (icône écran d'accueil), pas un onglet navigateur. */
export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    navigatorWithStandalone.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches
  );
}
