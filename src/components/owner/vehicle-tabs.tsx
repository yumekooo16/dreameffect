"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ChartSkeleton from "@/src/components/owner/chart-skeleton";

const Calendar = dynamic(() => import("@/src/components/calendar"), {
  loading: () => <ChartSkeleton />,
});

const VehicleRevenue = dynamic(() => import("@/src/components/vehicle-revenue"), {
  loading: () => <ChartSkeleton />,
});

type Reservation = {
  id: string;
  start_date: string;
  end_date: string;
  customer_name?: string | null;
  customer_email?: string | null;
  status: string;
  owner_amount?: number | null;
  company_amount?: number | null;
  total_price?: number | null;
};

type Maintenance = {
  id: string;
  maintenance_date: string;
  title: string;
  type?: string;
  description?: string | null;
  mileage?: number | null;
  next_due_date?: string | null;
};

type Props = {
  overview: React.ReactNode;
  reservations: React.ReactNode;
  documents: React.ReactNode;
  maintenance: React.ReactNode;
  calendarReservations: Reservation[];
  calendarMaintenances: Maintenance[];
  revenueProps: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalRentals: number;
    reservations: Reservation[];
  };
};

export default function VehicleTabs({
  overview,
  reservations,
  documents,
  maintenance,
  calendarReservations,
  calendarMaintenances,
  revenueProps,
}: Props) {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "reservations", label: "Réservations" },
    { id: "calendar", label: "Calendrier" },
    { id: "revenue", label: "Revenus" },
    { id: "documents", label: "Documents" },
    { id: "maintenance", label: "Maintenance" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div
        className="de-tabs-scroll flex gap-2 overflow-x-auto border-b border-[var(--blue-border)] pb-3 sm:pb-4"
        role="tablist"
        aria-label="Sections du véhicule"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            onClick={() => setTab(item.id)}
            className={`de-btn-tab ${
              tab === item.id ? "de-btn-tab--active" : "de-btn-tab--inactive"
            }`}
            aria-selected={tab === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="de-card de-card-padded" role="tabpanel">
        {tab === "overview" && overview}
        {tab === "reservations" && reservations}
        {tab === "calendar" && (
          <Calendar
            reservations={calendarReservations}
            maintenances={calendarMaintenances}
          />
        )}
        {tab === "revenue" && <VehicleRevenue {...revenueProps} />}
        {tab === "documents" && documents}
        {tab === "maintenance" && maintenance}
      </div>
    </div>
  );
}
