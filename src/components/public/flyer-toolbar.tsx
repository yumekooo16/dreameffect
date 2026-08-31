"use client";

import Link from "next/link";
import { Printer } from "lucide-react";

export default function FlyerToolbar() {
  return (
    <div className="de-flyer-toolbar no-print">
      <Link href="/" className="de-flyer-toolbar-back">
        ← Retour au site
      </Link>
      <button
        type="button"
        className="de-flyer-toolbar-print"
        onClick={() => window.print()}
      >
        <Printer size={16} strokeWidth={1.75} aria-hidden />
        Télécharger PDF (1 page A4)
      </button>
    </div>
  );
}
