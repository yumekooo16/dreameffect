import { requireOwner } from "@/src/lib/owner/auth";
import OwnerHeader from "@/src/components/owner/header";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOwner();

  return (
    <div className="de-page de-dashboard min-h-screen">
      <div className="de-page-inner mx-auto max-w-5xl px-4 sm:px-8 lg:px-12">
        <OwnerHeader />
        <main className="de-dashboard-frame pb-8 pt-2 sm:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
