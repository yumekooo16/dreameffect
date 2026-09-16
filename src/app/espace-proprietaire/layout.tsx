import { requireOwner } from "@/src/lib/owner/auth";
import OwnerHeader from "@/src/components/owner/header";
import OwnerAppNav from "@/src/components/owner/app-nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();

  return (
    <div className="de-page de-dashboard de-app-shell de-app-shell--owner min-h-screen">
      <div className="de-page-inner de-app-shell-inner">
        <OwnerHeader />
        <main className="de-dashboard-frame de-app-main">{children}</main>
      </div>
      <OwnerAppNav />
    </div>
  );
}
