/**
 * Push notifications client — DreamEffect PWA
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
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function isVapidConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY?.trim());
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
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

export async function getPushReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  return navigator.serviceWorker.ready;
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported() || !isVapidConfigured()) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await getPushReadyRegistration();
  if (!registration) return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      VAPID_PUBLIC_KEY!
    ) as BufferSource,
  });
}

export async function unsubscribeFromPush(): Promise<boolean> {
  const registration = await getPushReadyRegistration();
  if (!registration) return false;
  const existing = await registration.pushManager.getSubscription();
  if (!existing) return true;
  return existing.unsubscribe();
}

export function serializationPushSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return {
    endpoint: json.endpoint ?? subscription.endpoint,
    keys: {
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
    },
  };
}
