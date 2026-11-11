import { useCallback, useMemo, useState } from "react";
import { NoticeContext } from "@/context/NoticeContext";
export default function AppProviders({ children }) {
  const [notice, setNotice] = useState(null);
  const notify = useCallback((message) => setNotice(message), []);
  const value = useMemo(() => ({ notify }), [notify]);
  return (
    <NoticeContext.Provider value={value}>
      {children}
      {notice && (
        <aside className="notice-toast" aria-label="Notification">
          <p role="status">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </aside>
      )}
    </NoticeContext.Provider>
  );
}
