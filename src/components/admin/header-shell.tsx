"use client";

import dynamic from "next/dynamic";

const AdminHeader = dynamic(() => import("@/src/components/admin/header"), {
  ssr: false,
  loading: () => (
    <header className="de-header de-app-header">
      <div className="de-app-header-bar">
        <div className="h-9 w-36 animate-pulse rounded-lg bg-muted/40" />
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted/30" />
      </div>
    </header>
  ),
});

export default AdminHeader;
