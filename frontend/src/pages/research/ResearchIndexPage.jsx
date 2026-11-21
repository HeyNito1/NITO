import { pageStyle, paragraphStyle } from "./researchStyles";
import ResearchSection from "./components/ResearchSection";
import ResearchCard from "./components/ResearchCard";
import ResearchGrid from "./components/ResearchGrid";
import { useResearchFilters } from "./hooks/useResearchFilters";
import ResearchFilters from "./components/ResearchFilters";

export default function ResearchIndexPage() {
  const filters = useResearchFilters();
  return (
    <div style={pageStyle}>
      <ResearchSection style={{ paddingTop: 54, paddingBottom: 80 }}>
        <ResearchFilters {...filters} />
        <ResearchGrid index>
          {filters.visible.map((card) => (
            <ResearchCard key={card.id} {...card} ratio="294 / 277" />
          ))}
        </ResearchGrid>
        {filters.visible.length === 0 && (
          <p role="status" style={paragraphStyle}>
            No research matches your search.
          </p>
        )}
      </ResearchSection>
    </div>
  );
}
