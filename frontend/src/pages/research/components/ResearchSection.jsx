import { contentStyle } from "../researchStyles";

export default function ResearchSection({ children, gray = false, style, id }) {
  return (
    <section
      id={id}
      style={{
        background: gray ? "#141414" : "#000",
        padding: "clamp(56px, 5.2vw, 100px) 0",
        ...style,
      }}
    >
      <div style={contentStyle}>{children}</div>
    </section>
  );
}
