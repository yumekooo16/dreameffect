"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from "@/src/lib/constants";

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
};

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  topic: "location",
  message: "",
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

  return errors;
}

function buildContactMessage(form: FormState) {
  const lines = [
    "Bonjour DreamEffect,",
    "",
    `Nom : ${form.firstName.trim()} ${form.lastName.trim()}`,
    `Email : ${form.email.trim()}`,
  ];

  if (form.phone.trim()) {
    lines.push(`Téléphone : ${form.phone.trim()}`);
  }

  lines.push(
    `Demande : ${topicLabel(form.topic)}`,
    "",
    form.message.trim(),
  );

  return lines.join("\n");
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(false);

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, buildContactMessage(form));
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
    setForm(INITIAL);
    setErrors({});
  }

  if (sent) {
    return (
      <div className="de-contact-form-success">
        <CheckCircle2 size={28} strokeWidth={1.75} className="text-[var(--blue-soft)]" />
        <h2 className="de-display mt-4 text-xl tracking-tight">
          Message prêt à envoyer
        </h2>
        <p className="mt-2 text-sm leading-relaxed de-muted">
          WhatsApp s&apos;est ouvert avec votre message. Il ne reste qu&apos;à
          appuyer sur Envoyer. Si la fenêtre ne s&apos;est pas ouverte,
          réessayez ci-dessous.
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

      <div className="de-form-actions">
        <button type="submit" className="de-btn de-btn-primary de-btn-lg">
          <Send size={18} strokeWidth={2} />
          Envoyer ma demande
        </button>
        <p className="de-form-note">
          Votre message sera envoyé via WhatsApp. Réponse habituelle sous 24 h.
        </p>
      </div>
    </form>
  );
}
