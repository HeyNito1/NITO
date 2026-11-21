import { muted, headingStyle } from "../researchStyles";
import ResearchSection from "../components/ResearchSection";
import ResearchGrid from "../components/ResearchGrid";

export default function ResearchTestimonialsSection() {
  return (
    <ResearchSection
      style={{ minHeight: 425, padding: "76px 0 80px" }}
    >
      <h2 style={{ ...headingStyle, marginBottom: 48 }}>
        What they say about us?
      </h2>

      <ResearchGrid gap={48}>
        {[1, 2, 3, 4].map((id) => (
          <figure
            key={id}
            style={{
              background: "#141414",
              borderRadius: 12,
              overflow: "hidden",
              margin: 0,
            }}
          >
            <blockquote
              style={{
                margin: 0,
                padding: "18px 18px 14px",
                fontSize: 16,
                lineHeight: 1.3,
              }}
            >
              “Ayooo! this the best shit I ever laid my hands on
              man, I mean no one got that shittt. Crazy!”
            </blockquote>

            <figcaption
              style={{
                borderTop: "1px solid #888",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "#000",
                }}
              />

              <span style={{ fontSize: 14 }}>
                text
                <small
                  style={{
                    display: "block",
                    fontSize: 9,
                    color: muted,
                  }}
                >
                  INFINITO COMICS
                </small>
              </span>
            </figcaption>
          </figure>
        ))}
      </ResearchGrid>
    </ResearchSection>
  );
}