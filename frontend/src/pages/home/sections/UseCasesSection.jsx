import Container from "@/components/ui/Container";
import ArrowIcon from "@/components/ui/ArrowIcon";
export default function UseCasesSection({ description, audiences, onSelect }) {
  return (
    <section
      id="use-cases"
      className="use-cases-section"
      aria-labelledby="use-cases-title"
    >
      <Container className="use-cases-grid">
        <div className="use-cases-copy">
          <h2 id="use-cases-title" className="section-title">
            Explore all the
            <br />
            USE CASES
          </h2>
          <p>{description}</p>
        </div>
        <div className="use-cases-panel" aria-hidden="true" />
        <div className="audiences">
          <h2 className="section-title">
            THE <span className="text-accent">AI</span> FOR ALL
          </h2>
          <div className="audience-cards">
            {audiences.map((item) => (
              <button
                type="button"
                className="audience-card"
                key={item.id}
                onClick={() => onSelect(item)}
              >
                <img
                  src={item.image}
                  alt=""
                  width="462"
                  height="357"
                  loading="lazy"
                />
                <span>
                  {item.label}
                  <ArrowIcon />
                </span>
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
