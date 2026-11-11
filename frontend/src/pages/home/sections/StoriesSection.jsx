import Container from "@/components/ui/Container";
export default function StoriesSection({ metrics, stories }) {
  return (
    <section
      id="stories"
      className="stories-section section-surface"
      aria-labelledby="stories-title"
    >
      <Container>
        <div className="stories-heading">
          <div>
            <p className="stories-eyebrow">Trusted by VISIONARIES</p>
            <h2 id="stories-title" className="section-title">
              Stories that TOUCHED us.
            </h2>
          </div>
          <dl className="metrics">
            {metrics.map((metric) => (
              <div key={metric.id}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="story-grid">
          {stories.map((story) => (
            <figure className="story-card" key={story.id}>
              <img
                src={story.image}
                alt={story.alt}
                width="420"
                height="394"
                loading="lazy"
              />
              <figcaption>{story.caption}</figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
