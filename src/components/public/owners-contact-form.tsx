"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import GdprConsentField from "@/src/components/gdpr/gdpr-consent-field";
import { buildWhatsAppUrl, WHATSAPP_NUMBER } from "@/src/lib/constants";

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicle: string;
  message: string;
  gdprConsent: boolean;
};

const INITIAL: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  vehicle: "",
  message: "",
  gdprConsent: false,
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.firstName.trim()) errors.firstName = "Prénom requis";
  if (!form.lastName.trim()) errors.lastName = "Nom requis";

  if (!form.phone.trim()) {
    errors.phone = "Téléphone requis";
  } else if (!/^[\d\s+().-]{8,}$/.test(form.phone.trim())) {
    errors.phone = "Numéro invalide";
  }

  if (!form.email.trim()) {
    errors.email = "Email requis";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email invalide";
  }

  if (!form.vehicle.trim()) errors.vehicle = "Véhicule requis";

  if (!form.message.trim()) {
    errors.message = "Message requis";
  } else if (form.message.trim().length < 10) {
    errors.message = "Minimum 10 caractères";
  }

  if (!form.gdprConsent) {
    errors.gdprConsent = "Veuillez accepter le traitement de vos données";
  }

  return errors;
}

function buildOwnerContactMessage(form: FormState) {
  return [
    "Bonjour DreamEffect,",
    "",
    "Je souhaite confier mon véhicule à votre gestion.",
    "",
    `Prénom : ${form.firstName.trim()}`,
    `Nom : ${form.lastName.trim()}`,
    `Téléphone : ${form.phone.trim()}`,
    `Email : ${form.email.trim()}`,
    `Véhicule : ${form.vehicle.trim()}`,
    "",
    form.message.trim(),
  ].join("\n");
}

export default function OwnersContactForm() {
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

    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, buildOwnerContactMessage(form));
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
    setForm(INITIAL);
    setErrors({});
  }

  if (sent) {
    return (
      <div className="de-contact-form-success">
        <CheckCircle2 size={28} strokeWidth={1.75} className="text-[var(--blue-soft)]" />
        <h3 className="de-display mt-4 text-xl">
          Demande prête à envoyer
        </h3>
        <p className="mt-2 text-sm leading-relaxed de-muted">
          WhatsApp s&apos;est ouvert avec votre message. Il reste à appuyer
          sur Envoyer pour nous joindre.
        </p>
        <button
          type="button"
          className="de-btn de-btn-primary mt-6"
          onClick={() => setSent(false)}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form className="de-contact-form" onSubmit={handleSubmit} noValidate>
      <div className="de-form-row">
        <div className="de-form-field">
          <label htmlFor="owner-firstName" className="de-label">
            Prénom
          </label>
          <input
            id="owner-firstName"
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
          <label htmlFor="owner-lastName" className="de-label">
            Nom
          </label>
          <input
            id="owner-lastName"
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
          <label htmlFor="owner-phone" className="de-label">
            Téléphone
          </label>
          <input
            id="owner-phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={`de-input ${errors.phone ? "de-input--error" : ""}`}
            placeholder="06 12 34 56 78"
          />
          {errors.phone && <p className="de-form-error">{errors.phone}</p>}
        </div>

        <div className="de-form-field">
          <label htmlFor="owner-email" className="de-label">
            Email
          </label>
          <input
            id="owner-email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={`de-input ${errors.email ? "de-input--error" : ""}`}
            placeholder="jean.dupont@email.com"
          />
          {errors.email && <p className="de-form-error">{errors.email}</p>}
        </div>
      </div>

      <div className="de-form-field">
        <label htmlFor="owner-vehicle" className="de-label">
          Véhicule
        </label>
        <input
          id="owner-vehicle"
          type="text"
          value={form.vehicle}
          onChange={(e) => updateField("vehicle", e.target.value)}
          className={`de-input ${errors.vehicle ? "de-input--error" : ""}`}
          placeholder="Ex. Porsche 911 Carrera S — 2022"
        />
        {errors.vehicle && <p className="de-form-error">{errors.vehicle}</p>}
      </div>

      <div className="de-form-field">
        <label htmlFor="owner-message" className="de-label">
          Message
        </label>
        <textarea
          id="owner-message"
          rows={5}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={`de-input de-textarea ${errors.message ? "de-input--error" : ""}`}
          placeholder="Parlez-nous de votre véhicule, de vos disponibilités ou de vos questions…"
        />
        {errors.message && (
          <p className="de-form-error">{errors.message}</p>
        )}
      </div>

      <GdprConsentField
        id="owner-gdpr-consent"
        checked={form.gdprConsent}
        onChange={(checked) => updateField("gdprConsent", checked)}
        error={errors.gdprConsent}
      />

      <div className="de-form-actions">
        <button type="submit" className="de-btn de-btn-primary de-btn-lg">
          <Send size={18} strokeWidth={2} />
          Envoyer ma demande via WhatsApp
        </button>
        <p className="de-form-note">
          Aucune donnée n&apos;est enregistrée — votre message s&apos;ouvre
          directement dans WhatsApp.
        </p>
      </div>
    </form>
  );
}
