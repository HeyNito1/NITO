import {
  defaultAppearance,
  settingsStore,
  useSettings,
} from "@/services/settingsStore";
import { Action, Card, Row, Select } from "../components/Controls";

const themes = [
  ["obsidian", "Obsidian Grey"],
  ["crimson", "Crimson Red"],
  ["midnight", "Midnight Blue"],
  ["arctic", "Arctic White"],
];
export default function Appearance() {
  const { data } = useSettings();
  const a = data.appearance;
  const change = (key, value) =>
    settingsStore.update("appearance", { [key]: value });
  return (
    <>
      <Card
        title="Colors"
        action={
          <Select
            label="Color mode"
            value={a.mode}
            onChange={(mode) =>
              settingsStore.update("appearance", {
                mode,
                theme:
                  mode === "light"
                    ? "arctic"
                    : a.theme === "arctic"
                      ? "obsidian"
                      : a.theme,
              })
            }
            options={[
              ["dark", "Dark"],
              ["light", "Light"],
              ["system", "System"],
            ]}
          />
        }
      >
        <div className="settings-theme-grid">
          {themes.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={a.theme === id}
              onClick={() =>
                settingsStore.update("appearance", {
                  theme: id,
                  mode: id === "arctic" ? "light" : "dark",
                })
              }
              className={`settings-theme-option ${a.theme === id ? "is-selected" : ""}`}
            >
              <span className={`settings-theme-preview preview-${id}`}>
                <span className="preview-sidebar">
                  <i />
                </span>
                <span className="preview-conversation">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card
        title="Fonts & Motion"
        action={
          <Action
            onClick={() =>
              settingsStore.update("appearance", { ...defaultAppearance })
            }
          >
            Reset ⟳
          </Action>
        }
      >
        <Row label="Font Size">
          <Select
            label="Font Size"
            value={a.size}
            onChange={(v) => change("size", v)}
            options={[
              ["small", "Small"],
              ["medium", "Medium"],
              ["large", "Large"],
            ]}
          />
        </Row>
        <Row label="Interface Font">
          <Select
            label="Interface Font"
            value={a.interfaceFont}
            onChange={(v) => change("interfaceFont", v)}
            options={[
              ["sans", "Sans-serif"],
              ["serif", "Serif"],
              ["mono", "Monospace"],
            ]}
          />
        </Row>
        <Row label="Response Font">
          <Select
            label="Response Font"
            value={a.responseFont}
            onChange={(v) => change("responseFont", v)}
            options={[
              ["sans", "Sans-serif"],
              ["serif", "Serif"],
              ["mono", "Monospace"],
            ]}
          />
        </Row>
        <Row label="Reduced Motion">
          <Select
            label="Reduced Motion"
            value={a.motion}
            onChange={(v) => change("motion", v)}
            options={[
              ["system", "System"],
              ["reduce", "On"],
              ["full", "Off"],
            ]}
          />
        </Row>
      </Card>
    </>
  );
}
