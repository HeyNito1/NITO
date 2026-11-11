import { useCallback, useEffect, useRef, useState } from "react";
export function useNavigation() {
  const [active, setActive] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const rootRef = useRef(null);
  const lastTrigger = useRef(null);
  const close = useCallback(() => {
    setActive(null);
    setMobileOpen(false);
  }, []);
  useEffect(() => {
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) close();
    }
    function closeWithEscape(event) {
      if (event.key === "Escape") {
        close();
        lastTrigger.current?.focus();
      }
    }
    const media = window.matchMedia("(max-width: 1100px)");
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    media.addEventListener("change", close);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
      media.removeEventListener("change", close);
    };
  }, [close]);
  function openMenu(id, trigger) {
  lastTrigger.current = trigger;
  setActive(id);
}
  function toggleMenu(id, trigger) {
    lastTrigger.current = trigger;
    setActive((current) => (current === id ? null : id));
  }
  function toggleMobile(trigger) {
    lastTrigger.current = trigger;
    setMobileOpen((current) => !current);
    setActive(null);
  }
  return {
  active,
  mobileOpen,
  rootRef,
  openMenu,
  toggleMenu,
  toggleMobile,
  close,
};
}
