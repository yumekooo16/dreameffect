import { requireAdmin } from "@/src/lib/admin/auth";
import AdminHeader from "@/src/components/admin/header-shell";
import AdminAppNav from "@/src/components/admin/app-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="de-page de-dashboard de-app-shell de-app-shell--admin min-h-screen">
      <div className="de-page-inner de-app-shell-inner">
        <AdminHeader />
        <main className="de-dashboard-frame de-app-main">{children}</main>
      </div>
      <AdminAppNav />
    </div>
  );
}
