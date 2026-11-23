import { pageStyle } from "./researchStyles";
import ResearchHeroSection from "./sections/ResearchHeroSection";
import ResearchFAQsSection from "./sections/ResearchFAQsSection";
import ResearcherProfilesSection from "./sections/ResearcherProfilesSection";
import ResearchTestimonialsSection from "./sections/ResearchTestimonialsSection";
import ProgramsGridSection from "./sections/ProgramsGridSection";

export default function ResearchProgramsPage() {
  return (
    <div style={{ ...pageStyle, isolation: "isolate" }}>
      <div
        style={{
          position: "sticky",
          top: "min(var(--header-height, 0px), calc(100svh - clamp(650px, 48.6vw, 933px)))",
          zIndex: 0,
        }}
      >
        <ResearchHeroSection variant="programs" />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: pageStyle.background ?? pageStyle.backgroundColor ?? "#fff",
        }}
      >
        <ResearcherProfilesSection />
        <ProgramsGridSection />
        <ResearchFAQsSection />
        <ResearchTestimonialsSection />
      </div>
    </div>
  );
}