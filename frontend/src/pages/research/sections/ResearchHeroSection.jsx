import { Link } from "react-router";
import { contentStyle } from "../researchStyles";
import {
  introduction,
  researchIndexPath,
} from "../mocks/researchData";
import { asset } from "../services/researchAssets";
import ResearchAction from "../components/ResearchAction";

const heroSettings = {
  overview: {
    image: "overview-hero",
    left: "16.56%",
    width: "66.88%",
    top: 115,
    minHeight: "clamp(650px, 48.6vw, 933px)",
  },
  programs: {
    image: "programs-hero",
    left: "15.99%",
    width: "67.97%",
    top: 75,
    minHeight: "clamp(650px, 49.17vw, 944px)",
  },
  observatory: {
    image: "observatory-hero",
    left: "26.38%",
    width: "51.27%",
    top: -1,
    minHeight: "clamp(640px, 47.5vw, 912px)",
  },
};

export default function ResearchHeroSection({ variant = "overview" }) {
  const programs = variant === "programs";
  const observatory = variant === "observatory";
  const settings = programs
    ? heroSettings.programs
    : observatory
      ? heroSettings.observatory
      : heroSettings.overview;

  return (
    <section
      style={{
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        minHeight: settings.minHeight,
        textAlign: "center",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "max(100%, 1000px)",
          maxWidth: 1920,
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <img
          src={asset(settings.image)}
          alt=""
          style={{
            position: "absolute",
            left: settings.left,
            top: settings.top,
            width: settings.width,
            maxWidth: "none",
            height: "auto",
            transform: observatory
              ? "rotate(9.29891deg)"
              : undefined,
            transformOrigin: "top left",
          }}
        />
      </div>

      <h1
        style={{
          position: programs || observatory ? "relative" : "absolute",
          top: programs || observatory ? undefined : 80,
          left: programs || observatory ? undefined : "50%",
          transform: programs || observatory ? undefined : "translateX(-50%)",
          width: programs || observatory
            ? undefined
            : "min(717px, calc(100% - 48px))",
          margin: "0 auto",
          padding: programs || observatory
            ? "clamp(52px, 5vw, 96px) 24px 0"
            : 0,
          maxWidth: 840,
          fontSize: "clamp(34px, 3.125vw, 60px)",
          lineHeight: programs || observatory ? 1.22 : 1.25,
          letterSpacing: "-1.5px",
          fontWeight: 500,
        }}
      >
        {programs ? (
          "Research Programs"
        ) : observatory ? (
          <>
            Impacting World
            <br />
            through Intelligence.
          </>
        ) : (
          <>
            Intelligence that moves
            <br />
            beyond ANSWERS.
          </>
        )}
      </h1>

      {observatory ? (
        <div
          style={{
            ...contentStyle,
            position: "absolute",
            bottom: 100,
            left: "50%",
            transform: "translateX(-50%)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            color: "#bbb",
            fontSize: "clamp(13px, 1.25vw, 24px)",
            lineHeight: 1.3,
          }}
        >
          {[1, 2, 3, 4].map((number) => (
            <Link key={number} to="#analytics">
              USE CASE
              <br />
              number {number}
            </Link>
          ))}
        </div>
      ) : (
        <>
          <p
          style={{
            position: "absolute",
            top: programs ? undefined : "min(733px, calc(100% - 198px))",
            fontSize: programs ? 20 : 18,
            lineHeight: programs ? "25px" : "23px",
            bottom: programs ? 156 : undefined,
            left: programs ? "50%" : "48.83%",
            transform: "translateX(-50%)",
            width: programs
              ? "min(500px, calc(100% - 48px))"
              : "min(427px, calc(100% - 48px))",
            color: "#aaa",
            margin: 0,
          }}
        >
          {introduction}
        </p>

          <div
            style={{
              position: "absolute",
              bottom: programs ? 58 : 60,
              left: 0,
              right: 0,
            }}
          >
            <ResearchAction
              wide
              to={programs ? "#programs" : researchIndexPath}
            >
              {programs ? "Explore Programs" : "Research Index"} ↗
            </ResearchAction>
          </div>
        </>
      )}
    </section>
  );
}