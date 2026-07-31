"use client";

export function OfflineRetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="de-btn de-btn-primary w-full de-btn-lg"
    >
      Réessayer
    </button>
  );
}
