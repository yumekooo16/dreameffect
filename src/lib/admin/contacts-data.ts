import { createClient } from "@/src/lib/supabase/server";

export const CONTACT_TOPIC_LABELS: Record<string, string> = {
  location: "Louer un véhicule",
  owner: "Confier mon véhicule",
  other: "Autre demande",
};

export type ContactSubmission = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  created_at: string;
};

export function formatContactTopic(topic: string) {
  return CONTACT_TOPIC_LABELS[topic] ?? topic;
}

export async function fetchContactSubmissions(limit = 50) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_submissions")
    .select(
      "id, first_name, last_name, email, phone, topic, message, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[contacts] fetch failed:", error.message);
    return [] as ContactSubmission[];
  }

  return (data ?? []) as ContactSubmission[];
}

export async function fetchRecentContactSubmissions(limit = 5) {
  return fetchContactSubmissions(limit);
}
