import { headingStyle, paragraphStyle } from "../researchStyles";
import { lorem } from "../mocks/researchData";
import { asset, contourImage } from "../services/researchAssets";
import ResearchSection from "../components/ResearchSection";

export default function ResearcherProfilesSection() {
  return (
    <ResearchSection gray style={{ minHeight: 1243 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          gap: "clamp(32px, 4.5vw, 86px)",
        }}
      >
        <div style={{ flex: "1 1 260px", maxWidth: 350 }}>
          <h2 style={{ ...headingStyle, marginBottom: 36 }}>
            Who do we
            <br />
            look for?
          </h2>

          <p
            style={{
              ...paragraphStyle,
              fontSize: 22,
              textAlign: "justify",
            }}
          >
            {lorem} Suspendisse potenti.
          </p>
        </div>

        <div
          style={{
            flex: "3 1 520px",
            display: "grid",
            gap: 48,
          }}
        >
          {["Banda 20", "Banda 19", "LOL"].map((title, index) => (
            <article
              key={title}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 54,
                alignItems: "flex-start",
              }}
            >
              <img
                src={asset("cardimage")}
                alt=""
                loading="lazy"
                style={{
                  flex: "0 1 332px",
                  width: 332,
                  maxWidth: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #aaa",
                }}
              />

              <div style={{ flex: "1.55 1 280px", minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: 32,
                    fontWeight: 400,
                    margin: "0 0 18px",
                  }}
                >
                  {title}
                </h3>

                <p
                  style={{
                    ...paragraphStyle,
                    fontSize: 22,
                    textAlign: "justify",
                  }}
                >
                  {lorem}
                </p>

                <p
                  style={{
                    ...paragraphStyle,
                    fontSize: 22,
                    textAlign: "justify",
                    marginTop: 28,
                  }}
                >
                  at posuere gravida, neque augue facilisis magna,
                  vitae aliquet risus nibh vel erat. Suspendisse
                  potenti.at posuere gravida, neque augue facilisis
                  magna, vitae aliquet risus nibh vel erat.
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ResearchSection>
  );
}