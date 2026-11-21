import { headingStyle } from "../researchStyles";
import ResearchSection from "../components/ResearchSection";
import ResearchCard from "../components/ResearchCard";

export default function ObservatorySignalsSection() {
  return (
    <ResearchSection
      gray
      style={{ minHeight: 777, paddingTop: 70 }}
    >
      <h2 style={{ ...headingStyle, marginBottom: 76 }}>
        Signals to Watch
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 54 }}>
        {[
          ["signal-wide", "Mighty NITO", 540],
          ["signal-math", "NITO MATH", 348],
          ["signal-tech", "Tech Impact", 348],
        ].map(([image, title, width]) => (
          <div
            key={title}
            style={{
              flex: `${width} 1 ${width > 400 ? 290 : 220}px`,
              minWidth: 0,
            }}
          >
            <ResearchCard
              image={image}
              title={title}
              imageHeight={328}
            />
          </div>
        ))}
      </div>
    </ResearchSection>
  );
}