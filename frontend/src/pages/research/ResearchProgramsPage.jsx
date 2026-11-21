import { pageStyle } from "./researchStyles";
import ResearchHeroSection from "./sections/ResearchHeroSection";
import ResearchFAQsSection from "./sections/ResearchFAQsSection";
import ResearcherProfilesSection from "./sections/ResearcherProfilesSection";
import ResearchTestimonialsSection from "./sections/ResearchTestimonialsSection";
import ProgramsGridSection from "./sections/ProgramsGridSection";

export default function ResearchProgramsPage() {
  return (
    <div style={pageStyle}>
      <ResearchHeroSection variant="programs" />
      <ResearcherProfilesSection />
      <ProgramsGridSection />
      <ResearchFAQsSection />
      <ResearchTestimonialsSection />
    </div>
  );
}
