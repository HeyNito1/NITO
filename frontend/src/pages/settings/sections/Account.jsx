import { useState } from "react";
import { Link } from "react-router";
import { settingsStore, useSettings } from "@/services/settingsStore";
import {
  Action,
  Card,
  Empty,
  Field,
  Modal,
  Row,
  Select,
} from "../components/Controls";
import { useNotice } from "@/context/NoticeContext";

const profileFields = [
  ["email", "Email", "email"],
  ["username", "Username"],
  ["phone", "Phone Number", "tel"],
  ["dob", "DOB", "date"],
  ["profession", "Profession"],
  ["language", "Preferred Language"],
  ["organization", "Organization ID"],
];
export function ProfileEditor({ onClose, field }) {
  const { data } = useSettings();
  const [draft, setDraft] = useState({ ...data.profile });
  const { notify } = useNotice();
  const fields = field
    ? profileFields.filter(([key]) => key === field)
    : [["name", "Display name"], ["bio", "About you"], ...profileFields];
  return (
    <Modal title="Edit personal information" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          settingsStore.update("profile", draft);
          notify("Profile saved in this browser.");
          onClose();
        }}
      >
        <div className="grid gap-4">
          {fields.map(([key, label, type]) =>
            key === "language" ? (
              <label className="settings-field" key={key}>
                <span>{label}</span>
                <Select
                  label={label}
                  value={draft[key]}
                  options={[
                    "English (US)",
                    "English (UK)",
                    "Hindi",
                    "Spanish",
                    "French",
                  ]}
                  onChange={(v) => setDraft({ ...draft, [key]: v })}
                />
              </label>
            ) : (
              <Field
                key={key}
                label={label}
                name={key}
                type={type}
                value={draft[key]}
                maxLength={key === "bio" ? 200 : 120}
                required={["name", "username"].includes(key)}
                max={
                  key === "dob"
                    ? new Date().toISOString().slice(0, 10)
                    : undefined
                }
                onChange={(v) => setDraft({ ...draft, [key]: v })}
              />
            ),
          )}
        </div>
        <p className="settings-muted mt-4 text-xs">
          Profile details are stored in this browser. Editing an email or phone
          number does not verify it or change a login.
        </p>
        <div className="settings-dialog-actions">
          <Action onClick={onClose}>Cancel</Action>
          <button className="settings-primary" type="submit">
            Save changes
          </button>
        </div>
      </form>
    </Modal>
  );
}
export function PersonalInfo({ editable = true }) {
  const { data } = useSettings();
  const [editing, setEditing] = useState(null);
  const p = data.profile;
  const fields = editable
    ? profileFields
    : profileFields.filter(([key]) => !["phone", "language"].includes(key));
  return (
    <>
      <Card title="Personal Information">
        {fields.map(([key, label]) => (
          <Row key={key} label={label}>
            <span className="break-words text-right">
              {key === "dob" && p[key]
                ? p[key].split("-").reverse().join("-")
                : p[key] || "Not set"}
            </span>
            {editable && (
              <button
                type="button"
                className="settings-edit"
                aria-label={`Edit ${label}`}
                onClick={() => setEditing(key)}
              >
                <img
                  src="/assets/settings/edit.svg"
                  alt=""
                  className="block max-w-none"
                />
              </button>
            )}
          </Row>
        ))}
        <Row
          label={
            <span className="flex items-center gap-3">
              Plan
              <Link className="settings-action" to="/settings/billing">
                Upgrade
              </Link>
            </span>
          }
        >
          Free
        </Row>
      </Card>
      {editing && (
        <ProfileEditor field={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
export default function Account() {
  const [info, setInfo] = useState(null);
  return (
    <>
      <PersonalInfo />
      <Card
        title="Manage Devices"
        action={<Action 
          style={{ color: "#fff", fontWeight: 700, fontSize: "22px" }}
          onClick={() => setInfo("devices")}>⋮</Action>}
      >
        <Row
          label={
            <div className="flex items-center gap-5">
              <img
                src="/assets/settings/windows-device.png"
                className="h-[45px] w-[45px] object-contain"
                alt=""
              />
              <div>
                This browser
                <p className="settings-muted mt-1 text-sm">
                  Local session • Current device
                </p>
              </div>
            </div>
          }
        >
          <Action
            style={{ color: "#fff", fontWeight: 700, fontSize: "22px" }}
            onClick={() => setInfo("devices")}
          >
            ⋮
          </Action>
        </Row>
        <Empty>
          Device sessions become available when you connect an account.
        </Empty>
      </Card>
      <Card title="Disable or Deletion">
        <Row
          label="Disable Account"
          description="Manage your account’s availability."
        >
          <Action
            style={{ color: "#fff", fontWeight: 700, fontSize: "24px" }}
            onClick={() => setInfo("disable")}
          >
            ›
          </Action>
        </Row>
        <Row
          label="Delete Account"
          description="Permanently remove your account and its data."
          danger
        >
          <Action
            aria-label="Delete Account"
            style={{ color: "#fff", fontWeight: 700, fontSize: "22px" }}
            onClick={() => setInfo("delete")}
          >
            ›
          </Action>
        </Row>
      </Card>
      {info && (
        <Modal
          title={
            info === "devices"
              ? "Manage devices"
              : info === "disable"
                ? "Disable account"
                : "Delete account"
          }
          onClose={() => setInfo(null)}
        >
          <p className="text-sm leading-relaxed">
            {info === "devices"
              ? "There is no signed-in account or device session service yet. This page shows only the browser you are using. Remote sign-out requires authentication."
              : "NITO currently saves data only in your browser. Account deletion and disabling require a connected account service; no account has been changed."}
          </p>
          {info !== "devices" && (
            <Link
              to="/settings/data-controls"
              onClick={() => setInfo(null)}
              className="settings-primary mt-6 inline-block"
            >
              Manage local data
            </Link>
          )}
          <div className="settings-dialog-actions">
            <Action onClick={() => setInfo(null)}>Close</Action>
          </div>
        </Modal>
      )}
    </>
  );
}
