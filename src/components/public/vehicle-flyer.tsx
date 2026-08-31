import Image from "next/image";
import Link from "next/link";
import {
  AtSign,
  FileText,
  Mail,
  MessageCircle,
} from "lucide-react";
import type { BMW_SERIE2_FLYER } from "@/src/lib/public/flyers/bmw-serie-2";

export type VehicleFlyerData = typeof BMW_SERIE2_FLYER;

function ContactIcon({ kind }: { kind: VehicleFlyerData["contacts"][number]["kind"] }) {
  if (kind === "email") return <Mail size={14} strokeWidth={1.75} aria-hidden />;
  if (kind === "instagram") return <AtSign size={14} strokeWidth={1.75} aria-hidden />;
  if (kind === "whatsapp") return <MessageCircle size={14} strokeWidth={1.75} aria-hidden />;
  return (
    <span className="de-flyer-snap-icon" aria-hidden>
      S
    </span>
  );
}

export default function VehicleFlyer({ data }: { data: VehicleFlyerData }) {
  return (
    <article className="de-flyer" aria-label={`Flyer ${data.brandLine} ${data.modelLine}`}>
      <header className="de-flyer-top">
        <div className="de-flyer-brand">
          <Image
            src="/logo-de.png"
            alt=""
            width={52}
            height={52}
            className="de-flyer-logo"
            priority
            unoptimized
          />
          <div>
            <p className="de-flyer-wordmark">DreΛm Effect</p>
            <p className="de-flyer-tagline">{data.tagline}</p>
          </div>
        </div>

        <ul className="de-flyer-contacts">
          {data.contacts.map((item) => (
            <li key={item.kind}>
              <Link href={item.href} target="_blank" rel="noopener noreferrer">
                <ContactIcon kind={item.kind} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </header>

      <div className="de-flyer-title-block">
        <div className="de-flyer-title-rule" aria-hidden />
        <div>
          <h1 className="de-flyer-brand-line">{data.brandLine}</h1>
          <p className="de-flyer-model-line">{data.modelLine}</p>
        </div>
      </div>

      <div className="de-flyer-hero">
        <Image
          src={data.heroImage}
          alt={`${data.brandLine} ${data.modelLine}`}
          fill
          priority
          sizes="(max-width: 600px) 100vw, 480px"
          className="de-flyer-hero-img"
        />
        <div className="de-flyer-hero-overlay" aria-hidden />
      </div>

      <div className="de-flyer-body">
        <section className="de-flyer-specs" aria-label="Caractéristiques">
          <div className="de-flyer-specs-rule" aria-hidden />
          <dl>
            {data.specs.map((row) => (
              <div key={row.label} className="de-flyer-spec-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="de-flyer-pricing" aria-label="Tarifs">
          <h2>Tarifs</h2>
          <ul>
            {data.pricing.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </li>
            ))}
          </ul>
          <p className="de-flyer-deposit">
            Caution : <strong>{data.deposit}</strong>
          </p>
        </section>
      </div>

      <footer className="de-flyer-footer">
        <FileText size={16} strokeWidth={1.75} aria-hidden />
        <p>{data.requirements}</p>
      </footer>

      <p className="de-flyer-qr-hint">
        Réservez sur{" "}
        <Link href={data.vehicleUrl} className="de-flyer-link">
          dreameffect.fr
        </Link>
      </p>
    </article>
  );
}
