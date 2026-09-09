"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing, BellOff } from "lucide-react";
import {
  getNotificationPermission,
  isPushSupported,
  isVapidConfigured,
  serializationPushSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/src/lib/pwa/push";
import {
  getPushSubscriptionStatus,
  removePushSubscription,
  savePushSubscription,
} from "@/src/lib/pwa/push-actions";

type Props = {
  /** Mode compact pour le header (icône seule) */
  compact?: boolean;
};

export default function PushEnableButton({ compact = true }: Props) {
  const [pending, startTransition] = useTransition();
  const [supported, setSupported] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    setConfigured(isVapidConfigured());
    setPermission(getNotificationPermission());

    startTransition(async () => {
      const status = await getPushSubscriptionStatus();
      setConfigured(status.configured && isVapidConfigured());
      setSubscribed(status.subscribed);
      setReady(true);
    });
  }, []);

  function enable() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const subscription = await subscribeToPush();
        if (!subscription) {
          setError(
            getNotificationPermission() === "denied"
              ? "Notifications refusées. Réactivez-les dans les réglages du navigateur / iPhone."
              : "Impossible d'activer les notifications sur cet appareil."
          );
          setPermission(getNotificationPermission());
          return;
        }

        const serialized = serializationPushSubscription(subscription);
        const result = await savePushSubscription(serialized);
        if (!result.success) {
          setError(result.error ?? "Enregistrement impossible");
          return;
        }

        setSubscribed(true);
        setPermission("granted");
        setMessage("Notifications téléphone activées.");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Activation impossible. Réessayez."
        );
      }
    });
  }

  function disable() {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          await removePushSubscription(existing.endpoint);
          await unsubscribeFromPush();
        }
        setSubscribed(false);
        setMessage("Notifications téléphone désactivées.");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Désactivation impossible"
        );
      }
    });
  }

  if (!ready) return null;

  if (!supported || !configured) {
    if (compact) return null;
    return (
      <p className="text-xs de-muted">
        {!supported
          ? "Notifications push non supportées sur ce navigateur."
          : "Notifications push : clés VAPID manquantes (config serveur)."}
      </p>
    );
  }

  const label = subscribed
    ? "Désactiver les notifications téléphone"
    : permission === "denied"
      ? "Notifications bloquées — ouvrez les réglages"
      : "Activer les notifications sur cet appareil";

  return (
    <div className={`de-push-enable${compact ? " de-push-enable--compact" : ""}`}>
      <button
        type="button"
        className={`de-btn de-push-enable-btn ${
          subscribed ? "de-btn-ghost" : "de-btn-primary"
        }`}
        disabled={pending || permission === "denied"}
        onClick={subscribed ? disable : enable}
        title={label}
        aria-label={label}
      >
        {subscribed ? (
          <BellOff className="size-4" aria-hidden />
        ) : (
          <BellRing className="size-4" aria-hidden />
        )}
        {!compact && (
          <span>{subscribed ? "Désactiver notifs" : "Activer notifs téléphone"}</span>
        )}
      </button>
      {(message || error || permission === "denied") && (
        <div className="de-push-enable-feedback" role="status">
          {message && <p className="de-push-enable-msg">{message}</p>}
          {error && <p className="de-push-enable-error">{error}</p>}
          {permission === "denied" && !error && (
            <p className="de-push-enable-error">
              Autorisez DreamEffect dans les réglages du navigateur / iPhone.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
