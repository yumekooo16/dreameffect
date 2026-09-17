"use client";

type HoneypotFieldProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

/** Champ piège anti-bot — masqué visuellement et des lecteurs d’écran. */
export default function HoneypotField({ id, value, onChange }: HoneypotFieldProps) {
  return (
    <div className="de-hp" aria-hidden="true">
      <label htmlFor={id}>Site web</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
