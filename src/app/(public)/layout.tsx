import JsonLd from "@/src/components/public/json-ld";
import PublicHeader from "@/src/components/public/header";
import PublicFooter from "@/src/components/public/footer";
import { globalPublicJsonLd } from "@/src/lib/public/seo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="de-maison">
      <a href="#main-content" className="de-skip-link">
        Aller au contenu
      </a>
      <PublicHeader />
      <div className="de-page de-landing de-maison-shell">
        <JsonLd data={globalPublicJsonLd()} />
        <main id="main-content">{children}</main>
        <PublicFooter />
      </div>
    </div>
  );
}
