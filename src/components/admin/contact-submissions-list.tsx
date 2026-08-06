import { Mail, MessageSquare, Phone, User } from "lucide-react";
import {
  formatContactTopic,
  type ContactSubmission,
} from "@/src/lib/admin/contacts-data";

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactSubmissionsList({
  items,
}: {
  items: ContactSubmission[];
}) {
  if (items.length === 0) {
    return (
      <p className="de-empty">
        Aucune demande de contact pour le moment.
      </p>
    );
  }

  return (
    <div className="de-list">
      {items.map((item) => {
        const fullName = `${item.first_name} ${item.last_name}`.trim();

        return (
          <article key={item.id} className="de-list-item">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{fullName}</p>
                <p className="mt-0.5 text-xs de-muted">
                  {formatContactTopic(item.topic)} — {formatDate(item.created_at)}
                </p>
              </div>
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 de-muted">
                <User size={14} strokeWidth={1.75} className="shrink-0" />
                <dd>{fullName}</dd>
              </div>
              <div className="flex items-center gap-2 de-muted">
                <Mail size={14} strokeWidth={1.75} className="shrink-0" />
                <dd>
                  <a
                    href={`mailto:${item.email}`}
                    className="transition hover:text-foreground"
                  >
                    {item.email}
                  </a>
                </dd>
              </div>
              {item.phone && (
                <div className="flex items-center gap-2 de-muted">
                  <Phone size={14} strokeWidth={1.75} className="shrink-0" />
                  <dd>
                    <a
                      href={`tel:${item.phone.replace(/\s/g, "")}`}
                      className="transition hover:text-foreground"
                    >
                      {item.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-4 rounded-lg border border-[var(--blue-border)] bg-[var(--bg)] p-3">
              <div className="mb-2 flex items-center gap-2 text-xs de-muted">
                <MessageSquare size={14} strokeWidth={1.75} />
                Message
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {item.message}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
