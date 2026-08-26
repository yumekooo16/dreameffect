import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InfoArticle, InfoCta } from "@/src/components/public/info-article";
import JsonLd from "@/src/components/public/json-ld";
import PageHero from "@/src/components/public/page-hero";
import type { LocalCityPage } from "@/src/lib/public/local-city-pages";
import { breadcrumbJsonLd, buildPageMetadata } from "@/src/lib/public/seo";
import { PUBLIC_ROUTES } from "@/src/lib/public/site";

export function buildLocalCityMetadata(page: LocalCityPage) {
  return buildPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: page.path,
    keywords: page.keywords,
  });
}

export default function LocalCityPageView({ page }: { page: LocalCityPage }) {
  const primaryHref =
    page.kind === "location" ? PUBLIC_ROUTES.vehicles : PUBLIC_ROUTES.owners;
  const primaryLabel =
    page.kind === "location" ? "Voir les véhicules" : "Espace propriétaires";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: page.metaTitle, path: page.path },
        ])}
      />
      <PageHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        description={page.heroDescription}
      />
      <InfoArticle blocks={page.blocks} />
      <InfoCta>
        <h2 className="de-display text-xl tracking-tight">{page.ctaTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed de-muted">
          {page.ctaBody}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={primaryHref} className="de-btn de-btn-primary">
            {primaryLabel}
            <ArrowRight size={16} />
          </Link>
          <Link href={PUBLIC_ROUTES.contact} className="de-btn de-btn-ghost">
            Nous contacter
          </Link>
        </div>
        <nav aria-label="Pages liées" className="mt-8">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {page.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="de-muted underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </InfoCta>
    </>
  );
}
