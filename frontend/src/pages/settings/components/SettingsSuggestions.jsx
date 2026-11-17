import { Link, useNavigate } from "react-router";
import { useChatEntry } from "@/hooks/useChatEntry";
import { useNotice } from "@/context/NoticeContext";
import { useSettings } from "@/services/settingsStore";

const suggestions = [
  "Continue building your Health app",
  "7-day Workout Routine",
  "Understanding RAG",
];
export default function SettingsSuggestions() {
  const enterChat = useChatEntry();
  const navigate = useNavigate();
  const { notify } = useNotice();
  const { data } = useSettings();
  const news = [
    ["news-musk.png", "MUSK MERGES TESLA & SPACEX", "black"],
    ["news-tiger.png", "TIGER ZINDA HAI", "white"],
    ["news-sbi.png", "SBI DATA BREACH", "black"],
  ];
  return (
    <aside
      className="settings-suggestions"
      aria-label="Suggestions and updates"
    >
      <p className="settings-premium-label">Premium</p>
      <button
        type="button"
        className="settings-suggestion-button"
        onClick={() => navigate("/settings/billing")}
      >
        Benefits <span>⌄</span>
      </button>
      <h2>Suggestions</h2>
      <div className="grid gap-[10px]">
        {suggestions.map((prompt) => (
          <button
            type="button"
            key={prompt}
            className="settings-suggestion-button"
            onClick={() => {
              try {
                enterChat({ prompt });
              } catch (e) {
                notify(e.message);
              }
            }}
          >
            {prompt}
          </button>
        ))}
      </div>
      <h2 className="mt-[24px]!">What’s new today?</h2>
      <div className="grid gap-[20px]">
        {news.map(([src, title, color]) => (
          <figure
            className={`settings-news ${src.replace(".png", "")}`}
            key={src}
            aria-label={`${title} — design preview`}
          >
            <img src={`/assets/settings/${src}`} alt="" />
            <span style={{ color }}>{title}</span>
          </figure>
        ))}
        {data.privacy.showAdPreview && (
          <Link
            to="/settings/ad-preferences"
            className="settings-news settings-ad news-sbi"
          >
            <img
              src="/assets/settings/news-sbi.png"
              alt="SBI building — advertisement design preview"
            />
            <small>Ad preview</small>
          </Link>
        )}
      </div>
    </aside>
  );
}
