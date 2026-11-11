import { useEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import ArrowIcon from "@/components/ui/ArrowIcon";

export default function CapabilitiesSection({ items }) {
  const trackRef = useRef(null);
  const [limits, setLimits] = useState({
    previous: false,
    next: true,
  });

  useEffect(() => {
    const track = trackRef.current;

    function updateLimits() {
      const previous = track.scrollLeft > 2;
      const next =
        track.scrollLeft + track.clientWidth < track.scrollWidth - 2;

      setLimits((current) =>
        current.previous === previous && current.next === next
          ? current
          : { previous, next },
      );
    }

    function handleWheel(event) {
      // Preserve pinch-to-zoom and native horizontal trackpad scrolling.
      if (
        event.ctrlKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      ) {
        return;
      }

      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? track.clientWidth
            : 1;

      const next = Math.max(
        0,
        Math.min(
          track.scrollWidth - track.clientWidth,
          track.scrollLeft + event.deltaY * unit,
        ),
      );

      // At either end, let the page scroll normally.
      if (Math.abs(next - track.scrollLeft) < 1) return;

      event.preventDefault();
      track.scrollLeft = next;
    }

    const observer = new ResizeObserver(updateLimits);
    observer.observe(track);

    track.addEventListener("scroll", updateLimits, { passive: true });
    track.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateLimits);
      track.removeEventListener("wheel", handleWheel);
    };
  }, [items.length]);

  function move(direction) {
    const track = trackRef.current;
    const gap =
      parseFloat(window.getComputedStyle(track).columnGap) || 0;

    track.scrollBy({
      left: direction * (track.clientWidth + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "instant"
        : "smooth",
    });
  }

  const goBack = !limits.next && limits.previous;

  return (
    <section
      id="capabilities"
      className="capabilities-section section-surface"
      aria-labelledby="capabilities-title"
    >
      <Container>
        <h2 id="capabilities-title" className="section-title">
          Capabilities and Powers
          <br />
          of NITO
        </h2>

        <div className="capabilities-layout">
          <div
            ref={trackRef}
            className="flex gap-7 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            tabIndex={0}
            role="group"
            aria-label="NITO capability cards"
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                className="min-w-0 shrink-0 basis-[85%] min-[601px]:basis-[calc((100%_-_1.75rem)/2)] min-[1101px]:basis-[calc((100%_-_3.5rem)/3)]"
                role="group"
                aria-label={`Card ${index + 1} of ${items.length}`}
              >
                <article className="capability-card">
                  <img
                    src={item.image}
                    alt=""
                    width="487"
                    height="459"
                    loading="lazy"
                  />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="carousel-next"
            aria-label={
              goBack ? "Previous capabilities" : "Next capabilities"
            }
            disabled={!limits.previous && !limits.next}
            onClick={() => move(goBack ? -1 : 1)}
          >
            <ArrowIcon className={goBack ? "rotate-180" : ""} />
          </button>
        </div>
      </Container>
    </section>
  );
}