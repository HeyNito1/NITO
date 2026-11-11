import ArrowIcon from "./ArrowIcon";
export default function Button({
  variant = "outline",
  arrow = false,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`button button--${variant} ${className}`}
      {...props}
    >
      {children}
      {arrow && <ArrowIcon diagonal className="button-arrow" />}
    </button>
  );
}
