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
    <section className="de-section" aria-labelledby="owners-faq-title">
      <div className="de-public-container">
        <div className="de-owners-know-layout">
          <div className="de-section-header de-section-header--flush">
            <p className="de-section-eyebrow">Propriétaires</p>
            <h2 id="owners-faq-title" className="de-display de-section-title">
              Ce qu&apos;il faut savoir
            </h2>
            <p className="de-section-description">
              Les questions que se posent les propriétaires avant de confier
              leur véhicule — distinctes de la FAQ locataire.
            </p>
          </div>

          <div className="de-owners-faq-list">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <details key={question} className="de-faq-item">
                <summary className="de-faq-question">{question}</summary>
                <p className="de-faq-answer">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { FAQ_ITEMS };
