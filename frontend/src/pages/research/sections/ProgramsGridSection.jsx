import { contourImage } from "../services/researchAssets";
import { useState } from "react";
import { programNames } from "../mocks/researchData";
import ResearchAction from "../components/ResearchAction";
import ResearchSection from "../components/ResearchSection";
import ResearchSectionHeading from "../components/ResearchSectionHeading";
import ResearchCard from "../components/ResearchCard";
import ResearchGrid from "../components/ResearchGrid";

export default function ProgramsGridSection() {
  const [showAll, setShowAll] = useState(false);

  return (
    <ResearchSection id="programs" style={{ minHeight: 1246 }}>
      <ResearchSectionHeading
        style={{ marginBottom: 52 }}
        action={
          <ResearchAction onClick={() => setShowAll(!showAll)}>
            {showAll ? "View less" : "View all"} ↗
          </ResearchAction>
        }
      >
        NITO’s Research Programs
      </ResearchSectionHeading>

      <ResearchGrid>
        {programNames.slice(0, showAll ? 12 : 8).map((title, index) => (
          <ResearchCard
            key={index}
            title={title}
            image={contourImage(index)}
          />
        ))}
      </ResearchGrid>
    </ResearchSection>
  );
}