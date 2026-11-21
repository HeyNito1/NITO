import ResearchAction from "./ResearchAction";
import ResearchSectionHeading from "./ResearchSectionHeading";

export default function ResearchFilters({
  filtersOpen,
  setFiltersOpen,
  query,
  order,
  update,
  reset,
}) {
  return (
    <>
      <ResearchSectionHeading
        style={{ marginBottom: 58 }}
        action={
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="research-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "none",
              border: 0,
              color: "#fff",
              fontSize: 24,
            }}
          >
            Filter{" "}
            <svg
              aria-hidden="true"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 6h18M3 12h18M3 18h18M8 3v6M16 9v6M9 15v6" />
            </svg>
          </button>
        }
      >
        Research
      </ResearchSectionHeading>
      {filtersOpen && (
        <div
          id="research-filters"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            padding: 24,
            marginBottom: 48,
            border: "1px solid #555",
            borderRadius: 16,
          }}
        >
          <label style={{ flex: "1 1 220px" }}>
            Search research
            <input
              type="search"
              value={query}
              onChange={(event) => update("q", event.target.value)}
              style={{
                display: "block",
                width: "100%",
                marginTop: 10,
                background: "#141414",
                color: "#fff",
                padding: 12,
                border: "1px solid #888",
                borderRadius: 8,
              }}
            />
          </label>
          <label>
            Display order
            <select
              value={order}
              onChange={(event) => update("order", event.target.value)}
              style={{
                display: "block",
                marginTop: 10,
                background: "#141414",
                color: "#fff",
                padding: 12,
                border: "1px solid #888",
                borderRadius: 8,
              }}
            >
              <option value="default">Design order</option>
              <option value="reverse">Reverse order</option>
            </select>
          </label>
          <ResearchAction onClick={reset}>Reset</ResearchAction>
        </div>
      )}
    </>
  );
}
