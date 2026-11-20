import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PromptComposer from "../components/PromptComposer";
import PlatformIcon from "@/components/ui/PlatformIcon";
import { useNotice } from "@/context/NoticeContext";
import { useChatEntry } from "@/hooks/useChatEntry";

export default function HeroSection({ categories, composer }) {
  const enterChat = useChatEntry();
  const { notify } = useNotice();
  const {
    prompt,
    setPrompt,
    category,
    setCategory,
    attachments,
    setAttachments,
    result,
    status,
    error,
    fileRef,
    inputRef,
    submit,
    attach,
  } = composer;
  return (
    <section id="hero" className="hero-section" aria-labelledby="hero-title">
      <div className="hero-orbit" aria-hidden="true">
        <div className="particle-placeholder" />
      </div>
      <Container className="hero-content">
        <h1 id="hero-title">How can I help you?</h1>
        <div className="hero-composer">
          <input
            className="sr-only"
            type="file"
            tabIndex={-1}
            ref={fileRef}
            multiple
            accept=".txt,.md,.pdf,image/*"
            onChange={attach}
            aria-label="Choose local attachments"
          />
          <PromptComposer
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            categories={categories}
            selectedCategory={category}
            onCategoryChange={(selectedCategory) => {
              setCategory(selectedCategory);

              try {
                enterChat();
              } catch (error) {
                notify(error.message);
              }
            }}
            onSubmit={submit}
            onAttach={() => fileRef.current?.click()}
            inputRef={inputRef}
            attachments={attachments}
            onRemoveAttachment={(index) =>
              setAttachments((current) => current.filter((_, i) => index !== i))
            }
            disabled={status === "loading"}
          />
          {attachments.length > 0 && (
            <p className="attachment-note">
              Local preview only. Files are not uploaded or analyzed.
            </p>
          )}
          <div aria-live="polite" className="prompt-status">
            {status === "loading" && <p>Preparing a demo response…</p>}
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            {result && (
              <article className="prompt-result">
                <p className="result-label">
                  {result.isDemo
                    ? "Demo response · No AI request was sent"
                    : "NITO response"}
                </p>
                <p>{result.text}</p>
              </article>
            )}
          </div>
        </div>
        <Button
          variant="explore"
          arrow
          onClick={() => {
            try {
              enterChat();
            } catch (error) {
              notify(error.message);
            }
          }}
        >
          Explore
        </Button>
      </Container>
      <div id="download" className="hero-download">
        <p>Download</p>
        <div className="platform-links">
          {[
            ["ubuntu", "Linux"],
            ["windows", "Windows"],
            ["apple", "Mac"],
          ].map(([platform, label]) => (
            <button
              key={platform}
              type="button"
              aria-label={`Download NITO for ${label}`}
              onClick={() =>
                notify(
                  `NITO for ${label} is not available for download in this frontend preview.`,
                )
              }
            >
              <PlatformIcon platform={platform} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
