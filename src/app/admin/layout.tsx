import { requireAdmin } from "@/src/lib/admin/auth";
import AdminHeader from "@/src/components/admin/header-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="de-page de-dashboard min-h-screen">
      <div className="de-page-inner mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
        <AdminHeader />
        <main className="de-dashboard-frame pb-8 pt-2 sm:pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}
