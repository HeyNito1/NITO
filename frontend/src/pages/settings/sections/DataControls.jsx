import { useState } from "react";
import { Link } from "react-router";
import { useChat } from "@/hooks/useChat";
import { settingsStore, useSettings } from "@/services/settingsStore";
import { useNotice } from "@/context/NoticeContext";
import {
  Action,
  Card,
  Empty,
  Modal,
  Row,
  Toggle,
} from "../components/Controls";
import { downloadFile } from "../download";
export default function DataControls() {
  const { data } = useSettings();
  const chats = useChat();
  const { notify } = useNotice();
  const [dialog, setDialog] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  function exportData() {
    downloadFile("nito-data.json", {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: data,
      conversations: chats.conversations,
    });
    notify("Your local data export was downloaded.");
    setDialog(null);
  }
  async function location(enabled) {
    if (!enabled) {
      settingsStore.update("privacy", { location: false });
      return;
    }
    if (!navigator.geolocation) {
      notify("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        settingsStore.update("privacy", { location: true });
        notify("Location access allowed. No coordinates were saved.");
      },
      () => notify("Location access was denied or unavailable."),
      { timeout: 10000 },
    );
  }
  return (
    <>
      <Card title="Personal Data">
        <Row label="Shared Links">
          <Action onClick={() => setDialog("links")}>Manage</Action>
        </Row>
        <Row label="App Access">
          <Action onClick={() => setDialog("apps")}>Manage</Action>
        </Row>
        <Row label="Location">
          <Toggle
            label="Location"
            checked={data.privacy.location}
            onChange={location}
          />
        </Row>
        <Row label="Train NITO using your conversations">
          <Toggle
            label="Train NITO using your conversations"
            checked={data.privacy.training}
            onChange={(training) =>
              settingsStore.update("privacy", { training })
            }
          />
        </Row>
      </Card>
      <Card title="Chats">
        <Row label="Delete all Chats">
          <Action
            onClick={() => {
              setConfirmation("");
              setDialog("delete");
            }}
          >
            Manage
          </Action>
        </Row>
        <Row label="Export Data">
          <Action onClick={() => setDialog("export")}>Manage</Action>
        </Row>
        <Row label="Ad Control">
          <Link className="settings-action" to="/settings/ad-preferences">
            Manage
          </Link>
        </Row>
        <Row label="Cookie Preferences">
          <Action onClick={() => setDialog("cookies")}>Manage</Action>
        </Row>
        <Row label="Archive all Chats">
          <Action
            disabled={!chats.conversations.some((c) => !c.archived)}
            onClick={() => {
              chats.archiveAll(true);
              notify("All conversations archived.");
            }}
          >
            Archive
          </Action>
        </Row>
      </Card>
      <p className="settings-footnote">
        Training consent is a local preference; demo conversations are not sent
        to a training service. Location access does not save your coordinates.
      </p>
      {dialog && (
        <Modal
          title={
            {
              links: "Shared links",
              apps: "App access",
              delete: "Delete all local chats",
              export: "Export your data",
              cookies: "Cookie preferences",
            }[dialog]
          }
          onClose={() => setDialog(null)}
        >
          {dialog === "links" && (
            <>
              <Empty>
                No public share links exist. Sharing a reply copies its text or
                opens the device share sheet; it does not publish a
                conversation.
              </Empty>
              <Action onClick={() => setDialog(null)}>Close</Action>
            </>
          )}
          {dialog === "apps" && (
            <>
              <Empty>
                No external applications have access to your NITO account.
                Profile links are bookmarks, not OAuth connections.
              </Empty>
              <Link className="settings-action" to="/profile">
                Manage profile links
              </Link>
            </>
          )}
          {dialog === "export" && (
            <>
              <p className="text-sm leading-relaxed">
                Download your profile, settings, and{" "}
                {chats.conversations.length} conversations, including archived
                chats and all tabs, as JSON. The file contains personal data;
                attachment bytes are not included.
              </p>
              <div className="settings-dialog-actions">
                <Action onClick={() => setDialog(null)}>Cancel</Action>
                <Action onClick={exportData}>Download JSON</Action>
              </div>
            </>
          )}
          {dialog === "delete" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (confirmation !== "DELETE") return;
                chats.clear();
                setDialog(null);
                notify("All local chats and legacy chat backups deleted.");
              }}
            >
              <p className="text-sm leading-relaxed">
                Permanently delete {chats.conversations.length} conversations,
                including archived chats and all tabs. Profile and settings will
                remain. Download an export first if you need a backup.
              </p>
              <label className="settings-field mt-5">
                <span>Type DELETE to confirm</span>
                <input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="off"
                />
              </label>
              <div className="settings-dialog-actions">
                <Action onClick={() => setDialog(null)}>Cancel</Action>
                <button
                  type="submit"
                  className="settings-primary bg-red-700!"
                  disabled={confirmation !== "DELETE"}
                >
                  Delete all chats
                </button>
              </div>
            </form>
          )}
          {dialog === "cookies" && (
            <>
              <Row
                label="Essential storage"
                description="Stores your local chats and preferences."
              >
                <span className="settings-muted text-sm">Always active</span>
              </Row>
              {[
                ["analytics", "Analytics"],
                ["personalization", "Personalization"],
                ["advertising", "Advertising"],
              ].map(([key, label]) => (
                <Row key={key} label={label}>
                  <Toggle
                    label={label}
                    checked={data.privacy[key]}
                    onChange={(v) =>
                      settingsStore.update("privacy", { [key]: v })
                    }
                  />
                </Row>
              ))}
              <p className="settings-footnote mt-5">
                These choices are saved locally. No third-party analytics or
                advertising scripts are installed.
              </p>
              <div className="settings-dialog-actions">
                <Action onClick={() => setDialog(null)}>Done</Action>
              </div>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
