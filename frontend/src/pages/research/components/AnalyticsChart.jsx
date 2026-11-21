import { font } from "../researchStyles";

export default function AnalyticsChart() {
  const groups = [
    [680, 550],
    [680, 770],
    [575, 650],
    [680, 725],
    [770, 815],
  ];
  return (
    <svg
      viewBox="0 0 820 550"
      role="img"
      aria-label="Illustrative analytics from the Figma design; gray and blue comparison bars for five periods. This is not live usage data."
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        overflow: "visible",
      }}
    >
      {[0, 100, 200, 300, 400, 500, 600, 700, 800].map((value) => (
        <text
          key={value}
          x="46"
          y={494 - value / 2}
          textAnchor="end"
          fill="#858585"
          fontSize="20"
          fontFamily={font}
        >
          {value}
        </text>
      ))}
      <path d="M60 70V480H800" fill="none" stroke="#aaa" />
      {groups.map(([gray, blue], index) => (
        <g key={index}>
          <rect
            x={105 + index * 124}
            y={480 - gray / 2}
            width="34"
            height={gray / 2}
            rx="4"
            fill="#999"
          />
          <rect
            x={145 + index * 124}
            y={480 - blue / 2}
            width="34"
            height={blue / 2}
            rx="4"
            fill="#0066ff"
          />
          <text
            x={143 + index * 124}
            y="514"
            textAnchor="middle"
            fill="#858585"
            fontSize="20"
            fontFamily={font}
          >
            {["01/26", "02/26", "03/26", "04/26", "04/26"][index]}
          </text>
        </g>
      ))}
    </svg>
  );
}
