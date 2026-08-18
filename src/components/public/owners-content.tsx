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
        className="de-section de-section-alt de-owners-contact-section"
        aria-labelledby="owners-contact-title"
      >
        <div className="de-public-container">
          <div className="de-owners-contact-layout">
            <div>
              <p className="de-section-eyebrow">Contact</p>
              <h2 id="owners-contact-title" className="de-display de-section-title">
                Parlons de votre véhicule
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed de-muted sm:text-base">
                Indiquez-nous votre modèle. Nous revenons vers vous pour
                étudier les conditions ensemble.
              </p>
              <ul className="de-check-list de-owners-contact-points">
                <li>Réponse sous 24 h en moyenne</li>
                <li>Échange sur votre véhicule</li>
                <li>Aucun engagement sans votre accord</li>
              </ul>
            </div>

            <div className="de-contact-form-block">
              <OwnersContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
