import { useState } from "react";
import { settingsStore, useSettings } from "@/services/settingsStore";
import { useNotice } from "@/context/NoticeContext";
import {
  Action,
  Card,
  Field,
  Modal,
  Row,
  Toggle,
} from "../components/Controls";
import { downloadFile } from "../download";
export default function AdPreferences() {
  const { data } = useSettings();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(data.adDraft);
  const [hidden, setHidden] = useState(false);
  const { notify } = useNotice();
  return (
    <>
      {!hidden && (
        <Card
          title="Create your Ad"
          action={
            <Action
              aria-label="Dismiss ad creation card"
              onClick={() => setHidden(true)}
            >
              ×
            </Action>
          }
        >
          <div className="settings-ad-creation">
            <p className="settings-muted max-w-[550px] text-sm leading-relaxed">
              Add your website URL, write your suggested ad, and prepare a
              campaign draft.
            </p>
            <Action
              onClick={() => {
                setDraft(data.adDraft);
                setOpen(true);
              }}
            >
              Start Advertisement
            </Action>
          </div>
        </Card>
      )}
      <Card title="Your ad preferences">
        <Row label="Personalized advertising">
          <Toggle
            label="Personalized advertising"
            checked={data.privacy.advertising}
            onChange={(advertising) =>
              settingsStore.update("privacy", { advertising })
            }
          />
        </Row>
        <Row label="Show advertisement design preview">
          <Toggle
            label="Show advertisement design preview"
            checked={data.privacy.showAdPreview}
            onChange={(showAdPreview) =>
              settingsStore.update("privacy", { showAdPreview })
            }
          />
        </Row>
        <Row label="Saved campaign draft">
          <Action
            onClick={() => {
              setDraft(data.adDraft);
              setOpen(true);
            }}
          >
            Edit draft
          </Action>
        </Row>
      </Card>
      <p className="settings-footnote">
        Drafts stay in your browser. No advertising network, audience targeting,
        or campaign publishing is connected.
      </p>
      {open && (
        <Modal
          title="Create an advertisement draft"
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const url = new URL(draft.url);
              if (!["https:", "http:"].includes(url.protocol)) {
                notify("Use an https:// or http:// website URL.");
                return;
              }
              settingsStore.update("adDraft", draft);
              setOpen(false);
              notify("Campaign draft saved locally.");
            }}
          >
            <Field
              label="Website URL"
              type="url"
              required
              value={draft.url}
              placeholder="https://example.com"
              onChange={(url) => setDraft({ ...draft, url })}
            />
            <Field
              label="Headline"
              required
              maxLength={80}
              value={draft.headline}
              onChange={(headline) => setDraft({ ...draft, headline })}
            />
            <label className="settings-field">
              <span>Suggested ad</span>
              <textarea
                required
                maxLength={400}
                rows="4"
                value={draft.description}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value })
                }
              />
            </label>
            <div className="settings-ad-preview">
              <span className="settings-muted text-xs">Ad preview</span>
              <h3 className="my-2">{draft.headline || "Your headline"}</h3>
              <p className="text-sm">
                {draft.description || "Your suggested ad will appear here."}
              </p>
              <p className="settings-muted mt-3 break-all text-xs">
                {draft.url}
              </p>
            </div>
            <div className="settings-dialog-actions">
              <Action
                onClick={() => downloadFile("nito-campaign-draft.json", draft)}
              >
                Export draft
              </Action>
              <button className="settings-primary" type="submit">
                Save draft
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
