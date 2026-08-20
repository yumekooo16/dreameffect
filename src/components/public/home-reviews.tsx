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
          size={13}
          strokeWidth={1.5}
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
    <section className="de-keys-section" aria-labelledby="home-reviews-title">
      <div className="de-public-container">
        <p className="de-keys-eyebrow">Confiance</p>
        <h2 id="home-reviews-title" className="de-keys-h2">
          Ce que l&apos;on nous dit
        </h2>

        <div className="de-keys-duo" style={{ marginTop: "2rem" }}>
          {reviews.map((review) => (
            <blockquote
              key={`${review.author}-${review.text.slice(0, 24)}`}
              className="de-keys-duo-panel"
            >
              <StarRow rating={review.rating} />
              <p
                style={{
                  marginTop: "0.75rem",
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  lineHeight: 1.45,
                  color: "var(--text)",
                }}
              >
                &ldquo;{review.text}&rdquo;
              </p>
              <footer
                style={{
                  marginTop: "1rem",
                  fontSize: "0.75rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-subtle)",
                }}
              >
                {review.author}
              </footer>
            </blockquote>
          ))}
        </div>

        {googleUrl ? (
          <Link href={googleUrl} target="_blank" rel="noopener noreferrer" className="de-keys-link">
            Voir et laisser un avis sur Google
            <ExternalLink size={14} aria-hidden />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
