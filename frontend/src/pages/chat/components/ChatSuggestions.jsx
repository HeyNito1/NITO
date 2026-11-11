export default function ChatSuggestions({
  onSuggest,
}) {
  const suggestions = [
    [
      "Continue building your Health app",
      "Help me plan the next steps for building a health app.",
    ],
    [
      "7-day Workout Routine",
      "Help me put together a beginner-friendly 7-day workout routine.",
    ],
    [
      "Understanding RAG",
      "Explain retrieval-augmented generation and when I should use it.",
    ],
  ];

  return (
    <aside
      className="
        chat-suggestions
        min-[961px]:block!
        min-[961px]:h-[min(976px,calc(125dvh_-_31px))]!
      "
      aria-label="Suggestions and updates"
    >
      <p className="chat-premium-label">
        Premium
      </p>

      <details className="chat-benefits">
        <summary>Benefits</summary>

        <p>
          NITO plans and account features are coming
          soon. You can explore chat with demo
          replies now.
        </p>
      </details>

      <h2 className="chat-panel-heading">
        Suggestions
      </h2>

      <div className="chat-suggestion-list">
        {suggestions.map(([label, prompt]) => (
          <button
            key={label}
            type="button"
            onClick={() => onSuggest(prompt)}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className="chat-panel-heading chat-updates-heading">
        What’s new today?
      </h2>

      <div className="chat-updates-empty">
        Updates will appear here.
      </div>
    </aside>
  );
}