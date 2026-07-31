"use client";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  priority?: string | null;
  created_at: string;
};

function priorityLabel(priority?: string | null) {
  if (priority === "high") return "Prioritaire";
  if (priority === "medium") return "Important";
  return null;
}

export default function Notifications({
  notifications,
  onMarkAsRead,
  compact = false,
}: {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
  compact?: boolean;
}) {
  if (notifications.length === 0) {
    return <p className="de-empty">Aucune notification</p>;
  }

  return (
    <div className="de-list">
      {notifications.map((notification) => {
        const priority = priorityLabel(notification.priority);
        const Wrapper = onMarkAsRead ? "button" : "div";

        return (
          <Wrapper
            key={notification.id}
            type={onMarkAsRead ? "button" : undefined}
            onClick={
              onMarkAsRead && !notification.is_read
                ? () => onMarkAsRead(notification.id)
                : undefined
            }
            className={`de-list-item w-full text-left ${
              !notification.is_read ? "de-list-item--unread" : ""
            } ${onMarkAsRead && !notification.is_read ? "cursor-pointer" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-medium">{notification.title}</h3>
                  {priority && (
                    <span className="de-badge de-badge--pending">{priority}</span>
                  )}
                </div>
                <p className={`mt-1 text-sm de-muted ${compact ? "line-clamp-2" : ""}`}>
                  {notification.message}
                </p>
                <p className="mt-2 text-xs de-muted">
                  {new Date(notification.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {!notification.is_read && (
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--blue)]"
                  aria-label="Non lue"
                />
              )}
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}
