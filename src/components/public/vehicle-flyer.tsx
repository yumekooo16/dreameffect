import Image from "next/image";
import { FileText } from "lucide-react";
import { FlyerContactIcon } from "@/src/components/public/flyer-social-icons";
import type { BMW_SERIE2_FLYER } from "@/src/lib/public/flyers/bmw-serie-2";

export type VehicleFlyerData = typeof BMW_SERIE2_FLYER;

export default function VehicleFlyer({ data }: { data: VehicleFlyerData }) {
  return (
    <article className="de-flyer" aria-label={`Flyer ${data.brandLine} ${data.modelLine}`}>
      <div className="de-flyer-bg" aria-hidden>
        <Image
          src={data.heroImage}
          alt=""
          fill
          priority
          sizes="210mm"
          className="de-flyer-bg-img"
        />
        <div className="de-flyer-bg-shade" />
      </div>

      <div className="de-flyer-sheet">
        <header className="de-flyer-head">
          <div className="de-flyer-brand">
            <Image
              src="/logo-de.png"
              alt=""
              width={40}
              height={40}
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
                <FlyerContactIcon kind={item.kind} className="de-flyer-app-icon" />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </header>

        <div className="de-flyer-title-wrap">
          <div className="de-flyer-title-rule" aria-hidden />
          <div>
            <h1 className="de-flyer-brand-line">{data.brandLine}</h1>
            <p className="de-flyer-model-line">{data.modelLine}</p>
          </div>
        </div>

        <div className="de-flyer-spacer" aria-hidden />

        <div className="de-flyer-bottom">
          <section className="de-flyer-specs" aria-label="Caractéristiques">
            <div className="de-flyer-specs-rule" aria-hidden />
            <ul>
              {data.specs.map((row) => (
                <li key={row.label}>
                  <span className="de-flyer-spec-label">{row.label} :</span>{" "}
                  <span className="de-flyer-spec-value">{row.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="de-flyer-pricing" aria-label="Tarifs">
            <h2>TARIFS :</h2>
            <ul>
              {data.pricing.map((row) => (
                <li key={row.label}>
                  <span>{row.label}:</span>
                  <strong>{row.value}</strong>
                </li>
              ))}
              <li className="de-flyer-deposit-row">
                <span>Caution :</span>
                <strong>{data.deposit}</strong>
              </li>
            </ul>
          </section>
        </div>

        <footer className="de-flyer-foot">
          <FileText size={14} strokeWidth={1.75} aria-hidden />
          <p>{data.requirements}</p>
        </footer>
      </div>
    </article>
  );
}
