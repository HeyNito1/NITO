import { settingsStore, useSettings } from "@/services/settingsStore";
import { Card, Row, Toggle } from "../components/Controls";
const skills = [
  ["general", "General", "Everyday questions and conversations"],
  ["research", "Research", "Explore a topic in more depth"],
  ["writing", "Content", "Writing, editing, and summarising"],
  ["api-platform", "Coding", "Programming and technical questions"],
  ["creatives", "Creative", "Brainstorm ideas and creative projects"],
];
export default function Skills() {
  const { data } = useSettings();
  return (
    <>
      <Card title="Your Skills">
        {skills.map(([key, label, description]) => (
          <Row key={key} label={label} description={description}>
            <Toggle
              label={`${label} skill`}
              checked={data.skills.includes(key)}
              onChange={(v) =>
                settingsStore.set(
                  "skills",
                  v
                    ? [...data.skills, key]
                    : data.skills.filter((x) => x !== key),
                )
              }
            />
          </Row>
        ))}
      </Card>
      <p className="settings-footnote">
        Choose the categories shown on your empty chat screen. Existing
        conversation categories stay intact. Replies remain demonstrations.
      </p>
    </>
  );
}
