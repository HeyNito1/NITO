export default function CategoryPill({ selected = false, children, ...props }) {
  return (
    <button
      type="button"
      className="category-pill"
      aria-pressed={selected}
      {...props}
    >
      {children}
    </button>
  );
}
