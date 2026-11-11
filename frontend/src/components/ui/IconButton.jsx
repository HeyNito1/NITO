export default function IconButton({
  label,
  variant = "outline",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`icon-button icon-button--${variant} ${className}`}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
