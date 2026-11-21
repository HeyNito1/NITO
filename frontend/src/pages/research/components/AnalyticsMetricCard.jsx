export default function AnalyticsMetricCard({ number }) {
  return (
    <div
      style={{
        minHeight: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        background: "#000",
        padding: "24px clamp(20px, 2.1vw, 40px)",
        border: "1px solid #555",
        borderRadius: 20,
      }}
    >
      <span
        style={{
          fontSize: "clamp(16px, 1.25vw, 24px)",
          lineHeight: 1.4,
        }}
      >
        {number} AI Adoption
        <br />
        Rate{" "}
        <span
          title="Illustrative figure from the Figma design"
          style={{ fontSize: 15 }}
        >
          ⓘ
        </span>
      </span>
      <span
        style={{
          fontSize: "clamp(32px, 2.5vw, 48px)",
          whiteSpace: "nowrap",
        }}
      >
        64% <span style={{ color: "#80ff00", fontSize: 24 }}>⌃</span>
      </span>
    </div>
  );
}
