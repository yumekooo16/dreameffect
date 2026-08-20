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
    <section className="de-section" aria-labelledby="home-reviews-title">
      <div className="de-public-container">
        <div className="de-section-masthead">
          <p className="de-section-eyebrow">Confiance</p>
          <h2 id="home-reviews-title" className="de-display de-section-title">
            Ce que l&apos;on nous dit
          </h2>
        </div>

        <div className="de-reviews-editorial">
          {reviews.map((review) => (
            <blockquote key={`${review.author}-${review.text.slice(0, 24)}`} className="de-review-quote">
              <StarRow rating={review.rating} />
              <p className="de-display">&ldquo;{review.text}&rdquo;</p>
              <footer>
                <cite className="not-italic">{review.author}</cite>
              </footer>
            </blockquote>
          ))}
        </div>

        {googleUrl ? (
          <Link
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="de-text-cta de-reviews-cta-link"
          >
            Voir et laisser un avis sur Google
            <ExternalLink size={14} aria-hidden />
          </Link>
        ) : null}
      </div>
    </section>
  );
}
