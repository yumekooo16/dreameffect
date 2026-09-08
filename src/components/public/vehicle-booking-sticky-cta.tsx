"use client";

import { CalendarDays } from "lucide-react";

type Props = {
  disabled?: boolean;
};

export default function VehicleBookingStickyCta({ disabled = false }: Props) {
  function scrollToBooking() {
    const target = document.getElementById("reservation");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (disabled) return null;

  return (
    <div className="de-booking-sticky" role="region" aria-label="Accès réservation">
      <button
        type="button"
        className="de-btn de-btn-primary de-booking-sticky-btn"
        onClick={scrollToBooking}
      >
        <CalendarDays className="size-4" aria-hidden />
        Choisir mes dates
      </button>
    </div>
  );
}
