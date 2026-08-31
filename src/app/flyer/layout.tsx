import type { Metadata } from "next";
import FlyerToolbar from "@/src/components/public/flyer-toolbar";
import "./flyer.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function FlyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="de-flyer-shell">
      <FlyerToolbar />
      {children}
    </div>
  );
}
