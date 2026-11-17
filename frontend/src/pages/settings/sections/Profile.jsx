import { useRef, useState } from "react";
import { settingsStore, useSettings } from "@/services/settingsStore";
import { useNotice } from "@/context/NoticeContext";
import { Action, Card, Field, Modal, Row } from "../components/Controls";
import { PersonalInfo, ProfileEditor } from "./Account";
const platforms = [
  ["LinkedIn", null, "in"],
  ["GitHub", "github.png"],
  ["Canva", "canva.png"],
  ["Figma", "figma.png"],
  ["X", "x.png"],
  ["YouTube", "youtube.png"],
  ["Facebook", "facebook.png"],
  ["Instagram", "instagram.png"],
  ["Behance", "behance.png"],
];
export default function Profile() {
  const { data } = useSettings();
  const { notify } = useNotice();
  const [editing, setEditing] = useState(false);
  const [link, setLink] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [instructions, setInstructions] = useState(data.profile.instructions);
  const [resume, setResume] = useState(data.profile.resume);
  const avatarRef = useRef(null);
  const resumeRef = useRef(null);
  async function share() {
    const text = `${data.profile.name}${data.profile.bio ? ` — ${data.profile.bio}` : ""}`;
    try {
      if (navigator.share)
        await navigator.share({ title: "NITO profile", text });
      else {
        await navigator.clipboard.writeText(text);
        notify("Profile summary copied.");
      }
    } catch (error) {
      if (error.name !== "AbortError") notify("Could not share this profile.");
    }
  }
  function avatar(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 500 * 1024
    ) {
      notify("Choose a PNG, JPG, or WebP image under 500 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      settingsStore.update("profile", { avatar: reader.result });
    reader.onerror = () => notify("This image could not be read.");
    reader.readAsDataURL(file);
  }
  return (
    <>
      <div className="settings-profile-tools">
        <Action onClick={() => setEditing(true)}>Edit</Action>
        <Action onClick={share}>Share</Action>
      </div>
      <div className="settings-profile-hero">
        <button
          type="button"
          className="settings-avatar"
          onClick={() => avatarRef.current?.click()}
          aria-label="Change profile photo"
        >
          {data.profile.avatar && (
            <img src={data.profile.avatar} alt="Your profile" />
          )}
          <span aria-hidden="true">✎</span>
        </button>
        <input
          hidden
          ref={avatarRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={avatar}
        />
        <h1>{data.profile.name}</h1>
        <p className="settings-muted text-sm">
          {data.profile.bio || data.profile.profession || "Your NITO profile"}
        </p>
      </div>
      <PersonalInfo editable={false} />
      <Card
        title="Linked Platforms"
        action={
          <Action
            aria-label="Manage platform links"
            onClick={() => {
              setLink("Website");
              setLinkUrl(data.linkedPlatforms.Website || "");
            }}
          >
            ⋮
          </Action>
        }
      >
        <div className="settings-platforms">
          {platforms.map(([name, src, text]) => (
            <button
              key={name}
              type="button"
              aria-label={`${data.linkedPlatforms[name] ? "Edit" : "Add"} ${name} link`}
              title={name}
              className={`settings-platform ${name === "Figma" ? "settings-platform-figma" : ""} ${data.linkedPlatforms[name] ? "is-linked" : ""}`}
              onClick={() => {
                setLink(name);
                setLinkUrl(data.linkedPlatforms[name] || "");
              }}
            >
              {src ? (
                <img src={`/assets/settings/${src}`} alt={name} />
              ) : (
                <span className="text-[35px] font-bold">{text}</span>
              )}
            </button>
          ))}
          <button
            type="button"
            className="settings-platform"
            aria-label="Add another platform link"
            onClick={() => {
              setLink("Website");
              setLinkUrl(data.linkedPlatforms.Website || "");
            }}
          >
            ＋
          </button>
        </div>
      </Card>
      <Card
        title="NITO for you"
        action={
          <Action
            onClick={() => {
              settingsStore.update("profile", {
                instructions: instructions.trim(),
                resume,
              });
              notify(
                "Personalization saved locally. Demo replies do not use these instructions yet.",
              );
            }}
          >
            Save
          </Action>
        }
      >
        <p className="mb-3 text-sm">
          Personalize your NITO by telling it what to be
        </p>
        <div className="flex items-start gap-5">
          <textarea
            className="settings-instructions"
            aria-label="Personalization instructions"
            value={instructions}
            maxLength={2000}
            rows="3"
            placeholder="Tell NITO about your work and how you like responses."
            onChange={(e) => setInstructions(e.target.value)}
          />
          <div className="min-w-0 max-w-[100px] text-center">
            <span className="settings-resume-icon" aria-hidden="true">
              PDF
            </span>
            <p className="mt-2 truncate text-xs" title={resume?.name}>
              {resume?.name || "Resume"}
            </p>
          </div>
          <div className="grid gap-2">
            <Action
              aria-label="Choose resume"
              onClick={() => resumeRef.current?.click()}
            >
              ⊕
            </Action>
            <Action
              aria-label="Remove resume"
              disabled={!resume}
              onClick={() => {
                setResume(null);
                settingsStore.update("profile", { resume: null });
              }}
            >
              ⌫
            </Action>
          </div>
        </div>
        <input
          hidden
          ref={resumeRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (
              file.type !== "application/pdf" ||
              file.size > 5 * 1024 * 1024
            ) {
              notify("Choose a PDF under 5 MB.");
              return;
            }
            const metadata = {
              name: file.name,
              size: file.size,
              type: file.type,
            };
            setResume(metadata);
            settingsStore.update("profile", { resume: metadata });
            notify(
              "Resume filename saved. The file has not been uploaded or analysed.",
            );
          }}
        />
      </Card>
      {editing && <ProfileEditor onClose={() => setEditing(false)} />}
      {link && (
        <Modal title={`${link} profile link`} onClose={() => setLink(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const url = new URL(linkUrl);
              if (!["https:", "http:"].includes(url.protocol)) {
                notify("Use an HTTP or HTTPS URL.");
                return;
              }
              settingsStore.update("linkedPlatforms", { [link]: url.href });
              setLink(null);
              notify("Profile link saved. No account access was granted.");
            }}
          >
            <Field
              label="Profile URL"
              type="url"
              required
              value={linkUrl}
              maxLength={500}
              placeholder="https://"
              onChange={setLinkUrl}
            />
            <p className="settings-footnote mt-4">
              Save a profile bookmark. This does not connect the platform to
              NITO.
            </p>
            {data.linkedPlatforms[link] && (
              <Row label="Saved profile">
                <a
                  href={data.linkedPlatforms[link]}
                  target="_blank"
                  rel="noreferrer"
                  className="settings-action"
                >
                  Open ↗
                </a>
              </Row>
            )}
            <div className="settings-dialog-actions">
              {data.linkedPlatforms[link] && (
                <Action
                  danger
                  onClick={() => {
                    const next = { ...data.linkedPlatforms };
                    delete next[link];
                    settingsStore.set("linkedPlatforms", next);
                    setLink(null);
                  }}
                >
                  Remove link
                </Action>
              )}
              <Action onClick={() => setLink(null)}>Cancel</Action>
              <button type="submit" className="settings-primary">
                Save link
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
