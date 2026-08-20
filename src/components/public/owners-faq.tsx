const FAQ_ITEMS = [
  {
    question: "Qui assure le véhicule ?",
    answer:
      "Les conditions d'assurance sont définies avec vous lors de la mise en location. Nous vous accompagnons pour vérifier que votre couverture est adaptée à l'activité de location, en toute transparence.",
  },
  {
    question: "Comment suis-je payé ?",
    answer:
      "Vos revenus sont calculés chaque mois à partir des locations effectuées. Vous recevez un récapitulatif clair et le reversement correspondant, consultable depuis votre espace propriétaire.",
  },
  {
    question: "Puis-je récupérer ma voiture ?",
    answer:
      "Oui. Vous restez propriétaire de votre véhicule. Les modalités de récupération et les délais sont convenus ensemble, en respectant les locations déjà confirmées.",
  },
  {
    question: "Qui gère les locataires ?",
    answer:
      "DreamEffect est l'interlocuteur unique : réservations, remise des clés, suivi pendant la location et retour du véhicule. Vous n'avez pas à gérer les échanges directement.",
  },
  {
    question: "Que se passe-t-il en cas de problème ?",
    answer:
      "Notre équipe intervient en premier recours. Chaque situation est traitée rapidement, avec un suivi documenté et une communication transparente envers vous.",
  },
];

export default function OwnersFaq() {
  return (
    <section className="de-section de-faq-section" aria-labelledby="owners-faq-title">
      <div className="de-public-container de-faq-layout">
        <div className="de-faq-intro">
          <p className="de-section-eyebrow">Propriétaires</p>
          <h2 id="owners-faq-title" className="de-display de-section-title">
            Ce qu&apos;il faut savoir
          </h2>
          <p className="de-section-lede">
            Les questions avant de confier votre véhicule — distinctes de la
            FAQ locataire.
          </p>
        </div>

        <div className="de-faq-editorial">
          {FAQ_ITEMS.map(({ question, answer }, index) => (
            <details key={question} className="de-faq-row">
              <summary className="de-faq-summary">
                <span className="de-faq-num" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="de-faq-q de-display">{question}</span>
              </summary>
              <p className="de-faq-a">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export { FAQ_ITEMS };
