import { Link } from "react-router";

export default function ResearchAction({ to, children, onClick, wide = false }) {
  const style = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: wide ? 50 : 44,
    minWidth: wide ? 300 : 162,
    padding: "8px 22px",
    border: "1px solid #bcbcbc",
    borderRadius: 999,
    background: "#000",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
    fontSize: 16,
    textDecoration: "none",
    cursor: "pointer",
  };
  return to ? (
    <Link to={to} style={style}>
      {children}
    </Link>
  ) : (
    <button type="button" style={style} onClick={onClick}>
      {children}
    </button>
  );
}
