import { useRef } from "react";
import { font, headingStyle, paragraphStyle } from "../researchStyles";
import { shortCopy } from "../mocks/researchData";
import { asset } from "../services/researchAssets";
import ResearchAction from "./ResearchAction";

export default function ResearchCard({
  image,
  title,
  description = shortCopy,
  large = false,
  ratio = "1",
  imageHeight,
}) {
  const dialog = useRef(null);
  return (
    <article style={{ minWidth: 0 }}>
      <button
        type="button"
        aria-label={`Read ${title}`}
        onClick={() => dialog.current.showModal()}
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          border: 0,
          background: "none",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <img
          src={asset("cardimage")}
          alt=""
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: imageHeight || "auto",
            aspectRatio: imageHeight ? undefined : ratio,
            objectFit: "cover",
            borderRadius: 10,
            border: "1px solid #9b9b9b",
          }}
        />
        <h3
          style={{
            margin: large ? "30px 0 12px" : "24px 0 14px",
            fontWeight: 400,
            fontSize: large ? 32 : 22,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
      </button>
      <p
        style={{
          ...paragraphStyle,
          fontSize: large ? 22 : 14,
          textAlign: large ? "justify" : "left",
        }}
      >
        {description}
      </p>
      <dialog
        ref={dialog}
        aria-label={title}
        style={{
          margin: "auto",
          width: "min(560px, calc(100% - 40px))",
          maxHeight: "80dvh",
          overflowY: "auto",
          padding: 28,
          border: "1px solid #777",
          borderRadius: 20,
          color: "#fff",
          background: "#141414",
          fontFamily: font,
        }}
      >
        <h2 style={{ ...headingStyle, fontSize: 28 }}>{title}</h2>
        <p style={{ ...paragraphStyle, margin: "20px 0" }}>{description}</p>
        <p style={{ ...paragraphStyle, marginBottom: 24 }}>
          This design contains placeholder copy. Full research details have not
          been supplied yet.
        </p>
        <ResearchAction onClick={() => dialog.current.close()}>Close</ResearchAction>
      </dialog>
    </article>
  );
}
