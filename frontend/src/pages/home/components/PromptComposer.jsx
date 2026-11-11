import { useId } from "react";
import CategoryPill from "@/components/ui/CategoryPill";
import IconButton from "@/components/ui/IconButton";
export default function PromptComposer({
  value,
  onChange,
  categories,
  selectedCategory,
  onCategoryChange,
  onSubmit,
  onAttach,
  inputRef,
  attachments = [],
  onRemoveAttachment,
  disabled = false,
}) {
  const id = useId();
  return (
    <form className="prompt-composer" onSubmit={onSubmit} aria-busy={disabled}>
      <div className="prompt-row">
        <IconButton
          label="Add attachment"
          onClick={onAttach}
          disabled={disabled}
        >
          +
        </IconButton>
        <label className="sr-only" htmlFor={id}>
          Your prompt
        </label>
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={onChange}
          placeholder="Teach me how to integrate external LLM"
          maxLength={4000}
          required
          disabled={disabled}
          autoComplete="off"
        />
        <IconButton
          type="submit"
          label={disabled ? "Sending prompt" : "Submit prompt"}
          variant="blue"
          disabled={disabled}
        >
          {disabled ? (
            <span className="spinner" />
          ) : (
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 12 4 4L19 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </IconButton>
      </div>
      <div
        className="prompt-categories"
        role="group"
        aria-label="Prompt category"
      >
        {categories.map((category) => (
          <CategoryPill
            key={category.id}
            selected={selectedCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
            disabled={disabled}
          >
            {category.label}
          </CategoryPill>
        ))}
      </div>
      {attachments.length > 0 && (
        <ul className="attachment-list">
          {attachments.map((file, index) => (
            <li key={`${file.name}-${index}`}>
              <span>{file.name}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemoveAttachment(index)}
                disabled={disabled}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
