import { headingStyle } from "../researchStyles";
import ResearchSection from "../components/ResearchSection";
import AnalyticsChart from "../components/AnalyticsChart";
import AnalyticsMetricCard from "../components/AnalyticsMetricCard";

export default function ObservatoryAnalyticsSection() {
  return (
    <ResearchSection gray id="analytics" style={{ minHeight: 1040 }}>
      <h2 style={headingStyle}>
        NITO’s Statical
        <br />
        Analytics
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "clamp(32px, 5vw, 96px)",
          marginTop: 42,
        }}
      >
        <div style={{ flex: "1.8 1 500px", minWidth: 0 }}>
          <AnalyticsChart />
        </div>

        <div
          style={{
            flex: "1 1 280px",
            display: "grid",
            gap: 28,
          }}
        >
          {[1, 2, 3, 4].map((number) => (
            <AnalyticsMetricCard key={number} number={number} />
          ))}
        </div>
      </div>
    </ResearchSection>
  );
}