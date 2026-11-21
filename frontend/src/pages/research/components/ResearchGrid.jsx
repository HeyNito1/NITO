export default function ResearchGrid({ children, gap = 64, index = false }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: index
          ? "repeat(auto-fill, minmax(min(100%, 240px), 1fr))"
          : "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
        columnGap: index ? 54 : gap,
        rowGap: index ? 68 : 76,
      }}
    >
      {children}
    </div>
  );
}
