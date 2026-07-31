import {
  getDocumentStatus,
  type DocumentType,
} from "@/src/lib/documents/type";

export type DocumentRecord = {
  id: string;
  vehicle_id: string;
  owner_id?: string | null;
  type: DocumentType | string;
  name: string;
  expiration_date?: string | null;
  is_valid?: boolean | null;
  created_at?: string | null;
};

export type DocumentListItem = DocumentRecord & {
  vehicle_label: string;
  vehicle_image_url?: string | null;
  owner_id: string;
  owner_name: string;
};

export type DocumentDetail = DocumentListItem & {
  vehicle: {
    id: string;
    brand: string;
    model: string;
    image_url?: string | null;
    owner_id: string;
  };
  owner: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
};

export type DocumentStats = {
  total: number;
  valid: number;
  expired: number;
  expiringSoon: number;
};

export type DocumentFormData = {
  vehicle_id: string;
  type: DocumentType;
  name: string;
  expiration_date: string;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const EXPIRING_SOON_DAYS = 30;

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function computeDocumentStats(
  items: DocumentListItem[]
): DocumentStats {
  let valid = 0;
  let expired = 0;
  let expiringSoon = 0;

  for (const item of items) {
    const status = getDocumentStatus(item);
    if (status === "expired") expired += 1;
    else if (status === "expiring_soon") expiringSoon += 1;
    else if (status === "valid" || status === "no_expiration") valid += 1;
  }

  return {
    total: items.length,
    valid,
    expired,
    expiringSoon,
  };
}

export function splitExpiringDocuments(items: DocumentListItem[]) {
  const expired: DocumentListItem[] = [];
  const expiringSoon: DocumentListItem[] = [];

  for (const item of items) {
    const status = getDocumentStatus(item);
    if (status === "expired") expired.push(item);
    else if (status === "expiring_soon") expiringSoon.push(item);
  }

  expired.sort((a, b) =>
    (a.expiration_date ?? "").localeCompare(b.expiration_date ?? "")
  );
  expiringSoon.sort((a, b) =>
    (a.expiration_date ?? "").localeCompare(b.expiration_date ?? "")
  );

  return { expired, expiringSoon };
}

export function daysUntilExpiration(expirationDate?: string | null) {
  if (!expirationDate) return null;
  const today = startOfDay(new Date());
  const expiration = startOfDay(new Date(expirationDate));
  return Math.ceil((expiration.getTime() - today.getTime()) / MS_PER_DAY);
}

export function isWithinExpiringWindow(expirationDate?: string | null) {
  const days = daysUntilExpiration(expirationDate);
  if (days == null) return false;
  return days <= EXPIRING_SOON_DAYS;
}
