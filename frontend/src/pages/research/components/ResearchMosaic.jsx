import { Link } from "react-router";
import { asset } from "../services/researchAssets";
import { researchIndexPath } from "../mocks/researchData";

export default function ResearchMosaic({ observatory = false }) {
  const items = [
    {
      image: observatory ? "frontier-wave" : "research-wave",
      label: observatory ? "Our Models" : "Multi Agent Model",
      to: observatory ? "/discover/mighty" : researchIndexPath,
    },
    {
      image: observatory ? "frontier-stream" : "research-stream",
      label: observatory ? "Research Papers" : "Multi Agent Model",
      to: researchIndexPath,
    },
    {
      image: observatory ? "frontier-earth" : "research-earth",
      label: observatory ? "Recent Releases" : "Multi Agent Model",
      to: researchIndexPath,
    },
  ];

  function renderTile(item, tall = false) {
    return (
      <Link
        key={item.image}
        to={item.to}
        style={{
          position: "relative",
          display: "block",
          overflow: "hidden",
          border: "1px solid #888",
          borderRadius: 26,
          aspectRatio: tall ? "653 / 487" : "653 / 233",
          color: "#fff",
        }}
      >
        <img
          src={asset(item.image)}
          alt=""
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <span
          style={{
            position: "absolute",
            bottom: 20,
            right: 28,
            fontSize: tall ? 28 : 24,
            textShadow: "0 2px 8px #000",
          }}
        >
          {item.label} →
        </span>
      </Link>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 30,
        marginTop: 56,
      }}
    >
      <div style={{ flex: "1 1 290px", minWidth: 0 }}>
        {renderTile(items[0], true)}
      </div>

      <div
        style={{
          flex: "1 1 290px",
          minWidth: 0,
          display: "grid",
          gap: 20,
        }}
      >
        {items.slice(1).map((item) => renderTile(item))}
      </div>
    </div>
  );
}