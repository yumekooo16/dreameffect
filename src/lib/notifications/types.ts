export type NotificationType =
  | "reservation_created"
  | "reservation_modified"
  | "reservation_status"
  | "reservation_cancelled"
  | "rental_reminder_start"
  | "rental_reminder_end"
  | "maintenance_due"
  | "maintenance_completed"
  | "document_expiring";

export type NotificationPriority = "normal" | "medium" | "high";

export type NotificationRecord = {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  is_read: boolean;
  priority?: NotificationPriority | string | null;
  created_at: string;
};

export type CreateNotificationInput = {
  profile_id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  related_id: string;
  created_by: string;
  priority?: NotificationPriority;
};
