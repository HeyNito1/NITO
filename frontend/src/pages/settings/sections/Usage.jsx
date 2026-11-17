import { useState } from "react";
import { Link } from "react-router";
import { useChat } from "@/hooks/useChat";
import { Card, Row } from "../components/Controls";
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
function localDate(time) {
  return new Date(time).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}
export default function Usage() {
  const { conversations } = useChat();
  const [now] = useState(() => Date.now());
  const currentYear = Number(
    new Date(now).toLocaleDateString("en", {
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }),
  );
  const [year, setYear] = useState(currentYear);
  const [selected, setSelected] = useState(null);
  const counts = Array(12).fill(0);
  let today = 0;
  for (const chat of conversations)
    for (const tab of chat.tabs)
      for (const message of tab.messages) {
        if (message.role !== "user") continue;
        const time = message.createdAt || chat.createdAt;
        const parts = new Intl.DateTimeFormat("en", {
          year: "numeric",
          month: "numeric",
          timeZone: "Asia/Kolkata",
        }).formatToParts(new Date(time));
        if (Number(parts.find((p) => p.type === "year").value) === year)
          counts[Number(parts.find((p) => p.type === "month").value) - 1]++;
        if (localDate(time) === localDate(now)) today++;
      }
  const max = Math.max(5, ...counts);
  return (
    <>
      <Card title="Daily Limits">
        <div className="flex flex-wrap justify-between gap-2 py-2 text-sm">
          <p>{today} messages sent today</p>
          <p className="settings-muted">Local demo • No server quota</p>
        </div>
        <progress
          className="settings-progress"
          value={today ? 1 : 0}
          max="1"
          aria-label="Local demo has no daily server quota"
        />
      </Card>
      <Card title="Your Plan">
        <Row label="Current Plan">Free</Row>
        <Row
          label={
            <span>
              <Link className="text-blue-400 underline" to="/settings/billing">
                Upgrade
              </Link>{" "}
              for more usage and higher capabilities.
            </span>
          }
        >
          <Link
            className="settings-action settings-white-button"
            to="/settings/billing"
          >
            View Plans
          </Link>
        </Row>
      </Card>
      <Card
        title="History"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous year"
              className="settings-action"
              onClick={() => setYear(year - 1)}
            >
              ‹
            </button>
            <span>{year}</span>
            <button
              type="button"
              className="settings-action"
              aria-label="Next year"
              disabled={year >= currentYear}
              onClick={() => setYear(year + 1)}
            >
              ›
            </button>
          </div>
        }
      >
        <div className="settings-chart" aria-label={`Messages sent in ${year}`}>
          <div className="settings-chart-axis">
            {[
              max,
              Math.round(max * 0.75),
              Math.round(max * 0.5),
              Math.round(max * 0.25),
              0,
            ].map((v, i) => (
              <span key={i}>{v}</span>
            ))}
          </div>
          <div className="settings-chart-bars">
            {months.map((month, index) => (
              <button
                key={month}
                className={`settings-chart-month ${selected === index ? "is-selected" : ""}`}
                type="button"
                aria-label={`${month} ${year}: ${counts[index]} messages`}
                onClick={() => setSelected(index)}
              >
                <span className="settings-bar-area">
                  <span
                    style={{
                      height: `${(counts[index] / max) * 100}%`,
                      minHeight: counts[index] ? 3 : 0,
                    }}
                  />
                </span>
                <span>{month}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="settings-muted mt-4 text-xs" role="status">
          {selected !== null
            ? `${months[selected]} ${year}: ${counts[selected]} messages. `
            : ""}
          Counts are based on saved conversations in this browser; deleted chats
          are excluded. Older messages use their conversation’s creation date.
        </p>
      </Card>
    </>
  );
}
