import { pageStyle } from "./researchStyles";
import ResearchHeroSection from "./sections/ResearchHeroSection";
import ResearchFAQsSection from "./sections/ResearchFAQsSection";
import LatestExplorationsSection from "./sections/LatestExplorationsSection";
import ResearchHighlightsSection from "./sections/ResearchHighlightsSection";

export default function ResearchOverviewPage() {
  return (
    <div style={{ ...pageStyle, position: "relative", isolation: "isolate" }}>
      <div
        style={{
          position: "sticky",
          top: "min(var(--header-height, 0px), calc(100svh - clamp(650px, 48.6vw, 933px)))",
          zIndex: 0,
        }}
      >
        <ResearchHeroSection />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: pageStyle.background,
        }}
      >
        <LatestExplorationsSection />
        <ResearchHighlightsSection />
        <ResearchFAQsSection />
      </div>
    </div>
  );
}
