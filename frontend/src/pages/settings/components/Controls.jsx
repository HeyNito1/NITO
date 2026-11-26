import { useEffect, useRef } from "react";

export function Action({ children, onClick, danger, ...props }) {
  return (
    <button
      type="button"
      className={`settings-action ${danger ? "text-red-400!" : ""}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
export function Card({ title, action, children, className = "" }) {
  return (
    <section className={`settings-card ${className}`}>
      <header className="settings-card-heading">
        <h2>{title}</h2>
        {action}
      </header>
      <div className="settings-card-body">{children}</div>
    </section>
  );
}
export function Row({ label, description, children, danger = false }) {
  return (
    <div className="settings-row">
      <div className="min-w-0">
        <div className={danger ? "text-red-500" : ""}>{label}</div>
        {description && (
          <p className="settings-muted mt-0.5 text-[12px]">{description}</p>
        )}
      </div>
      <div className="settings-row-control">{children}</div>
    </div>
  );
}
export function Toggle({ label, checked, onChange, unavailable = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      aria-disabled={unavailable || undefined}
      onClick={() => onChange(!checked)}
      className={`settings-toggle ${checked ? "is-on" : ""}`}
    >
      <span />
    </button>
  );
}
export function Select({ label, value, onChange, options }) {
  return (
    <select
      className="settings-select"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => {
        const [v, text] = Array.isArray(option) ? option : [option, option];
        return (
          <option key={v} value={v}>
            {text}
          </option>
        );
      })}
    </select>
  );
}

export function Modal({
  title,
  children,
  onClose,
  className = "",
  headerAction,
}) {

  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`settings-modal ${className}`}
      aria-labelledby="settings-modal-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 id="settings-modal-title" className="text-xl">
          {title}
        </h2>

        <div className="flex shrink-0 items-center gap-3">
          {headerAction}

          <button
            type="button"
            className="settings-action"
            aria-label="Close dialog"
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  ...props
}) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </label>
  );
}
export function Empty({ children }) {
  return (
    <p className="settings-muted py-3 text-sm leading-relaxed">{children}</p>
  );
}
export function More({ label, children }) {
  const ref = useRef(null);
  useEffect(() => {
    function dismiss(event) {
      if (event.type === "keydown" && event.key !== "Escape") return;
      if (event.type === "pointerdown" && ref.current?.contains(event.target))
        return;
      if (ref.current?.open) {
        ref.current.open = false;
        if (event.type === "keydown")
          ref.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismiss);
    };
  }, []);
  return (
    <details ref={ref} className="settings-more">
      <summary aria-label={label}>{"⋮"}</summary>
      <div
        className="settings-more-content"
        onClick={() => {
          if (ref.current) ref.current.open = false;
        }}
      >
        {children}
      </div>
    </details>
  );
}
