import OwnersContactForm from "@/src/components/public/owners-contact-form";
import OwnersFaq from "@/src/components/public/owners-faq";
import OwnersHowItWorks from "@/src/components/public/owners-how-it-works";
import OwnersServices from "@/src/components/public/owners-services";
import OwnersTrust from "@/src/components/public/owners-trust";

export default function OwnersContent() {
  return (
    <>
      <OwnersHowItWorks />
      <OwnersServices />
      <OwnersTrust />
      <OwnersFaq />

      <section
        id="proprietaire-contact"
        className="de-keys-section de-keys-section--paper"
        aria-labelledby="owners-contact-title"
      >
        <div className="de-public-container de-keys-contact-grid">
          <div>
            <p className="de-keys-eyebrow">Contact</p>
            <h2 id="owners-contact-title" className="de-keys-h2">
              Confiez votre véhicule
            </h2>
            <p className="de-keys-lede">
              Remplissez le formulaire. Nous vous recontactons rapidement pour
              étudier votre projet ensemble.
            </p>
            <ul className="de-check-list de-owners-contact-points">
              <li>Réponse sous 24 h en moyenne</li>
              <li>Échange personnalisé sur votre véhicule</li>
              <li>Aucun engagement sans votre accord</li>
            </ul>
          </div>
          <div>
            <OwnersContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
