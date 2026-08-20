import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";
import {
  getCustomerReviews,
  getGoogleReviewsUrl,
} from "@/src/lib/public/reviews";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="de-reviews-stars" aria-label={`${rating} sur 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          strokeWidth={1.75}
          className={
            index < rating ? "de-reviews-star de-reviews-star--filled" : "de-reviews-star"
          }
          aria-hidden
        />
      ))}
    </div>
  );
}

export default function HomeReviewsSection() {
  const reviews = getCustomerReviews();
  const googleUrl = getGoogleReviewsUrl();

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="de-section de-section-alt" aria-labelledby="home-reviews-title">
      <div className="de-public-container">
        <div className="de-section-header">
          <p className="de-section-eyebrow">Avis clients</p>
          <h2 id="home-reviews-title" className="de-display de-section-title">
            Ce que disent nos clients
          </h2>
          <p className="de-section-description">
            Retours de locataires et propriétaires — la même exigence que sur notre
            fiche Google.
          </p>
        </div>

        <div className="de-reviews-grid">
          {reviews.map((review) => (
            <article key={`${review.author}-${review.text.slice(0, 24)}`} className="de-review-card">
              <StarRow rating={review.rating} />
              <blockquote className="de-review-text">&ldquo;{review.text}&rdquo;</blockquote>
              <footer className="de-review-author">
                <cite className="not-italic">{review.author}</cite>
                {review.date ? (
                  <span className="de-review-date">{review.date}</span>
                ) : null}
              </footer>
            </article>
          ))}
        </div>

        {googleUrl ? (
          <div className="de-reviews-cta">
            <Link
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="de-btn de-btn-ghost"
            >
              Voir tous nos avis sur Google
              <ExternalLink size={16} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
