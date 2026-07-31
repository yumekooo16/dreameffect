/**
 * Architecture push notifications — préparée pour intégration future.
 * Ne pas activer tant que les clés VAPID et le backend ne sont pas configurés.
 */

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
};

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

export function isVapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY);
}

/** Convertit une clé VAPID base64url en Uint8Array pour PushManager.subscribe */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Récupère l'enregistrement du service worker prêt pour les push.
 * À appeler depuis un composant client une fois les notifications activées.
 */
export async function getPushReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  return navigator.serviceWorker.ready;
}

/**
 * Abonnement push — stub pour intégration future.
 * Brancher ici l'appel serveur (Server Action / API) pour persister la subscription.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported() || !isVapidConfigured()) return null;

  const registration = await getPushReadyRegistration();
  if (!registration) return null;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      VAPID_PUBLIC_KEY!
    ) as BufferSource,
  });
}
