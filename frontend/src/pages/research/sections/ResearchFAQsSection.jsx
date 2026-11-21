import { Link } from "react-router";
import { headingStyle, paragraphStyle } from "../researchStyles";
import ResearchAction from "../components/ResearchAction";
import ResearchSection from "../components/ResearchSection";

export default function ResearchFAQsSection() {
  return (
    <ResearchSection
      gray
      style={{ padding: "58px 0", minHeight: 616 }}
    >
      <h2
        style={{
          ...headingStyle,
          textAlign: "center",
          marginBottom: 42,
        }}
      >
        FAQs
      </h2>

      <div
        style={{
          maxWidth: 955,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        {[1, 2, 3, 4, 5].map((number) => (
          <details
            key={number}
            style={{
              border: "1px solid #bcbcbc",
              borderRadius: 26,
              background: "#080808",
              padding: "12px 24px",
            }}
          >
            <summary
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                listStyle: "none",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: "24px",
              }}
            >
              How to become a researcher
              <span aria-hidden="true">⌄</span>
            </summary>

            <p style={{ ...paragraphStyle, paddingTop: 18 }}>
              Please check the Research Programs page for available
              opportunities. Detailed application requirements will be
              added when supplied.
            </p>

            <Link
              to="/discover/research-program"
              style={{
                display: "inline-block",
                marginTop: 14,
                color: "#fff",
                textDecoration: "underline",
              }}
            >
              Explore Research Programs
            </Link>
          </details>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <ResearchAction to="/discover/contact-us">
          Contact Us
        </ResearchAction>
      </div>
    </ResearchSection>
  );
}