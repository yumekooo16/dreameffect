"use client";

import dynamic from "next/dynamic";

const AdminHeader = dynamic(() => import("@/src/components/admin/header"), {
  ssr: false,
  loading: () => (
    <header className="de-header space-y-3">
      <div className="h-[4.5rem] animate-pulse rounded-[var(--radius)] bg-muted/40 sm:h-20" />
      <div className="h-10 animate-pulse rounded-[var(--radius)] bg-muted/30" />
    </header>
  ),
});

export default AdminHeader;
