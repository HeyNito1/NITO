
import BenefitsCard from "./BenefitsCard";
import { pageSuggestions } from "../data/promptSuggestions";

export default function ChatSuggestions({ onSuggest }) {
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

      <BenefitsCard />

      <h2 className="chat-panel-heading">
        Suggestions
      </h2>

      <div className="chat-suggestion-list">
        {pageSuggestions.map(([label, prompt]) => (
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
