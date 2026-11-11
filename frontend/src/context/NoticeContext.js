import { createContext, useContext } from "react";
export const NoticeContext = createContext(null);
export function useNotice() {
  const value = useContext(NoticeContext);
  if (!value) throw new Error("useNotice must be used within Providers");
  return value;
}
