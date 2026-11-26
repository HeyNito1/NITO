
import { useCallback, useEffect, useMemo, useState } from "react";
import { NoticeContext } from "@/context/NoticeContext";

const NOTICE_DURATION = {
  success: 3000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

export default function AppProviders({ children }) {
  const [notice, setNotice] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const notify = useCallback((message, type = "info") => {
    setIsPaused(false);
    setNotice({ message, type });
  }, []);

  const dismissNotice = useCallback(() => {
    setNotice(null);
    setIsPaused(false);
  }, []);

  useEffect(() => {
    if (!notice || isPaused) return;

    const timer = setTimeout(
      dismissNotice,
      NOTICE_DURATION[notice.type] ?? NOTICE_DURATION.info
    );

    return () => clearTimeout(timer);
  }, [notice, isPaused, dismissNotice]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NoticeContext.Provider value={value}>
      {children}

      {notice && (
        <aside
          className="notice-toast"
          aria-label="Notification"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <p role="status">{notice.message}</p>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={dismissNotice}
          >
            ×
          </button>
        </aside>
      )}
    </NoticeContext.Provider>
  );
}
