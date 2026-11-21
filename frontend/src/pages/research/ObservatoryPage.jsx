import { pageStyle } from "./researchStyles";
import ResearchHeroSection from "./sections/ResearchHeroSection";
import ObservatoryAnalyticsSection from "./sections/ObservatoryAnalyticsSection";
import ResearchHighlightsSection from "./sections/ResearchHighlightsSection";
import ObservatorySignalsSection from "./sections/ObservatorySignalsSection";

export default function ObservatoryPage() {
  return (
    <div style={pageStyle}>
      <ResearchHeroSection variant="observatory" />
      <ObservatoryAnalyticsSection />
      <ResearchHighlightsSection observatory />
      <ObservatorySignalsSection />
    </div>
  );
}
