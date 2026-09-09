"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/src/lib/supabase/client";
import Notifications from "@/src/components/notifications";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  priority?: string | null;
  created_at: string;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(async (uid?: string | null) => {
    const supabase = createClient();
    const profileId =
      uid ??
      (await supabase.auth.getUser()).data.user?.id ??
      null;
    if (!profileId) return;

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profileId)
      .eq("is_read", false);

    setUnreadCount(count ?? 0);
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, message, is_read, priority, created_at")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await refreshUnreadCount(user.id);
    }

    void init();
  }, [refreshUnreadCount]);

  // Temps réel : nouvelle notif → badge + liste
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-bell-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `profile_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Notification;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === row.id)) return prev;
            return [row, ...prev].slice(0, 20);
          });
          setUnreadCount((count) => count + (row.is_read ? 0 : 1));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);

  // Polling de secours (onglet ouvert sans realtime)
  useEffect(() => {
    if (!userId) return;
    const timer = window.setInterval(() => {
      void refreshUnreadCount(userId);
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [userId, refreshUnreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotifications();
    }
  }

  async function handleMarkAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("profile_id", user.id);
  }

  async function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", user.id)
      .eq("is_read", false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ""}`}
        aria-expanded={open}
        className="de-notifications-trigger relative flex h-10 w-10 items-center justify-center"
      >
        <Bell size={18} strokeWidth={1.75} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--blue)] px-1 text-[10px] font-medium text-[var(--bg)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="de-notifications-panel">
          <div className="flex items-center justify-between border-b border-[var(--blue-border)] px-4 py-3">
            <p className="de-display text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-[var(--blue)] transition hover:text-foreground"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto p-3">
            {loading && notifications.length === 0 ? (
              <p className="de-empty py-4 text-center">Chargement...</p>
            ) : (
              <Notifications
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                compact
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
