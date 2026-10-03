"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { CheckCircle2 } from "lucide-react";

const DEFAULT_FLASH_MS = 1800;
const REDIRECT_FLASH_MS = 700;

export function useSuccessFeedback(durationMs = DEFAULT_FLASH_MS) {
  const [succeeded, setSucceeded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSuccess = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setSucceeded(false);
  }, []);

  const flashSuccess = useCallback(
    (onDone?: () => void) => {
      setSucceeded(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setSucceeded(false);
        onDone?.();
      }, durationMs);
    },
    [durationMs]
  );

  useEffect(() => () => clearSuccess(), [clearSuccess]);

  return { succeeded, flashSuccess, clearSuccess };
}

/** Flash court avant une redirection pour laisser voir le bouton vert. */
export function useRedirectSuccessFeedback() {
  return useSuccessFeedback(REDIRECT_FLASH_MS);
}

type SuccessActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  succeeded?: boolean;
  idleLabel: ReactNode;
  pendingLabel?: ReactNode;
  successLabel?: ReactNode;
  className?: string;
};

export function SuccessActionButton({
  pending = false,
  succeeded = false,
  idleLabel,
  pendingLabel = "Enregistrement…",
  successLabel = "Enregistré",
  className = "de-btn de-btn-primary",
  type = "button",
  disabled,
  ...props
}: SuccessActionButtonProps) {
  const classes = [
    className,
    succeeded ? "de-btn--success" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      type={type}
      disabled={disabled || pending || succeeded}
      className={classes}
      aria-live={succeeded ? "polite" : undefined}
    >
      {succeeded ? (
        <>
          <CheckCircle2 className="de-btn-success-icon" aria-hidden />
          {successLabel}
        </>
      ) : pending ? (
        pendingLabel
      ) : (
        idleLabel
      )}
    </button>
  );
}

export function ActionSuccessMessage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={["de-action-success", className].filter(Boolean).join(" ")}
      role="status"
    >
      <CheckCircle2 className="de-action-success-icon" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
