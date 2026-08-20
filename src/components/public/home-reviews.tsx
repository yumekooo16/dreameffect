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
    <section className="de-section de-section-alt" aria-labelledby="home-reviews-title">
      <div className="de-public-container">
        <header className="de-exhibit-head">
          <p className="de-exhibit-head-num" aria-hidden>
            04
          </p>
          <div>
            <p className="de-mono-label">Confiance</p>
            <h2 id="home-reviews-title" className="de-display de-exhibit-head-title">
              Ce que l&apos;on nous dit
            </h2>
          </div>
        </header>

        <div className="de-review-wall">
          {reviews.map((review) => (
            <div key={`${review.author}-${review.text.slice(0, 24)}`} className="de-review-cell">
              <blockquote>
                <StarRow rating={review.rating} />
                <p className="de-review-mark" aria-hidden>
                  &ldquo;
                </p>
                <p className="de-review-text">{review.text}</p>
                <footer className="de-review-author">{review.author}</footer>
              </blockquote>
            </div>
          ))}
        </div>

        {googleUrl ? (
          <Link
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="de-text-cta"
            style={{ marginTop: "2rem" }}
          >
            Voir et laisser un avis sur Google
            <ExternalLink size={14} aria-hidden />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
