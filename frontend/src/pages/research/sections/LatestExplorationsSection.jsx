import { contourImage } from "../services/researchAssets";
import { lorem, researchIndexPath } from "../mocks/researchData";
import ResearchAction from "../components/ResearchAction";
import ResearchSection from "../components/ResearchSection";
import ResearchSectionHeading from "../components/ResearchSectionHeading";
import ResearchCard from "../components/ResearchCard";
import ResearchGrid from "../components/ResearchGrid";

export default function LatestExplorationsSection() {
  return (
    <ResearchSection gray style={{ minHeight: 997 }}>
      <ResearchSectionHeading
        style={{ marginBottom: 88 }}
        action={
          <ResearchAction to={researchIndexPath}>
            View all ↗
          </ResearchAction>
        }
      >
        Our Latest
        <br />
        Explorations
      </ResearchSectionHeading>

      <ResearchGrid>
        {["IDE", "Browser", "IDE", "Browser"].map((title, index) => (
          <ResearchCard
            key={index}
            large
            title={title}
            image={contourImage(index)}
            description={lorem + " augue facilisis magna."}
          />
        ))}
      </ResearchGrid>
    </ResearchSection>
  );
}