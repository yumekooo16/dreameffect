type FlyerSocialIconProps = {
  className?: string;
};

export function FlyerEmailIcon({ className }: FlyerSocialIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="24" rx="5" fill="#EA4335" />
      <path
        fill="#fff"
        d="M4.5 7.5h15v9h-15v-9zm1.2 1.2 6.3 4.2 6.3-4.2H5.7zm12.6 7.2V9.3l-6 4.05-6-4.05v6.6h12z"
      />
    </svg>
  );
}

export function FlyerInstagramIcon({ className }: FlyerSocialIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="flyer-ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="35%" stopColor="#FA7E1E" />
          <stop offset="65%" stopColor="#D62976" />
          <stop offset="100%" stopColor="#962FBF" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#flyer-ig)" />
      <rect
        x="6.2"
        y="6.2"
        width="11.6"
        height="11.6"
        rx="3.2"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.8" fill="none" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.4" cy="7.6" r="1.1" fill="#fff" />
    </svg>
  );
}

export function FlyerSnapchatIcon({ className }: FlyerSocialIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="24" rx="5" fill="#FFFC00" />
      <path
        fill="#fff"
        stroke="#111"
        strokeWidth="0.35"
        d="M12 4.2c2.4 0 3.8 1.55 3.8 3.75 0 1.05-.35 1.95-.95 2.65.65.25 1.25.55 1.25 1.35 0 .55-.35.95-.85 1.15.15.45.55.75 1.05.95-.1.55-.65.85-1.25.85-.35 0-.75-.1-1.05-.25-.3.75-.95 1.35-1.85 1.35-.9 0-1.55-.6-1.85-1.35-.3.15-.7.25-1.05.25-.6 0-1.15-.3-1.25-.85.5-.2.9-.5 1.05-.95-.5-.2-.85-.6-.85-1.15 0-.8.6-1.1 1.25-1.35-.6-.7-.95-1.6-.95-2.65 0-2.2 1.4-3.75 3.8-3.75z"
      />
    </svg>
  );
}

export function FlyerWhatsAppIcon({ className }: FlyerSocialIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="24" rx="12" fill="#25D366" />
      <path
        fill="#fff"
        d="M12 4.8a7.1 7.1 0 0 0-6.05 10.75L5.2 18.8l3.45-1.05A7.1 7.1 0 1 0 12 4.8zm0 1.25a5.85 5.85 0 0 1 0 11.7 5.75 5.75 0 0 1-2.95-.8l-.2-.12-2.05.62.67-2-.12-.2a5.85 5.85 0 0 1 4.65-9.2zm-2.2 2.55c-.12-.2-.25-.2-.4-.2h-.35c-.12 0-.3.05-.45.25-.15.2-.6.58-.6 1.42 0 .83.62 1.63.7 1.75.08.12 1.2 1.92 2.95 2.62 1.45.58 1.75.47 2.07.44.32-.03 1.02-.42 1.17-.82.14-.4.14-.75.1-.82-.05-.08-.15-.12-.32-.2-.17-.08-1.02-.5-1.18-.55-.15-.06-.27-.08-.38.08-.12.17-.45.55-.55.67-.1.12-.2.13-.37.05-.17-.08-.72-.27-1.37-.85-.5-.45-.85-1-.95-1.17-.1-.17 0-.26.07-.35.08-.08.17-.2.25-.3.08-.1.1-.17.17-.28.07-.12.03-.22 0-.3-.03-.08-.35-.85-.48-1.17z"
      />
    </svg>
  );
}

export function FlyerContactIcon({
  kind,
  className,
}: FlyerSocialIconProps & {
  kind: "email" | "instagram" | "snapchat" | "whatsapp";
}) {
  switch (kind) {
    case "email":
      return <FlyerEmailIcon className={className} />;
    case "instagram":
      return <FlyerInstagramIcon className={className} />;
    case "snapchat":
      return <FlyerSnapchatIcon className={className} />;
    case "whatsapp":
      return <FlyerWhatsAppIcon className={className} />;
  }
}
