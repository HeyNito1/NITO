import { paragraphStyle } from "../researchStyles";
import { longCopy, researchIndexPath } from "../mocks/researchData.js";
import ResearchAction from "../components/ResearchAction.jsx";
import ResearchSection from "../components/ResearchSection.jsx";
import ResearchSectionHeading from "../components/ResearchSectionHeading.jsx";
import ResearchMosaic from "../components/ResearchMosaic.jsx";

export default function ResearchHighlightsSection({
  observatory = false,
}) {
  return (
    <ResearchSection style={{ minHeight: observatory ? 899 : 932 }}>
      <ResearchSectionHeading
        action={
          observatory ? null : (
            <ResearchAction to={researchIndexPath}>
              Research Index ↗
            </ResearchAction>
          )
        }
      >
        {observatory ? "Emerging Frontier" : "Our Research"}
      </ResearchSectionHeading>

      <p style={{ ...paragraphStyle, marginTop: 24 }}>
        {longCopy}
      </p>

      <ResearchMosaic observatory={observatory} />
    </ResearchSection>
  );
}