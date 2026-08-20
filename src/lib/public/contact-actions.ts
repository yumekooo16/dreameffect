"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/lib/supabase/admin";

export type ContactLeadInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  topic: string;
  topicLabel: string;
  message: string;
  gdprConsent: boolean;
};

export type ContactLeadResult =
  | { ok: true }
  | { ok: false; error: string };

async function notifyAdminsAboutContactLead(
  supabase: SupabaseClient,
  payload: {
    submissionId: string;
    topicLabel: string;
    contactLine: string;
    message: string;
  }
) {
  const { data: admins, error: adminsError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (adminsError) {
    console.error("[contact] admin lookup failed:", adminsError.message);
    return;
  }

  if (!admins?.length) {
    console.error("[contact] no admin profile found for notifications");
    return;
  }

  for (const admin of admins) {
    const { error } = await supabase.from("notifications").insert({
      profile_id: admin.id,
      type: "contact_lead",
      title: `Nouvelle demande — ${payload.topicLabel}`,
      message: `${payload.contactLine}\n\n${payload.message}`,
      is_read: false,
      priority: "normal",
      related_id: payload.submissionId,
      created_by: admin.id,
    });

    if (error) {
      console.error(
        `[contact] notification insert failed for admin ${admin.id}:`,
        error.message
      );
    }
  }
}

export async function submitContactLead(
  input: ContactLeadInput
): Promise<ContactLeadResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();
  const topic = input.topic.trim();
  const topicLabel = input.topicLabel.trim();
  const message = input.message.trim();

  if (!firstName || !lastName) {
    return { ok: false, error: "Nom et prénom requis." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Email invalide." };
  }

  if (phone && !/^[\d\s+().-]{8,}$/.test(phone)) {
    return { ok: false, error: "Numéro de téléphone invalide." };
  }

  if (!topic || !topicLabel) {
    return { ok: false, error: "Objet de demande invalide." };
  }

  if (!message || message.length < 20) {
    return { ok: false, error: "Message trop court (minimum 20 caractères)." };
  }

  if (!input.gdprConsent) {
    return {
      ok: false,
      error: "Veuillez accepter le traitement de vos données personnelles.",
    };
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        topic,
        message,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[contact] insert failed:", error.message);
      return {
        ok: false,
        error: "Impossible d'enregistrer votre demande. Réessayez dans un instant.",
      };
    }

    const fullName = `${firstName} ${lastName}`;
    const contactLine = phone
      ? `${fullName} — ${email} — ${phone}`
      : `${fullName} — ${email}`;

    await notifyAdminsAboutContactLead(supabase, {
      submissionId: data.id,
      topicLabel,
      contactLine,
      message,
    });

    return { ok: true };
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return {
      ok: false,
      error: "Une erreur est survenue. Réessayez dans un instant.",
    };
  }
}
