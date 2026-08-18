import JsonLd from "@/src/components/public/json-ld";
import PublicHeader from "@/src/components/public/header";
import PublicFooter from "@/src/components/public/footer";
import { globalPublicJsonLd } from "@/src/lib/public/seo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isPreview = process.env.VERCEL_ENV === "preview";

  return (
    <div className="de-page de-landing">
      <JsonLd data={globalPublicJsonLd()} />
      <a href="#main-content" className="de-skip-link">
        Aller au contenu
      </a>
      {isPreview ? (
        <p className="de-preview-banner" role="status">
          Aperçu de la nouvelle version — le site en ligne www.dreameffect.fr
          n&apos;est pas encore à jour.
        </p>
      ) : null}
      <PublicHeader />
      <main id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
