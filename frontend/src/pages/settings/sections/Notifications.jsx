import { settingsStore, useSettings } from "@/services/settingsStore";
import { useNotice } from "@/context/NoticeContext";
import { Card, Row, Toggle } from "../components/Controls";
const push = [
  ["finished", "Finished Response"],
  ["payables", "Payables"],
  ["usage", "Usage"],
];
const emails = [
  ["releases", "Latest Releases"],
  ["tips", "Personalized tips"],
  ["emailPayables", "Payables"],
  ["events", "NITO Events"],
  ["campaigns", "Social Campaigns"],
];
export default function Notifications() {
  const { data } = useSettings();
  const { notify } = useNotice();
  async function change(key, value) {
    if (key === "finished" && value) {
      if (!("Notification" in window)) {
        notify("This browser does not support desktop notifications.");
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          notify(
            "Allow notifications in your browser settings to enable response alerts.",
          );
          return;
        }
      } catch {
        notify("Your browser could not enable notifications.");
        return;
      }
    }
    settingsStore.update("notifications", { [key]: value });
  }
  return (
    <>
      <Card title="Push Notifications">
        {push.map(([key, label]) => (
          <Row key={key} label={label}>
            <Toggle
              label={label}
              checked={data.notifications[key]}
              onChange={(v) => change(key, v)}
            />
          </Row>
        ))}
      </Card>
      <Card title="Email Notifications">
        {emails.map(([key, label]) => (
          <Row key={key} label={label}>
            <Toggle
              label={label}
              checked={data.notifications[key]}
              onChange={(v) => change(key, v)}
            />
          </Row>
        ))}
      </Card>
      <p className="settings-footnote">
        Response alerts work in this browser while NITO is open in the
        background. Other notification choices are saved preferences; email,
        billing, and quota alerts require connected services.
      </p>
    </>
  );
}
