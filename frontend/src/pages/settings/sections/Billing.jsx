import { useState } from "react";
import { useSearchParams } from "react-router";
import { settingsStore, useSettings } from "@/services/settingsStore";
import { useNotice } from "@/context/NoticeContext";
import {
  Action,
  Card,
  Empty,
  Field,
  Modal,
  More,
  Row,
  Select,
} from "../components/Controls";
const benefits = [
  "Access NITO across web, desktop, iOS, and Android.",
  "Chat with AI for research, brainstorming, and problem-solving.",
  "Generate, debug, explain, and optimise code.",
  "Write, edit, summarise, and create content.",
  "Search the web and retrieve relevant information.",
  "Analyse documents, PDFs, and uploaded files.",
  "Generate files, execute code, and work with data.",
  "Visualise data, interpret results, and generate insights.",
  "Maintain context and memory across conversations.",
  "Upload documents and build knowledge bases for AI-powered conversations.",
  "Connect external applications and services through integrations.",
  "Automate repetitive tasks and streamline workflows.",
  "Access advanced reasoning for complex problems.",
  "Work with multiple AI models through the NITO ecosystem.",
  "Access specialised AI tools for coding, research, and creative workflows.",
  "Manage projects and organise conversations in dedicated workspaces.",
  "Get priority access to advanced features and higher usage limits.",
  "Experience faster responses and extended AI capabilities.",
  "Access NITO Academy, learning resources, and developer programs.",
];
const billingFields = [
  ["name", "Name"],
  ["email", "Email", "email"],
  ["line1", "Address Line 1"],
  ["line2", "Address Line 2"],
  ["city", "City"],
  ["pin", "PIN"],
  ["state", "State"],
  ["country", "Country"],
];
export default function Billing() {
  const { data } = useSettings();
  const [params, setParams] = useSearchParams();
  const details = params.get("view") === "details";
  const [dialog, setDialog] = useState(null);
  const [draft, setDraft] = useState(data.billing);
  const [method, setMethod] = useState({ type: "UPI", label: "", last4: "" });
  const { notify } = useNotice();
  return (
    <>
      <div className="settings-subnav" aria-label="Billing views">
        <button
          type="button"
          aria-pressed={!details}
          onClick={() => setParams({})}
        >
          Benefits
        </button>
        <button
          type="button"
          aria-pressed={details}
          onClick={() => setParams({ view: "details" })}
        >
          Billing details
        </button>
      </div>
      {!details ? (
        <Card
          title="Benefits"
          action={<Action onClick={() => setDialog("upgrade")}>Upgrade</Action>}
        >
          <ul className="settings-benefits">
            {benefits.map((text) => (
              <li key={text}>
                <span aria-hidden="true">✓</span>
                {text}
              </li>
            ))}
          </ul>
          <p className="settings-footnote mt-4">
            Planned NITO capabilities. The current frontend uses demo replies;
            paid plans are not available yet.
          </p>
        </Card>
      ) : (
        <>
          <Card title="History">
            <Empty>
              No invoices yet. You are using the free local frontend.
            </Empty>
          </Card>
          <Card
            title="Billing Information"
            action={
              <Action
                onClick={() => {
                  setDraft(data.billing);
                  setDialog("billing");
                }}
              >
                Edit
              </Action>
            }
          >
            {billingFields.map(([key, label]) => (
              <Row key={key} label={label}>
                {data.billing[key] || "Not set"}
              </Row>
            ))}
          </Card>
          <Card
            title="Payment Methods"
            action={<Action onClick={() => setDialog("method")}>Add</Action>}
          >
            {data.paymentMethods.length ? (
              data.paymentMethods.map((item) => (
                <Row
                  key={item.id}
                  label={
                    <div>
                      {item.type}
                      <p className="settings-muted mt-1 text-sm">
                        {item.label}
                        {item.last4 ? ` •••• ${item.last4}` : ""}
                      </p>
                    </div>
                  }
                >
                  <More label={`Manage ${item.label}`}>
                    <button
                      onClick={() => {
                        settingsStore.set(
                          "paymentMethods",
                          data.paymentMethods.filter((m) => m.id !== item.id),
                        );
                        notify("Payment note removed.");
                      }}
                    >
                      Remove note
                    </button>
                  </More>
                </Row>
              ))
            ) : (
              <Empty>
                No payment methods connected. You can save a local payment label
                for later.
              </Empty>
            )}
          </Card>
        </>
      )}
      {dialog === "upgrade" && (
        <Modal title="NITO plans" onClose={() => setDialog(null)}>
          <p className="text-sm leading-relaxed">
            You are on NITO Free. The design previews a NITO+ subscription, but
            pricing, checkout, and payment processing are not connected. No
            subscription will be started and no charge will be made.
          </p>
          <div className="settings-dialog-actions">
            <Action
              onClick={() => {
                setParams({ view: "details" });
                setDialog(null);
              }}
            >
              View billing details
            </Action>
            <Action onClick={() => setDialog(null)}>Close</Action>
          </div>
        </Modal>
      )}
      {dialog === "billing" && (
        <Modal title="Edit billing information" onClose={() => setDialog(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              settingsStore.update("billing", draft);
              setDialog(null);
              notify("Billing information saved locally.");
            }}
          >
            <div className="grid gap-4">
              {billingFields.map(([key, label, type]) => (
                <Field
                  key={key}
                  label={label}
                  value={draft[key]}
                  type={type}
                  maxLength={160}
                  onChange={(v) => setDraft({ ...draft, [key]: v })}
                />
              ))}
            </div>
            <p className="settings-footnote mt-4">
              Stored in this browser only.
            </p>
            <div className="settings-dialog-actions">
              <Action onClick={() => setDialog(null)}>Cancel</Action>
              <button type="submit" className="settings-primary">
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
      {dialog === "method" && (
        <Modal title="Add a payment note" onClose={() => setDialog(null)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              settingsStore.set("paymentMethods", [
                ...data.paymentMethods,
                { ...method, id: crypto.randomUUID() },
              ]);
              setMethod({ type: "UPI", label: "", last4: "" });
              setDialog(null);
              notify(
                "Local payment note saved. No payment method was connected.",
              );
            }}
          >
            <p className="settings-footnote mb-5">
              This is a local label, not a payment connection. Do not enter a
              full card number, CVV, bank login, or UPI PIN.
            </p>
            <label className="settings-field">
              <span>Type</span>
              <Select
                label="Payment type"
                value={method.type}
                options={["UPI", "Credit card", "Debit card"]}
                onChange={(type) => setMethod({ ...method, type })}
              />
            </label>
            <Field
              label="Nickname"
              value={method.label}
              required
              maxLength={40}
              placeholder="Personal card"
              onChange={(label) => setMethod({ ...method, label })}
            />
            {method.type !== "UPI" && (
              <Field
                label="Last four digits only"
                value={method.last4}
                required
                pattern="[0-9]{4}"
                maxLength={4}
                inputMode="numeric"
                onChange={(last4) => setMethod({ ...method, last4 })}
              />
            )}
            <div className="settings-dialog-actions">
              <Action onClick={() => setDialog(null)}>Cancel</Action>
              <button type="submit" className="settings-primary">
                Save note
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
