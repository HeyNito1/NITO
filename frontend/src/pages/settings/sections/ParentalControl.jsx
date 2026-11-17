import { useState } from "react";
import { settingsStore, useSettings } from "@/services/settingsStore";
import {
  Action,
  Card,
  Empty,
  Field,
  Modal,
  Row,
  Toggle,
} from "../components/Controls";
import { useNotice } from "@/context/NoticeContext";
const categories = [
  ["research", "Research"],
  ["writing", "Content"],
  ["api-platform", "Coding"],
  ["creatives", "Creative"],
];
export default function ParentalControl() {
  const { data } = useSettings();
  const { notify } = useNotice();
  const [dialog, setDialog] = useState(null);
  const [draft, setDraft] = useState({ name: "", dailyLimit: 20, blocked: [] });
  function edit(member) {
    setDraft(
      member || {
        id: crypto.randomUUID(),
        name: "",
        dailyLimit: 20,
        blocked: [],
      },
    );
    setDialog("edit");
  }
  return (
    <>
      <Card
        title="Family"
        action={
          <Action onClick={() => edit(null)} aria-label="Add family profile">
            ＋
          </Action>
        }
      >
        {data.family.length ? (
          <div className="grid gap-3 py-1">
            {data.family.map((member) => (
              <div key={member.id} className="settings-list-row">
                <button
                  className="min-w-0 flex-1 truncate text-left"
                  onClick={() => edit(member)}
                >
                  {member.name}
                </button>
                <span className="settings-muted text-xs">
                  {data.activeFamilyId === member.id
                    ? "Active locally"
                    : "Local profile"}
                </span>
                <button
                  type="button"
                  aria-label={`Edit ${member.name}`}
                  onClick={() => edit(member)}
                >
                  ›
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            Add a family profile to set a daily message limit and allowed
            categories in this browser.
          </Empty>
        )}
      </Card>
      {data.activeFamilyId && (
        <Card title="Current family mode">
          <Row
            label={data.family.find((m) => m.id === data.activeFamilyId)?.name}
          >
            <Action
              onClick={() => {
                settingsStore.set("activeFamilyId", "");
                notify("Local family mode ended.");
              }}
            >
              End family mode
            </Action>
          </Row>
        </Card>
      )}
      <p className="settings-footnote">
        Local demo controls apply only in this browser and can be changed here.
        They are not secure parental supervision. Account linking, invitations,
        and tamper-resistant enforcement need a backend.
      </p>
      {dialog === "edit" && (
        <Modal
          title={
            data.family.some((m) => m.id === draft.id)
              ? "Edit family profile"
              : "Add family profile"
          }
          onClose={() => setDialog(null)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              settingsStore.set("family", [
                ...data.family.filter((m) => m.id !== draft.id),
                draft,
              ]);
              setDialog(null);
              notify("Family profile saved in this browser.");
            }}
          >
            <Field
              label="Name"
              value={draft.name}
              required
              maxLength={50}
              onChange={(name) => setDraft({ ...draft, name })}
            />
            <Field
              label="Daily message limit"
              type="number"
              value={draft.dailyLimit}
              min="1"
              max="500"
              required
              onChange={(v) => setDraft({ ...draft, dailyLimit: Number(v) })}
            />
            <div className="my-4">
              {categories.map(([key, label]) => (
                <Row key={key} label={`Allow ${label}`}>
                  <Toggle
                    label={`Allow ${label}`}
                    checked={!draft.blocked.includes(key)}
                    onChange={(allowed) =>
                      setDraft({
                        ...draft,
                        blocked: allowed
                          ? draft.blocked.filter((x) => x !== key)
                          : [...draft.blocked, key],
                      })
                    }
                  />
                </Row>
              ))}
            </div>
            <div className="settings-dialog-actions">
              <Action onClick={() => setDialog(null)}>Cancel</Action>
              <button type="submit" className="settings-primary">
                Save profile
              </button>
            </div>
          </form>
          {data.family.some((m) => m.id === draft.id) && (
            <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              <Action
                onClick={() => {
                  settingsStore.set("activeFamilyId", draft.id);
                  setDialog(null);
                  notify(`Local family mode started for ${draft.name}.`);
                }}
              >
                Use this profile
              </Action>
              <Action danger onClick={() => setDialog("remove")}>
                Remove profile
              </Action>
            </div>
          )}
        </Modal>
      )}
      {dialog === "remove" && (
        <Modal title="Remove family profile?" onClose={() => setDialog(null)}>
          <p className="text-sm">
            Remove {draft.name} and their local restrictions? This will not
            delete any conversations.
          </p>
          <div className="settings-dialog-actions">
            <Action onClick={() => setDialog("edit")}>Cancel</Action>
            <Action
              danger
              onClick={() => {
                if (data.activeFamilyId === draft.id)
                  settingsStore.set("activeFamilyId", "");
                settingsStore.set(
                  "family",
                  data.family.filter((m) => m.id !== draft.id),
                );
                setDialog(null);
              }}
            >
              Remove
            </Action>
          </div>
        </Modal>
      )}
    </>
  );
}
