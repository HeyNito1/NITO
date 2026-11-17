import { useState } from "react";
import { Action, Card, Modal, Row, Toggle } from "../components/Controls";
export default function Security() {
  const [dialog, setDialog] = useState(null);
  return (
    <>
      <Card title="Login">
        <Row label="Password">
          <Action onClick={() => setDialog("Change password")}>Change</Action>
        </Row>
        <Row label="Security Keys">
          <Action onClick={() => setDialog("Add security key")}>Add</Action>
        </Row>
        <Row label="Passkeys">
          <Action onClick={() => setDialog("Create passkey")}>Create</Action>
        </Row>
      </Card>
      <Card title="MFA">
        <Row label="Authenticator App">
          <Toggle
            label="Authenticator App"
            checked={false}
            unavailable
            onChange={() => setDialog("Authenticator App")}
          />
        </Row>
        <Row label="Text message">
          <Toggle
            label="Text message"
            checked={false}
            unavailable
            onChange={() => setDialog("Text message")}
          />
        </Row>
      </Card>
      <p className="settings-footnote">
        Account security is not connected. No password, security key, or MFA
        method is active.
      </p>
      {dialog && (
        <Modal title={dialog} onClose={() => setDialog(null)}>
          <p className="text-sm leading-relaxed">
            This action needs a signed-in account and a secure authentication
            service. NITO is running as a local frontend, so{" "}
            {dialog.toLowerCase()} cannot be completed yet. No credentials are
            collected or stored.
          </p>
          <div className="settings-dialog-actions">
            <Action onClick={() => setDialog(null)}>Got it</Action>
          </div>
        </Modal>
      )}
    </>
  );
}
