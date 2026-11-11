import SubmitInput from "@/components/ui/SubmitInput";
import { useNewsletter } from "./useNewsletter";
export default function NewsletterForm() {
  const { email, setEmail, status, message, submit } = useNewsletter();
  return (
    <div className="newsletter">
      <h2>Stay Updated</h2>
      <p>Get the latest news and updates about NITO with our newsletter!</p>
      <SubmitInput
        label="Email address"
        type="email"
        placeholder="Enter your Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onSubmit={submit}
        submitLabel={
          status === "loading" ? "Submitting email" : "Subscribe to newsletter"
        }
        disabled={status === "loading"}
      />
      <p
        className="form-message"
        role={status === "error" ? "alert" : "status"}
      >
        {status === "loading" ? "Submitting…" : message}
      </p>
    </div>
  );
}
