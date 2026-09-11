"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

type Props = {
  disabled?: boolean;
};

export default function VehicleBookingStickyCta({ disabled = false }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (disabled) return;

    const target = document.getElementById("reservation");
    if (!target || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Masquer dès que la zone réservation approche / entre dans l'écran
        setVisible(!entry.isIntersecting);
      },
      {
        root: null,
        // Anticiper un peu avant d'arriver sur le panel
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.05,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [disabled]);

  function scrollToBooking() {
    const target = document.getElementById("reservation");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (disabled) return null;

  return (
    <div
      className={`de-booking-sticky${visible ? "" : " de-booking-sticky--hidden"}`}
      role="region"
      aria-label="Accès réservation"
      aria-hidden={!visible}
    >
      <button
        type="button"
        className="de-btn de-btn-primary de-booking-sticky-btn"
        onClick={scrollToBooking}
        tabIndex={visible ? 0 : -1}
      >
        <CalendarDays className="size-4" aria-hidden />
        Choisir mes dates
      </button>
    </div>
  );
}
