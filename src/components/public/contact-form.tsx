"use client";

import { useState } from "react";
import { Send, CheckCircle2, Loader2 } from "lucide-react";
import GdprConsentField from "@/src/components/gdpr/gdpr-consent-field";
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from "@/src/lib/constants";
import { submitContactLead } from "@/src/lib/public/contact-actions";

const TOPICS = [
  { value: "location", label: "Louer un véhicule" },
  { value: "owner", label: "Confier mon véhicule" },
  { value: "other", label: "Autre demande" },
] as const;

type Topic = (typeof TOPICS)[number]["value"];

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  topic: Topic;
  message: string;
  gdprConsent: boolean;
};

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  topic: "location",
  message: "",
  gdprConsent: false,
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function topicLabel(topic: Topic) {
  return TOPICS.find((t) => t.value === topic)?.label ?? topic;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "Prénom requis";
  if (!form.lastName.trim()) errors.lastName = "Nom requis";

  if (!form.email.trim()) {
    errors.email = "Email requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email invalide";
  }

  if (form.phone.trim() && !/^[\d\s+().-]{8,}$/.test(form.phone.trim())) {
    errors.phone = "Numéro invalide";
  }

  if (!form.message.trim()) {
    errors.message = "Message requis";
  } else if (form.message.trim().length < 20) {
    errors.message = "Minimum 20 caractères";
  }

  if (!form.gdprConsent) {
    errors.gdprConsent = "Veuillez accepter le traitement de vos données";
  }

  return errors;
}

function buildWhatsAppMessage(form: FormState) {
  return [
    "Bonjour DreamEffect,",
    "",
    `Demande : ${topicLabel(form.topic)}`,
    "",
    form.message.trim(),
  ].join("\n");
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);
    setSubmitError(null);

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);

    const result = await submitContactLead({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      topic: form.topic,
      topicLabel: topicLabel(form.topic),
      message: form.message,
      gdprConsent: form.gdprConsent,
    });

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, buildWhatsAppMessage(form));
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
    setForm(INITIAL);
    setErrors({});
  }

  if (sent) {
    return (
      <div className="de-contact-form-success">
        <CheckCircle2 size={28} strokeWidth={1.75} className="text-[var(--blue-soft)]" />
        <h2 className="de-display mt-4 text-xl">
          Message prêt à envoyer
        </h2>
        <p className="mt-2 text-sm leading-relaxed de-muted">
          Vos coordonnées ont été enregistrées. WhatsApp s&apos;est ouvert avec
          votre demande — il reste à appuyer sur Envoyer.
        </p>
        <button
          type="button"
          className="de-btn de-btn-primary mt-6"
          onClick={() => setSent(false)}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form className="de-contact-form" onSubmit={handleSubmit} noValidate>
      <div className="de-form-row">
        <div className="de-form-field">
          <label htmlFor="contact-firstName" className="de-label">
            Prénom
          </label>
          <input
            id="contact-firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            className={`de-input ${errors.firstName ? "de-input--error" : ""}`}
            placeholder="Jean"
          />
          {errors.firstName && (
            <p className="de-form-error">{errors.firstName}</p>
          )}
        </div>

        <div className="de-form-field">
          <label htmlFor="contact-lastName" className="de-label">
            Nom
          </label>
          <input
            id="contact-lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            className={`de-input ${errors.lastName ? "de-input--error" : ""}`}
            placeholder="Dupont"
          />
          {errors.lastName && (
            <p className="de-form-error">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="de-form-row">
        <div className="de-form-field">
          <label htmlFor="contact-email" className="de-label">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={`de-input ${errors.email ? "de-input--error" : ""}`}
            placeholder="jean.dupont@email.com"
          />
          {errors.email && <p className="de-form-error">{errors.email}</p>}
        </div>

        <div className="de-form-field">
          <label htmlFor="contact-phone" className="de-label">
            Téléphone <span className="de-form-optional">(facultatif)</span>
          </label>
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={`de-input ${errors.phone ? "de-input--error" : ""}`}
            placeholder="06 12 34 56 78"
          />
          {errors.phone && <p className="de-form-error">{errors.phone}</p>}
        </div>
      </div>

      <div className="de-form-field">
        <label htmlFor="contact-topic" className="de-label">
          Objet de votre demande
        </label>
        <select
          id="contact-topic"
          value={form.topic}
          onChange={(e) => updateField("topic", e.target.value as Topic)}
          className="de-input de-select"
        >
          {TOPICS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="de-form-field">
        <label htmlFor="contact-message" className="de-label">
          Message
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`de-input de-textarea ${errors.message ? "de-input--error" : ""}`}
          placeholder="Décrivez votre demande : dates souhaitées, modèle recherché, véhicule à confier…"
        />
        {errors.message && (
          <p className="de-form-error">{errors.message}</p>
        )}
      </div>

      <GdprConsentField
        id="contact-gdpr-consent"
        checked={form.gdprConsent}
        onChange={(checked) => updateField("gdprConsent", checked)}
        error={errors.gdprConsent}
      />

      <div className="de-form-actions">
        {submitError && (
          <p className="de-form-error mb-3" role="alert">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          className="de-btn de-btn-primary de-btn-lg"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 size={18} strokeWidth={2} className="animate-spin" />
          ) : (
            <Send size={18} strokeWidth={2} />
          )}
          {submitting ? "Enregistrement…" : "Envoyer ma demande"}
        </button>
        <p className="de-form-note">
          Vos coordonnées sont enregistrées côté DreamEffect. WhatsApp
          s&apos;ouvrira avec uniquement votre demande et votre message.
        </p>
      </div>
    </form>
  );
}
