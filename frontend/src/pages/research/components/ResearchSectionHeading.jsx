import { headingStyle } from "../researchStyles";

export default function ResearchSectionHeading({ children, action, style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 24,
        ...style,
      }}
    >
      <h2 style={headingStyle}>{children}</h2>
      {action}
    </div>
  );
}
