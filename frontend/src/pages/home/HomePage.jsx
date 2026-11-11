import "./home.css";
import { useResource } from "@/hooks/useResource";
import { getHome } from "./services/homeService";
import { usePrompt } from "./hooks/usePrompt";
import HeroSection from "./sections/HeroSection";
import CapabilitiesSection from "./sections/CapabilitiesSection";
import UseCasesSection from "./sections/UseCasesSection";
import StoriesSection from "./sections/StoriesSection";
import Container from "@/components/ui/Container";
export default function HomePage() {
  const { data, status, error } = useResource(getHome);
  const composer = usePrompt();
  if (status === "loading")
    return (
      <Container className="page-state" role="status">
        <span className="spinner" /> Loading NITO…
      </Container>
    );
  if (status === "error")
    return (
      <Container className="page-state">
        <h1>Something went wrong.</h1>
        <p role="alert">{error.message}</p>
        <button className="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </Container>
    );
  if (!data)
    return (
      <Container className="page-state">
        <h1>No content available.</h1>
        <p>Please check back soon.</p>
      </Container>
    );
  return (
  <div className="home-page">
    <HeroSection categories={data.categories} composer={composer} />

    <div className="home-content">
      <CapabilitiesSection items={data.capabilities} />

      <UseCasesSection
        description={data.useCaseDescription}
        audiences={data.audiences}
        onSelect={composer.chooseAudience}
      />

      <StoriesSection
        metrics={data.metrics}
        stories={data.stories}
      />
    </div>
  </div>
);
}

